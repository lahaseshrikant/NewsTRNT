// Seed market configuration data from TypeScript config files to database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Market Indices Configuration Data - Comprehensive Global Coverage
const MARKET_INDICES = [
  // ============= AMERICAS =============
  // United States
  { symbol: '^GSPC', name: 'S&P 500', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 1 },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 2 },
  { symbol: '^IXIC', name: 'NASDAQ Composite', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NASDAQ', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 3 },
  { symbol: '^RUT', name: 'Russell 2000', country: 'US', region: ['AMERICAS'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 4 },
  { symbol: '^VIX', name: 'CBOE Volatility Index', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'CBOE', currency: 'USD', timezone: 'America/Chicago', marketHours: { open: '09:30', close: '16:15' }, isGlobal: true, sortOrder: 5 },
  { symbol: '^NDX', name: 'NASDAQ 100', country: 'US', region: ['AMERICAS'], exchange: 'NASDAQ', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 6 },
  
  // Canada
  { symbol: '^GSPTSE', name: 'S&P/TSX Composite', country: 'CA', region: ['AMERICAS'], exchange: 'TSX', currency: 'CAD', timezone: 'America/Toronto', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 10 },
  
  // Brazil
  { symbol: '^BVSP', name: 'Bovespa Index', country: 'BR', region: ['AMERICAS'], exchange: 'B3', currency: 'BRL', timezone: 'America/Sao_Paulo', marketHours: { open: '10:00', close: '17:00' }, isGlobal: true, sortOrder: 11 },
  
  // Mexico
  { symbol: '^MXX', name: 'IPC Mexico', country: 'MX', region: ['AMERICAS'], exchange: 'BMV', currency: 'MXN', timezone: 'America/Mexico_City', marketHours: { open: '08:30', close: '15:00' }, isGlobal: false, sortOrder: 12 },
  
  // Argentina
  { symbol: '^MERV', name: 'MERVAL Index', country: 'AR', region: ['AMERICAS'], exchange: 'BCBA', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires', marketHours: { open: '11:00', close: '17:00' }, isGlobal: false, sortOrder: 13 },
  
  // ============= EUROPE =============
  // United Kingdom
  { symbol: '^FTSE', name: 'FTSE 100', country: 'GB', region: ['EUROPE', 'GLOBAL'], exchange: 'LSE', currency: 'GBP', timezone: 'Europe/London', marketHours: { open: '08:00', close: '16:30' }, isGlobal: true, sortOrder: 20 },
  { symbol: '^FTMC', name: 'FTSE 250', country: 'GB', region: ['EUROPE'], exchange: 'LSE', currency: 'GBP', timezone: 'Europe/London', marketHours: { open: '08:00', close: '16:30' }, isGlobal: false, sortOrder: 21 },
  
  // Germany
  { symbol: '^GDAXI', name: 'DAX 40', country: 'DE', region: ['EUROPE', 'GLOBAL'], exchange: 'XETRA', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 22 },
  
  // France
  { symbol: '^FCHI', name: 'CAC 40', country: 'FR', region: ['EUROPE', 'GLOBAL'], exchange: 'Euronext Paris', currency: 'EUR', timezone: 'Europe/Paris', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 23 },
  
  // Pan-European
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', country: 'EU', region: ['EUROPE', 'GLOBAL'], exchange: 'STOXX', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' }, isGlobal: true, sortOrder: 24 },
  { symbol: '^STOXX', name: 'STOXX Europe 600', country: 'EU', region: ['EUROPE'], exchange: 'STOXX', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 25 },
  
  // Netherlands
  { symbol: '^AEX', name: 'AEX Index', country: 'NL', region: ['EUROPE'], exchange: 'Euronext Amsterdam', currency: 'EUR', timezone: 'Europe/Amsterdam', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 26 },
  
  // Spain
  { symbol: '^IBEX', name: 'IBEX 35', country: 'ES', region: ['EUROPE'], exchange: 'BME', currency: 'EUR', timezone: 'Europe/Madrid', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 27 },
  
  // Italy
  { symbol: '^FTSEMIB', name: 'FTSE MIB', country: 'IT', region: ['EUROPE'], exchange: 'Borsa Italiana', currency: 'EUR', timezone: 'Europe/Rome', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 28 },
  
  // Switzerland
  { symbol: '^SSMI', name: 'Swiss Market Index', country: 'CH', region: ['EUROPE'], exchange: 'SIX', currency: 'CHF', timezone: 'Europe/Zurich', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 29 },
  
  // Belgium
  { symbol: '^BFX', name: 'BEL 20', country: 'BE', region: ['EUROPE'], exchange: 'Euronext Brussels', currency: 'EUR', timezone: 'Europe/Brussels', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 30 },
  
  // Portugal
  { symbol: '^PSI20', name: 'PSI 20', country: 'PT', region: ['EUROPE'], exchange: 'Euronext Lisbon', currency: 'EUR', timezone: 'Europe/Lisbon', marketHours: { open: '08:00', close: '16:30' }, isGlobal: false, sortOrder: 31 },
  
  // Sweden
  { symbol: '^OMX', name: 'OMX Stockholm 30', country: 'SE', region: ['EUROPE'], exchange: 'Nasdaq Stockholm', currency: 'SEK', timezone: 'Europe/Stockholm', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 32 },
  
  // Russia
  { symbol: '^IMOEX', name: 'MOEX Russia Index', country: 'RU', region: ['EUROPE'], exchange: 'MOEX', currency: 'RUB', timezone: 'Europe/Moscow', marketHours: { open: '10:00', close: '18:50' }, isGlobal: false, sortOrder: 33 },
  
  // ============= ASIA-PACIFIC =============
  // Japan
  { symbol: '^N225', name: 'Nikkei 225', country: 'JP', region: ['ASIA', 'GLOBAL'], exchange: 'TSE', currency: 'JPY', timezone: 'Asia/Tokyo', marketHours: { open: '09:00', close: '15:00' }, isGlobal: true, sortOrder: 40 },
  { symbol: '^TOPX', name: 'TOPIX', country: 'JP', region: ['ASIA'], exchange: 'TSE', currency: 'JPY', timezone: 'Asia/Tokyo', marketHours: { open: '09:00', close: '15:00' }, isGlobal: false, sortOrder: 41 },
  
  // China
  { symbol: '^SSE', name: 'Shanghai Composite', country: 'CN', region: ['ASIA', 'GLOBAL'], exchange: 'SSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' }, isGlobal: true, sortOrder: 42 },
  { symbol: '^SZSE', name: 'Shenzhen Component', country: 'CN', region: ['ASIA'], exchange: 'SZSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' }, isGlobal: false, sortOrder: 43 },
  { symbol: '^CSI300', name: 'CSI 300', country: 'CN', region: ['ASIA'], exchange: 'SSE/SZSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' }, isGlobal: false, sortOrder: 44 },
  
  // Hong Kong
  { symbol: '^HSI', name: 'Hang Seng Index', country: 'HK', region: ['ASIA', 'GLOBAL'], exchange: 'HKEX', currency: 'HKD', timezone: 'Asia/Hong_Kong', marketHours: { open: '09:30', close: '16:00' }, isGlobal: true, sortOrder: 45 },
  { symbol: '^HSCE', name: 'Hang Seng China Enterprises', country: 'HK', region: ['ASIA'], exchange: 'HKEX', currency: 'HKD', timezone: 'Asia/Hong_Kong', marketHours: { open: '09:30', close: '16:00' }, isGlobal: false, sortOrder: 46 },
  
  // India
  { symbol: '^NSEI', name: 'NIFTY 50', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'NSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' }, isGlobal: true, sortOrder: 47 },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'BSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' }, isGlobal: true, sortOrder: 48 },
  { symbol: '^NSEBANK', name: 'NIFTY Bank', country: 'IN', region: ['ASIA'], exchange: 'NSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' }, isGlobal: false, sortOrder: 49 },
  
  // South Korea
  { symbol: '^KS11', name: 'KOSPI', country: 'KR', region: ['ASIA', 'GLOBAL'], exchange: 'KRX', currency: 'KRW', timezone: 'Asia/Seoul', marketHours: { open: '09:00', close: '15:30' }, isGlobal: true, sortOrder: 50 },
  { symbol: '^KQ11', name: 'KOSDAQ', country: 'KR', region: ['ASIA'], exchange: 'KRX', currency: 'KRW', timezone: 'Asia/Seoul', marketHours: { open: '09:00', close: '15:30' }, isGlobal: false, sortOrder: 51 },
  
  // Taiwan
  { symbol: '^TWII', name: 'Taiwan Weighted Index', country: 'TW', region: ['ASIA'], exchange: 'TWSE', currency: 'TWD', timezone: 'Asia/Taipei', marketHours: { open: '09:00', close: '13:30' }, isGlobal: false, sortOrder: 52 },
  
  // Australia
  { symbol: '^AXJO', name: 'S&P/ASX 200', country: 'AU', region: ['ASIA', 'GLOBAL'], exchange: 'ASX', currency: 'AUD', timezone: 'Australia/Sydney', marketHours: { open: '10:00', close: '16:00' }, isGlobal: true, sortOrder: 53 },
  { symbol: '^AORD', name: 'All Ordinaries', country: 'AU', region: ['ASIA'], exchange: 'ASX', currency: 'AUD', timezone: 'Australia/Sydney', marketHours: { open: '10:00', close: '16:00' }, isGlobal: false, sortOrder: 54 },
  
  // New Zealand
  { symbol: '^NZ50', name: 'S&P/NZX 50', country: 'NZ', region: ['ASIA'], exchange: 'NZX', currency: 'NZD', timezone: 'Pacific/Auckland', marketHours: { open: '10:00', close: '16:45' }, isGlobal: false, sortOrder: 55 },
  
  // Singapore
  { symbol: '^STI', name: 'Straits Times Index', country: 'SG', region: ['ASIA'], exchange: 'SGX', currency: 'SGD', timezone: 'Asia/Singapore', marketHours: { open: '09:00', close: '17:00' }, isGlobal: false, sortOrder: 56 },
  
  // Malaysia
  { symbol: '^KLSE', name: 'FTSE Bursa Malaysia KLCI', country: 'MY', region: ['ASIA'], exchange: 'Bursa Malaysia', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur', marketHours: { open: '09:00', close: '17:00' }, isGlobal: false, sortOrder: 57 },
  
  // Thailand
  { symbol: '^SET', name: 'SET Index', country: 'TH', region: ['ASIA'], exchange: 'SET', currency: 'THB', timezone: 'Asia/Bangkok', marketHours: { open: '10:00', close: '16:30' }, isGlobal: false, sortOrder: 58 },
  
  // Indonesia
  { symbol: '^JKSE', name: 'Jakarta Stock Exchange Composite', country: 'ID', region: ['ASIA'], exchange: 'IDX', currency: 'IDR', timezone: 'Asia/Jakarta', marketHours: { open: '09:00', close: '16:00' }, isGlobal: false, sortOrder: 59 },
  
  // Philippines
  { symbol: '^PSEI', name: 'PSEi Composite', country: 'PH', region: ['ASIA'], exchange: 'PSE', currency: 'PHP', timezone: 'Asia/Manila', marketHours: { open: '09:30', close: '15:30' }, isGlobal: false, sortOrder: 60 },
  
  // Vietnam
  { symbol: '^VNINDEX', name: 'VN-Index', country: 'VN', region: ['ASIA'], exchange: 'HOSE', currency: 'VND', timezone: 'Asia/Ho_Chi_Minh', marketHours: { open: '09:00', close: '15:00' }, isGlobal: false, sortOrder: 61 },
  
  // ============= MIDDLE EAST & AFRICA =============
  // Saudi Arabia
  { symbol: '^TASI', name: 'Tadawul All Share Index', country: 'SA', region: ['MENA'], exchange: 'Tadawul', currency: 'SAR', timezone: 'Asia/Riyadh', marketHours: { open: '10:00', close: '15:00' }, isGlobal: false, sortOrder: 70 },
  
  // UAE
  { symbol: '^ADI', name: 'Abu Dhabi Index', country: 'AE', region: ['MENA'], exchange: 'ADX', currency: 'AED', timezone: 'Asia/Dubai', marketHours: { open: '10:00', close: '14:00' }, isGlobal: false, sortOrder: 71 },
  { symbol: '^DFMGI', name: 'Dubai Financial Market', country: 'AE', region: ['MENA'], exchange: 'DFM', currency: 'AED', timezone: 'Asia/Dubai', marketHours: { open: '10:00', close: '14:00' }, isGlobal: false, sortOrder: 72 },
  
  // Qatar
  { symbol: '^QSI', name: 'QE All Share Index', country: 'QA', region: ['MENA'], exchange: 'QSE', currency: 'QAR', timezone: 'Asia/Qatar', marketHours: { open: '09:30', close: '13:30' }, isGlobal: false, sortOrder: 73 },
  
  // Israel
  { symbol: '^TA35', name: 'TA-35 Index', country: 'IL', region: ['MENA'], exchange: 'TASE', currency: 'ILS', timezone: 'Asia/Jerusalem', marketHours: { open: '09:00', close: '17:30' }, isGlobal: false, sortOrder: 74 },
  
  // South Africa
  { symbol: '^J203', name: 'JSE All Share Index', country: 'ZA', region: ['AFRICA'], exchange: 'JSE', currency: 'ZAR', timezone: 'Africa/Johannesburg', marketHours: { open: '09:00', close: '17:00' }, isGlobal: false, sortOrder: 75 },
  
  // Egypt
  { symbol: '^EGX30', name: 'EGX 30 Index', country: 'EG', region: ['AFRICA'], exchange: 'EGX', currency: 'EGP', timezone: 'Africa/Cairo', marketHours: { open: '10:00', close: '14:30' }, isGlobal: false, sortOrder: 76 },
  
  // Nigeria
  { symbol: '^NGS30', name: 'NSE All Share Index', country: 'NG', region: ['AFRICA'], exchange: 'NSE', currency: 'NGN', timezone: 'Africa/Lagos', marketHours: { open: '10:00', close: '14:30' }, isGlobal: false, sortOrder: 77 },
];

// Cryptocurrencies Configuration - Top 25 by Market Cap
const CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin', sortOrder: 1 },
  { symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum', sortOrder: 2 },
  { symbol: 'USDT', name: 'Tether', coinGeckoId: 'tether', sortOrder: 3 },
  { symbol: 'BNB', name: 'BNB', coinGeckoId: 'binancecoin', sortOrder: 4 },
  { symbol: 'SOL', name: 'Solana', coinGeckoId: 'solana', sortOrder: 5 },
  { symbol: 'USDC', name: 'USD Coin', coinGeckoId: 'usd-coin', sortOrder: 6 },
  { symbol: 'XRP', name: 'XRP', coinGeckoId: 'ripple', sortOrder: 7 },
  { symbol: 'DOGE', name: 'Dogecoin', coinGeckoId: 'dogecoin', sortOrder: 8 },
  { symbol: 'ADA', name: 'Cardano', coinGeckoId: 'cardano', sortOrder: 9 },
  { symbol: 'TRX', name: 'TRON', coinGeckoId: 'tron', sortOrder: 10 },
  { symbol: 'AVAX', name: 'Avalanche', coinGeckoId: 'avalanche-2', sortOrder: 11 },
  { symbol: 'SHIB', name: 'Shiba Inu', coinGeckoId: 'shiba-inu', sortOrder: 12 },
  { symbol: 'TON', name: 'Toncoin', coinGeckoId: 'the-open-network', sortOrder: 13 },
  { symbol: 'DOT', name: 'Polkadot', coinGeckoId: 'polkadot', sortOrder: 14 },
  { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', sortOrder: 15 },
  { symbol: 'BCH', name: 'Bitcoin Cash', coinGeckoId: 'bitcoin-cash', sortOrder: 16 },
  { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network', sortOrder: 17 },
  { symbol: 'LTC', name: 'Litecoin', coinGeckoId: 'litecoin', sortOrder: 18 },
  { symbol: 'UNI', name: 'Uniswap', coinGeckoId: 'uniswap', sortOrder: 19 },
  { symbol: 'ATOM', name: 'Cosmos', coinGeckoId: 'cosmos', sortOrder: 20 },
  { symbol: 'XLM', name: 'Stellar', coinGeckoId: 'stellar', sortOrder: 21 },
  { symbol: 'XMR', name: 'Monero', coinGeckoId: 'monero', sortOrder: 22 },
  { symbol: 'ETC', name: 'Ethereum Classic', coinGeckoId: 'ethereum-classic', sortOrder: 23 },
  { symbol: 'ALGO', name: 'Algorand', coinGeckoId: 'algorand', sortOrder: 24 },
  { symbol: 'FIL', name: 'Filecoin', coinGeckoId: 'filecoin', sortOrder: 25 },
];

// Commodities Configuration - Comprehensive Coverage
const COMMODITIES = [
  // Energy
  { symbol: 'CL', name: 'WTI Crude Oil', category: 'Energy', unit: 'barrel', currency: 'USD', sortOrder: 1 },
  { symbol: 'BZ', name: 'Brent Crude Oil', category: 'Energy', unit: 'barrel', currency: 'USD', sortOrder: 2 },
  { symbol: 'NG', name: 'Natural Gas', category: 'Energy', unit: 'MMBtu', currency: 'USD', sortOrder: 3 },
  { symbol: 'HO', name: 'Heating Oil', category: 'Energy', unit: 'gallon', currency: 'USD', sortOrder: 4 },
  { symbol: 'RB', name: 'RBOB Gasoline', category: 'Energy', unit: 'gallon', currency: 'USD', sortOrder: 5 },
  
  // Precious Metals
  { symbol: 'GC', name: 'Gold', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 10 },
  { symbol: 'SI', name: 'Silver', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 11 },
  { symbol: 'PL', name: 'Platinum', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 12 },
  { symbol: 'PA', name: 'Palladium', category: 'Precious Metals', unit: 'oz', currency: 'USD', sortOrder: 13 },
  
  // Industrial Metals
  { symbol: 'HG', name: 'Copper', category: 'Industrial Metals', unit: 'lb', currency: 'USD', sortOrder: 20 },
  { symbol: 'ALI', name: 'Aluminum', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 21 },
  { symbol: 'ZN', name: 'Zinc', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 22 },
  { symbol: 'NI', name: 'Nickel', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 23 },
  { symbol: 'PB', name: 'Lead', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 24 },
  { symbol: 'TIN', name: 'Tin', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 25 },
  { symbol: 'SN', name: 'Iron Ore', category: 'Industrial Metals', unit: 'ton', currency: 'USD', sortOrder: 26 },
  { symbol: 'UX', name: 'Uranium', category: 'Industrial Metals', unit: 'lb', currency: 'USD', sortOrder: 27 },
  
  // Grains & Oilseeds
  { symbol: 'ZC', name: 'Corn', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 30 },
  { symbol: 'ZW', name: 'Wheat', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 31 },
  { symbol: 'ZS', name: 'Soybeans', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 32 },
  { symbol: 'ZM', name: 'Soybean Meal', category: 'Agriculture', unit: 'ton', currency: 'USD', sortOrder: 33 },
  { symbol: 'ZL', name: 'Soybean Oil', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 34 },
  { symbol: 'ZO', name: 'Oats', category: 'Agriculture', unit: 'bushel', currency: 'USD', sortOrder: 35 },
  { symbol: 'ZR', name: 'Rough Rice', category: 'Agriculture', unit: 'cwt', currency: 'USD', sortOrder: 36 },
  
  // Softs
  { symbol: 'SB', name: 'Sugar #11', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 40 },
  { symbol: 'KC', name: 'Coffee', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 41 },
  { symbol: 'CC', name: 'Cocoa', category: 'Agriculture', unit: 'ton', currency: 'USD', sortOrder: 42 },
  { symbol: 'CT', name: 'Cotton', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 43 },
  { symbol: 'OJ', name: 'Orange Juice', category: 'Agriculture', unit: 'lb', currency: 'USD', sortOrder: 44 },
  
  // Livestock
  { symbol: 'LE', name: 'Live Cattle', category: 'Livestock', unit: 'lb', currency: 'USD', sortOrder: 50 },
  { symbol: 'GF', name: 'Feeder Cattle', category: 'Livestock', unit: 'lb', currency: 'USD', sortOrder: 51 },
  { symbol: 'HE', name: 'Lean Hogs', category: 'Livestock', unit: 'lb', currency: 'USD', sortOrder: 52 },
];

// Currency Pairs Configuration - Major, Cross, and Emerging
const CURRENCY_PAIRS = [
  // Major Pairs (USD)
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
  { pair: 'GBP/JPY', name: 'British Pound vs Japanese Yen', base: 'GBP', quote: 'JPY', type: 'cross', sortOrder: 12 },
  { pair: 'AUD/JPY', name: 'Australian Dollar vs Japanese Yen', base: 'AUD', quote: 'JPY', type: 'cross', sortOrder: 13 },
  { pair: 'EUR/CHF', name: 'Euro vs Swiss Franc', base: 'EUR', quote: 'CHF', type: 'cross', sortOrder: 14 },
  { pair: 'EUR/AUD', name: 'Euro vs Australian Dollar', base: 'EUR', quote: 'AUD', type: 'cross', sortOrder: 15 },
  
  // Emerging Market Pairs
  { pair: 'USD/INR', name: 'US Dollar vs Indian Rupee', base: 'USD', quote: 'INR', type: 'emerging', sortOrder: 20 },
  { pair: 'USD/CNY', name: 'US Dollar vs Chinese Yuan', base: 'USD', quote: 'CNY', type: 'emerging', sortOrder: 21 },
  { pair: 'USD/SGD', name: 'US Dollar vs Singapore Dollar', base: 'USD', quote: 'SGD', type: 'emerging', sortOrder: 22 },
  { pair: 'USD/HKD', name: 'US Dollar vs Hong Kong Dollar', base: 'USD', quote: 'HKD', type: 'emerging', sortOrder: 23 },
  { pair: 'USD/KRW', name: 'US Dollar vs South Korean Won', base: 'USD', quote: 'KRW', type: 'emerging', sortOrder: 24 },
  { pair: 'USD/BRL', name: 'US Dollar vs Brazilian Real', base: 'USD', quote: 'BRL', type: 'emerging', sortOrder: 25 },
  { pair: 'USD/MXN', name: 'US Dollar vs Mexican Peso', base: 'USD', quote: 'MXN', type: 'emerging', sortOrder: 26 },
  { pair: 'USD/ZAR', name: 'US Dollar vs South African Rand', base: 'USD', quote: 'ZAR', type: 'emerging', sortOrder: 27 },
  { pair: 'USD/TRY', name: 'US Dollar vs Turkish Lira', base: 'USD', quote: 'TRY', type: 'emerging', sortOrder: 28 },
  { pair: 'USD/RUB', name: 'US Dollar vs Russian Ruble', base: 'USD', quote: 'RUB', type: 'emerging', sortOrder: 29 },
  { pair: 'USD/THB', name: 'US Dollar vs Thai Baht', base: 'USD', quote: 'THB', type: 'emerging', sortOrder: 30 },
  { pair: 'USD/IDR', name: 'US Dollar vs Indonesian Rupiah', base: 'USD', quote: 'IDR', type: 'emerging', sortOrder: 31 },
  { pair: 'USD/PHP', name: 'US Dollar vs Philippine Peso', base: 'USD', quote: 'PHP', type: 'emerging', sortOrder: 32 },
  { pair: 'USD/SAR', name: 'US Dollar vs Saudi Riyal', base: 'USD', quote: 'SAR', type: 'emerging', sortOrder: 33 },
  { pair: 'USD/AED', name: 'US Dollar vs UAE Dirham', base: 'USD', quote: 'AED', type: 'emerging', sortOrder: 34 },
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
