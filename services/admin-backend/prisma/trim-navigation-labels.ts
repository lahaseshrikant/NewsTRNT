import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalize = (s: string) =>
  String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();

async function main() {
  console.log('🔎 Scanning navigation labels for whitespace / invisible characters...');
  const items = await prisma.navigation.findMany();
  let updated = 0;

  for (const it of items) {
    const clean = normalize(it.label || '');
    if (clean !== (it.label || '')) {
      await prisma.navigation.update({ where: { id: it.id }, data: { label: clean } });
      console.log(`✂️ Trimmed: id=${it.id} | "${it.label}" -> "${clean}"`);
      updated++;
    }
  }

  console.log(`✅ Completed. Records updated: ${updated}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });