// Market Data Type Definitions

export type MarketType = 'stock' | 'commodity' | 'currency' | 'crypto' | 'bond';
export type Region = 'AMERICAS' | 'EUROPE' | 'ASIA' | 'MIDDLE_EAST' | 'AFRICA' | 'OCEANIA' | 'GLOBAL';

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  type: MarketType;
  region: Region[];
  country: string; // ISO country code
  value: number;
  previousClose?: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: string;
  currency: string;
  lastUpdated: Date;
  isOpen: boolean;
  marketHours?: {
    open: string;
    close: string;
    timezone: string;
  };
}

export interface Commodity extends MarketIndex {
  unit: string; // 'oz', 'barrel', 'ton', etc.
}

export interface Currency {
  id: string;
  pair: string; // 'USD/EUR'
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface CryptoCurrency extends MarketIndex {
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  rank?: number;
}

export interface UserMarketPreferences {
  userId: string;
  preferredIndices: string[];
  preferredCommodities: string[];
  preferredCurrencies: string[];
  autoDetectLocation: boolean;
  manualLocation?: string; // ISO country code (e.g., 'US', 'IN', 'GB')
  displayCurrency: string; // User's preferred display currency
  theme: 'compact' | 'detailed' | 'cards';
  refreshInterval: number; // in seconds
  enableAlerts: boolean;
  priceAlerts?: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  value: number;
  isActive: boolean;
  notified: boolean;
}

export interface MarketDataResponse {
  indices: MarketIndex[];
  commodities: Commodity[];
  currencies: Currency[];
  cryptocurrencies: CryptoCurrency[];
  lastUpdated: Date;
  region: string;
  cacheExpiry: Date;
}

export interface LocationData {
  country: string; // ISO code
  countryName?: string;
  region?: Region;
  timezone?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: number;
  detectionMethod: 'user_preference' | 'geolocation' | 'ip' | 'locale' | 'default' | 'manual';
}

export interface MarketHours {
  region: string;
  timezone: string;
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
  schedule: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
}
