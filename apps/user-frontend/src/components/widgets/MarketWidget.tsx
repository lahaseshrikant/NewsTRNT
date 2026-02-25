// Market Data Widget Component — Premium Edition
// Displays market indices, commodities, currencies based on user location

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketIndex, Commodity, Currency, CryptoCurrency } from '@/types/market';
import { setManualLocation } from '@/lib/location-service';
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
].filter(country => COUNTRY_INDICES_MAP[country.code]);

// Mini sparkline SVG component — uses deterministic pseudo-random points from value
function MiniSparkline({ value, isPositive, width = 48, height = 20 }: { value: number; isPositive: boolean; width?: number; height?: number }) {
  const points = useMemo(() => {
    // Generate a smooth path based on value as seed
    const seed = Math.abs(value * 137.508) % 1000;
    const pts = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const noise = Math.sin(seed + i * 1.7) * 0.3 + Math.cos(seed * 0.5 + i * 2.3) * 0.2;
      const trend = isPositive ? (i / steps) * 0.4 : -(i / steps) * 0.3;
      const y = height / 2 + (noise + trend) * (height * 0.35);
      pts.push(`${x.toFixed(1)},${Math.max(2, Math.min(height - 2, y)).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [value, isPositive, width, height]);

  const color = isPositive ? '#10b981' : '#ef4444';
  return (
    <svg width={width} height={height} className="flex-shrink-0 opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    if (location?.country) {
      const currencyInfo = CURRENCY_SYMBOLS[location.country] || CURRENCY_SYMBOLS.US;
      setSelectedCurrency(currencyInfo);
    }
  }, [location]);

  const handleLocationChange = async (countryCode: string, countryName: string) => {
    setManualLocation(countryCode, countryName);
    setShowLocationDropdown(false);
    await refresh();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Compute overall market sentiment
  const sentiment = useMemo(() => {
    const allChanges = [
      ...indices.map(i => i.changePercent ?? 0),
      ...commodities.map(c => c.changePercent ?? 0),
    ];
    if (allChanges.length === 0) return { label: '—', color: 'text-muted-foreground', bg: 'bg-muted/50' };
    const avg = allChanges.reduce((a, b) => a + b, 0) / allChanges.length;
    if (avg > 0.5) return { label: 'Bullish', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (avg < -0.5) return { label: 'Bearish', color: 'text-red-500', bg: 'bg-red-500/10' };
    return { label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  }, [indices, commodities]);

  if (isLoading) {
    return (
      <div className={`market-widget-premium rounded-2xl overflow-hidden ${className}`}>
        <div className="p-5 space-y-4">
          <div className="animate-pulse space-y-1">
            <div className="h-5 bg-muted/60 rounded-lg w-2/5" />
            <div className="h-3 bg-muted/40 rounded w-1/3" />
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="h-8 bg-muted/30 rounded-lg flex-1" />)}
          </div>
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex justify-between items-center py-2.5">
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted/40 rounded w-3/5" />
                  <div className="h-3 bg-muted/30 rounded w-2/5" />
                </div>
                <div className="space-y-1 items-end">
                  <div className="h-4 bg-muted/40 rounded w-16 ml-auto" />
                  <div className="h-3 bg-muted/30 rounded w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`market-widget-premium rounded-2xl overflow-hidden ${className}`}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button onClick={handleRefresh} className="px-4 py-2 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'indices' as const, label: 'Indices', count: indices.length, icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    )},
    { id: 'commodities' as const, label: 'Commodities', show: showCommodities, count: commodities.length, icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { id: 'currencies' as const, label: 'FX', show: showCurrencies, count: currencies.length, icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { id: 'crypto' as const, label: 'Crypto', show: showCrypto, count: cryptocurrencies.length, icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    )},
  ].filter(tab => tab.show !== false);

  return (
    <div className={`market-widget-premium rounded-2xl overflow-hidden ${className}`}>
      {/* ── Premium Header ── */}
      <div className="market-widget-header px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="market-widget-icon w-9 h-9 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Markets</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-muted-foreground font-medium">Live</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sentiment.bg} ${sentiment.color}`}>
                  {sentiment.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              className="p-1.5 hover:bg-muted/50 rounded-lg transition-all group"
              title="Refresh data"
            >
              <svg className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Location Selector — Compact */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/40"
            >
              <span className="text-base leading-none">{COUNTRY_LIST.find(c => c.code === location?.country)?.flag || '🌍'}</span>
              <span className="font-medium">{location?.countryName || 'Select'}</span>
              <svg className={`w-3 h-3 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLocationDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLocationDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto">
                  <div className="p-1.5">
                    {COUNTRY_LIST.map(country => (
                      <button
                        key={country.code}
                        onClick={() => handleLocationChange(country.code, country.name)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                          location?.country === country.code ? 'bg-primary/5' : ''
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{country.name}</div>
                        </div>
                        {location?.country === country.code && (
                          <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

          <span className="text-[10px] font-bold px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-md tracking-wide">
            {selectedCurrency.symbol} {selectedCurrency.code}
          </span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="px-3 pb-0">
        <div
          className="grid gap-0.5 bg-muted/30 rounded-xl p-0.5"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`hidden md:inline text-[9px] px-1 py-0 rounded-full ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4">
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

// ─── Helper Functions ───

function formatCurrency(value: number | undefined | null, currencyCode: string): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  const symbol = Object.values(CURRENCY_SYMBOLS).find(c => c.code === currencyCode)?.symbol || '$';
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function safeToFixed(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return value.toFixed(decimals);
}

function formatChange(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}`;
}

// ─── Row Components ───

function IndexList({ indices }: { indices: MarketIndex[] }) {
  if (indices.length === 0) return <EmptyState message="No indices available for this region" />;

  return (
    <div className="space-y-0.5">
      {indices.map((index) => {
        const ext = index as MarketIndex & { isLocal?: boolean; isGlobalPopular?: boolean };
        const isPositive = (index.changePercent ?? 0) >= 0;

        return (
          <div
            key={index.id}
            className={`market-row group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/40 ${
              ext.isLocal ? 'market-row-local' : ''
            }`}
          >
            {/* Indicator dot */}
            <div className={`w-1 h-8 rounded-full flex-shrink-0 transition-all ${
              isPositive ? 'bg-emerald-500/60' : 'bg-red-500/60'
            }`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground truncate" title={index.name}>
                  {index.name}
                </p>
                {ext.isLocal && (
                  <span className="px-1 py-0 text-[9px] font-bold bg-primary/10 text-primary rounded tracking-wide">
                    LOCAL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium" title={index.symbol}>
                {index.symbol.replace(/^\^/, '')}
              </p>
            </div>

            {/* Sparkline */}
            <MiniSparkline value={index.value ?? 0} isPositive={isPositive} />

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatCurrency(index.value, index.currency)}
              </p>
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${
                isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(index.changePercent ?? 0).toFixed(2)}%</span>
              </div>
            </div>

            <MarketStatus isOpen={index.isOpen} />
          </div>
        );
      })}
    </div>
  );
}

function CommodityList({ commodities, localCurrency }: { commodities: Commodity[]; localCurrency?: string }) {
  if (commodities.length === 0) return <EmptyState message="No commodities available" />;

  return (
    <div className="space-y-0.5">
      {commodities.map(commodity => {
        const ext = commodity as Commodity & { valueLocal?: number; localCurrency?: string };
        const isPositive = (commodity.changePercent ?? 0) >= 0;

        return (
          <div key={commodity.id} className="market-row group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/40">
            <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
              isPositive ? 'bg-emerald-500/60' : 'bg-red-500/60'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{commodity.name}</p>
              <p className="text-[11px] text-muted-foreground font-medium">per {commodity.unit}</p>
            </div>

            <MiniSparkline value={commodity.value ?? 0} isPositive={isPositive} />

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                ${safeToFixed(commodity.value)}
              </p>
              {ext.valueLocal && ext.localCurrency && ext.localCurrency !== 'USD' && (
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  ≈ {formatCurrency(ext.valueLocal, ext.localCurrency)}
                </p>
              )}
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${
                isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(commodity.changePercent ?? 0).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CurrencyList({ currencies }: { currencies: Currency[]; localCurrency?: string }) {
  if (currencies.length === 0) return <EmptyState message="No currency data available" />;

  return (
    <div className="space-y-0.5">
      {currencies.map(currency => {
        const ext = currency as Currency & { isPopular?: boolean; type?: string };
        const rate = currency.rate ?? 0;
        const changePct = currency.changePercent ?? 0;
        const isPositive = changePct >= 0;
        const baseCcy = currency.baseCurrency || 'USD';
        const quoteCcy = currency.quoteCurrency || 'USD';
        const pair = currency.pair || `${baseCcy}/${quoteCcy}`;
        const decimals = rate >= 10 ? 2 : 4;

        return (
          <div key={currency.id} className="market-row group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/40">
            <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
              isPositive ? 'bg-emerald-500/60' : 'bg-red-500/60'
            }`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{pair}</p>
                {ext.isPopular && (
                  <span className="px-1 py-0 text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded tracking-wide">
                    MAJOR
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                1 {baseCcy} = {safeToFixed(rate, decimals)} {quoteCcy}
              </p>
            </div>

            <MiniSparkline value={rate} isPositive={isPositive} />

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                {safeToFixed(rate, decimals)}
              </p>
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${
                isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(changePct).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CryptoList({ cryptocurrencies, localCurrency }: { cryptocurrencies: CryptoCurrency[]; localCurrency?: string }) {
  if (cryptocurrencies.length === 0) return <EmptyState message="No cryptocurrencies available" />;

  return (
    <div className="space-y-0.5">
      {cryptocurrencies.map(crypto => {
        const ext = crypto as CryptoCurrency & { valueLocal?: number; localCurrency?: string; isPopular?: boolean; priority?: number };
        const isPositive = (crypto.changePercent ?? 0) >= 0;

        return (
          <div key={crypto.id} className="market-row group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/40">
            <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
              isPositive ? 'bg-emerald-500/60' : 'bg-red-500/60'
            }`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{crypto.symbol}</p>
                {ext.priority === 1 && (
                  <span className="px-1 py-0 text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded">#1</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate">{crypto.name}</p>
            </div>

            <MiniSparkline value={crypto.value ?? 0} isPositive={isPositive} />

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                ${safeToFixed(crypto.value, crypto.value < 1 ? 6 : 2)}
              </p>
              {ext.valueLocal && ext.localCurrency && ext.localCurrency !== 'USD' && (
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  ≈ {formatCurrency(ext.valueLocal, ext.localCurrency)}
                </p>
              )}
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${
                isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(crypto.changePercent ?? 0).toFixed(2)}%</span>
              </div>
            </div>

            <div className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-500">
              24/7
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MarketStatus({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="ml-1 flex-shrink-0" title={isOpen ? 'Market open' : 'Market closed'}>
      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-muted-foreground/30'}`} />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
