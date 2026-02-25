// Market Movers Widget — Top Gainers & Losers
// Shows the best and worst performing market items

'use client';

import { useMemo, useState } from 'react';
import { MarketIndex, Commodity, Currency } from '@/types/market';

interface MarketMoversProps {
  indices: MarketIndex[];
  commodities: Commodity[];
  currencies: Currency[];
  className?: string;
}

interface Mover {
  name: string;
  symbol: string;
  change: number;
  type: 'index' | 'commodity' | 'currency';
}

export default function MarketMovers({ indices, commodities, currencies, className = '' }: MarketMoversProps) {
  const [view, setView] = useState<'gainers' | 'losers'>('gainers');

  const movers = useMemo(() => {
    const all: Mover[] = [];
    
    indices.forEach(i => {
      if (i.changePercent !== undefined && i.changePercent !== null) {
        all.push({ name: i.name, symbol: i.symbol.replace(/^\^/, ''), change: i.changePercent, type: 'index' });
      }
    });
    
    commodities.forEach(c => {
      if (c.changePercent !== undefined && c.changePercent !== null) {
        all.push({ name: c.name, symbol: c.symbol, change: c.changePercent, type: 'commodity' });
      }
    });

    currencies.forEach(c => {
      if (c.changePercent !== undefined && c.changePercent !== null && c.pair) {
        all.push({ name: c.pair, symbol: c.pair, change: c.changePercent, type: 'currency' });
      }
    });

    const sorted = [...all].sort((a, b) => b.change - a.change);
    return {
      gainers: sorted.filter(m => m.change > 0).slice(0, 5),
      losers: sorted.filter(m => m.change < 0).sort((a, b) => a.change - b.change).slice(0, 5),
    };
  }, [indices, commodities, currencies]);

  const items = view === 'gainers' ? movers.gainers : movers.losers;

  if (items.length === 0 && movers.gainers.length === 0 && movers.losers.length === 0) return null;

  const typeColors: Record<string, string> = {
    index: 'bg-blue-500/10 text-blue-500',
    commodity: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    currency: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  const typeLabels: Record<string, string> = {
    index: 'IDX',
    commodity: 'CMD',
    currency: 'FX',
  };

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Market Movers</h3>
          </div>
          <div className="flex bg-muted/30 rounded-lg p-0.5">
            <button
              onClick={() => setView('gainers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                view === 'gainers'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setView('losers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                view === 'losers'
                  ? 'bg-red-500/10 text-red-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Losers
            </button>
          </div>
        </div>
      </div>

      <div className="py-1">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No {view} data available
          </p>
        ) : (
          items.map((item, idx) => (
            <div key={`${item.symbol}-${idx}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
              <span className="text-sm font-bold text-muted-foreground/40 tabular-nums w-5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-bold px-1 py-0 rounded ${typeColors[item.type]}`}>
                    {typeLabels[item.type]}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{item.symbol}</span>
                </div>
              </div>
              <div className="text-right">
                {/* Visual bar */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(item.change) * 20)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
