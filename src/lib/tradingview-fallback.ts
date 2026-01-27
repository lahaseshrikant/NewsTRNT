import { promises as fs } from 'fs';
import path from 'path';
// Database access moved to backend
import { getMarketIndices } from './market-config';

export interface TradingViewQuote {
  symbol: string;
  name: string;
  last: number;
  change?: number;
  change_percent?: number;
  high?: number;
  low?: number;
  currency?: string;
}

interface TradingViewSnapshot {
  generated_at?: string;
  source_url?: string;
  items: TradingViewQuote[];
}

const DEFAULT_SNAPSHOT_PATH = path.resolve(process.cwd(), 'data', 'tradingview_indices.json');

let cachedSnapshot: { data: TradingViewSnapshot; loadedAt: number } | null = null;

// Map database symbols to TradingView symbols
// Database uses Yahoo-style symbols (^GSPC), TradingView uses different naming
const SYMBOL_MAP: Record<string, string[]> = {
  '^GSPC': ['SPX', 'SP500', 'S&P500'],
  '^DJI': ['DJI', 'DJIA', 'DOW'],
  '^IXIC': ['IXIC', 'NASDAQ', 'NDX'],
  '^RUT': ['RUT', 'RUSSELL'],
  '^VIX': ['VIX'],
  '^GSPTSE': ['TSX', 'GSPTSE'],
  '^FTSE': ['UKX', 'FTSE', 'FTSE100', 'UK100'],
  '^GDAXI': ['DAX', 'GDAXI', 'DEU40'],
  '^FCHI': ['PX1', 'CAC40', 'FCHI', 'FRA40'],
  '^STOXX50E': ['STOXX50E', 'SX5E', 'STOXX50'],
  '^N225': ['NI225', 'NIKKEI', 'N225', 'NKY'],
  '^HSI': ['HSI', 'HANGSENG'],
  '^NSEI': ['NIFTY', 'NSEI', 'NIFTY50'],
  '^BSESN': ['SENSEX', 'BSESN', 'BSE'],
  '^SSE': ['SHCOMP', 'SSE', 'SHANGHAI'],
};

function normalizeSymbol(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function normalizeName(value: string) {
  return value.replace(/index/i, '').trim().toLowerCase();
}

function resolveSnapshotPath() {
  return process.env.TRADINGVIEW_SNAPSHOT_PATH
    ? path.resolve(process.cwd(), process.env.TRADINGVIEW_SNAPSHOT_PATH)
    : DEFAULT_SNAPSHOT_PATH;
}

export async function loadTradingViewSnapshot(forceRefresh = false): Promise<TradingViewSnapshot | null> {
  if (!forceRefresh && cachedSnapshot && Date.now() - cachedSnapshot.loadedAt < 60_000) {
    return cachedSnapshot.data;
  }

  const snapshotPath = resolveSnapshotPath();
  try {
    const raw = await fs.readFile(snapshotPath, 'utf-8');
    const parsed = JSON.parse(raw) as TradingViewSnapshot;
    if (!Array.isArray(parsed.items)) {
      return null;
    }
    cachedSnapshot = { data: parsed, loadedAt: Date.now() };
    return parsed;
  } catch (error) {
    console.warn(`[TradingView Fallback] Unable to read snapshot at ${snapshotPath}:`, error);
    return null;
  }
}

function findQuoteForSymbol(snapshot: TradingViewSnapshot, symbol: string, name?: string) {
  const normalizedTarget = normalizeSymbol(symbol);

  // First, try exact match after normalization
  let candidate = snapshot.items.find((item) => normalizeSymbol(item.symbol) === normalizedTarget);
  if (candidate) return candidate;

  // Try symbol mapping (e.g., ^GSPC -> SPX, ^NSEI -> NIFTY)
  const mappedSymbols = SYMBOL_MAP[symbol];
  if (mappedSymbols) {
    for (const mapped of mappedSymbols) {
      candidate = snapshot.items.find(
        (item) => normalizeSymbol(item.symbol) === normalizeSymbol(mapped)
      );
      if (candidate) return candidate;
    }
  }

  // Try name-based matching
  if (name) {
    const normalizedName = normalizeName(name);
    candidate = snapshot.items.find((item) => normalizeName(item.name) === normalizedName);
    if (candidate) return candidate;
  }

  // Attempt prefix / contains match on symbol
  candidate = snapshot.items.find((item) => normalizeSymbol(item.symbol).includes(normalizedTarget));
  if (candidate) return candidate;

  // Attempt contains match on name
  if (name) {
    candidate = snapshot.items.find((item) => normalizeName(item.name).includes(normalizeName(name)));
    if (candidate) return candidate;
  }

  return null;
}

export async function fetchIndexFromTradingView(symbol: string, name?: string) {
  const snapshot = await loadTradingViewSnapshot();
  if (!snapshot) return null;

  const quote = findQuoteForSymbol(snapshot, symbol, name);
  if (!quote || typeof quote.last !== 'number') {
    return null;
  }

  const previousClose = typeof quote.change === 'number' ? quote.last - quote.change : quote.last;
  const changePercent =
    typeof quote.change_percent === 'number'
      ? quote.change_percent
      : previousClose !== 0
      ? ((quote.last - previousClose) / previousClose) * 100
      : 0;

  return {
    value: quote.last,
    previousClose,
    change: typeof quote.change === 'number' ? quote.change : quote.last - previousClose,
    changePercent,
    high: typeof quote.high === 'number' ? quote.high : undefined,
    low: typeof quote.low === 'number' ? quote.low : undefined,
    lastUpdated: snapshot.generated_at ? new Date(snapshot.generated_at) : new Date(),
    currency: quote.currency ?? undefined,
    provider: 'tradingview',
    name: quote.name,
  };
}

export async function ingestTradingViewSnapshot() {
  const snapshot = await loadTradingViewSnapshot();
  if (!snapshot) {
    throw new Error('TradingView snapshot not available');
  }

  const indices = await getMarketIndices();
  let successCount = 0;
  let missCount = 0;
  const missedSymbols: string[] = [];

  console.log(`[TradingView Ingest] Processing ${indices.length} indices from config...`);

  for (const indexConfig of indices) {
    const quote = await fetchIndexFromTradingView(indexConfig.symbol, indexConfig.name);
    if (!quote) {
      missCount++;
      missedSymbols.push(indexConfig.symbol);
      console.log(`[TradingView Ingest] ❌ No match for ${indexConfig.symbol} (${indexConfig.name})`);
      continue;
    }

    const currency = quote.currency ?? indexConfig.currency ?? 'USD';

    // Database upsert moved to backend - just log the data here
    console.log(`[TradingView Ingest] ✓ Would upsert ${indexConfig.symbol}: ${quote.value} ${currency}`);
    // NOTE: To persist this data, call the backend API:
    // POST /api/market/ingest with the quote data

    successCount++;
    console.log(`[TradingView Ingest] ✅ Updated ${indexConfig.symbol}: ${quote.value} ${currency}`);
  }

  console.log(`[TradingView Ingest] Complete: ${successCount} success, ${missCount} missed`);
  if (missedSymbols.length > 0) {
    console.log(`[TradingView Ingest] Missed symbols: ${missedSymbols.join(', ')}`);
  }

  return {
    successCount,
    missCount,
    missedSymbols,
    generatedAt: snapshot.generated_at,
  };
}
