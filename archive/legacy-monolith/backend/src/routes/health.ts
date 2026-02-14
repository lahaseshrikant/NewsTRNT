import { Router, Request, Response } from 'express';
import { healthCheck } from '../config/database';

const router = Router();

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  timestamp: string;
  version: string;
}

router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await healthCheck();
    
    const health: HealthResponse = {
      status: dbHealthy ? 'healthy' : 'degraded',
      database: dbHealthy,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    const health: HealthResponse = {
      status: 'unhealthy',
      database: false,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    res.status(503).json(health);
  }
});

// Simple ping endpoint for basic connectivity
router.get('/ping', (req: Request, res: Response) => {
  res.json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

export default router;