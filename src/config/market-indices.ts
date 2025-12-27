// Comprehensive Market Indices Configuration
// Covering all major stock indices, commodities, currencies worldwide

import { Region } from '@/types/market';

interface IndexConfig {
  symbol: string;
  name: string;
  country: string;
  region: Region[];
  exchange: string;
  currency: string;
  timezone: string;
  marketHours: {
    open: string;
    close: string;
  };
}

// =============================================================================
// AMERICAS - Stock Indices
// =============================================================================

export const AMERICAS_INDICES: IndexConfig[] = [
  // United States - Using proper ticker symbols for APIs
  { symbol: '^GSPC', name: 'S&P 500', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^IXIC', name: 'NASDAQ Composite', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'NASDAQ', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^RUT', name: 'Russell 2000', country: 'US', region: ['AMERICAS'], exchange: 'NYSE', currency: 'USD', timezone: 'America/New_York', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^VIX', name: 'CBOE Volatility Index', country: 'US', region: ['AMERICAS', 'GLOBAL'], exchange: 'CBOE', currency: 'USD', timezone: 'America/Chicago', marketHours: { open: '09:30', close: '16:15' } },
  
  // Canada
  { symbol: '^GSPTSE', name: 'S&P/TSX Composite', country: 'CA', region: ['AMERICAS'], exchange: 'TSX', currency: 'CAD', timezone: 'America/Toronto', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^TSXV', name: 'TSX Venture Composite', country: 'CA', region: ['AMERICAS'], exchange: 'TSXV', currency: 'CAD', timezone: 'America/Toronto', marketHours: { open: '09:30', close: '16:00' } },
  
  // Brazil
  { symbol: '^BVSP', name: 'Bovespa Index', country: 'BR', region: ['AMERICAS'], exchange: 'B3', currency: 'BRL', timezone: 'America/Sao_Paulo', marketHours: { open: '10:00', close: '17:00' } },
  
  // Mexico
  { symbol: '^MXX', name: 'IPC Mexico', country: 'MX', region: ['AMERICAS'], exchange: 'BMV', currency: 'MXN', timezone: 'America/Mexico_City', marketHours: { open: '08:30', close: '15:00' } },
  
  // Argentina
  { symbol: '^MERV', name: 'MERVAL', country: 'AR', region: ['AMERICAS'], exchange: 'BCBA', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires', marketHours: { open: '11:00', close: '17:00' } },
  
  // Chile
  { symbol: '^IPSA', name: 'S&P/CLX IPSA', country: 'CL', region: ['AMERICAS'], exchange: 'BCS', currency: 'CLP', timezone: 'America/Santiago', marketHours: { open: '09:30', close: '16:00' } },
];

// =============================================================================
// EUROPE - Stock Indices
// =============================================================================

export const EUROPE_INDICES: IndexConfig[] = [
  // United Kingdom
  { symbol: '^FTSE', name: 'FTSE 100', country: 'GB', region: ['EUROPE', 'GLOBAL'], exchange: 'LSE', currency: 'GBP', timezone: 'Europe/London', marketHours: { open: '08:00', close: '16:30' } },
  { symbol: '^FTMC', name: 'FTSE 250', country: 'GB', region: ['EUROPE'], exchange: 'LSE', currency: 'GBP', timezone: 'Europe/London', marketHours: { open: '08:00', close: '16:30' } },
  
  // Germany
  { symbol: '^GDAXI', name: 'DAX', country: 'DE', region: ['EUROPE', 'GLOBAL'], exchange: 'XETRA', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' } },
  { symbol: '^MDAX', name: 'MDAX', country: 'DE', region: ['EUROPE'], exchange: 'XETRA', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' } },
  
  // France
  { symbol: '^FCHI', name: 'CAC 40', country: 'FR', region: ['EUROPE', 'GLOBAL'], exchange: 'Euronext Paris', currency: 'EUR', timezone: 'Europe/Paris', marketHours: { open: '09:00', close: '17:30' } },
  
  // Italy
  { symbol: '^FTSEMIB', name: 'FTSE MIB', country: 'IT', region: ['EUROPE'], exchange: 'Borsa Italiana', currency: 'EUR', timezone: 'Europe/Rome', marketHours: { open: '09:00', close: '17:30' } },
  
  // Spain
  { symbol: '^IBEX', name: 'IBEX 35', country: 'ES', region: ['EUROPE'], exchange: 'BME', currency: 'EUR', timezone: 'Europe/Madrid', marketHours: { open: '09:00', close: '17:30' } },
  
  // Netherlands
  { symbol: '^AEX', name: 'AEX Amsterdam', country: 'NL', region: ['EUROPE'], exchange: 'Euronext Amsterdam', currency: 'EUR', timezone: 'Europe/Amsterdam', marketHours: { open: '09:00', close: '17:30' } },
  
  // Switzerland
  { symbol: '^SSMI', name: 'SMI Swiss Market Index', country: 'CH', region: ['EUROPE'], exchange: 'SIX', currency: 'CHF', timezone: 'Europe/Zurich', marketHours: { open: '09:00', close: '17:30' } },
  
  // Belgium
  { symbol: '^BFX', name: 'BEL 20', country: 'BE', region: ['EUROPE'], exchange: 'Euronext Brussels', currency: 'EUR', timezone: 'Europe/Brussels', marketHours: { open: '09:00', close: '17:30' } },
  
  // Sweden
  { symbol: '^OMXS30', name: 'OMX Stockholm 30', country: 'SE', region: ['EUROPE'], exchange: 'Nasdaq Stockholm', currency: 'SEK', timezone: 'Europe/Stockholm', marketHours: { open: '09:00', close: '17:30' } },
  
  // Norway
  { symbol: '^OSEBX', name: 'Oslo Børs All-Share', country: 'NO', region: ['EUROPE'], exchange: 'Oslo Børs', currency: 'NOK', timezone: 'Europe/Oslo', marketHours: { open: '09:00', close: '16:20' } },
  
  // Denmark
  { symbol: '^OMXC20', name: 'OMX Copenhagen 20', country: 'DK', region: ['EUROPE'], exchange: 'Nasdaq Copenhagen', currency: 'DKK', timezone: 'Europe/Copenhagen', marketHours: { open: '09:00', close: '17:00' } },
  
  // Russia
  { symbol: '^IMOEX', name: 'MOEX Russia Index', country: 'RU', region: ['EUROPE'], exchange: 'MOEX', currency: 'RUB', timezone: 'Europe/Moscow', marketHours: { open: '10:00', close: '18:45' } },
  
  // Poland
  { symbol: '^WIG20', name: 'WIG20', country: 'PL', region: ['EUROPE'], exchange: 'GPW', currency: 'PLN', timezone: 'Europe/Warsaw', marketHours: { open: '09:00', close: '17:00' } },
  
  // Euro Zone
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', country: 'EU', region: ['EUROPE', 'GLOBAL'], exchange: 'STOXX', currency: 'EUR', timezone: 'Europe/Berlin', marketHours: { open: '09:00', close: '17:30' } },
];

// =============================================================================
// ASIA - Stock Indices
// =============================================================================

export const ASIA_INDICES: IndexConfig[] = [
  // Japan
  { symbol: '^N225', name: 'Nikkei 225', country: 'JP', region: ['ASIA', 'GLOBAL'], exchange: 'TSE', currency: 'JPY', timezone: 'Asia/Tokyo', marketHours: { open: '09:00', close: '15:00' } },
  { symbol: '^TOPIX', name: 'TOPIX', country: 'JP', region: ['ASIA'], exchange: 'TSE', currency: 'JPY', timezone: 'Asia/Tokyo', marketHours: { open: '09:00', close: '15:00' } },
  
  // China
  { symbol: '^SSE', name: 'Shanghai Composite', country: 'CN', region: ['ASIA', 'GLOBAL'], exchange: 'SSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' } },
  { symbol: '^SZSE', name: 'Shenzhen Composite', country: 'CN', region: ['ASIA'], exchange: 'SZSE', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' } },
  { symbol: '^CSI300', name: 'CSI 300', country: 'CN', region: ['ASIA'], exchange: 'CSI', currency: 'CNY', timezone: 'Asia/Shanghai', marketHours: { open: '09:30', close: '15:00' } },
  
  // Hong Kong
  { symbol: '^HSI', name: 'Hang Seng Index', country: 'HK', region: ['ASIA', 'GLOBAL'], exchange: 'HKEX', currency: 'HKD', timezone: 'Asia/Hong_Kong', marketHours: { open: '09:30', close: '16:00' } },
  { symbol: '^HSCEI', name: 'Hang Seng China Enterprises', country: 'HK', region: ['ASIA'], exchange: 'HKEX', currency: 'HKD', timezone: 'Asia/Hong_Kong', marketHours: { open: '09:30', close: '16:00' } },
  
  // India
  { symbol: '^NSEI', name: 'NIFTY 50', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'NSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' } },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', country: 'IN', region: ['ASIA', 'GLOBAL'], exchange: 'BSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' } },
  { symbol: '^NSEBANK', name: 'NIFTY Bank', country: 'IN', region: ['ASIA'], exchange: 'NSE', currency: 'INR', timezone: 'Asia/Kolkata', marketHours: { open: '09:15', close: '15:30' } },
  
  // South Korea
  { symbol: '^KS11', name: 'KOSPI', country: 'KR', region: ['ASIA'], exchange: 'KRX', currency: 'KRW', timezone: 'Asia/Seoul', marketHours: { open: '09:00', close: '15:30' } },
  { symbol: '^KQ11', name: 'KOSDAQ', country: 'KR', region: ['ASIA'], exchange: 'KRX', currency: 'KRW', timezone: 'Asia/Seoul', marketHours: { open: '09:00', close: '15:30' } },
  
  // Taiwan
  { symbol: '^TWII', name: 'Taiwan Weighted', country: 'TW', region: ['ASIA'], exchange: 'TWSE', currency: 'TWD', timezone: 'Asia/Taipei', marketHours: { open: '09:00', close: '13:30' } },
  
  // Singapore
  { symbol: '^STI', name: 'Straits Times Index', country: 'SG', region: ['ASIA'], exchange: 'SGX', currency: 'SGD', timezone: 'Asia/Singapore', marketHours: { open: '09:00', close: '17:00' } },
  
  // Malaysia
  { symbol: '^KLSE', name: 'FTSE Bursa Malaysia KLCI', country: 'MY', region: ['ASIA'], exchange: 'Bursa Malaysia', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur', marketHours: { open: '09:00', close: '17:00' } },
  
  // Thailand
  { symbol: '^SETI', name: 'SET Index', country: 'TH', region: ['ASIA'], exchange: 'SET', currency: 'THB', timezone: 'Asia/Bangkok', marketHours: { open: '10:00', close: '16:30' } },
  
  // Indonesia
  { symbol: '^JKSE', name: 'Jakarta Composite', country: 'ID', region: ['ASIA'], exchange: 'IDX', currency: 'IDR', timezone: 'Asia/Jakarta', marketHours: { open: '09:00', close: '16:00' } },
  
  // Philippines
  { symbol: '^PSEI', name: 'PSEi Index', country: 'PH', region: ['ASIA'], exchange: 'PSE', currency: 'PHP', timezone: 'Asia/Manila', marketHours: { open: '09:30', close: '15:30' } },
  
  // Vietnam
  { symbol: '^VNINDEX', name: 'VN-Index', country: 'VN', region: ['ASIA'], exchange: 'HOSE', currency: 'VND', timezone: 'Asia/Ho_Chi_Minh', marketHours: { open: '09:00', close: '15:00' } },
  
  // Pakistan
  { symbol: '^KSE100', name: 'KSE 100', country: 'PK', region: ['ASIA'], exchange: 'PSX', currency: 'PKR', timezone: 'Asia/Karachi', marketHours: { open: '09:30', close: '15:30' } },
  
  // Bangladesh
  { symbol: '^DSEX', name: 'DSEX', country: 'BD', region: ['ASIA'], exchange: 'DSE', currency: 'BDT', timezone: 'Asia/Dhaka', marketHours: { open: '10:00', close: '14:30' } },
  
  // Sri Lanka
  { symbol: '^ASPI', name: 'All Share Price Index', country: 'LK', region: ['ASIA'], exchange: 'CSE', currency: 'LKR', timezone: 'Asia/Colombo', marketHours: { open: '09:30', close: '14:30' } },
];

// =============================================================================
// MIDDLE EAST - Stock Indices
// =============================================================================

export const MIDDLE_EAST_INDICES: IndexConfig[] = [
  // Saudi Arabia
  { symbol: '^TASI', name: 'Tadawul All Share', country: 'SA', region: ['MIDDLE_EAST'], exchange: 'Tadawul', currency: 'SAR', timezone: 'Asia/Riyadh', marketHours: { open: '10:00', close: '15:00' } },
  
  // UAE
  { symbol: '^DFM', name: 'DFM General Index', country: 'AE', region: ['MIDDLE_EAST'], exchange: 'DFM', currency: 'AED', timezone: 'Asia/Dubai', marketHours: { open: '10:00', close: '14:00' } },
  { symbol: '^ADX', name: 'ADX General Index', country: 'AE', region: ['MIDDLE_EAST'], exchange: 'ADX', currency: 'AED', timezone: 'Asia/Dubai', marketHours: { open: '10:00', close: '14:00' } },
  
  // Qatar
  { symbol: '^QSI', name: 'QE Index', country: 'QA', region: ['MIDDLE_EAST'], exchange: 'QSE', currency: 'QAR', timezone: 'Asia/Qatar', marketHours: { open: '09:30', close: '13:00' } },
  
  // Kuwait
  { symbol: '^KWSEIDX', name: 'Kuwait SE Price Index', country: 'KW', region: ['MIDDLE_EAST'], exchange: 'Boursa Kuwait', currency: 'KWD', timezone: 'Asia/Kuwait', marketHours: { open: '09:30', close: '13:00' } },
  
  // Israel
  { symbol: '^TA125', name: 'TA-125', country: 'IL', region: ['MIDDLE_EAST'], exchange: 'TASE', currency: 'ILS', timezone: 'Asia/Jerusalem', marketHours: { open: '09:30', close: '17:25' } },
  
  // Turkey
  { symbol: '^XU100', name: 'BIST 100', country: 'TR', region: ['MIDDLE_EAST', 'EUROPE'], exchange: 'BIST', currency: 'TRY', timezone: 'Europe/Istanbul', marketHours: { open: '10:00', close: '18:00' } },
  
  // Egypt
  { symbol: '^EGX30', name: 'EGX 30', country: 'EG', region: ['MIDDLE_EAST', 'AFRICA'], exchange: 'EGX', currency: 'EGP', timezone: 'Africa/Cairo', marketHours: { open: '10:00', close: '14:30' } },
];

// =============================================================================
// AFRICA - Stock Indices
// =============================================================================

export const AFRICA_INDICES: IndexConfig[] = [
  // South Africa
  { symbol: '^JALSH', name: 'FTSE/JSE All Share', country: 'ZA', region: ['AFRICA'], exchange: 'JSE', currency: 'ZAR', timezone: 'Africa/Johannesburg', marketHours: { open: '09:00', close: '17:00' } },
  { symbol: '^TOP40', name: 'FTSE/JSE Top 40', country: 'ZA', region: ['AFRICA'], exchange: 'JSE', currency: 'ZAR', timezone: 'Africa/Johannesburg', marketHours: { open: '09:00', close: '17:00' } },
  
  // Nigeria
  { symbol: '^NGSEINDX', name: 'NSE All-Share', country: 'NG', region: ['AFRICA'], exchange: 'NSE', currency: 'NGN', timezone: 'Africa/Lagos', marketHours: { open: '10:00', close: '14:30' } },
  
  // Kenya
  { symbol: '^KNSMIDX', name: 'NSE 20', country: 'KE', region: ['AFRICA'], exchange: 'NSE', currency: 'KES', timezone: 'Africa/Nairobi', marketHours: { open: '09:00', close: '15:00' } },
  
  // Morocco
  { symbol: '^MASI', name: 'MASI', country: 'MA', region: ['AFRICA'], exchange: 'Casablanca SE', currency: 'MAD', timezone: 'Africa/Casablanca', marketHours: { open: '09:00', close: '15:30' } },
];

// =============================================================================
// OCEANIA - Stock Indices
// =============================================================================

export const OCEANIA_INDICES: IndexConfig[] = [
  // Australia
  { symbol: '^AXJO', name: 'S&P/ASX 200', country: 'AU', region: ['OCEANIA'], exchange: 'ASX', currency: 'AUD', timezone: 'Australia/Sydney', marketHours: { open: '10:00', close: '16:00' } },
  { symbol: '^AORD', name: 'All Ordinaries', country: 'AU', region: ['OCEANIA'], exchange: 'ASX', currency: 'AUD', timezone: 'Australia/Sydney', marketHours: { open: '10:00', close: '16:00' } },
  
  // New Zealand
  { symbol: '^NZ50', name: 'S&P/NZX 50', country: 'NZ', region: ['OCEANIA'], exchange: 'NZX', currency: 'NZD', timezone: 'Pacific/Auckland', marketHours: { open: '10:00', close: '16:45' } },
];

// =============================================================================
// COMMODITIES
// =============================================================================

export const COMMODITIES = [
  // Energy
  { symbol: 'CL', name: 'Crude Oil WTI', type: 'commodity', category: 'Energy', unit: 'barrel', currency: 'USD' },
  { symbol: 'BZ', name: 'Brent Crude Oil', type: 'commodity', category: 'Energy', unit: 'barrel', currency: 'USD' },
  { symbol: 'NG', name: 'Natural Gas', type: 'commodity', category: 'Energy', unit: 'MMBtu', currency: 'USD' },
  { symbol: 'HO', name: 'Heating Oil', type: 'commodity', category: 'Energy', unit: 'gallon', currency: 'USD' },
  { symbol: 'RB', name: 'Gasoline', type: 'commodity', category: 'Energy', unit: 'gallon', currency: 'USD' },
  
  // Precious Metals
  { symbol: 'GC', name: 'Gold', type: 'commodity', category: 'Precious Metals', unit: 'oz', currency: 'USD' },
  { symbol: 'SI', name: 'Silver', type: 'commodity', category: 'Precious Metals', unit: 'oz', currency: 'USD' },
  { symbol: 'PL', name: 'Platinum', type: 'commodity', category: 'Precious Metals', unit: 'oz', currency: 'USD' },
  { symbol: 'PA', name: 'Palladium', type: 'commodity', category: 'Precious Metals', unit: 'oz', currency: 'USD' },
  
  // Industrial Metals
  { symbol: 'HG', name: 'Copper', type: 'commodity', category: 'Industrial Metals', unit: 'lb', currency: 'USD' },
  { symbol: 'ALI', name: 'Aluminum', type: 'commodity', category: 'Industrial Metals', unit: 'ton', currency: 'USD' },
  { symbol: 'ZNC', name: 'Zinc', type: 'commodity', category: 'Industrial Metals', unit: 'ton', currency: 'USD' },
  { symbol: 'NI', name: 'Nickel', type: 'commodity', category: 'Industrial Metals', unit: 'ton', currency: 'USD' },
  
  // Agriculture
  { symbol: 'ZC', name: 'Corn', type: 'commodity', category: 'Agriculture', unit: 'bushel', currency: 'USD' },
  { symbol: 'ZW', name: 'Wheat', type: 'commodity', category: 'Agriculture', unit: 'bushel', currency: 'USD' },
  { symbol: 'ZS', name: 'Soybeans', type: 'commodity', category: 'Agriculture', unit: 'bushel', currency: 'USD' },
  { symbol: 'SB', name: 'Sugar', type: 'commodity', category: 'Agriculture', unit: 'lb', currency: 'USD' },
  { symbol: 'KC', name: 'Coffee', type: 'commodity', category: 'Agriculture', unit: 'lb', currency: 'USD' },
  { symbol: 'CT', name: 'Cotton', type: 'commodity', category: 'Agriculture', unit: 'lb', currency: 'USD' },
  { symbol: 'CC', name: 'Cocoa', type: 'commodity', category: 'Agriculture', unit: 'ton', currency: 'USD' },
  
  // Livestock
  { symbol: 'LE', name: 'Live Cattle', type: 'commodity', category: 'Livestock', unit: 'lb', currency: 'USD' },
  { symbol: 'GF', name: 'Feeder Cattle', type: 'commodity', category: 'Livestock', unit: 'lb', currency: 'USD' },
  { symbol: 'HE', name: 'Lean Hogs', type: 'commodity', category: 'Livestock', unit: 'lb', currency: 'USD' },
];

// =============================================================================
// CRYPTOCURRENCIES
// =============================================================================

export const CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto' },
  { symbol: 'MATIC', name: 'Polygon', type: 'crypto' },
  { symbol: 'LTC', name: 'Litecoin', type: 'crypto' },
];

// =============================================================================
// MAJOR CURRENCY PAIRS
// =============================================================================

export const CURRENCY_PAIRS = [
  // Major Pairs
  { pair: 'EUR/USD', name: 'Euro vs US Dollar', base: 'EUR', quote: 'USD', type: 'major' },
  { pair: 'GBP/USD', name: 'British Pound vs US Dollar', base: 'GBP', quote: 'USD', type: 'major' },
  { pair: 'USD/JPY', name: 'US Dollar vs Japanese Yen', base: 'USD', quote: 'JPY', type: 'major' },
  { pair: 'USD/CHF', name: 'US Dollar vs Swiss Franc', base: 'USD', quote: 'CHF', type: 'major' },
  { pair: 'AUD/USD', name: 'Australian Dollar vs US Dollar', base: 'AUD', quote: 'USD', type: 'major' },
  { pair: 'USD/CAD', name: 'US Dollar vs Canadian Dollar', base: 'USD', quote: 'CAD', type: 'major' },
  { pair: 'NZD/USD', name: 'New Zealand Dollar vs US Dollar', base: 'NZD', quote: 'USD', type: 'major' },
  
  // Cross Pairs
  { pair: 'EUR/GBP', name: 'Euro vs British Pound', base: 'EUR', quote: 'GBP', type: 'cross' },
  { pair: 'EUR/JPY', name: 'Euro vs Japanese Yen', base: 'EUR', quote: 'JPY', type: 'cross' },
  { pair: 'GBP/JPY', name: 'British Pound vs Japanese Yen', base: 'GBP', quote: 'JPY', type: 'cross' },
  
  // Emerging Market Pairs
  { pair: 'USD/INR', name: 'US Dollar vs Indian Rupee', base: 'USD', quote: 'INR', type: 'emerging' },
  { pair: 'USD/CNY', name: 'US Dollar vs Chinese Yuan', base: 'USD', quote: 'CNY', type: 'emerging' },
  { pair: 'USD/BRL', name: 'US Dollar vs Brazilian Real', base: 'USD', quote: 'BRL', type: 'emerging' },
  { pair: 'USD/MXN', name: 'US Dollar vs Mexican Peso', base: 'USD', quote: 'MXN', type: 'emerging' },
  { pair: 'USD/ZAR', name: 'US Dollar vs South African Rand', base: 'USD', quote: 'ZAR', type: 'emerging' },
  { pair: 'USD/TRY', name: 'US Dollar vs Turkish Lira', base: 'USD', quote: 'TRY', type: 'emerging' },
  { pair: 'USD/RUB', name: 'US Dollar vs Russian Ruble', base: 'USD', quote: 'RUB', type: 'emerging' },
];

// =============================================================================
// ALL INDICES COMBINED
// =============================================================================

export const ALL_INDICES = [
  ...AMERICAS_INDICES,
  ...EUROPE_INDICES,
  ...ASIA_INDICES,
  ...MIDDLE_EAST_INDICES,
  ...AFRICA_INDICES,
  ...OCEANIA_INDICES,
];

// =============================================================================
// COUNTRY TO INDICES MAPPING
// =============================================================================

export const COUNTRY_INDICES_MAP: Record<string, string[]> = {
  // Americas - Using proper ticker symbols with ^ prefix for APIs
  US: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
  CA: ['^GSPTSE', '^TSXV'],
  BR: ['^BVSP'],
  MX: ['^MXX'],
  AR: ['^MERV'],
  CL: ['^IPSA'],
  
  // Europe
  GB: ['^FTSE', '^FTMC'],
  DE: ['^GDAXI', '^MDAX'],
  FR: ['^FCHI'],
  IT: ['^FTSEMIB'],
  ES: ['^IBEX'],
  NL: ['^AEX'],
  CH: ['^SSMI'],
  BE: ['^BFX'],
  SE: ['^OMXS30'],
  NO: ['^OSEBX'],
  DK: ['^OMXC20'],
  RU: ['^IMOEX'],
  PL: ['^WIG20'],
  EU: ['^STOXX50E'],
  
  // Asia
  JP: ['^N225', '^TOPIX'],
  CN: ['^SSE', '^SZSE', '^CSI300'],
  HK: ['^HSI', '^HSCEI'],
  IN: ['^NSEI', '^BSESN', '^NSEBANK'],
  KR: ['^KS11', '^KQ11'],
  TW: ['^TWII'],
  SG: ['^STI'],
  MY: ['^KLSE'],
  TH: ['^SETI'],
  ID: ['^JKSE'],
  PH: ['^PSEI'],
  VN: ['^VNINDEX'],
  PK: ['^KSE100'],
  BD: ['^DSEX'],
  LK: ['^ASPI'],
  
  // Middle East
  SA: ['^TASI'],
  AE: ['^DFM', '^ADX'],
  QA: ['^QSI'],
  KW: ['^KWSEIDX'],
  IL: ['^TA125'],
  TR: ['^XU100'],
  EG: ['^EGX30'],
  
  // Africa
  ZA: ['^JALSH', '^TOP40'],
  NG: ['^NGSEINDX'],
  KE: ['^KNSMIDX'],
  MA: ['^MASI'],
  
  // Oceania
  AU: ['^AXJO', '^AORD'],
  NZ: ['^NZ50'],
};

// Helper function to get indices by country
export const getIndicesByCountry = (countryCode: string): IndexConfig[] => {
  const symbols = COUNTRY_INDICES_MAP[countryCode] || [];
  return ALL_INDICES.filter(index => symbols.includes(index.symbol));
};

// Helper function to get indices by region
export const getIndicesByRegion = (region: Region): IndexConfig[] => {
  return ALL_INDICES.filter(index => index.region.includes(region));
};
