const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`select current_user, current_schema(), current_setting('search_path')`;
    console.log('DB info:', result);
  } catch (err) {
    console.error('Error querying DB info:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
