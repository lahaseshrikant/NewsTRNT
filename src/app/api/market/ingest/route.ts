/**
 * Direct Database Ingestion API for Market Data Scrapers
 * ======================================================
 * 
 * This endpoint allows scrapers (Python or Node.js) to POST market data
 * directly to the database instead of writing to JSON files.
 * 
 * POST /api/market/ingest
 * Body: {
 *   scraperName: string,       // "tradingview", "coingecko", etc.
 *   dataType: "indices" | "crypto" | "currencies" | "commodities",
 *   items: Array<MarketDataItem>,
 *   generatedAt?: string       // ISO timestamp
 * }
 * 
 * Security: Protected by API key from MARKET_INGEST_API_KEY env variable
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';

// Types for incoming data
interface IndexQuote {
  symbol: string;
  name: string;
  last: number;
  change?: number;
  change_percent?: number;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
  currency?: string;
  exchange?: string;
  country?: string;
}

interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  change_percent?: number;
  market_cap?: number;
  volume_24h?: number;
  high_24h?: number;
  low_24h?: number;
  rank?: number;
}

interface CurrencyQuote {
  currency: string;
  name: string;
  rate_to_usd: number;
  symbol?: string;
  country?: string;
}

interface CommodityQuote {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  change_percent?: number;
  high?: number;
  low?: number;
  category?: string;
}

interface IngestPayload {
  scraperName: string;
  dataType: 'indices' | 'crypto' | 'currencies' | 'commodities';
  items: (IndexQuote | CryptoQuote | CurrencyQuote | CommodityQuote)[];
  generatedAt?: string;
  apiKey?: string;
}

// Symbol mapping for TradingView -> Yahoo format
const TRADINGVIEW_TO_YAHOO: Record<string, string> = {
  'SPX': '^GSPC',
  'SP500': '^GSPC',
  'DJI': '^DJI',
  'DJIA': '^DJI',
  'DOW': '^DJI',
  'IXIC': '^IXIC',
  'NDX': '^IXIC',
  'NASDAQ': '^IXIC',
  'RUT': '^RUT',
  'RUSSELL': '^RUT',
  'VIX': '^VIX',
  'TSX': '^GSPTSE',
  'GSPTSE': '^GSPTSE',
  'UKX': '^FTSE',
  'FTSE': '^FTSE',
  'FTSE100': '^FTSE',
  'UK100': '^FTSE',
  'DAX': '^GDAXI',
  'DEU40': '^GDAXI',
  'GDAXI': '^GDAXI',
  'PX1': '^FCHI',
  'CAC40': '^FCHI',
  'FRA40': '^FCHI',
  'FCHI': '^FCHI',
  'SX5E': '^STOXX50E',
  'STOXX50': '^STOXX50E',
  'STOXX50E': '^STOXX50E',
  'NI225': '^N225',
  'NIKKEI': '^N225',
  'NKY': '^N225',
  'N225': '^N225',
  'HSI': '^HSI',
  'HANGSENG': '^HSI',
  'NIFTY': '^NSEI',
  'NIFTY50': '^NSEI',
  'NSEI': '^NSEI',
  'SENSEX': '^BSESN',
  'BSE': '^BSESN',
  'BSESN': '^BSESN',
  'SHCOMP': '^SSE',
  'SHANGHAI': '^SSE',
  'SSE': '^SSE',
  // Additional global indices
  'IBOV': '^BVSP',
  'BOVESPA': '^BVSP',
  'IPC': '^MXX',
  'MEXBOL': '^MXX',
  'KOSPI': '^KS11',
  'KS11': '^KS11',
  'KOSDAQ': '^KQ11',
  'KQ11': '^KQ11',
  'TWII': '^TWII',
  'TAIEX': '^TWII',
  'AS51': '^AXJO',
  'AXJO': '^AXJO',
  'ASX200': '^AXJO',
  'STI': '^STI',
  'STRAITS': '^STI',
  'KLSE': '^KLSE',
  'KLCI': '^KLSE',
  'SET': '^SET',
  'JKSE': '^JKSE',
  'IDX': '^JKSE',
  'PSI': '^PSI20',
  'PSI20': '^PSI20',
  'IBEX': '^IBEX',
  'IBEX35': '^IBEX',
  'AEX': '^AEX',
  'SMI': '^SSMI',
  'SSMI': '^SSMI',
  'BEL20': '^BFX',
  'BFX': '^BFX',
  'OMX': '^OMX',
  'OMXS30': '^OMX',
  'MOEX': '^IMOEX',
  'IMOEX': '^IMOEX',
  'RTSI': '^RTS',
  'RTS': '^RTS',
  'TADAWUL': '^TASI',
  'TASI': '^TASI',
  'QSI': '^QSI',
  'QEALL': '^QSI',
  'ADI': '^ADI',
  'TA35': '^TA35',
  'TA125': '^TA125',
  'EGX30': '^EGX30',
  'JSE': '^J203',
  'NSEASI': '^NGS30',
};

// Symbol to country mapping (Yahoo format symbols)
const SYMBOL_TO_COUNTRY: Record<string, string> = {
  // Americas
  '^GSPC': 'US', '^DJI': 'US', '^IXIC': 'US', '^RUT': 'US', '^VIX': 'US',
  '^GSPTSE': 'CA', '^TSXV': 'CA',
  '^BVSP': 'BR',
  '^MXX': 'MX',
  '^MERV': 'AR',
  '^IPSA': 'CL',
  // Europe
  '^FTSE': 'GB', '^FTMC': 'GB',
  '^GDAXI': 'DE', '^MDAX': 'DE',
  '^FCHI': 'FR',
  '^FTSEMIB': 'IT',
  '^IBEX': 'ES',
  '^AEX': 'NL',
  '^SSMI': 'CH',
  '^BFX': 'BE',
  '^OMX': 'SE', '^OMXS30': 'SE',
  '^OSEBX': 'NO',
  '^OMXC20': 'DK',
  '^IMOEX': 'RU', '^RTS': 'RU',
  '^WIG20': 'PL',
  '^STOXX50E': 'EU', '^STOXX': 'EU',
  // Asia
  '^N225': 'JP', '^TOPIX': 'JP',
  '^SSE': 'CN', '^SZSE': 'CN', '^CSI300': 'CN',
  '^HSI': 'HK', '^HSCEI': 'HK',
  '^NSEI': 'IN', '^BSESN': 'IN', '^NSEBANK': 'IN',
  '^KS11': 'KR', '^KQ11': 'KR',
  '^TWII': 'TW',
  '^STI': 'SG',
  '^KLSE': 'MY',
  '^SET': 'TH',
  '^JKSE': 'ID',
  // Middle East & Africa
  '^TASI': 'SA',
  '^QSI': 'QA',
  '^ADI': 'AE', '^DFMGI': 'AE',
  '^TA35': 'IL', '^TA125': 'IL',
  '^EGX30': 'EG',
  '^J203': 'ZA',
  '^NGS30': 'NG',
  // Oceania
  '^AXJO': 'AU', '^AORD': 'AU',
  '^NZ50': 'NZ',
  // European smaller
  '^PSI20': 'PT',
  '^ATX': 'AT',
  '^OMXH25': 'FI',
};

function normalizeSymbol(tvSymbol: string): string {
  const normalized = tvSymbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return TRADINGVIEW_TO_YAHOO[normalized] || tvSymbol;
}

function getCountryForSymbol(yahooSymbol: string, scraperCountry?: string): string {
  // First check our mapping
  if (SYMBOL_TO_COUNTRY[yahooSymbol]) {
    return SYMBOL_TO_COUNTRY[yahooSymbol];
  }
  // Use scraper-provided country if valid
  if (scraperCountry && scraperCountry !== 'UNKNOWN' && scraperCountry.length === 2) {
    return scraperCountry.toUpperCase();
  }
  return 'UNKNOWN';
}

function verifyApiKey(request: NextRequest): boolean {
  const expectedKey = process.env.MARKET_INGEST_API_KEY;
  if (!expectedKey) {
    // If no key configured, allow (development mode)
    console.warn('[Market Ingest] No MARKET_INGEST_API_KEY configured - allowing all requests');
    return true;
  }
  
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '') || request.headers.get('x-api-key');
  
  return apiKey === expectedKey;
}

async function ingestIndices(items: IndexQuote[], scraperName: string) {
  let inserted = 0;
  let failed = 0;
  const failedSymbols: string[] = [];
  const now = new Date();
  
  for (const item of items) {
    try {
      // Normalize symbol (convert TradingView format to Yahoo format)
      const symbol = normalizeSymbol(item.symbol);
      // Get country from our mapping (more reliable than scraper data)
      const country = getCountryForSymbol(symbol, item.country);
      const previousClose = item.change ? item.last - item.change : item.last;
      const changePercent = item.change_percent ?? 
        (previousClose !== 0 ? ((item.last - previousClose) / previousClose) * 100 : 0);
      
      await prisma.marketIndex.upsert({
        where: { symbol },
        update: {
          name: item.name,
          value: item.last,
          previousClose,
          change: item.change ?? 0,
          changePercent,
          high: item.high ?? item.last,
          low: item.low ?? item.last,
          open: item.open,
          volume: item.volume,
          currency: item.currency ?? 'USD',
          country, // Use mapped country
          exchange: item.exchange ?? 'UNKNOWN',
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
        },
        create: {
          symbol,
          name: item.name,
          value: item.last,
          previousClose,
          change: item.change ?? 0,
          changePercent,
          high: item.high ?? item.last,
          low: item.low ?? item.last,
          open: item.open,
          volume: item.volume,
          currency: item.currency ?? 'USD',
          timezone: 'UTC',
          country, // Use mapped country
          exchange: item.exchange ?? 'UNKNOWN',
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
          dataQuality: 100,
        },
      });
      
      inserted++;
    } catch (error) {
      failed++;
      failedSymbols.push(item.symbol);
      console.error(`[Market Ingest] Failed to insert index ${item.symbol}:`, error);
    }
  }
  
  return { inserted, failed, failedSymbols };
}

async function ingestCrypto(items: CryptoQuote[], scraperName: string) {
  let inserted = 0;
  let failed = 0;
  const failedSymbols: string[] = [];
  const now = new Date();
  
  for (const item of items) {
    try {
      const previousClose = item.change ? item.price - item.change : item.price;
      const changePercent = item.change_percent ?? 
        (previousClose !== 0 ? ((item.price - previousClose) / previousClose) * 100 : 0);
      
      // Find matching crypto config to get coinGeckoId
      const config = await prisma.cryptocurrencyConfig.findFirst({
        where: { 
          OR: [
            { symbol: item.symbol.toUpperCase() },
            { name: { contains: item.name, mode: 'insensitive' } }
          ]
        }
      });
      
      if (!config) {
        console.warn(`[Market Ingest] No crypto config found for ${item.symbol}`);
        failed++;
        failedSymbols.push(item.symbol);
        continue;
      }
      
      await prisma.cryptocurrency.upsert({
        where: { symbol: config.symbol },
        update: {
          name: item.name,
          value: item.price,
          previousClose,
          change: item.change ?? 0,
          changePercent,
          high24h: item.high_24h,
          low24h: item.low_24h,
          volume24h: item.volume_24h,
          marketCap: item.market_cap,
          rank: item.rank,
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
        },
        create: {
          symbol: config.symbol,
          name: item.name,
          coinGeckoId: config.coinGeckoId,
          value: item.price,
          previousClose,
          change: item.change ?? 0,
          changePercent,
          high24h: item.high_24h,
          low24h: item.low_24h,
          volume24h: item.volume_24h,
          marketCap: item.market_cap,
          rank: item.rank,
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
          dataQuality: 100,
        },
      });
      
      inserted++;
    } catch (error) {
      failed++;
      failedSymbols.push(item.symbol);
      console.error(`[Market Ingest] Failed to insert crypto ${item.symbol}:`, error);
    }
  }
  
  return { inserted, failed, failedSymbols };
}

async function ingestCurrencies(items: CurrencyQuote[], scraperName: string) {
  let inserted = 0;
  let failed = 0;
  const failedSymbols: string[] = [];
  const now = new Date();
  
  for (const item of items) {
    try {
      await prisma.currencyRate.upsert({
        where: { currency: item.currency.toUpperCase() },
        update: {
          currencyName: item.name,
          rateToUSD: item.rate_to_usd,
          rateFromUSD: item.rate_to_usd !== 0 ? 1 / item.rate_to_usd : null,
          symbol: item.symbol,
          country: item.country,
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
        },
        create: {
          currency: item.currency.toUpperCase(),
          currencyName: item.name,
          rateToUSD: item.rate_to_usd,
          rateFromUSD: item.rate_to_usd !== 0 ? 1 / item.rate_to_usd : null,
          symbol: item.symbol,
          country: item.country,
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
        },
      });
      
      inserted++;
    } catch (error) {
      failed++;
      failedSymbols.push(item.currency);
      console.error(`[Market Ingest] Failed to insert currency ${item.currency}:`, error);
    }
  }
  
  return { inserted, failed, failedSymbols };
}

async function ingestCommodities(items: CommodityQuote[], scraperName: string) {
  let inserted = 0;
  let failed = 0;
  const failedSymbols: string[] = [];
  const now = new Date();
  
  for (const item of items) {
    try {
      const previousClose = item.change ? item.price - item.change : item.price;
      const changePercent = item.change_percent ?? 
        (previousClose !== 0 ? ((item.price - previousClose) / previousClose) * 100 : 0);
      
      await prisma.commodity.upsert({
        where: { symbol: item.symbol.toUpperCase() },
        update: {
          name: item.name,
          value: item.price,
          previousClose,
          change: item.change,
          changePercent,
          high: item.high,
          low: item.low,
          category: item.category ?? 'general',
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
        },
        create: {
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          value: item.price,
          previousClose,
          change: item.change,
          changePercent,
          high: item.high,
          low: item.low,
          category: item.category ?? 'general',
          lastUpdated: now,
          lastSource: scraperName,
          isStale: false,
          dataQuality: 100,
        },
      });
      
      inserted++;
    } catch (error) {
      failed++;
      failedSymbols.push(item.symbol);
      console.error(`[Market Ingest] Failed to insert commodity ${item.symbol}:`, error);
    }
  }
  
  return { inserted, failed, failedSymbols };
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as IngestPayload;
    const { scraperName, dataType, items, generatedAt } = body;
    
    if (!scraperName || !dataType || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields: scraperName, dataType, items' },
        { status: 400 }
      );
    }
    
    if (!['indices', 'crypto', 'currencies', 'commodities'].includes(dataType)) {
      return NextResponse.json(
        { error: 'Invalid dataType. Must be: indices, crypto, currencies, or commodities' },
        { status: 400 }
      );
    }
    
    console.log(`[Market Ingest] Received ${items.length} ${dataType} items from ${scraperName}`);
    
    // Create scraper run record
    const scraperRun = await prisma.scraperRun.create({
      data: {
        scraperName,
        dataType,
        status: 'running',
        itemsFound: items.length,
        metadata: { generatedAt: generatedAt || new Date().toISOString() },
      },
    });
    
    let result: { inserted: number; failed: number; failedSymbols: string[] };
    
    // Route to appropriate ingest function
    switch (dataType) {
      case 'indices':
        result = await ingestIndices(items as IndexQuote[], scraperName);
        break;
      case 'crypto':
        result = await ingestCrypto(items as CryptoQuote[], scraperName);
        break;
      case 'currencies':
        result = await ingestCurrencies(items as CurrencyQuote[], scraperName);
        break;
      case 'commodities':
        result = await ingestCommodities(items as CommodityQuote[], scraperName);
        break;
      default:
        throw new Error(`Unknown dataType: ${dataType}`);
    }
    
    // Update scraper run record
    await prisma.scraperRun.update({
      where: { id: scraperRun.id },
      data: {
        status: result.failed === 0 ? 'success' : result.inserted > 0 ? 'partial' : 'failed',
        completedAt: new Date(),
        itemsInserted: result.inserted,
        itemsFailed: result.failed,
        errorMessage: result.failedSymbols.length > 0 
          ? `Failed symbols: ${result.failedSymbols.join(', ')}` 
          : null,
      },
    });
    
    console.log(`[Market Ingest] Completed: ${result.inserted} inserted, ${result.failed} failed`);
    
    return NextResponse.json({
      success: true,
      scraperName,
      dataType,
      runId: scraperRun.id,
      stats: {
        received: items.length,
        inserted: result.inserted,
        failed: result.failed,
        failedSymbols: result.failedSymbols,
      },
    });
    
  } catch (error) {
    console.error('[Market Ingest] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check recent scraper runs
export async function GET() {
  try {
    const recentRuns = await prisma.scraperRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
    
    const stats = {
      totalRuns: await prisma.scraperRun.count(),
      successfulRuns: await prisma.scraperRun.count({ where: { status: 'success' } }),
      failedRuns: await prisma.scraperRun.count({ where: { status: 'failed' } }),
      lastRun: recentRuns[0] || null,
    };
    
    return NextResponse.json({
      success: true,
      stats,
      recentRuns,
      endpoint: {
        url: '/api/market/ingest',
        method: 'POST',
        authentication: 'Bearer token in Authorization header or x-api-key header',
        body: {
          scraperName: 'string (required)',
          dataType: 'indices | crypto | currencies | commodities (required)',
          items: 'array of data items (required)',
          generatedAt: 'ISO timestamp (optional)',
        },
      },
    });
  } catch (error) {
    console.error('[Market Ingest] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scraper stats' },
      { status: 500 }
    );
  }
}
