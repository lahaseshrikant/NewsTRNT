/**
 * scripts/sync-market-symbols.ts
 *
 * One-time (and safe-to-rerun) migration script.
 *
 * What it does:
 *   1. Loads every row in MarketIndex
 *   2. Resolves each symbol to its canonical ^ -prefixed equivalent via the alias map
 *   3. Loads the matching MarketIndexConfig row to get the correct metadata
 *   4. Updates the row:
 *       - Renames the symbol if it was non-canonical  (re-inserts to avoid FK issues)
 *       - Copies country / exchange / currency / timezone from config
 *   5. Deletes orphan rows where no config entry exists (optional, controlled by DRY_RUN)
 *
 * Usage:
 *   npx ts-node src/scripts/sync-market-symbols.ts
 *   DRY_RUN=true npx ts-node src/scripts/sync-market-symbols.ts
 */
import prisma from '../config/database';
import { resolveIndexSymbol, INDEX_SYMBOL_ALIASES } from '../lib/market/symbol-aliases';

const DRY_RUN = process.env.DRY_RUN === 'true';

async function run() {
  console.log(`\n🔄 Sync Market Symbols ${DRY_RUN ? '(DRY RUN – no changes)' : ''}\n`);

  // 1. Load all config rows
  const configRows = await prisma.marketIndexConfig.findMany({
    select: { symbol: true, country: true, exchange: true, currency: true, timezone: true, name: true },
  });
  const configSymbolSet = new Set<string>(configRows.map(r => r.symbol));
  const configMap = new Map<string, typeof configRows[0]>();
  for (const cfg of configRows) configMap.set(cfg.symbol, cfg);

  console.log(`Config entries: ${configRows.length}`);

  // 2. Load all marketIndex rows
  const indexRows = await prisma.marketIndex.findMany();
  console.log(`MarketIndex rows: ${indexRows.length}\n`);

  let updated = 0, renamed = 0, orphaned = 0, skipped = 0;

  for (const row of indexRows) {
    const canonical = resolveIndexSymbol(row.symbol, configSymbolSet);
    const cfg = configMap.get(canonical);

    if (canonical !== row.symbol) {
      // Scraper symbol needs to be renamed to canonical
      const existing = await prisma.marketIndex.findUnique({ where: { symbol: canonical } });

      if (!DRY_RUN) {
        if (existing) {
          // Canonical row already exists – delete the duplicate scraper row
          console.log(`  🗑  Delete duplicate: ${row.symbol}  →  (canonical ${canonical} exists)`);
          await prisma.marketIndex.delete({ where: { symbol: row.symbol } });
        } else {
          // Rename: delete old row and recreate with canonical symbol + config metadata
          console.log(`  ✏️  Rename: ${row.symbol}  →  ${canonical}`);
          await prisma.marketIndex.delete({ where: { symbol: row.symbol } });
          await prisma.marketIndex.create({
            data: {
              ...row,
              symbol:   canonical,
              name:     cfg?.name     ?? row.name,
              country:  cfg?.country  ?? row.country,
              exchange: cfg?.exchange ?? row.exchange,
              currency: cfg?.currency ?? row.currency,
              timezone: cfg?.timezone ?? row.timezone,
            },
          });
        }
      } else {
        const action = existing ? 'DELETE duplicate' : `RENAME → ${canonical}`;
        console.log(`  [DRY] ${action}: ${row.symbol}`);
      }
      renamed++;
      continue;
    }

    if (!cfg) {
      // Symbol is already canonical but has no config entry → keep but flag
      console.log(`  ⚠️  Orphan (no config): ${row.symbol}`);
      orphaned++;
      continue;
    }

    // Symbol matches config – update metadata if stale
    const needsUpdate =
      row.name     !== cfg.name     ||
      row.country  !== cfg.country  ||
      row.exchange !== cfg.exchange ||
      row.currency !== cfg.currency ||
      row.timezone !== cfg.timezone;

    if (needsUpdate) {
      if (!DRY_RUN) {
        await prisma.marketIndex.update({
          where: { symbol: row.symbol },
          data: {
            name:     cfg.name,
            country:  cfg.country,
            exchange: cfg.exchange,
            currency: cfg.currency,
            timezone: cfg.timezone,
          },
        });
      }
      console.log(`  ✅ Updated metadata: ${row.symbol}  name: "${row.name}" → "${cfg.name}", country: ${row.country} → ${cfg.country}`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Renamed  / deleted duplicates : ${renamed}`);
  console.log(`  Metadata updated              : ${updated}`);
  console.log(`  Orphaned (no config entry)    : ${orphaned}`);
  console.log(`  Already correct               : ${skipped}`);
  if (DRY_RUN) console.log('\n  ⚡ DRY RUN – no changes were written.');
}

run()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
