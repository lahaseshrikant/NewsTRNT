import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech news and innovations',
        color: '#3182CE',
        icon: '💻'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'politics' },
      update: {},
      create: {
        name: 'Politics',
        slug: 'politics',
        description: 'Political news and government updates',
        color: '#DC2626',
        icon: '🏛️'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business and finance news',
        color: '#059669',
        icon: '💼'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'science' },
      update: {},
      create: {
        name: 'Science',
        slug: 'science',
        description: 'Scientific discoveries and research',
        color: '#7C3AED',
        icon: '🔬'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'health' },
      update: {},
      create: {
        name: 'Health',
        slug: 'health',
        description: 'Health and medical news',
        color: '#DB2777',
        icon: '🏥'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news and updates',
        color: '#EA580C',
        icon: '⚽'
      }
    })
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@NewsTRNT.com' },
    update: {},
    create: {
      email: 'admin@NewsTRNT.com',
      fullName: 'NewsTRNT Admin',
      passwordHash: hashedPassword,
      isAdmin: true,
      isVerified: true,
      preferences: {
        categories: categories.map(c => c.id),
        emailNotifications: true,
        pushNotifications: true
      }
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create Test User
  const testUserPassword = await bcrypt.hash('testuser123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'user@NewsTRNT.com' },
    update: {},
    create: {
      email: 'user@NewsTRNT.com',
      username: 'testuser',
      fullName: 'Test User',
      passwordHash: testUserPassword,
      isAdmin: false,
      isVerified: true,
      preferences: {
        categories: [categories[0].id, categories[2].id], // Tech and Business
        emailNotifications: true,
        pushNotifications: false
      }
    }
  });

  console.log('✅ Test user created:', testUser.email);

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'breaking' },
      update: {},
      create: { name: 'Breaking', slug: 'breaking' }
    }),
    prisma.tag.upsert({
      where: { slug: 'ai' },
      update: {},
      create: { name: 'AI', slug: 'ai' }
    }),
    prisma.tag.upsert({
      where: { slug: 'startups' },
      update: {},
      create: { name: 'Startups', slug: 'startups' }
    }),
    prisma.tag.upsert({
      where: { slug: 'innovation' },
      update: {},
      create: { name: 'Innovation', slug: 'innovation' }
    })
  ]);

  console.log('✅ Tags created:', tags.length);

  // Create Sample Articles
  const articles = [
    {
      title: 'AI Revolution: ChatGPT-5 Announces Breakthrough in Human-like Reasoning',
      slug: 'ai-revolution-chatgpt-5-announces-breakthrough-human-reasoning',
      summary: 'OpenAI unveils ChatGPT-5 with unprecedented reasoning capabilities that could transform how we interact with artificial intelligence in our daily lives.',
      content: `In a groundbreaking announcement that has sent shockwaves through the tech industry, OpenAI has unveiled ChatGPT-5, featuring revolutionary advances in artificial reasoning that bring AI closer to human-like thinking than ever before.

The new model demonstrates remarkable improvements in logical reasoning, emotional understanding, and contextual awareness. During live demonstrations, ChatGPT-5 successfully solved complex multi-step problems, engaged in nuanced philosophical discussions, and even displayed what researchers describe as "creative intuition."

Key improvements include:

• **Enhanced Reasoning**: The model can now work through complex logical chains with 94% accuracy, compared to 67% in previous versions
• **Emotional Intelligence**: Advanced understanding of human emotions and social contexts
• **Memory Persistence**: Ability to maintain context across extended conversations spanning days
• **Multimodal Integration**: Seamless processing of text, images, audio, and video inputs

Dr. Sarah Chen, OpenAI's Director of Research, explained: "ChatGPT-5 represents a quantum leap in AI capabilities. We're seeing emergent behaviors that suggest the model is developing genuine understanding rather than just pattern matching."

The implications for industries ranging from healthcare to education are staggering. Early beta testers report that the AI can now assist with complex medical diagnoses, create personalized learning curricula, and even help with creative writing projects with unprecedented sophistication.

However, the announcement has also raised important questions about AI safety and ethics. Critics worry about the rapid pace of development and the potential for misuse of such powerful technology.

OpenAI has assured the public that extensive safety measures are in place, including robust content filtering, bias detection systems, and careful monitoring of the model's outputs.

The technology is expected to be available to the public in Q2 2025, marking what many experts believe will be a defining moment in the history of artificial intelligence.`,
      categoryId: categories[0].id, // Technology
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: true,
      isFeatured: true,
      readingTime: 4,
      tags: [tags[0], tags[1]] // Breaking, AI
    },
    {
      title: 'Global Climate Summit Reaches Historic $500B Green Energy Agreement',
      slug: 'global-climate-summit-historic-500b-green-energy-agreement',
      summary: 'World leaders commit to the largest climate investment in history, promising to accelerate renewable energy adoption and create millions of green jobs.',
      content: `In an unprecedented show of global unity, leaders from 195 nations have signed the most ambitious climate agreement in history, committing $500 billion toward renewable energy infrastructure and climate resilience over the next decade.

The agreement, reached after intense negotiations at the Global Climate Summit in Copenhagen, represents a tripling of previous climate commitments and establishes binding targets for carbon neutrality by 2040.

Major commitments include:

• **$200B for Solar Infrastructure**: Massive expansion of solar farms and residential solar programs
• **$150B for Wind Energy**: Both onshore and offshore wind projects across six continents  
• **$100B for Energy Storage**: Advanced battery technology and grid modernization
• **$50B for Climate Adaptation**: Protecting vulnerable communities from climate impacts

"This is humanity's moonshot moment," declared UN Secretary-General António Guterres. "We're not just fighting climate change – we're building the foundation for a sustainable, prosperous future for all."

The agreement establishes several groundbreaking mechanisms:

**Carbon Credit Revolution**: A new global carbon trading system that allows developing nations to monetize forest preservation and renewable energy projects.

**Green Job Guarantee**: Participating countries commit to retraining fossil fuel workers for renewable energy careers, with full salary support during transition periods.

**Technology Sharing**: Developed nations will share clean energy patents royalty-free with developing countries.

**Climate Justice Fund**: $25 billion dedicated to supporting climate refugees and vulnerable communities.

Early market reactions have been overwhelmingly positive, with renewable energy stocks surging 15% globally and several major oil companies announcing accelerated transition plans.

However, environmental groups remain cautiously optimistic, noting that previous climate commitments have often fallen short of targets. "The real test will be in implementation," said Greenpeace International Director Jennifer Morgan.

The agreement goes into effect January 1, 2026, with quarterly progress reviews and financial penalties for countries that miss their targets.

Industry experts predict this could be the catalyst that finally makes renewable energy cheaper than fossil fuels in every market worldwide, potentially ending the age of carbon-based energy within the next two decades.`,
      categoryId: categories[3].id, // Science  
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: true,
      isFeatured: true,
      readingTime: 5,
      tags: [tags[0]] // Breaking
    },
    {
      title: 'Startup Unicorns Hit Record High: 47 New Billion-Dollar Companies This Quarter',
      slug: 'startup-unicorns-record-high-47-new-billion-dollar-companies',
      summary: 'The entrepreneurship boom continues as venture capital funding creates an unprecedented number of unicorn startups across diverse industries.',
      content: `The startup ecosystem is experiencing its most explosive growth period in history, with 47 companies achieving unicorn status (valuations over $1 billion) in just the past three months – a 200% increase from the same period last year.

This unprecedented surge is being driven by a perfect storm of factors: abundant venture capital, accelerated digital transformation, and breakthrough innovations in AI, biotechnology, and clean energy.

**Top Performing Sectors:**

• **AI & Machine Learning**: 18 new unicorns, led by companies developing AI chips and autonomous systems
• **FinTech**: 12 new unicorns, including several cryptocurrency and digital banking platforms  
• **HealthTech**: 8 new unicorns, particularly in personalized medicine and telemedicine
• **CleanTech**: 5 new unicorns, focusing on battery technology and carbon capture
• **Other**: 4 unicorns across various sectors including logistics and education

The largest funding round was secured by NeuralChip, an AI hardware startup that raised $2.8 billion for its revolutionary brain-computer interface technology. The company's valuation jumped from $500 million to $15 billion in just six months.

"We're witnessing a fundamental shift in how fast companies can scale," explained venture capitalist Marc Andreessen. "Technologies that used to take decades to develop are now reaching market in 2-3 years."

**Global Distribution:**
- United States: 28 unicorns
- China: 8 unicorns  
- Europe: 6 unicorns
- India: 3 unicorns
- Other regions: 2 unicorns

The trend is being fueled by several factors:

**Abundant Capital**: Venture capital firms raised a record $150 billion in 2024, providing ample funding for high-growth companies.

**AI Acceleration**: Artificial intelligence is enabling startups to automate complex processes and scale faster than ever before.

**Remote Work Revolution**: Companies can now access global talent pools, reducing operational costs while expanding capabilities.

**ESG Focus**: Investors are prioritizing companies with strong environmental, social, and governance practices.

However, some analysts warn of potential bubble conditions. "The speed of these valuations is concerning," noted economist Dr. Robert Shiller. "We need to ensure these companies have sustainable business models, not just impressive growth metrics."

Despite concerns, the unicorn boom is creating significant economic impact. These 47 companies have collectively created over 150,000 jobs and are projected to generate $50 billion in revenue this year.

The trend shows no signs of slowing, with industry experts predicting we could see over 200 new unicorns by the end of 2025 – a milestone that would reshape the global economy and cement this decade as the greatest entrepreneurial boom in history.`,
      categoryId: categories[2].id, // Business
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: false,
      isFeatured: true,
      readingTime: 6,
      tags: [tags[2], tags[3]] // Startups, Innovation
    }
  ];

  for (const articleData of articles) {
    const { tags: articleTags, ...articleWithoutTags } = articleData;
    
    const article = await prisma.article.upsert({
      where: { slug: articleWithoutTags.slug },
      update: {},
      create: {
        ...articleWithoutTags,
        publishedAt: new Date()
      }
    });

    // Connect tags
    for (const tag of articleTags) {
      await prisma.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId: article.id,
            tagId: tag.id
          }
        },
        update: {},
        create: {
          articleId: article.id,
          tagId: tag.id
        }
      });
    }

    console.log('✅ Article created:', article.title);
  }

  console.log('🌱 Database seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@NewsTRNT.com / admin123');
  console.log('User: user@NewsTRNT.com / testuser123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
