import prisma from './src/config/database';

(async () => {
  try {
    const rows = await prisma.marketIndex.findMany({ take: 5 });
    console.log('sample marketIndex:', rows.length);
    const count = await prisma.marketIndex.count();
    console.log('total count', count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();