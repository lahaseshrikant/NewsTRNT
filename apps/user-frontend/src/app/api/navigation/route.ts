import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    // Proxy to user backend (do NOT call admin from user frontend)
    const userBackendUrl = process.env.USER_BACKEND_URL || API_CONFIG.baseURL.replace(/\/api\/?$/, '');
    const response = await fetch(`${userBackendUrl}/api/navigation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If admin backend is not available, return default navigation
      const defaultNavigation = [
        {
          id: 'home',
          name: 'home',
          label: 'Home',
          href: '/',
          icon: 'home',
          isActive: true,
          sortOrder: 1,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'news',
          name: 'news',
          label: 'News',
          href: '/news',
          icon: 'news',
          isActive: true,
          sortOrder: 2,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'articles',
          name: 'articles',
          label: 'Articles',
          href: '/articles',
          icon: 'article',
          isActive: true,
          sortOrder: 3,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'opinion',
          name: 'opinion',
          label: 'Opinion',
          href: '/opinion',
          icon: 'opinion',
          isActive: true,
          sortOrder: 4,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'analysis',
          name: 'analysis',
          label: 'Analysis',
          href: '/analysis',
          icon: 'chart',
          isActive: true,
          sortOrder: 5,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'shorts',
          name: 'shorts',
          label: 'Shorts',
          href: '/shorts',
          icon: 'bolt',
          isActive: true,
          sortOrder: 6,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stories',
          name: 'stories',
          label: 'Stories',
          href: '/web-stories',
          icon: 'book',
          isActive: true,
          sortOrder: 7,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'trending',
          name: 'trending',
          label: 'Trending',
          href: '/trending',
          icon: 'trending',
          isActive: true,
          sortOrder: 8,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return NextResponse.json(defaultNavigation);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching navigation:', error);

    // Return default navigation as fallback
    const defaultNavigation = [
      {
        id: 'home',
        name: 'home',
        label: 'Home',
        href: '/',
        icon: 'home',
        isActive: true,
        sortOrder: 1,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'news',
        name: 'news',
        label: 'News',
        href: '/news',
        icon: 'news',
        isActive: true,
        sortOrder: 2,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'articles',
        name: 'articles',
        label: 'Articles',
        href: '/articles',
        icon: 'article',
        isActive: true,
        sortOrder: 3,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'opinion',
        name: 'opinion',
        label: 'Opinion',
        href: '/opinion',
        icon: 'opinion',
        isActive: true,
        sortOrder: 4,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'analysis',
        name: 'analysis',
        label: 'Analysis',
        href: '/analysis',
        icon: 'chart',
        isActive: true,
        sortOrder: 5,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'shorts',
        name: 'shorts',
        label: 'Shorts',
        href: '/shorts',
        icon: 'bolt',
        isActive: true,
        sortOrder: 6,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stories',
        name: 'stories',
        label: 'Stories',
        href: '/web-stories',
        icon: 'book',
        isActive: true,
        sortOrder: 7,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'trending',
        name: 'trending',
        label: 'Trending',
        href: '/trending',
        icon: 'trending',
        isActive: true,
        sortOrder: 8,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(defaultNavigation);
  }
}