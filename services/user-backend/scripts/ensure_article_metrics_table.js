const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.article_metrics (
        article_id uuid PRIMARY KEY,
        comment_count int NOT NULL DEFAULT 0,
        like_count int NOT NULL DEFAULT 0,
        view_count int NOT NULL DEFAULT 0,
        share_count int NOT NULL DEFAULT 0,
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_article_metrics_article FOREIGN KEY (article_id)
          REFERENCES public.articles(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ ensured public.article_metrics table exists');
  } catch (err) {
    console.error('Failed to ensure article_metrics table:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
