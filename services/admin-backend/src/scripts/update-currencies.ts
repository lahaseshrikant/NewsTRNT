/**
 * Fetch live currency rates from Frankfurter API and persist them.
 * Run: npx ts-node src/scripts/update-currencies.ts
 *
 * Uses the admin-backend Prisma client (neondb_owner) which has write access
 * to currency_rates table.
 *
 * rateToUSD semantics: how many units of <currency> = 1 USD.
 *   e.g. INR → 87, meaning 1 USD = 87 INR.
 */

import prisma from '../config/database';

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD';

const TRACK_CURRENCIES = [
  'AED', 'ARS', 'AUD', 'BDT', 'BGN', 'BHD', 'BRL', 'CAD', 'CHF',
  'CLP', 'CNY', 'COP', 'CRC', 'CZK', 'DKK', 'DOP', 'EGP', 'EUR',
  'FJD', 'GBP', 'GHS', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK',
  'JPY', 'KES', 'KRW', 'KWD', 'LKR', 'MAD', 'MXN', 'MYR', 'NGN',
  'NOK', 'NZD', 'OMR', 'PAB', 'PEN', 'PHP', 'PHP', 'PKR', 'PLN',
  'QAR', 'RON', 'RSD', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY',
  'TWD', 'UAH', 'UYU', 'VND', 'ZAR',
];

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

async function main() {
  console.log('💱 Fetching live exchange rates from Frankfurter API...\n');

  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as FrankfurterResponse;

  const apiRates = new Map<string, number>([['USD', 1.0]]);
  for (const [code, rate] of Object.entries(data.rates)) {
    apiRates.set(code.toUpperCase(), Number(rate));
  }
  console.log(`✅ Fetched ${apiRates.size} rates (date: ${data.date})\n`);

  const now = new Date();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Process USD itself too
  const currencies = ['USD', ...TRACK_CURRENCIES.filter(c => c !== 'USD')];

  for (const code of [...new Set(currencies)]) {
    const rateToUSD = apiRates.get(code);
    if (rateToUSD === undefined) {
      skipped++;
      continue;
    }

    const existing = await prisma.currencyRate.findUnique({ where: { currency: code } });
    const previousRate = existing?.rateToUSD ?? rateToUSD;
    const change = rateToUSD - previousRate;
    const changePercent = previousRate !== 0 ? (change / previousRate) * 100 : 0;

    await prisma.currencyRate.upsert({
      where: { currency: code },
      create: {
        currency: code,
        currencyName: existing?.currencyName ?? code,
        rateToUSD,
        rateFromUSD: rateToUSD !== 0 ? 1 / rateToUSD : 0,
        previousRate,
        change,
        changePercent,
        lastUpdated: now,
        lastSource: 'frankfurter',
      },
      update: {
        rateToUSD,
        rateFromUSD: rateToUSD !== 0 ? 1 / rateToUSD : 0,
        previousRate,
        change,
        changePercent,
        lastUpdated: now,
        lastSource: 'frankfurter',
        isStale: false,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`📊 Done — ${created} created, ${updated} updated, ${skipped} skipped (not in API)`);
  console.log('🎉 Currency rates updated successfully!');
}

main()
  .catch(err => {
    console.error('Fatal error updating currency rates:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
