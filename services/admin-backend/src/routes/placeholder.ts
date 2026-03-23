import { Router } from 'express';

const router = Router();

router.get('/:width/:height', (req, res) => {
  const width = parseInt(req.params.width, 10) || 400;
  const height = parseInt(req.params.height, 10) || 600;

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="rgb(243, 244, 246)"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" dy=".3em" fill="rgb(107, 114, 128)">
      ${width} × ${height}
    </text>
  </svg>
  `;

  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(svg);
});

export default router;
