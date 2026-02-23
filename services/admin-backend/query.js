const prisma = require('./src/config/database').default;
(async () => {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.marketIndex.findMany({ take: 5 });
    console.log('sample marketIndex:', rows);
    const count = await prisma.marketIndex.count();
    console.log('total count', count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();