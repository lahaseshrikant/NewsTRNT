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
    }),
    prisma.category.upsert({
      where: { slug: 'entertainment' },
      update: {},
      create: {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Entertainment news and celebrity updates',
        color: '#F59E0B',
        icon: '🎬'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'world' },
      update: {},
      create: {
        name: 'World',
        slug: 'world',
        description: 'International news and global events',
        color: '#06B6D4',
        icon: '🌍'
      }
    })
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create Subcategories
  const subCategories = await Promise.all([
    // Health subcategories
    prisma.subCategory.upsert({
      where: { slug: 'medical-research' },
      update: {},
      create: {
        name: 'Medical Research',
        slug: 'medical-research',
        categoryId: categories.find(c => c.slug === 'health')!.id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'wellness' },
      update: {},
      create: {
        name: 'Wellness',
        slug: 'wellness',
        categoryId: categories.find(c => c.slug === 'health')!.id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'mental-health' },
      update: {},
      create: {
        name: 'Mental Health',
        slug: 'mental-health',
        categoryId: categories.find(c => c.slug === 'health')!.id,
        sortOrder: 3
      }
    }),
    // Technology subcategories
    prisma.subCategory.upsert({
      where: { slug: 'ai-ml' },
      update: {},
      create: {
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        categoryId: categories.find(c => c.slug === 'technology')!.id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'startups' },
      update: {},
      create: {
        name: 'Startups',
        slug: 'startups',
        categoryId: categories.find(c => c.slug === 'technology')!.id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'cybersecurity' },
      update: {},
      create: {
        name: 'Cybersecurity',
        slug: 'cybersecurity',
        categoryId: categories.find(c => c.slug === 'technology')!.id,
        sortOrder: 3
      }
    }),
    // Entertainment subcategories
    prisma.subCategory.upsert({
      where: { slug: 'movies' },
      update: {},
      create: {
        name: 'Movies',
        slug: 'movies',
        categoryId: categories.find(c => c.slug === 'entertainment')!.id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'music' },
      update: {},
      create: {
        name: 'Music',
        slug: 'music',
        categoryId: categories.find(c => c.slug === 'entertainment')!.id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'celebrities' },
      update: {},
      create: {
        name: 'Celebrities',
        slug: 'celebrities',
        categoryId: categories.find(c => c.slug === 'entertainment')!.id,
        sortOrder: 3
      }
    }),
    // World subcategories
    prisma.subCategory.upsert({
      where: { slug: 'asia' },
      update: {},
      create: {
        name: 'Asia',
        slug: 'asia',
        categoryId: categories.find(c => c.slug === 'world')!.id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'europe' },
      update: {},
      create: {
        name: 'Europe',
        slug: 'europe',
        categoryId: categories.find(c => c.slug === 'world')!.id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.upsert({
      where: { slug: 'americas' },
      update: {},
      create: {
        name: 'Americas',
        slug: 'americas',
        categoryId: categories.find(c => c.slug === 'world')!.id,
        sortOrder: 3
      }
    })
  ]);

  console.log('✅ Subcategories created:', subCategories.length);

  // Create Admin User
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD environment variable must be set!');
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  
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
  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword) {
    throw new Error('SEED_TEST_PASSWORD environment variable must be set!');
  }
  const testUserPassword = await bcrypt.hash(testPassword, 12);
  
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
    },
    // Politics Article
    {
      title: 'Historic Election Reform Bill Passes Congress with Bipartisan Support',
      slug: 'historic-election-reform-bill-passes-congress',
      summary: 'Landmark legislation aims to modernize voting infrastructure and increase accessibility for all Americans.',
      content: `In a rare display of bipartisan cooperation, Congress has passed the most comprehensive election reform legislation in decades, promising to modernize voting systems and expand access to the ballot box.

The Election Modernization and Accessibility Act passed the House 312-118 and the Senate 72-28, securing enough votes to override any potential veto.

**Key Provisions Include:**

• **Automatic Voter Registration**: Citizens will be automatically registered when obtaining driver's licenses or government IDs
• **Early Voting Expansion**: Mandates at least 14 days of early voting in all states
• **Voting Infrastructure Upgrade**: $5 billion for states to upgrade aging voting machines and cybersecurity
• **Mail-In Voting Standards**: Establishes uniform standards for mail-in ballot processing

"This is what democracy looks like when we work together," said Senator Maria Gonzalez, the bill's lead sponsor. "We've created a framework that makes voting easier while maintaining security."

The legislation comes after years of contentious debate over voting rights and election security. Supporters argue it strikes a careful balance between accessibility and integrity.

However, critics on both sides remain concerned. Some argue the bill doesn't go far enough in protecting voting rights, while others worry about potential fraud risks.

Implementation will be phased in over the next two years, with full compliance required by the 2026 midterm elections.`,
      categoryId: categories[1].id, // Politics
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: false,
      isFeatured: true,
      isTrending: true,
      readingTime: 4,
      tags: [tags[0]] // Breaking
    },
    // Health Article
    {
      title: 'Revolutionary mRNA Vaccine Shows 98% Effectiveness Against New Flu Strain',
      slug: 'mrna-vaccine-98-effectiveness-new-flu-strain',
      summary: 'Building on COVID-19 vaccine technology, scientists develop highly effective universal flu vaccine.',
      content: `Scientists have announced a breakthrough in influenza prevention, with a new mRNA-based vaccine demonstrating 98% effectiveness against multiple flu strains in Phase 3 clinical trials.

The vaccine, developed by a collaboration between Moderna and the National Institutes of Health, represents a major advancement in flu prevention technology.

**Trial Results:**

• **98% Efficacy**: Against all tested flu strains including H1N1, H3N2, and influenza B
• **85,000 Participants**: The largest flu vaccine trial in history
• **Long-lasting Protection**: Immunity maintained for at least 18 months
• **Minimal Side Effects**: Similar to existing COVID-19 vaccines

"This is the holy grail of flu vaccines," said Dr. Anthony Marcus, lead researcher on the trial. "We're potentially looking at a single shot that could replace annual flu vaccinations."

The vaccine works by targeting conserved regions of the influenza virus that rarely mutate, providing broad protection against current and future strains.

**Public Health Impact:**

Seasonal flu kills between 290,000 and 650,000 people globally each year. A highly effective universal vaccine could prevent the majority of these deaths.

The FDA has granted fast-track designation, with potential approval expected by Fall 2025. Manufacturing capacity is already being scaled to meet anticipated global demand.`,
      categoryId: categories[4].id, // Health
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: true,
      isFeatured: true,
      readingTime: 4,
      tags: [tags[0], tags[3]] // Breaking, Innovation
    },
    // Sports Article
    {
      title: 'Underdog Team Wins Championship in Historic Overtime Thriller',
      slug: 'underdog-team-wins-championship-overtime-thriller',
      summary: 'In one of the greatest games ever played, the underdogs complete an improbable journey to claim the title.',
      content: `In a finish that will be replayed for generations, the underdog team completed their Cinderella run with a dramatic overtime victory to claim the championship title.

The game, which many are already calling the greatest in the sport's history, featured multiple lead changes, buzzer-beating shots, and a performance for the ages.

**Game Highlights:**

• **Final Score**: 112-109 in double overtime
• **MVP Performance**: Star player scored 47 points, including the game-winning shot
• **Comeback Kings**: Team overcame a 15-point deficit in the fourth quarter
• **Record Viewership**: 48 million viewers, the most-watched championship in a decade

"I can't believe this is real," said the team captain, fighting back tears. "We were 200-to-1 odds at the start of the season. Nobody believed in us except us."

The victory caps an remarkable season for the franchise, which hadn't won a championship in 52 years. Fans who had waited their entire lives flooded the streets in celebration.

**Historic Context:**

The team becomes the first 8th seed to win the championship since the league's expansion. Their playoff run included victories over three teams that had been ranked #1 during the regular season.

A victory parade is scheduled for downtown this weekend, with officials expecting over 1 million fans to attend.`,
      categoryId: categories[5].id, // Sports
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: false,
      isFeatured: false,
      isTrending: true,
      readingTime: 4,
      tags: [tags[0]] // Breaking
    },
    // Science Article
    {
      title: 'Scientists Achieve Nuclear Fusion Milestone: Net Energy Gain Confirmed',
      slug: 'scientists-achieve-nuclear-fusion-milestone-net-energy-gain',
      summary: 'Breakthrough at national laboratory produces more energy than consumed, marking pivotal moment for clean energy.',
      content: `In what scientists are calling a "Wright Brothers moment" for clean energy, researchers at the National Ignition Facility have achieved a confirmed net energy gain from nuclear fusion for the first time in history.

The breakthrough, which has been decades in the making, could eventually lead to virtually limitless clean energy.

**The Achievement:**

• **Energy Output**: 3.15 megajoules produced from 2.05 megajoules of laser input
• **Net Gain**: 54% more energy out than put in
• **Reproducibility**: Successfully replicated in three subsequent experiments
• **Temperature**: Achieved conditions hotter than the center of the sun

"This is the moment we've been working toward for 60 years," said Dr. Kim Budil, director of Lawrence Livermore National Laboratory. "We have proven that fusion ignition is possible."

**How It Works:**

Unlike nuclear fission (which powers current nuclear plants by splitting atoms), fusion combines light atoms under extreme pressure and heat to release energy – the same process that powers the sun.

**Path to Commercial Power:**

While today's achievement is historic, commercial fusion power plants are still likely 20-30 years away. The next step involves developing reactors that can sustain fusion reactions continuously.

The breakthrough has already sparked a surge in private investment, with several fusion startups reporting record funding rounds in the days following the announcement.`,
      categoryId: categories[3].id, // Science
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: true,
      isFeatured: true,
      isTrending: true,
      readingTime: 5,
      tags: [tags[0], tags[3]] // Breaking, Innovation
    },
    // More Tech Articles
    {
      title: 'Apple Unveils Revolutionary AR Glasses at Surprise Event',
      slug: 'apple-unveils-revolutionary-ar-glasses-surprise-event',
      summary: 'The long-rumored Apple Glass finally arrives, promising to transform how we interact with the digital world.',
      content: `Apple has officially entered the augmented reality market with the unveiling of Apple Glass, a sleek pair of AR glasses that CEO Tim Cook called "the most advanced consumer electronics device ever created."

The surprise announcement, made at Apple's Cupertino headquarters, sent the company's stock to all-time highs and sparked predictions of a new era in personal computing.

**Key Features:**

• **All-Day Battery**: 12 hours of continuous use
• **Prescription Compatible**: Works with most prescription lens types
• **Spatial Computing**: Full integration with Apple's ecosystem
• **Privacy-First Design**: No camera indicator lights, strict data controls

"This isn't about replacing your iPhone," Cook explained. "This is about seamlessly blending digital information with your physical world."

The glasses feature transparent displays that overlay digital content onto the real world, from navigation arrows on sidewalks to floating message notifications.

**Price and Availability:**

• **Apple Glass**: Starting at $1,299
• **Available**: March 2025
• **Pre-orders**: Begin January 15

Industry analysts predict Apple Glass could generate $10-15 billion in first-year sales, creating a new major product category for the company.`,
      categoryId: categories[0].id, // Technology
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: false,
      isFeatured: true,
      isTrending: true,
      readingTime: 4,
      tags: [tags[1], tags[3]] // AI, Innovation
    },
    // Business News
    {
      title: 'Federal Reserve Announces Interest Rate Pivot, Markets Rally',
      slug: 'federal-reserve-announces-interest-rate-pivot-markets-rally',
      summary: 'Central bank signals end of rate hiking cycle, triggering broad market gains.',
      content: `The Federal Reserve has announced a significant shift in monetary policy, signaling the end of its aggressive rate-hiking campaign and sending financial markets to record highs.

Fed Chair Jerome Powell's statement indicated that inflation has been sufficiently contained and that the central bank will begin cutting rates in the first quarter of next year.

**Market Reaction:**

• **S&P 500**: Up 2.8%, largest single-day gain in two years
• **Nasdaq**: Up 3.5%, tech stocks lead the rally
• **10-Year Treasury**: Yield drops to 3.8%
• **Bitcoin**: Surges past $50,000

"We've achieved what we set out to do," Powell said in his press conference. "The economy is cooling at an appropriate pace, and inflation is trending back to our 2% target."

**Rate Cut Expectations:**

Markets are now pricing in 4-5 rate cuts over the next 12 months, bringing the fed funds rate from the current 5.25-5.50% range down to around 4%.

**Economic Outlook:**

The Fed's updated projections show:
• GDP Growth: 2.1% for 2025
• Unemployment: 4.2% expected peak
• Core Inflation: 2.4% by year-end 2025

Economists broadly welcomed the pivot, though some cautioned that declaring victory over inflation may be premature.`,
      categoryId: categories[2].id, // Business
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: true,
      isFeatured: false,
      isTrending: true,
      readingTime: 4,
      tags: [tags[0]] // Breaking
    },
    // Health Short News
    {
      title: 'New Study Links Daily Walking to 40% Lower Heart Disease Risk',
      slug: 'new-study-links-daily-walking-lower-heart-disease-risk',
      summary: 'Research confirms that even moderate daily exercise significantly reduces cardiovascular risk.',
      content: `A comprehensive study involving 150,000 participants has found that walking just 30 minutes a day reduces heart disease risk by 40%, reinforcing the power of simple, accessible exercise.

The research, published in the Journal of the American Heart Association, tracked participants over 15 years.

**Key Findings:**

• **40% Risk Reduction**: For those walking 30+ minutes daily
• **25% Reduction**: For those walking 15-30 minutes daily
• **Dose Response**: More walking generally equals more benefit
• **Age Independent**: Benefits observed across all age groups

"You don't need a gym membership or expensive equipment," said lead researcher Dr. Helen Park. "Walking is medicine, and it's free."

The study also found that breaking up walks throughout the day is just as effective as one continuous walk, making it easier for people with busy schedules to incorporate exercise.`,
      categoryId: categories[4].id, // Health
      createdBy: adminUser.id,
      imageUrl: '/api/placeholder/800/400',
      isBreaking: false,
      isFeatured: false,
      isTrending: false,
      readingTime: 3,
      tags: []
    }
  ];

  for (const articleData of articles) {
    const { tags: articleTags, ...articleWithoutTags } = articleData;
    
    const article = await prisma.article.upsert({
      where: { slug: articleWithoutTags.slug },
      update: {
        isPublished: true,
        publishedAt: new Date()
      },
      create: {
        ...articleWithoutTags,
        isPublished: true,
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

  // Create Web Stories with full slide data matching frontend interface
  const webStories = [
    {
      title: 'Climate Summit 2024: Key Highlights',
      slug: 'climate-summit-2024-highlights',
      categoryId: categories[3].id, // Science
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          content: {
            headline: 'Climate Summit 2024',
            text: 'World leaders gather in Dubai for crucial climate discussions that could shape our planet\'s future',
            image: '/api/placeholder/400/700'
          },
          duration: 6000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          content: {
            headline: '195 Countries Participate',
            text: 'The largest climate summit in history brings together world leaders, activists, and scientists to address the climate crisis'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'image',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          content: {
            headline: '$100B Climate Fund Launched',
            text: 'Historic funding commitment to help developing nations transition to renewable energy',
            image: '/api/placeholder/400/700',
            cta: {
              text: 'See More',
              url: '/web-stories'
            }
          },
          duration: 6000
        },
        {
          id: 'slide-4',
          type: 'text',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          content: {
            headline: 'What\'s Next?',
            text: 'Countries have 6 months to submit their updated climate action plans. The next summit will be held in 2025.',
            cta: {
              text: 'Stay Updated',
              url: '/newsletter'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Environmental Team',
      duration: 45,
      coverImage: '/api/placeholder/400/600',
      isFeature: true,
      priority: 'high',
      viewCount: 12540,
      likeCount: 892,
      shareCount: 234,
      createdBy: adminUser.id
    },
    {
      title: 'AI Revolution in Healthcare',
      slug: 'ai-healthcare-revolution',
      categoryId: categories[0].id, // Technology
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          content: {
            headline: 'AI Transforms Healthcare',
            text: 'Revolutionary breakthroughs in medical diagnosis',
            image: '/api/placeholder/400/600'
          },
          duration: 6000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          content: {
            headline: '95% Accuracy Rate',
            text: 'AI models now outperform human doctors in early detection of rare diseases'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'image',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          content: {
            headline: 'Robotic Surgery',
            text: 'Precision surgeries with AI-assisted robotic systems',
            image: '/api/placeholder/400/600'
          },
          duration: 6000
        },
        {
          id: 'slide-4',
          type: 'text',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          content: {
            headline: 'Future of Medicine',
            text: 'Personalized treatments based on AI analysis of patient data',
            cta: {
              text: 'Learn More',
              url: '/category/technology'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Tech News',
      duration: 60,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal',
      viewCount: 8920,
      likeCount: 654,
      shareCount: 187,
      createdBy: adminUser.id
    },
    {
      title: 'Space Mission Success',
      slug: 'space-mission-success-2024',
      categoryId: categories[3].id, // Science
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          content: {
            headline: 'Mars Mission Update',
            text: 'Historic rover landing sends first images from the red planet',
            image: '/api/placeholder/400/600'
          },
          duration: 6000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          content: {
            headline: 'Water Discovery',
            text: 'Scientists confirm presence of subsurface water ice'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'image',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          content: {
            headline: 'Next Steps',
            text: 'Preparing for the first human mission to Mars by 2030',
            image: '/api/placeholder/400/600',
            cta: {
              text: 'Explore More',
              url: '/category/science'
            }
          },
          duration: 6000
        }
      ],
      status: 'published',
      author: 'Space Desk',
      duration: 50,
      coverImage: '/api/placeholder/400/600',
      isFeature: true,
      priority: 'high',
      viewCount: 15670,
      likeCount: 1234,
      shareCount: 456,
      createdBy: adminUser.id
    },
    {
      title: 'Economic Outlook 2024',
      slug: 'economic-outlook-2024',
      categoryId: categories[2].id, // Business
      slides: [
        {
          id: 'slide-1',
          type: 'text',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          content: {
            headline: 'Market Outlook 2024',
            text: 'Expert predictions for the global economy'
          },
          duration: 5000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          content: {
            headline: 'Growth Sectors',
            text: 'Tech, healthcare, and renewable energy lead the way'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'text',
          background: 'linear-gradient(135deg, #3182CE 0%, #63b3ed 100%)',
          content: {
            headline: 'Investment Tips',
            text: 'Diversification remains key in volatile markets',
            cta: {
              text: 'Read Analysis',
              url: '/category/business'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Business Team',
      duration: 40,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal',
      viewCount: 7430,
      likeCount: 345,
      shareCount: 123,
      createdBy: adminUser.id
    },
    {
      title: 'Sports Championship Finals',
      slug: 'sports-championship-finals-2024',
      categoryId: categories[5].id, // Sports
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #EA580C 0%, #f97316 100%)',
          content: {
            headline: 'Championship Finals',
            text: 'The most anticipated matchup of the year',
            image: '/api/placeholder/400/600'
          },
          duration: 5000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          content: {
            headline: 'Record Attendance',
            text: '100,000 fans pack the stadium for historic game'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'text',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          content: {
            headline: 'Final Score',
            text: 'Underdogs clinch victory in overtime thriller',
            cta: {
              text: 'See Highlights',
              url: '/category/sports'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Sports Desk',
      duration: 35,
      coverImage: '/api/placeholder/400/600',
      isFeature: true,
      priority: 'high',
      viewCount: 22100,
      likeCount: 2345,
      shareCount: 789,
      createdBy: adminUser.id
    },
    {
      title: 'Health & Wellness Trends',
      slug: 'health-wellness-trends-2024',
      categoryId: categories[4].id, // Health
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #DB2777 0%, #ec4899 100%)',
          content: {
            headline: 'Wellness Revolution',
            text: 'New approaches to mental and physical health',
            image: '/api/placeholder/400/600'
          },
          duration: 5000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          content: {
            headline: 'Mental Health Focus',
            text: 'Workplaces prioritize employee wellbeing'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'text',
          background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
          content: {
            headline: 'Nutrition Science',
            text: 'Personalized diets based on genetic testing',
            cta: {
              text: 'Learn More',
              url: '/category/health'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Health Team',
      duration: 40,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal',
      viewCount: 9870,
      likeCount: 567,
      shareCount: 234,
      createdBy: adminUser.id
    },
    {
      title: 'Startup Success Stories',
      slug: 'startup-success-stories-2024',
      categoryId: categories[2].id, // Business
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          content: {
            headline: 'Unicorn Boom',
            text: '47 new unicorns emerge this quarter',
            image: '/api/placeholder/400/600'
          },
          duration: 5000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #3182CE 0%, #63b3ed 100%)',
          content: {
            headline: 'Record Funding',
            text: '$150B in venture capital raised in 2024'
          },
          duration: 5000
        }
      ],
      status: 'draft',
      author: 'Business Team',
      duration: 30,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'low',
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      createdBy: adminUser.id
    },
    {
      title: 'Political Landscape Update',
      slug: 'political-landscape-2024',
      categoryId: categories[1].id, // Politics
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #DC2626 0%, #ef4444 100%)',
          content: {
            headline: 'Election Updates',
            text: 'Key developments in global elections',
            image: '/api/placeholder/400/600'
          },
          duration: 5000
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          content: {
            headline: 'Policy Changes',
            text: 'Major legislative updates across nations'
          },
          duration: 5000
        },
        {
          id: 'slide-3',
          type: 'text',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          content: {
            headline: 'What It Means',
            text: 'Impact analysis of recent political shifts',
            cta: {
              text: 'Read More',
              url: '/category/politics'
            }
          },
          duration: 5000
        }
      ],
      status: 'published',
      author: 'Political Team',
      duration: 45,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal',
      viewCount: 11230,
      likeCount: 432,
      shareCount: 321,
      createdBy: adminUser.id
    }
  ];

  for (const webStoryData of webStories) {
    const webStory = await prisma.webStory.upsert({
      where: { slug: webStoryData.slug },
      update: {},
      create: {
        ...webStoryData,
        publishedAt: webStoryData.status === 'published' ? new Date() : null
      }
    });

    console.log('✅ Web Story created:', webStory.title);
  }

  console.log('🌱 Database seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@NewsTRNT.com / [SEED_ADMIN_PASSWORD]');
  console.log('User: user@NewsTRNT.com / [SEED_TEST_PASSWORD]');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
