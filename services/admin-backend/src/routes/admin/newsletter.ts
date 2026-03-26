import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';
import { emailService } from '../../lib/email';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// NEWSLETTER TEMPLATE ENDPOINTS
// =============================================================================

// GET /api/admin/newsletter/templates - Get all templates
router.get('/newsletter/templates', requireAdmin, async (req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST /api/admin/newsletter/templates - Create template
router.post('/newsletter/templates', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, type = 'newsletter', content } = req.body;
    
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        type,
        content: content || '',
        createdBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'CREATE_TEMPLATE',
        targetType: 'template',
        targetId: template.id,
        details: req.body
      }
    });

    res.json({ message: 'Template created', template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// POST /api/admin/newsletter/templates/:id/duplicate - Duplicate template
router.post('/newsletter/templates/:id/duplicate', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const original = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!original) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    
    const duplicate = await prisma.emailTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        subject: original.subject,
        type: original.type,
        content: original.content,
        createdBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DUPLICATE_TEMPLATE',
        targetType: 'template',
        targetId: duplicate.id,
        details: { originalId: id }
      }
    });

    res.json({ message: 'Template duplicated', template: duplicate });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// DELETE /api/admin/newsletter/templates/:id - Delete template
router.delete('/newsletter/templates/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.emailTemplate.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_TEMPLATE',
        targetType: 'template',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// POST /api/admin/newsletter/send - Send newsletter
router.post('/newsletter/send', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { templateId, subject: customSubject, subscriberIds } = req.body;

    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let query: any = { status: 'active' };
    if (subscriberIds && Array.isArray(subscriberIds) && subscriberIds.length > 0) {
      query.id = { in: subscriberIds };
    }

    const subscribers = await prisma.newsletterSubscription.findMany({ where: query });
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found to send' });
    }

    // Import the new email service (assuming top level import to be added next)
    const { emailService } = require('../../lib/email');

    let sentCount = 0;
    for (const sub of subscribers) {
      try {
        await emailService.sendEmail({
          to: sub.email,
          subject: customSubject || template.subject || 'NewsTRNT Newsletter',
          html: template.content,
          emailCategory: 'NEWSLETTER',
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send newsletter to ${sub.email}`, e);
      }
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'SEND_NEWSLETTER',
        targetType: 'newsletter',
        targetId: templateId,
        details: { sentCount, totalTarget: subscribers.length }
      }
    });

    return res.json({ message: 'Newsletter sent', sentCount, totalTarget: subscribers.length });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
    return;
  }
});

export default router;
