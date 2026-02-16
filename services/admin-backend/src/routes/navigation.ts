import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createNavigationSchema = z.object({
  name: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return (val as string).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  }, z.string().min(2).max(50)),
  label: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return (val as string).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  }, z.string().min(1).max(50)),
  href: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return (val as string).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  }, z.string().min(1).max(200)),
  icon: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return (val as string).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  }, z.string().max(10).optional()),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().min(0).optional().default(0)
});

const updateNavigationSchema = createNavigationSchema.partial();

// GET /api/navigation - List all navigation items
router.get('/', async (req, res) => {
  try {
    const navigation = await prisma.navigation.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return res.json(navigation);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

// GET /api/navigation/admin - List all navigation items for admin (Admin only)
router.get('/admin', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const navigation = await prisma.navigation.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return res.json(navigation);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

// POST /api/navigation/sync-categories - Create/update navigation items for all categories
// Admin-only utility: imports categories into navigation (creates missing nav entries, updates label/href/icon/sortOrder)
router.post('/sync-categories', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Load all non-deleted categories
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { sortOrder: 'asc' }
    });

    const results: { created: number; updated: number; skipped: number } = { created: 0, updated: 0, skipped: 0 };

    for (const cat of categories) {
      const navName = cat.slug; // use slug as the navigation `name`
      const href = `/category/${cat.slug}`;

      const existing = await prisma.navigation.findUnique({ where: { name: navName } });

      if (existing) {
        // Update existing navigation item so admin UI reflects category metadata
        await prisma.navigation.update({
          where: { name: navName },
          data: {
            label: cat.name,
            href,
            icon: cat.icon || undefined,
            sortOrder: cat.sortOrder ?? 0,
            isActive: cat.isActive ?? true
          }
        });
        results.updated++;
      } else {
        // Create a navigation item for this category
        await prisma.navigation.create({
          data: {
            name: navName,
            label: cat.name,
            href,
            icon: cat.icon || undefined,
            sortOrder: cat.sortOrder ?? 0,
            isActive: cat.isActive ?? true,
            isSystem: false
          }
        });
        results.created++;
      }
    }

    return res.json({ message: 'Sync completed', results });
  } catch (error) {
    console.error('Error syncing categories to navigation:', error);
    return res.status(500).json({ error: 'Failed to sync categories' });
  }
});

// POST /api/navigation - Create new navigation item (Admin only)
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const validatedData = createNavigationSchema.parse(req.body);

    // Check if name already exists
    const existingNav = await prisma.navigation.findUnique({
      where: { name: validatedData.name }
    });

    if (existingNav) {
      return res.status(400).json({ error: 'A navigation item with this name already exists' });
    }

    const navigation = await prisma.navigation.create({
      data: validatedData
    });

    return res.status(201).json(navigation);
  } catch (error) {
    console.error('Error creating navigation item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create navigation item' });
  }
});

// PUT /api/navigation/:id - Update navigation item (Admin only)
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const validatedData = updateNavigationSchema.parse(req.body);

    const existingNav = await prisma.navigation.findUnique({
      where: { id }
    });

    if (!existingNav) {
      return res.status(404).json({ error: 'Navigation item not found' });
    }

    // Prevent updating system items' core properties
    if (existingNav.isSystem) {
      // Reject only if client attempts to change name/href to a *different* value.
      if ((Object.prototype.hasOwnProperty.call(req.body, 'name') && validatedData.name && validatedData.name !== existingNav.name) ||
          (Object.prototype.hasOwnProperty.call(req.body, 'href') && validatedData.href && validatedData.href !== existingNav.href)) {
        return res.status(400).json({ error: 'Cannot modify system navigation items' });
      }

      // Ensure we don't accidentally update name/href for system items even if provided
      delete (validatedData as any).name;
      delete (validatedData as any).href;
    }

    const navigation = await prisma.navigation.update({
      where: { id },
      data: validatedData
    });

    return res.json(navigation);
  } catch (error) {
    console.error('Error updating navigation item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update navigation item' });
  }
});

// DELETE /api/navigation/:id - Delete navigation item (Admin only)
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const existingNav = await prisma.navigation.findUnique({
      where: { id }
    });

    if (!existingNav) {
      return res.status(404).json({ error: 'Navigation item not found' });
    }

    // Prevent deleting system items
    if (existingNav.isSystem) {
      return res.status(400).json({ error: 'Cannot delete system navigation items' });
    }

    await prisma.navigation.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Navigation item deleted successfully' });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    return res.status(500).json({ error: 'Failed to delete navigation item' });
  }
});

export default router;