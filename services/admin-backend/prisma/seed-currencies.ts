// Seed comprehensive currency data to database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Currency data with countries, symbols, and initial rates (relative to USD)
const CURRENCIES = [
  // Major Currencies
  { currency: 'USD', currencyName: 'US Dollar', symbol: '$', country: 'US', rateToUSD: 1.0 },
  { currency: 'EUR', currencyName: 'Euro', symbol: '€', country: 'EU', rateToUSD: 0.92 },
  { currency: 'GBP', currencyName: 'British Pound', symbol: '£', country: 'GB', rateToUSD: 0.79 },
  { currency: 'JPY', currencyName: 'Japanese Yen', symbol: '¥', country: 'JP', rateToUSD: 157.0 },
  { currency: 'CHF', currencyName: 'Swiss Franc', symbol: 'CHF', country: 'CH', rateToUSD: 0.90 },
  { currency: 'CAD', currencyName: 'Canadian Dollar', symbol: 'C$', country: 'CA', rateToUSD: 1.44 },
  { currency: 'AUD', currencyName: 'Australian Dollar', symbol: 'A$', country: 'AU', rateToUSD: 1.62 },
  { currency: 'NZD', currencyName: 'New Zealand Dollar', symbol: 'NZ$', country: 'NZ', rateToUSD: 1.78 },
  
  // Asian Currencies
  { currency: 'CNY', currencyName: 'Chinese Yuan', symbol: '¥', country: 'CN', rateToUSD: 7.30 },
  { currency: 'HKD', currencyName: 'Hong Kong Dollar', symbol: 'HK$', country: 'HK', rateToUSD: 7.79 },
  { currency: 'TWD', currencyName: 'Taiwan Dollar', symbol: 'NT$', country: 'TW', rateToUSD: 32.5 },
  { currency: 'KRW', currencyName: 'South Korean Won', symbol: '₩', country: 'KR', rateToUSD: 1450.0 },
  { currency: 'SGD', currencyName: 'Singapore Dollar', symbol: 'S$', country: 'SG', rateToUSD: 1.36 },
  { currency: 'INR', currencyName: 'Indian Rupee', symbol: '₹', country: 'IN', rateToUSD: 85.5 },
  { currency: 'MYR', currencyName: 'Malaysian Ringgit', symbol: 'RM', country: 'MY', rateToUSD: 4.47 },
  { currency: 'THB', currencyName: 'Thai Baht', symbol: '฿', country: 'TH', rateToUSD: 34.5 },
  { currency: 'IDR', currencyName: 'Indonesian Rupiah', symbol: 'Rp', country: 'ID', rateToUSD: 16200 },
  { currency: 'PHP', currencyName: 'Philippine Peso', symbol: '₱', country: 'PH', rateToUSD: 58.5 },
  { currency: 'VND', currencyName: 'Vietnamese Dong', symbol: '₫', country: 'VN', rateToUSD: 25500 },
  { currency: 'PKR', currencyName: 'Pakistani Rupee', symbol: '₨', country: 'PK', rateToUSD: 278 },
  { currency: 'BDT', currencyName: 'Bangladeshi Taka', symbol: '৳', country: 'BD', rateToUSD: 123 },
  { currency: 'LKR', currencyName: 'Sri Lankan Rupee', symbol: 'Rs', country: 'LK', rateToUSD: 295 },
  
  // Middle East & Africa
  { currency: 'SAR', currencyName: 'Saudi Riyal', symbol: 'ر.س', country: 'SA', rateToUSD: 3.75 },
  { currency: 'AED', currencyName: 'UAE Dirham', symbol: 'د.إ', country: 'AE', rateToUSD: 3.67 },
  { currency: 'QAR', currencyName: 'Qatari Riyal', symbol: 'ر.ق', country: 'QA', rateToUSD: 3.64 },
  { currency: 'KWD', currencyName: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'KW', rateToUSD: 0.31 },
  { currency: 'BHD', currencyName: 'Bahraini Dinar', symbol: 'د.ب', country: 'BH', rateToUSD: 0.38 },
  { currency: 'OMR', currencyName: 'Omani Rial', symbol: 'ر.ع', country: 'OM', rateToUSD: 0.38 },
  { currency: 'ILS', currencyName: 'Israeli Shekel', symbol: '₪', country: 'IL', rateToUSD: 3.60 },
  { currency: 'TRY', currencyName: 'Turkish Lira', symbol: '₺', country: 'TR', rateToUSD: 35.2 },
  { currency: 'EGP', currencyName: 'Egyptian Pound', symbol: 'E£', country: 'EG', rateToUSD: 50.8 },
  { currency: 'ZAR', currencyName: 'South African Rand', symbol: 'R', country: 'ZA', rateToUSD: 18.4 },
  { currency: 'NGN', currencyName: 'Nigerian Naira', symbol: '₦', country: 'NG', rateToUSD: 1550 },
  { currency: 'KES', currencyName: 'Kenyan Shilling', symbol: 'KSh', country: 'KE', rateToUSD: 129 },
  { currency: 'GHS', currencyName: 'Ghanaian Cedi', symbol: 'GH₵', country: 'GH', rateToUSD: 15.0 },
  { currency: 'MAD', currencyName: 'Moroccan Dirham', symbol: 'د.م.', country: 'MA', rateToUSD: 10.1 },
  
  // Europe
  { currency: 'SEK', currencyName: 'Swedish Krona', symbol: 'kr', country: 'SE', rateToUSD: 11.0 },
  { currency: 'NOK', currencyName: 'Norwegian Krone', symbol: 'kr', country: 'NO', rateToUSD: 11.3 },
  { currency: 'DKK', currencyName: 'Danish Krone', symbol: 'kr', country: 'DK', rateToUSD: 7.08 },
  { currency: 'PLN', currencyName: 'Polish Zloty', symbol: 'zł', country: 'PL', rateToUSD: 4.08 },
  { currency: 'CZK', currencyName: 'Czech Koruna', symbol: 'Kč', country: 'CZ', rateToUSD: 23.9 },
  { currency: 'HUF', currencyName: 'Hungarian Forint', symbol: 'Ft', country: 'HU', rateToUSD: 395 },
  { currency: 'RON', currencyName: 'Romanian Leu', symbol: 'lei', country: 'RO', rateToUSD: 4.72 },
  { currency: 'BGN', currencyName: 'Bulgarian Lev', symbol: 'лв', country: 'BG', rateToUSD: 1.85 },
  { currency: 'HRK', currencyName: 'Croatian Kuna', symbol: 'kn', country: 'HR', rateToUSD: 7.15 },
  { currency: 'RSD', currencyName: 'Serbian Dinar', symbol: 'дин', country: 'RS', rateToUSD: 111 },
  { currency: 'RUB', currencyName: 'Russian Ruble', symbol: '₽', country: 'RU', rateToUSD: 105 },
  { currency: 'UAH', currencyName: 'Ukrainian Hryvnia', symbol: '₴', country: 'UA', rateToUSD: 41.4 },
  { currency: 'ISK', currencyName: 'Icelandic Króna', symbol: 'kr', country: 'IS', rateToUSD: 139 },
  
  // Americas
  { currency: 'MXN', currencyName: 'Mexican Peso', symbol: '$', country: 'MX', rateToUSD: 20.3 },
  { currency: 'BRL', currencyName: 'Brazilian Real', symbol: 'R$', country: 'BR', rateToUSD: 6.18 },
  { currency: 'ARS', currencyName: 'Argentine Peso', symbol: '$', country: 'AR', rateToUSD: 1030 },
  { currency: 'CLP', currencyName: 'Chilean Peso', symbol: '$', country: 'CL', rateToUSD: 990 },
  { currency: 'COP', currencyName: 'Colombian Peso', symbol: '$', country: 'CO', rateToUSD: 4380 },
  { currency: 'PEN', currencyName: 'Peruvian Sol', symbol: 'S/', country: 'PE', rateToUSD: 3.72 },
  { currency: 'UYU', currencyName: 'Uruguayan Peso', symbol: '$U', country: 'UY', rateToUSD: 44.3 },
  { currency: 'VES', currencyName: 'Venezuelan Bolívar', symbol: 'Bs', country: 'VE', rateToUSD: 53.2 },
  { currency: 'DOP', currencyName: 'Dominican Peso', symbol: 'RD$', country: 'DO', rateToUSD: 60.5 },
  { currency: 'GTQ', currencyName: 'Guatemalan Quetzal', symbol: 'Q', country: 'GT', rateToUSD: 7.72 },
  { currency: 'CRC', currencyName: 'Costa Rican Colón', symbol: '₡', country: 'CR', rateToUSD: 508 },
  { currency: 'PAB', currencyName: 'Panamanian Balboa', symbol: 'B/', country: 'PA', rateToUSD: 1.0 },
  
  // Oceania
  { currency: 'FJD', currencyName: 'Fiji Dollar', symbol: 'FJ$', country: 'FJ', rateToUSD: 2.28 },
  { currency: 'PGK', currencyName: 'Papua New Guinean Kina', symbol: 'K', country: 'PG', rateToUSD: 4.05 },
  
  // Crypto (for reference/display)
  { currency: 'BTC', currencyName: 'Bitcoin', symbol: '₿', country: 'CRYPTO', rateToUSD: 0.000010 },
  { currency: 'ETH', currencyName: 'Ethereum', symbol: 'Ξ', country: 'CRYPTO', rateToUSD: 0.00028 },
];

async function main() {
  console.log('💱 Starting currency data seed...\n');
  console.log('ℹ️  Only creating records where NO automated data exists (lastSource !== "seed" records are preserved).\n');

  try {
    const now = new Date();
    let created = 0;
    let skipped = 0;
    
    for (const currency of CURRENCIES) {
      // Check if an automated record already exists — if so, skip it
      const existing = await prisma.currencyRate.findUnique({
        where: { currency: currency.currency },
      });

      if (existing && existing.lastSource !== 'seed') {
        // Automated data present — don't overwrite
        skipped++;
        continue;
      }

      // Either no record, or previous seed record — safe to upsert seed values
      await prisma.currencyRate.upsert({
        where: { currency: currency.currency },
        update: {
          currencyName: currency.currencyName,
          rateToUSD: currency.rateToUSD,
          rateFromUSD: currency.rateToUSD !== 0 ? 1 / currency.rateToUSD : null,
          symbol: currency.symbol,
          country: currency.country,
          lastUpdated: now,
          lastSource: 'seed',
        },
        create: {
          currency: currency.currency,
          currencyName: currency.currencyName,
          rateToUSD: currency.rateToUSD,
          rateFromUSD: currency.rateToUSD !== 0 ? 1 / currency.rateToUSD : null,
          symbol: currency.symbol,
          country: currency.country,
          lastUpdated: now,
          lastSource: 'seed',
        },
      });
      created++;
    }
    
    console.log(`✅ Created/updated ${created} seed currencies, skipped ${skipped} automated records\n`);
    console.log('🎉 Currency seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding currencies:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
