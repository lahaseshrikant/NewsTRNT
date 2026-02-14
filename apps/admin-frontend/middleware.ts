import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin-frontend middleware
 * Auth enforcement happens client-side via AdminAuthGuard because
 * JWT is stored in localStorage (not accessible in middleware).
 * This middleware only handles static-asset passthrough.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
