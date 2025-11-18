// Seed market configuration data from TypeScript config files to database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Market Indices Configuration Data
const MARKET_INDICES = [
  // Americas
  { symbol: '^GSPC', name: 'S&P 500', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 1 },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 2 },
  { symbol: '^IXIC', name: 'NASDAQ Composite', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NASDAQ', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 3 },
  { symbol: '^RUT', name: 'Russell 2000', country: 'US', region: ['AMERICAS'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 4 },
  { symbol: '^VIX', name: 'CBOE Volatility Index', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'CBOE', currency: 'USD', timezone: 'America/Chicago', marketHours: { open: '09:30', close: '16:15' }, isGlobal: true, sortOrder: 5 },
  
  // Canada
  { symbol: '^GSPTSE', name: 'S&P/TSX Composite', country: 'CA', region: ['AMERICAS'], exchange: 'TSX', currency: 'CAD', timezone: 'America/Toronto', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 10 },
  
  // Europe
  { symbol: '^FTSE', name: 'FTSE 100', country: 'GB', region: ['EUROPE', 'GLOBAL'], exchange: 'LSE', currency: 'GBP', timezone: 'Europe/London', marketHours: { open: '08:00', close: '16:30' }, isGlobal: true, sortOrder: 20 },
  { symbol: '^GDAXI', name: 'DAX', country: 'DE', region: ['EUROPE', 'GLOBAL'], exchange: 'XETRA', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 21 },
  { symbol: '^FCHI', name: 'CAC 40', country: 'FR', region: ['EUROPE', 'GLOBAL'], exchange: 'Euronext Paris', currency: 'EUR', timezone: 'Europe/Paris', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 22 },
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', country: 'EU', region: ['EUROPE', 'GLOBAL'], exchange: 'STOXX', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 23 },
  
  // Asia
  { symbol: '^N225', name: 'Nikkei 225', country: 'JP', region: ['ASIA', 'GLOBAL'], exchange: 'TSE', currency: 'JPY', timezone: 'Asia/Tokyo', marketHours: { open: '09:00', close: '15:00' }, isGlobal: true, sortOrder: 30 },
  { symbol: '^HSI', name: 'Hang Seng Index', country: 'HK', region: ['ASIA', 'GLOBAL'], exchange: 'HKEX', currency: 'HKD', timezone: 'Asia/Hong_Kong', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 31 },
  { symbol: '^NSEI', name: 'NIFTY 50', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'NSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' }, isGlobal: true, sortOrder: 32 },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'BSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' }, isGlobal: true, sortOrder: 33 },
  { symbol: '^SSE', name: 'Shanghai Composite', country: 'CN', region: ['ASIA', 'GLOBAL'], exchange: 'SSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' }, isGlobal: true, sortOrder: 34 },
];

// Cryptocurrencies Configuration
const CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin', sortOrder: 1 },
  { symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum', sortOrder: 2 },
  { symbol: 'BNB', name: 'Binance Coin', coinGeckoId: 'binancecoin', sortOrder: 3 },
  { symbol: 'XRP', name: 'Ripple', coinGeckoId: 'ripple', sortOrder: 4 },
  { symbol: 'ADA', name: 'Cardano', coinGeckoId: 'cardano', sortOrder: 5 },
  { symbol: 'DOGE', name: 'Dogecoin', coinGeckoId: 'dogecoin', sortOrder: 6 },
  { symbol: 'SOL', name: 'Solana', coinGeckoId: 'solana', sortOrder: 7 },
  { symbol: 'DOT', name: 'Polkadot', coinGeckoId: 'polkadot', sortOrder: 8 },
  { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network', sortOrder: 9 },
  { symbol: 'LTC', name: 'Litecoin', coinGeckoId: 'litecoin', sortOrder: 10 },
];

// Commodities Configuration
const COMMODITIES = [
  // Energy
  { symbol: 'CL', name: 'Crude Oil WTI', category: 'Energy', unit: 'barrel', currency: 'USD', sortOrder: 1 },
  { symbol: 'BZ', name: 'Brent Crude Oil', category: 'Energy', unit: 'barrel', currency: 'USD', sortOrder: 2 },
  { symbol: 'NG', name: 'Natural Gas', category: 'Energy', unit: 'MMBtu', currency: 'USD', sortOrder: 3 },
  
  // Precious Metals
  { symbol: 'GC', name: 'Gold', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 10 },
  { symbol: 'SI', name: 'Silver', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 11 },
  { symbol: 'PL', name: 'Platinum', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 12 },
  { symbol: 'PA', name: 'Palladium', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 13 },
  
  // Industrial Metals
  { symbol: 'HG', name: 'Copper', category: 'Industrial Metals', unit: 'lb', currency: 'USD', sortOrder: 20 },
  { symbol: 'ALI', name: 'Aluminum', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 21 },
  
  // Agriculture
  { symbol: 'ZC', name: 'Corn', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 30 },
  { symbol: 'ZW', name: 'Wheat', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 31 },
  { symbol: 'ZS', name: 'Soybeans', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 32 },
  { symbol: 'SB', name: 'Sugar', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 33 },
  { symbol: 'KC', name: 'Coffee', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 34 },
];

// Currency Pairs Configuration
const CURRENCY_PAIRS = [
  { pair: 'EUR/USD', name: 'Euro vs US Dollar', base: 'EUR', quote: 'USD', type: 'major', sortOrder: 1 },
  { pair: 'GBP/USD', name: 'British Pound vs US Dollar', base: 'GBP', quote: 'USD', type: 'major', sortOrder: 2 },
  { pair: 'USD/JPY', name: 'US Dollar vs Japanese Yen', base: 'USD', quote: 'JPY', type: 'major', sortOrder: 3 },
  { pair: 'USD/CHF', name: 'US Dollar vs Swiss Franc', base: 'USD', quote: 'CHF', type: 'major', sortOrder: 4 },
  { pair: 'AUD/USD', name: 'Australian Dollar vs US Dollar', base: 'AUD', quote: 'USD', type: 'major', sortOrder: 5 },
  { pair: 'USD/CAD', name: 'US Dollar vs Canadian Dollar', base: 'USD', quote: 'CAD', type: 'major', sortOrder: 6 },
  { pair: 'NZD/USD', name: 'New Zealand Dollar vs US Dollar', base: 'NZD', quote: 'USD', type: 'major', sortOrder: 7 },
  
  // Cross Pairs
  { pair: 'EUR/GBP', name: 'Euro vs British Pound', base: 'EUR', quote: 'GBP', type: 'cross', sortOrder: 10 },
  { pair: 'EUR/JPY', name: 'Euro vs Japanese Yen', base: 'EUR', quote: 'JPY', type: 'cross', sortOrder: 11 },
  
  // Emerging
  { pair: 'USD/INR', name: 'US Dollar vs Indian Rupee', base: 'USD', quote: 'INR', type: 'emerging', sortOrder: 20 },
  { pair: 'USD/CNY', name: 'US Dollar vs Chinese Yuan', base: 'USD', quote: 'CNY', type: 'emerging', sortOrder: 21 },
];

async function main() {
  console.log('🌱 Starting market configuration seed...\n');

  try {
    // Seed Market Indices
    console.log('📊 Seeding market indices configuration...');
    for (const index of MARKET_INDICES) {
      await prisma.marketIndexConfig.upsert({
        where: { symbol: index.symbol },
        update: index,
        create: index,
      });
    }
    console.log(`✅ Seeded ${MARKET_INDICES.length} market indices\n`);

    // Seed Cryptocurrencies
    console.log('₿ Seeding cryptocurrency configuration...');
    for (const crypto of CRYPTOCURRENCIES) {
      await prisma.cryptocurrencyConfig.upsert({
        where: { symbol: crypto.symbol },
        update: crypto,
        create: crypto,
      });
    }
    console.log(`✅ Seeded ${CRYPTOCURRENCIES.length} cryptocurrencies\n`);

    // Seed Commodities
    console.log('🛢️ Seeding commodity configuration...');
    for (const commodity of COMMODITIES) {
      await prisma.commodityConfig.upsert({
        where: { symbol: commodity.symbol },
        update: commodity,
        create: commodity,
      });
    }
    console.log(`✅ Seeded ${COMMODITIES.length} commodities\n`);

    // Seed Currency Pairs
    console.log('💱 Seeding currency pair configuration...');
    for (const pair of CURRENCY_PAIRS) {
      await prisma.currencyPairConfig.upsert({
        where: { pair: pair.pair },
        update: pair,
        create: pair,
      });
    }
    console.log(`✅ Seeded ${CURRENCY_PAIRS.length} currency pairs\n`);

    console.log('🎉 Market configuration seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding market configuration:', error);
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
