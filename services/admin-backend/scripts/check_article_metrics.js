const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const res = await prisma.$queryRaw`select to_regclass('public.article_metrics')::text as tbl`;
    console.log('article_metrics exists:', res);
  } catch (err) {
    console.error('error checking table:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
