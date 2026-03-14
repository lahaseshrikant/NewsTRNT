const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const article = await prisma.article.findFirst({ select: { id: true } });
    console.log('articleId', article?.id);
  } catch (err) {
    console.error('Error fetching articleId:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
