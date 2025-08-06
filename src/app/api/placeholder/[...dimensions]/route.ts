import { NextRequest, NextResponse } from 'next/server';

interface Params {
  dimensions: string[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const [width = '400', height = '300'] = params.dimensions;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgb(243, 244, 246)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" dy=".3em" fill="rgb(107, 114, 128)">
        ${width} × ${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
