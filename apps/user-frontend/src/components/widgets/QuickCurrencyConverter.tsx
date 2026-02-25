// Quick Currency Converter — Inline mini widget
// Allows users to convert between major currencies using live rates

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Currency } from '@/types/market';

interface QuickCurrencyConverterProps {
  currencies: Currency[];
  className?: string;
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'];

export default function QuickCurrencyConverter({ currencies, className = '' }: QuickCurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');

  // Build a rate map from pair data: BASE/QUOTE → rate
  const rateMap = useMemo(() => {
    const map = new Map<string, number>();
    currencies.forEach(c => {
      if (c.rate && c.baseCurrency && c.quoteCurrency) {
        map.set(`${c.baseCurrency}/${c.quoteCurrency}`, c.rate);
        // Also compute inverse
        if (c.rate > 0) {
          map.set(`${c.quoteCurrency}/${c.baseCurrency}`, 1 / c.rate);
        }
      }
    });
    return map;
  }, [currencies]);

  // Available currency codes from the data
  const availableCodes = useMemo(() => {
    const codes = new Set<string>();
    currencies.forEach(c => {
      if (c.baseCurrency) codes.add(c.baseCurrency);
      if (c.quoteCurrency) codes.add(c.quoteCurrency);
    });
    // Sort: popular first, then alphabetical rest
    return Array.from(codes).sort((a, b) => {
      const aIdx = POPULAR_CURRENCIES.indexOf(a);
      const bIdx = POPULAR_CURRENCIES.indexOf(b);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      if (aIdx >= 0) return -1;
      if (bIdx >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [currencies]);

  // Find the rate between fromCurrency and toCurrency
  const getRate = useCallback((from: string, to: string): number | null => {
    if (from === to) return 1;

    // Direct lookup
    const direct = rateMap.get(`${from}/${to}`);
    if (direct) return direct;

    // Try through USD as intermediate
    const fromToUSD = from === 'USD' ? 1 : rateMap.get(`${from}/USD`);
    const usdToTo = to === 'USD' ? 1 : rateMap.get(`USD/${to}`);
    if (fromToUSD && usdToTo) return fromToUSD * usdToTo;

    return null;
  }, [rateMap]);

  const rate = getRate(fromCurrency, toCurrency);
  const numAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? numAmount * rate : null;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (currencies.length === 0 || availableCodes.length < 2) return null;

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden ${className}`}>
      <div className="px-5 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Currency Converter</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Amount + From */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all tabular-nums"
              min="0"
              step="any"
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {availableCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-all hover:scale-110 active:scale-95"
            title="Swap currencies"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Result + To */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Converted</label>
            <div className="w-full px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm font-bold text-foreground tabular-nums">
              {converted !== null
                ? converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: converted >= 100 ? 2 : 4 })
                : '—'
              }
            </div>
          </div>
          <div className="w-24">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {availableCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate info */}
        {rate !== null && (
          <p className="text-[11px] text-muted-foreground text-center">
            1 {fromCurrency} = {rate >= 10 ? rate.toFixed(2) : rate.toFixed(4)} {toCurrency}
          </p>
        )}
      </div>
    </div>
  );
}
