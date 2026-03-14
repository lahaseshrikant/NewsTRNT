const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const res = await prisma.$queryRaw`select relrowsecurity, relforcerowsecurity from pg_class where relname = 'comments'`;
    console.log('RLS info:', res);
  } catch (err) {
    console.error('Error querying RLS info:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
