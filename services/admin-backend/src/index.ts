import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';

// Import routes
import adminRoutes from './routes/admin';
import adminAuthRoutes from './routes/admin-auth';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import categoryRoutes from './routes/categories';
import webstoryRoutes from './routes/webstories';
import marketRoutes from './routes/market';
import uploadRoutes from './routes/upload';
import healthRoutes from './routes/health';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import infrastructure
import { initializeDatabase, closeDatabase } from './config/database';

// Import market services
import { startMarketDataUpdates, stopMarketDataUpdates } from './lib/market-auto-update';

// Load environment
dotenv.config({ path: '.env' });

console.log('📧 Environment loaded:', {
  hasDB: !!process.env.DATABASE_URL,
  hasJWT: !!process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
});

const app = express();
const PORT = process.env.PORT || 5002;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Admin CORS: only admin-frontend
const adminClientUrl = process.env.ADMIN_CLIENT_URL || 'http://localhost:3001';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === adminClientUrl) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CORS] Blocked origin', origin, '— allowed:', adminClientUrl);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' })); // larger limit for article content + media
app.use(express.urlencoded({ extended: true }));

// ── Routes (admin-only — articles/categories have admin write endpoints) ─────

app.use('/api/admin', adminRoutes);
app.use('/api/auth', adminAuthRoutes); // admin login/logout/verify/refresh (DB-only)
app.use('/api/auth', authRoutes);      // general auth fallback
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/webstories', webstoryRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', healthRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────────────────────────

const start = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 admin-backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

    // Start market data auto-update service if enabled
    if (process.env.ENABLE_MARKET_AUTO_UPDATE === 'true') {
      startMarketDataUpdates();
    }
  });
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down admin-backend...');
  stopMarketDataUpdates();
  await closeDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('❌ Failed to start admin-backend:', err);
  process.exit(1);
});
