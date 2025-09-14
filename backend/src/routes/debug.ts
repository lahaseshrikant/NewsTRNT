import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/debug/token - returns classification info about provided Authorization header
router.get('/token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const response: any = {
    success: true,
    hasAuthHeader: !!authHeader,
    tokenPreview: token ? token.substring(0, 24) + '...' : null,
  };
  if (!token) {
    res.status(400).json({ success: false, error: 'No token supplied' });
    return;
  }
  const looksLikeJWT = token.split('.').length === 3;
  response.looksLikeJWT = looksLikeJWT;
  if (!looksLikeJWT) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      response.base64DecodedPreview = decoded.substring(0, 120);
      if (decoded.trim().startsWith('{') && decoded.trim().endsWith('}')) {
        const json = JSON.parse(decoded);
        response.parsedKeys = Object.keys(json);
        response.parsed = {
          email: json.email,
            role: json.role,
            userId: json.userId,
            sessionId: json.sessionId,
            timestampAgeMs: Date.now() - json.timestamp
        };
      }
    } catch (e) {
      response.base64Error = (e as Error).message;
    }
  }
  res.json(response);
});

// Protected echo to prove token works via authenticateToken
router.get('/auth-check', authenticateToken, (req, res) => {
  res.json({ success: true, mode: 'authenticated', user: (req as any).user });
});

export default router;
