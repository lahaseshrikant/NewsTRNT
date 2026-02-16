import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';

// Import routes
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import categoryRoutes from './routes/categories';
import webstoriesRoutes from './routes/webstories';
import navigationRoutes from './routes/navigation';
import healthRoutes from './routes/health';
import statsRoutes from './routes/stats';
import commentsRoutes from './routes/comments';
import userPreferencesRoutes from './routes/user-preferences';
import marketRoutes from './routes/market';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import infrastructure
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';

// Load environment
dotenv.config({ path: '.env' });

console.log('📧 Environment loaded:', {
  hasDB: !!process.env.DATABASE_URL,
  hasJWT: !!process.env.JWT_SECRET,
  hasRedis: !!process.env.REDIS_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
});

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS: allow multiple comma-separated origins
const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // non-browser / server-side
      if (clientUrls.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CORS] Blocked origin', origin, '— allowed:', clientUrls);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes (user-facing only — NO /api/admin) ───────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/webstories', webstoriesRoutes);
app.use('/api', healthRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/user', userPreferencesRoutes);
app.use('/api/market', marketRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────────────────────────

const start = async () => {
  // Initialize infrastructure (graceful failures)
  await initializeDatabase();
  await initializeRedis();

  app.listen(PORT, () => {
    console.log(`🚀 user-backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down user-backend...');
  await closeRedis();
  await closeDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('❌ Failed to start user-backend:', err);
  process.exit(1);
});
