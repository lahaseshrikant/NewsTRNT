const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.$queryRaw`SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'comments'`;
    const commentPrivs = await prisma.$queryRaw`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='comments' ORDER BY grantee, privilege_type`;
    const articlePrivs = await prisma.$queryRaw`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='articles' ORDER BY grantee, privilege_type`;

    console.log('tables:', tables);
    console.log('comment privileges:', commentPrivs);
    console.log('article privileges:', articlePrivs);
  } catch (err) {
    console.error('Error checking comments table schema/privs:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
