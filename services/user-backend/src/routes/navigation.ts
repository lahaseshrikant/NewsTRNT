import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

// GET /api/navigation - Public navigation for user-facing site
router.get('/', async (req, res) => {
  try {
    const navigation = await prisma.navigation.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json(navigation);
  } catch (error) {
    console.error('Error fetching navigation (user-backend):', error);
    return res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

export default router;
