const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const info = await prisma.$queryRaw`
      select
        current_user as user,
        current_database() as database,
        current_schema() as schema,
        current_setting('search_path') as search_path,
        has_table_privilege(current_user, 'public.comments', 'insert') as can_insert,
        has_table_privilege(current_user, 'public.comments', 'select') as can_select,
        has_table_privilege(current_user, 'public.comments', 'update') as can_update
    `;
    console.log('DB info:', info);
  } catch (err) {
    console.error('Error querying db info:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
