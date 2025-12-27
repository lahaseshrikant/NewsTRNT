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

  // Debug logging
  console.log('[MarketWidget] State:', {
    location: location?.country,
    indicesCount: indices.length,
    indices: indices.map(i => i.symbol),
    isLoading,
    error,
  });

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
          <CommodityList commodities={commodities.slice(0, maxItems)} localCurrency={selectedCurrency.code} />
        )}
        {activeTab === 'currencies' && (
          <CurrencyList currencies={currencies.slice(0, maxItems)} localCurrency={selectedCurrency.code} />
        )}
        {activeTab === 'crypto' && (
          <CryptoList cryptocurrencies={cryptocurrencies.slice(0, maxItems)} localCurrency={selectedCurrency.code} />
        )}
      </div>
    </div>
  );
}

// Helper function to format currency - handles NaN and undefined
function formatCurrency(value: number | undefined | null, currencyCode: string): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '—';
  }
  const symbol = Object.values(CURRENCY_SYMBOLS).find(c => c.code === currencyCode)?.symbol || '$';
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to safely format number with toFixed - handles NaN
function safeToFixed(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(decimals);
}

// Helper to format change with sign
function formatChange(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}`;
}

// Index List Component - Enhanced with priority badges
function IndexList({ indices }: { indices: MarketIndex[] }) {
  if (indices.length === 0) {
    return <EmptyState message="No indices available" />;
  }

  return (
    <div className="space-y-3">
      {indices.map((index, idx) => {
        // Type assertion for extended properties from API
        const extendedIndex = index as MarketIndex & { 
          isLocal?: boolean; 
          isGlobalPopular?: boolean;
          priority?: number;
        };
        
        return (
          <div
            key={index.id}
            className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors ${
              extendedIndex.isLocal ? 'bg-primary/5 border-l-2 border-primary' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">
                  {index.symbol}
                </p>
                {/* Priority badges */}
                {extendedIndex.isLocal && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                    LOCAL
                  </span>
                )}
                {extendedIndex.isGlobalPopular && !extendedIndex.isLocal && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                    GLOBAL
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {index.name}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-foreground">
                {formatCurrency(index.value, index.currency)}
              </p>
              <p className={`text-sm font-medium ${
                (index.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChange(index.change)} ({safeToFixed(index.changePercent)}%)
              </p>
            </div>
            <MarketStatus isOpen={index.isOpen} />
          </div>
        );
      })}
    </div>
  );
}

// Commodity List Component - Enhanced with local currency
function CommodityList({ commodities, localCurrency }: { commodities: Commodity[]; localCurrency?: string }) {
  if (commodities.length === 0) {
    return <EmptyState message="No commodities available" />;
  }

  return (
    <div className="space-y-3">
      {commodities.map(commodity => {
        // Type assertion for extended properties
        const extendedCommodity = commodity as Commodity & {
          valueLocal?: number;
          localCurrency?: string;
        };
        
        return (
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
                ${safeToFixed(commodity.value)}
              </p>
              {/* Show local currency if available and different from USD */}
              {extendedCommodity.valueLocal && extendedCommodity.localCurrency && extendedCommodity.localCurrency !== 'USD' && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(extendedCommodity.valueLocal, extendedCommodity.localCurrency)}
                </p>
              )}
              <p className={`text-sm font-medium ${
                (commodity.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChange(commodity.change)} ({safeToFixed(commodity.changePercent)}%)
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Currency List Component - Shows real currency rates from database
function CurrencyList({ currencies, localCurrency }: { currencies: Currency[]; localCurrency?: string }) {
  // Use real currency data from API - no mock data
  if (currencies.length === 0) {
    return <EmptyState message="No currency data available. Ensure market data is updating." />;
  }

  return (
    <div className="space-y-3">
      {localCurrency && (
        <div className="text-sm text-muted-foreground mb-4">
          Exchange rates from {localCurrency}
        </div>
      )}
      {currencies.map(currency => {
        // Type assertion for extended properties
        const extendedCurrency = currency as Currency & {
          isPopular?: boolean;
          priority?: number;
        };
        
        return (
          <div
            key={currency.id}
            className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors ${
              extendedCurrency.isPopular ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {currency.pair}
                </p>
                {extendedCurrency.isPopular && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                    MAJOR
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                1 {currency.baseCurrency} = {safeToFixed(currency.rate, 4)} {currency.quoteCurrency}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-foreground text-lg">
                {safeToFixed(currency.rate, 4)}
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

// Crypto List Component - Enhanced with local currency and popularity badges
function CryptoList({ cryptocurrencies, localCurrency }: { cryptocurrencies: CryptoCurrency[]; localCurrency?: string }) {
  if (cryptocurrencies.length === 0) {
    return <EmptyState message="No cryptocurrencies available" />;
  }

  return (
    <div className="space-y-3">
      {cryptocurrencies.map(crypto => {
        // Type assertion for extended properties
        const extendedCrypto = crypto as CryptoCurrency & {
          valueLocal?: number;
          localCurrency?: string;
          isPopular?: boolean;
          priority?: number;
        };
        
        return (
          <div
            key={crypto.id}
            className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors ${
              extendedCrypto.isPopular ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {crypto.symbol}
                </p>
                {extendedCrypto.priority === 1 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded">
                    #1
                  </span>
                )}
                {extendedCrypto.priority === 2 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded">
                    #2
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {crypto.name}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-foreground">
                ${safeToFixed(crypto.value, crypto.value < 1 ? 6 : 2)}
              </p>
              {/* Show local currency if available and different from USD */}
              {extendedCrypto.valueLocal && extendedCrypto.localCurrency && extendedCrypto.localCurrency !== 'USD' && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(extendedCrypto.valueLocal, extendedCrypto.localCurrency)}
                </p>
              )}
              <p className={`text-sm font-medium ${
                (crypto.changePercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChange(crypto.changePercent)}%
              </p>
            </div>
            <div className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
              24/7
            </div>
          </div>
        );
      })}
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
