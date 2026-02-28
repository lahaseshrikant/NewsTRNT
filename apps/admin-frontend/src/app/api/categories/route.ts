import { NextRequest, NextResponse } from 'next/server';

// Backend API base (may include /api suffix in env). Normalize to avoid double /api.
const USER_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

function buildCategoriesUrl(params: URLSearchParams) {
 const trimmed = USER_BACKEND_URL.replace(/\/+$/g, '');
 if (trimmed.endsWith('/api')) {
 return `${trimmed}/categories?${params.toString()}`;
 }
 return `${trimmed}/api/categories?${params.toString()}`;
}

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const includeInactive = searchParams.get('includeInactive') || 'false';
 const includeStatsRaw = searchParams.get('includeStats') || 'false';
 const includeSubCategories = searchParams.get('includeSubCategories') || 'false';

 // ensure we never send duplicate includeStats entries; express interprets
 // an array as the raw value which breaks the backend conditional check.
 const includeStats = (includeStatsRaw === 'true' || includeSubCategories === 'true') ? 'true' : 'false';

 const params = new URLSearchParams();
 params.append('includeInactive', includeInactive);
 params.append('includeStats', includeStats);

 const target = buildCategoriesUrl(params);

 const authHeader = request.headers.get('Authorization');
 const headers: Record<string, string> = { 'Content-Type': 'application/json' };
 if (authHeader) {
 headers['Authorization'] = authHeader;
 }

 const response = await fetch(target, {
 method: 'GET',
 headers,
 });

 if (!response.ok) {
 console.error(`User backend responded with status: ${response.status} for ${target}`);
 return NextResponse.json({ error: 'Failed to fetch categories from backend' }, { status: response.status });
 }

 const data = await response.json();
 return NextResponse.json(data);
 } catch (error) {
 console.error('Error fetching categories proxy:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
