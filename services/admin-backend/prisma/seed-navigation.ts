import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNavigation() {
  console.log('🌱 Seeding navigation items...');

  const navigationItems = [
    {
      name: 'home',
      label: 'Home',
      href: '/',
      icon: '🏠',
      sortOrder: 1,
      isSystem: true
    },
    {
      name: 'news',
      label: 'News',
      href: '/news',
      icon: '📰',
      sortOrder: 2,
      isSystem: true
    },
    {
      name: 'articles',
      label: 'Articles',
      href: '/articles',
      icon: '📄',
      sortOrder: 3,
      isSystem: true
    },
    {
      name: 'opinion',
      label: 'Opinion',
      href: '/opinion',
      icon: '💭',
      sortOrder: 4,
      isSystem: true
    },
    {
      name: 'analysis',
      label: 'Analysis',
      href: '/analysis',
      icon: '📊',
      sortOrder: 5,
      isSystem: true
    },
    {
      name: 'shorts',
      label: 'Shorts',
      href: '/shorts',
      icon: '⚡',
      sortOrder: 6,
      isSystem: true
    },
    {
      name: 'stories',
      label: 'Stories',
      href: '/web-stories',
      icon: '📖',
      sortOrder: 7,
      isSystem: true
    },
    {
      name: 'trending',
      label: 'Trending',
      href: '/trending',
      icon: '🔥',
      sortOrder: 8,
      isSystem: true
    },
    // additional site pages (editable)
    {
      name: 'about',
      label: 'About',
      href: '/about',
      icon: 'ℹ️',
      sortOrder: 9,
      isSystem: false
    },
    {
      name: 'contact',
      label: 'Contact',
      href: '/contact',
      icon: '📞',
      sortOrder: 10,
      isSystem: false
    },
    {
      name: 'services',
      label: 'Services',
      href: '/services',
      icon: '🛠️',
      sortOrder: 11,
      isSystem: false
    },
    {
      name: 'careers',
      label: 'Careers',
      href: '/careers',
      icon: '💼',
      sortOrder: 12,
      isSystem: false
    },
    // seeding categories as navigation items (editable)
    {
      name: 'business',
      label: 'Business',
      href: '/categories/business',
      icon: '💼',
      sortOrder: 13,
      isSystem: false
    },
    {
      name: 'technology',
      label: 'Technology',
      href: '/categories/technology',
      icon: '💻',
      sortOrder: 14,
      isSystem: false
    },
    {
      name: 'sports',
      label: 'Sports',
      href: '/categories/sports',
      icon: '⚽',
      sortOrder: 15,
      isSystem: false
    },
    {
      name: 'entertainment',
      label: 'Entertainment',
      href: '/categories/entertainment',
      icon: '🎬',
      sortOrder: 16,
      isSystem: false
    },
    {
      name: 'health',
      label: 'Health',
      href: '/categories/health',
      icon: '🏥',
      sortOrder: 17,
      isSystem: false
    },
    {
      name: 'science',
      label: 'Science',
      href: '/categories/science',
      icon: '🔬',
      sortOrder: 18,
      isSystem: false
    },
    {
      name: 'world',
      label: 'World',
      href: '/categories/world',
      icon: '🌍',
      sortOrder: 19,
      isSystem: false
    },
    {
      name: 'politics',
      label: 'Politics',
      href: '/categories/politics',
      icon: '🏛️',
      sortOrder: 20,
      isSystem: false
    }
  ];

  for (const item of navigationItems) {
    try {
      await prisma.navigation.upsert({
        where: { name: item.name },
        update: item,
        create: item
      });
      console.log(`✅ Created/Updated navigation item: ${item.label}`);
    } catch (error) {
      console.error(`❌ Failed to create navigation item ${item.label}:`, error);
    }
  }

  console.log('🎉 Navigation seeding completed!');
}

if (require.main === module) {
  seedNavigation()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedNavigation };