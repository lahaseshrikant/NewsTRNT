import { NextResponse } from 'next/server';

// For now, return static categories until we set up proper database connection
export async function GET() {
  try {
    const categories = [
      { id: '1', name: 'Technology', slug: 'technology', color: '#3182CE' },
      { id: '2', name: 'Business', slug: 'business', color: '#059669' },
      { id: '3', name: 'Science', slug: 'science', color: '#7C3AED' },
      { id: '4', name: 'Politics', slug: 'politics', color: '#DC2626' },
      { id: '5', name: 'Sports', slug: 'sports', color: '#EA580C' },
      { id: '6', name: 'Health', slug: 'health', color: '#DB2777' },
      { id: '7', name: 'Environment', slug: 'environment', color: '#10B981' },
      { id: '8', name: 'Entertainment', slug: 'entertainment', color: '#F59E0B' }
    ];

    return NextResponse.json({
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}