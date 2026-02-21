'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketIndex } from '@/types/market';

/**
 * Live market ticker bar — sits below the header like Bloomberg/CNBC.
 * Auto-scrolls market indices with color-coded change indicators.
 * Pauses on hover, doubles speed on mobile for visible movement.
 */
export default function MarketTicker() {
  const { indices, isLoading } = useMarketData({ autoRefresh: true, refreshInterval: 30_000 });
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (indices.length > 0) setLastUpdated(new Date());
  }, [indices]);

  // Don't render if no data after loading
  if (!isLoading && indices.length === 0) return null;

  const formatPrice = (val: number | undefined) =>
    val !== undefined ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const formatChange = (val: number | undefined) => {
    if (val === undefined || val === null) return '0.00';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
  };

  const formatPct = (val: number | undefined) => {
    if (val === undefined || val === null) return '0.00%';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const changeColor = (val: number | undefined) => {
    if (!val) return 'text-gray-400';
    return val > 0 ? 'text-emerald-400' : 'text-red-400';
  };

  const changeBg = (val: number | undefined) => {
    if (!val) return 'bg-gray-500/10';
    return val > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10';
  };

  const renderItem = (item: MarketIndex, key: string) => (
    <div
      key={key}
      className="inline-flex items-center gap-2 px-4 py-1 whitespace-nowrap cursor-default select-none"
    >
      <span className="font-semibold text-xs text-foreground/90 tracking-wide uppercase">
        {item.symbol || item.name}
      </span>
      <span className="text-xs font-mono text-foreground/70">{formatPrice(item.value)}</span>
      <span className={`text-xs font-mono ${changeColor(item.change)}`}>
        {formatChange(item.change)}
      </span>
      <span
        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${changeBg(item.changePercent)} ${changeColor(item.changePercent)}`}
      >
        {item.changePercent !== undefined && item.changePercent > 0 ? '▲' : item.changePercent !== undefined && item.changePercent < 0 ? '▼' : '–'}{' '}
        {formatPct(item.changePercent)}
      </span>
    </div>
  );

  // Duplicate items for seamless infinite scroll
  const items = indices.length > 0 ? indices : [];
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full bg-background/95 backdrop-blur-sm border-b border-border/50 overflow-hidden relative z-30"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="marquee"
      aria-label="Live market data"
    >
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 px-3 py-1.5 bg-primary/10 border-r border-border/50 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Link href="/news?category=business" className="text-[10px] font-bold tracking-widest uppercase text-primary hover:text-primary/80 transition-colors">
            Markets
          </Link>
        </div>

        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center gap-6 px-4 py-1.5 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-10 bg-muted rounded" />
                  <div className="h-3 w-14 bg-muted rounded" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="inline-flex ticker-scroll"
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            >
              {doubled.map((item, i) => renderItem(item, `${item.symbol}-${i}`))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {lastUpdated && (
          <div className="flex-shrink-0 hidden md:flex items-center px-3 text-[10px] text-muted-foreground font-mono border-l border-border/50">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
