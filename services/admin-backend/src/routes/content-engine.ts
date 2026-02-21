/**
 * Content Engine Proxy Routes
 * Proxies requests from admin-frontend → content-engine service (port 8000).
 * All routes require admin authentication.
 *
 * Mounted at: /api/content-engine
 */
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';

const router = Router();

// All routes require admin auth
router.use(authenticateToken);

// ── Helpers ──────────────────────────────────────────────────────────────────

const ENGINE_URL = () => process.env.CONTENT_ENGINE_URL || 'http://localhost:8000';
const ENGINE_KEY = () => process.env.CONTENT_ENGINE_API_KEY || '';

async function proxyGet(path: string): Promise<any> {
  const url = `${ENGINE_URL()}/api/v1${path}`;
  const res = await fetch(url, {
    headers: {
      'X-API-Key': ENGINE_KEY(),
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

async function proxyPost(path: string, body: any = {}): Promise<any> {
  const url = `${ENGINE_URL()}/api/v1${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': ENGINE_KEY(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function proxyPatch(path: string, body: any = {}): Promise<any> {
  const url = `${ENGINE_URL()}/api/v1${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-API-Key': ENGINE_KEY(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function proxyDelete(path: string): Promise<any> {
  const url = `${ENGINE_URL()}/api/v1${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-API-Key': ENGINE_KEY(),
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

// ── Health ───────────────────────────────────────────────────────────────────

/**
 * GET /api/content-engine/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/health');
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({
      success: false,
      data: { status: 'offline', error: error.message },
    });
  }
});

/**
 * GET /api/content-engine/status  — detailed status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/health/status');
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// ── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * POST /api/content-engine/pipeline/trigger — trigger a pipeline run
 * Body: { type: 'full' | 'news' | 'market' }
 */
router.post('/pipeline/trigger', async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'full' } = req.body;
    const data = await proxyPost('/pipeline/trigger', { type });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/content-engine/pipeline/history — recent pipeline runs
 */
router.get('/pipeline/history', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit || 20;
    const data = await proxyGet(`/pipeline/history?limit=${limit}`);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/content-engine/pipeline/runs/:runId
 */
router.get('/pipeline/runs/:runId', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet(`/pipeline/runs/${req.params.runId}`);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Scheduler ────────────────────────────────────────────────────────────────

/**
 * GET /api/content-engine/scheduler/status
 */
router.get('/scheduler/status', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/scheduler/status');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/content-engine/scheduler/jobs — create a new job
 */
router.post('/scheduler/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyPost('/scheduler/jobs', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/content-engine/scheduler/jobs/:jobId — pause/resume/update
 */
router.patch('/scheduler/jobs/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyPatch(`/scheduler/jobs/${req.params.jobId}`, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/content-engine/scheduler/jobs/:jobId
 */
router.delete('/scheduler/jobs/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyDelete(`/scheduler/jobs/${req.params.jobId}`);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Scraping ─────────────────────────────────────────────────────────────────

/**
 * GET /api/content-engine/scraping/sources — list configured sources
 */
router.get('/scraping/sources', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/scraping/sources');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/content-engine/scraping/rss — trigger RSS scrape
 */
router.post('/scraping/rss', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyPost('/scraping/rss', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/content-engine/scraping/newsapi — trigger NewsAPI fetch
 */
router.post('/scraping/newsapi', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyPost('/scraping/newsapi', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── AI ───────────────────────────────────────────────────────────────────────

/**
 * GET /api/content-engine/ai/status — AI provider status
 */
router.get('/ai/status', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/ai/status');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Config ───────────────────────────────────────────────────────────────────

/**
 * GET /api/content-engine/config — engine configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const data = await proxyGet('/config');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/content-engine/config — update engine config
 */
router.patch('/config', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyPatch('/config', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
