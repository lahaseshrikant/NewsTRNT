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
import healthRoutes from './routes/health';
import debugRoutes from './routes/debug';
import statsRoutes from './routes/stats';
import commentsRoutes from './routes/comments';
import userPreferencesRoutes from './routes/user-preferences';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import database
import { initializeDatabase } from './config/database';

// Configure environment variables - ensure backend .env is loaded
dotenv.config({ path: '.env' });

// Debug: Log if DATABASE_URL is loaded (without showing actual value)
console.log('📧 Environment loaded:', {
  hasDB: !!process.env.DATABASE_URL,
  hasJWT: !!process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development'
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Dynamic CORS: allow multiple comma-separated origins (e.g. http://localhost:3000,http://localhost:3001)
const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser / server-side
    if (clientUrls.includes(origin)) {
      return callback(null, true);
    }
    // In dev we log a helpful hint
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[CORS] Blocked origin', origin, '— allowed:', clientUrls);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/webstories', webstoriesRoutes);
app.use('/api', healthRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/user', userPreferencesRoutes);

// Health check (legacy endpoint for compatibility)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  // Initialize database connection (graceful failure)
  await initializeDatabase();
  
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`� Detailed health: http://localhost:${PORT}/api/health`);
  console.log(`🏓 Ping test: http://localhost:${PORT}/api/ping`);
});
