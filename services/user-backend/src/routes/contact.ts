import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

const router = Router();

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address').max(320),
  subject: z.string().min(1, 'Subject is required').max(500),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  category: z.string().optional(), // frontend field, stored in subject prefix
});

// POST /api/contact - Public endpoint to submit a contact message
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, subject, message, category } = parsed.data;

    // Prefix subject with category if provided (e.g., "[Press] My subject")
    const fullSubject = category && category !== 'general'
      ? `[${category.charAt(0).toUpperCase() + category.slice(1)}] ${subject}`
      : subject;

    const contactMessage = await (prisma as any).contactMessage.create({
      data: {
        name,
        email,
        subject: fullSubject,
        message,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will respond within 24 hours.',
      id: contactMessage.id,
    });
  } catch (error) {
    console.error('[Contact] Error submitting message:', error);
    return res.status(500).json({
      error: 'Failed to submit your message. Please try again later.',
    });
  }
});

export default router;
