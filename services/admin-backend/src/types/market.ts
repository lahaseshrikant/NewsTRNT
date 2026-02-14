// Market data types for admin-backend

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  currency?: string;
  country?: string;
  exchange?: string;
  lastUpdated: Date;
}

export interface Commodity {
  symbol: string;
  name: string;
  value: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  unit?: string;
  currency?: string;
  lastUpdated: Date;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
  baseCurrency: string;
  change?: number;
  changePercent?: number;
  lastUpdated: Date;
}

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
  marketCap?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
  lastUpdated: Date;
}

export interface CoinGeckoMarketResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}
