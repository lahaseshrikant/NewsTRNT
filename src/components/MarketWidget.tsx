// Market Data Widget Component
// Displays market indices, commodities, currencies based on user location

'use client';

import { useState, useEffect } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketIndex, Commodity, Currency, CryptoCurrency } from '@/types/market';
import { setManualLocation, getUserLocation } from '@/lib/location-service';
import { COUNTRY_INDICES_MAP } from '@/config/market-indices';

interface MarketWidgetProps {
  className?: string;
  showCommodities?: boolean;
  showCurrencies?: boolean;
  showCrypto?: boolean;
  maxItems?: number;
}

// Currency symbols by country
const CURRENCY_SYMBOLS: Record<string, { code: string; symbol: string }> = {
  US: { code: 'USD', symbol: '$' },
  CA: { code: 'CAD', symbol: 'C$' },
  GB: { code: 'GBP', symbol: '£' },
  EU: { code: 'EUR', symbol: '€' },
  JP: { code: 'JPY', symbol: '¥' },
  CN: { code: 'CNY', symbol: '¥' },
  IN: { code: 'INR', symbol: '₹' },
  AU: { code: 'AUD', symbol: 'A$' },
  BR: { code: 'BRL', symbol: 'R$' },
  MX: { code: 'MXN', symbol: 'Mex$' },
  RU: { code: 'RUB', symbol: '₽' },
  KR: { code: 'KRW', symbol: '₩' },
  CH: { code: 'CHF', symbol: 'CHF' },
  HK: { code: 'HKD', symbol: 'HK$' },
  SG: { code: 'SGD', symbol: 'S$' },
  SA: { code: 'SAR', symbol: 'SR' },
  AE: { code: 'AED', symbol: 'د.إ' },
  ZA: { code: 'ZAR', symbol: 'R' },
};

// Country list for dropdown
const COUNTRY_LIST = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
].filter(country => COUNTRY_INDICES_MAP[country.code]); // Only show countries with indices

export default function MarketWidget({
  className = '',
  showCommodities = true,
  showCurrencies = true,
  showCrypto = true,
  maxItems = 5,
}: MarketWidgetProps) {
  const { indices, commodities, currencies, cryptocurrencies, location, isLoading, error, refresh } = useMarketData();
  const [activeTab, setActiveTab] = useState<'indices' | 'commodities' | 'currencies' | 'crypto'>('indices');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_SYMBOLS.US);

  // Update currency when location changes
  useEffect(() => {
    if (location?.country) {
      const currencyInfo = CURRENCY_SYMBOLS[location.country] || CURRENCY_SYMBOLS.US;
      setSelectedCurrency(currencyInfo);
    }
  }, [location]);

  const handleLocationChange = async (countryCode: string, countryName: string) => {
    setManualLocation(countryCode, countryName);
    setShowLocationDropdown(false);
    // Refresh data with new location
    await refresh();
  };

  if (isLoading) {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'indices' as const, label: 'Indices', show: true, count: indices.length },
    { id: 'commodities' as const, label: 'Commodities', show: showCommodities, count: commodities.length },
    { id: 'currencies' as const, label: 'Currencies', show: showCurrencies, count: currencies.length },
    { id: 'crypto' as const, label: 'Crypto', show: showCrypto, count: cryptocurrencies.length },
  ].filter(tab => tab.show);

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">
            Market Overview
          </h2>
          <button
            onClick={refresh}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Location Selector */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>📍 {location?.countryName || location?.country || 'Select Location'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowLocationDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                      Select Country
                    </div>
                    {COUNTRY_LIST.map(country => (
                      <button
                        key={country.code}
                        onClick={() => handleLocationChange(country.code, country.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left ${
                          location?.country === country.code ? 'bg-muted/50' : ''
                        }`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{country.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {CURRENCY_SYMBOLS[country.code]?.code || 'USD'}
                          </div>
                        </div>
                        {location?.country === country.code && (
                          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Currency Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Currency:</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
              {selectedCurrency.symbol} {selectedCurrency.code}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'indices' && (
          <IndexList indices={indices.slice(0, maxItems)} />
        )}
        {activeTab === 'commodities' && (
          <CommodityList commodities={commodities.slice(0, maxItems)} />
        )}
        {activeTab === 'currencies' && (
          <CurrencyList currencies={currencies.slice(0, maxItems)} localCurrency={selectedCurrency.code} />
        )}
        {activeTab === 'crypto' && (
          <CryptoList cryptocurrencies={cryptocurrencies.slice(0, maxItems)} />
        )}
      </div>
    </div>
  );
}

// Helper function to format currency
function formatCurrency(value: number, currencyCode: string): string {
  const symbol = Object.values(CURRENCY_SYMBOLS).find(c => c.code === currencyCode)?.symbol || '$';
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Index List Component
function IndexList({ indices }: { indices: MarketIndex[] }) {
  if (indices.length === 0) {
    return <EmptyState message="No indices available" />;
  }

  return (
    <div className="space-y-3">
      {indices.map(index => (
        <div
          key={index.id}
          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {index.symbol}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {index.name}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-foreground">
              {formatCurrency(index.value, index.currency)}
            </p>
            <p className={`text-sm font-medium ${
              index.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
            </p>
          </div>
          <MarketStatus isOpen={index.isOpen} />
        </div>
      ))}
    </div>
  );
}

// Commodity List Component
function CommodityList({ commodities }: { commodities: Commodity[] }) {
  if (commodities.length === 0) {
    return <EmptyState message="No commodities available" />;
  }

  return (
    <div className="space-y-3">
      {commodities.map(commodity => (
        <div
          key={commodity.id}
          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {commodity.name}
            </p>
            <p className="text-sm text-muted-foreground">
              per {commodity.unit}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-foreground">
              {formatCurrency(commodity.value, commodity.currency)}
            </p>
            <p className={`text-sm font-medium ${
              commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {commodity.change >= 0 ? '+' : ''}{commodity.change.toFixed(2)} ({commodity.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Currency List Component - Shows conversion rates for local currency
function CurrencyList({ currencies, localCurrency }: { currencies: Currency[]; localCurrency?: string }) {
  // If we have a local currency, create conversion rates for it
  const conversionRates = localCurrency ? [
    { from: localCurrency, to: 'USD', label: `${localCurrency} to US Dollar` },
    { from: localCurrency, to: 'EUR', label: `${localCurrency} to Euro` },
    { from: localCurrency, to: 'GBP', label: `${localCurrency} to British Pound` },
    { from: localCurrency, to: 'JPY', label: `${localCurrency} to Japanese Yen` },
    { from: localCurrency, to: 'CNY', label: `${localCurrency} to Chinese Yuan` },
    { from: localCurrency, to: 'AUD', label: `${localCurrency} to Australian Dollar` },
    { from: localCurrency, to: 'CAD', label: `${localCurrency} to Canadian Dollar` },
    { from: localCurrency, to: 'CHF', label: `${localCurrency} to Swiss Franc` },
  ].filter(rate => rate.from !== rate.to) : [];

  // Currency conversion rates (mock data)
  const CURRENCY_RATES: Record<string, number> = {
    USD: 1, INR: 83.12, GBP: 0.79, EUR: 0.92, JPY: 149.50, CNY: 7.24,
    AUD: 1.53, CAD: 1.36, BRL: 4.98, MXN: 17.15, RUB: 92.50, KRW: 1310.50,
    CHF: 0.88, HKD: 7.82, SGD: 1.34, SAR: 3.75, AED: 3.67, ZAR: 18.20,
  };

  // Calculate conversion rate
  const getConversionRate = (from: string, to: string): number => {
    const fromRate = CURRENCY_RATES[from] || 1;
    const toRate = CURRENCY_RATES[to] || 1;
    return toRate / fromRate;
  };

  if (conversionRates.length > 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground mb-4">
          Exchange rates for {localCurrency}
        </div>
        {conversionRates.map((rate, index) => {
          const conversionRate = getConversionRate(rate.from, rate.to);
          const previousRate = conversionRate * (1 + (Math.random() - 0.5) * 0.01);
          const change = conversionRate - previousRate;
          const changePercent = (change / previousRate) * 100;
          
          return (
            <div
              key={`${rate.from}-${rate.to}-${index}`}
              className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {rate.from}/{rate.to}
                </p>
                <p className="text-sm text-muted-foreground">
                  {rate.label}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-foreground">
                  {conversionRate.toFixed(4)}
                </p>
                <p className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(4)} ({changePercent.toFixed(2)}%)
                </p>
              </div>
              <div className="ml-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback to default currencies if no local currency
  if (currencies.length === 0) {
    return <EmptyState message="No currencies available" />;
  }

  return (
    <div className="space-y-3">
      {currencies.map(currency => (
        <div
          key={currency.id}
          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {currency.pair}
            </p>
            <p className="text-sm text-muted-foreground">
              {currency.baseCurrency} / {currency.quoteCurrency}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-foreground">
              {currency.rate.toFixed(4)}
            </p>
            <p className={`text-sm font-medium ${
              currency.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(4)} ({currency.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Crypto List Component
function CryptoList({ cryptocurrencies }: { cryptocurrencies: CryptoCurrency[] }) {
  if (cryptocurrencies.length === 0) {
    return <EmptyState message="No cryptocurrencies available" />;
  }

  return (
    <div className="space-y-3">
      {cryptocurrencies.map(crypto => (
        <div
          key={crypto.id}
          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {crypto.symbol}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {crypto.name}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-foreground">
              {formatCurrency(crypto.value, crypto.currency)}
            </p>
            <p className={`text-sm font-medium ${
              crypto.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {crypto.change >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
            </p>
          </div>
          <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            24/7
          </div>
        </div>
      ))}
    </div>
  );
}

// Market Status Indicator
function MarketStatus({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="ml-2 flex items-center">
      <div className={`w-2 h-2 rounded-full ${
        isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      }`} />
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <svg
        className="mx-auto h-12 w-12 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
