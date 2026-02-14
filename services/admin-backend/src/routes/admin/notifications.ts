import { Router } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();

// Simple in-memory mock notifications for admin (placeholder until DB model exists)
let MOCK_ADMIN_NOTIFICATIONS = [
  { id: 'n-1', type: 'info', title: 'New Article Published', message: 'Tech Innovations article is now live', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), link: '/content' },
  { id: 'n-2', type: 'warning', title: 'API Rate Limit', message: 'NewsAPI usage at 85% of daily quota', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), link: '/external-apis' },
  { id: 'n-3', type: 'success', title: 'Backup Completed', message: 'Automatic backup finished successfully', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
];

// GET /api/admin/notifications
router.get('/notifications', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  // In future, replace with Prisma-backed notifications table
  res.json({ notifications: MOCK_ADMIN_NOTIFICATIONS });
});

// PATCH /api/admin/notifications/:id/read
router.patch('/notifications/:id/read', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  MOCK_ADMIN_NOTIFICATIONS = MOCK_ADMIN_NOTIFICATIONS.map(n => n.id === id ? { ...n, read: true } : n);
  res.json({ success: true });
});

// PATCH /api/admin/notifications/mark-all-read
router.patch('/notifications/mark-all-read', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  MOCK_ADMIN_NOTIFICATIONS = MOCK_ADMIN_NOTIFICATIONS.map(n => ({ ...n, read: true }));
  res.json({ success: true });
});

export default router;
