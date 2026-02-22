import { Router } from 'express';

// Import all admin sub-route modules
import usersRoutes from './users';
import teamRoutes from './team';
import activityRoutes from './activity';
import analyticsRoutes from './analytics';
import moderationRoutes from './moderation';
import systemRoutes from './system';
import newsletterRoutes from './newsletter';
import mediaRoutes from './media';
import advertisingRoutes from './advertising';
import siteConfigRoutes from './site-config';
import marketConfigRoutes from './market-config';
import rbacRoutes from './rbac';
import notificationsRoutes from './notifications';
import scrapedItemsRoutes from './scraped-items';

const router = Router();

// ── Mount all admin sub-routers ──────────────────────────────────────────────
router.use('/', usersRoutes);         // /users, /users/:id/role, /users/:id/status, /users/bulk, /subscribers
router.use('/', teamRoutes);          // /team, /team/invite, /team/invites
router.use('/', activityRoutes);      // /activity
router.use('/', analyticsRoutes);     // /analytics/*, /stats/dashboard, /stats
router.use('/', moderationRoutes);    // /moderation/*
router.use('/', systemRoutes);        // /system/*, /settings
router.use('/', newsletterRoutes);    // /newsletter/templates
router.use('/', mediaRoutes);         // /media
router.use('/', advertisingRoutes);   // /advertising/*
router.use('/', siteConfigRoutes);    // /site-config, /site-config/public
router.use('/', marketConfigRoutes);  // /market-config, /market-config/indices|cryptos|currencies|commodities
router.use('/', rbacRoutes);
router.use('/', notificationsRoutes);          // /roles, /roles/:id, /permissions
router.use('/', scrapedItemsRoutes);   // /scraped-items, /scraped-items/:id/approve

export default router;
