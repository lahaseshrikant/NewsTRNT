/**
 * Market Data Health Check & Diagnostics API
 * 
 * GET /api/market/health
 * Returns comprehensive health status of market data:
 * - Data counts (indices, crypto, currencies, commodities)
 * - Data freshness (staleness detection)
 * - Scraper run history
 * - Configuration status
 */

import { NextResponse } from 'next/server';
import prisma from '@backend/config/database';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
}

interface DataHealth {
  count: number;
  configCount: number;
  staleCount: number;
  oldestUpdate: Date | null;
  newestUpdate: Date | null;
  avgAgeMinutes: number;
  health: HealthStatus;
}

async function checkMarketIndicesHealth(): Promise<DataHealth> {
  const now = new Date();
  const STALE_THRESHOLD_MINUTES = 60; // Consider data stale after 60 minutes
  
  const [count, configCount, staleCount, oldest, newest] = await Promise.all([
    prisma.marketIndex.count(),
    prisma.marketIndexConfig.count({ where: { isActive: true } }),
    prisma.marketIndex.count({ where: { isStale: true } }),
    prisma.marketIndex.findFirst({ orderBy: { lastUpdated: 'asc' }, select: { lastUpdated: true } }),
    prisma.marketIndex.findFirst({ orderBy: { lastUpdated: 'desc' }, select: { lastUpdated: true } }),
  ]);
  
  const avgAgeMinutes = newest?.lastUpdated 
    ? (now.getTime() - newest.lastUpdated.getTime()) / 60000 
    : 0;
  
  let health: HealthStatus;
  if (count === 0) {
    health = { status: 'critical', message: 'No market index data available' };
  } else if (count < configCount * 0.5) {
    health = { status: 'degraded', message: `Only ${count}/${configCount} indices have data` };
  } else if (avgAgeMinutes > STALE_THRESHOLD_MINUTES) {
    health = { status: 'degraded', message: `Data is ${Math.round(avgAgeMinutes)} minutes old` };
  } else if (staleCount > 0) {
    health = { status: 'degraded', message: `${staleCount} indices marked as stale` };
  } else {
    health = { status: 'healthy', message: 'All indices data fresh' };
  }
  
  return {
    count,
    configCount,
    staleCount,
    oldestUpdate: oldest?.lastUpdated || null,
    newestUpdate: newest?.lastUpdated || null,
    avgAgeMinutes: Math.round(avgAgeMinutes),
    health,
  };
}

async function checkCryptoHealth(): Promise<DataHealth> {
  const now = new Date();
  const STALE_THRESHOLD_MINUTES = 10; // Crypto should be fresher
  
  const [count, configCount, staleCount, oldest, newest] = await Promise.all([
    prisma.cryptocurrency.count(),
    prisma.cryptocurrencyConfig.count({ where: { isActive: true } }),
    prisma.cryptocurrency.count({ where: { isStale: true } }),
    prisma.cryptocurrency.findFirst({ orderBy: { lastUpdated: 'asc' }, select: { lastUpdated: true } }),
    prisma.cryptocurrency.findFirst({ orderBy: { lastUpdated: 'desc' }, select: { lastUpdated: true } }),
  ]);
  
  const avgAgeMinutes = newest?.lastUpdated 
    ? (now.getTime() - newest.lastUpdated.getTime()) / 60000 
    : 0;
  
  let health: HealthStatus;
  if (count === 0) {
    health = { status: 'critical', message: 'No cryptocurrency data available' };
  } else if (count < configCount * 0.5) {
    health = { status: 'degraded', message: `Only ${count}/${configCount} cryptos have data` };
  } else if (avgAgeMinutes > STALE_THRESHOLD_MINUTES) {
    health = { status: 'degraded', message: `Data is ${Math.round(avgAgeMinutes)} minutes old` };
  } else {
    health = { status: 'healthy', message: 'All crypto data fresh' };
  }
  
  return {
    count,
    configCount,
    staleCount,
    oldestUpdate: oldest?.lastUpdated || null,
    newestUpdate: newest?.lastUpdated || null,
    avgAgeMinutes: Math.round(avgAgeMinutes),
    health,
  };
}

async function checkCurrencyHealth(): Promise<DataHealth> {
  const now = new Date();
  const STALE_THRESHOLD_MINUTES = 60;
  
  const [count, staleCount, oldest, newest] = await Promise.all([
    prisma.currencyRate.count(),
    prisma.currencyRate.count({ where: { isStale: true } }),
    prisma.currencyRate.findFirst({ orderBy: { lastUpdated: 'asc' }, select: { lastUpdated: true } }),
    prisma.currencyRate.findFirst({ orderBy: { lastUpdated: 'desc' }, select: { lastUpdated: true } }),
  ]);
  
  const avgAgeMinutes = newest?.lastUpdated 
    ? (now.getTime() - newest.lastUpdated.getTime()) / 60000 
    : 0;
  
  let health: HealthStatus;
  if (count === 0) {
    health = { status: 'critical', message: 'No currency data available' };
  } else if (avgAgeMinutes > STALE_THRESHOLD_MINUTES) {
    health = { status: 'degraded', message: `Data is ${Math.round(avgAgeMinutes)} minutes old` };
  } else {
    health = { status: 'healthy', message: 'All currency data fresh' };
  }
  
  return {
    count,
    configCount: 65, // Approximate number of currencies we track
    staleCount,
    oldestUpdate: oldest?.lastUpdated || null,
    newestUpdate: newest?.lastUpdated || null,
    avgAgeMinutes: Math.round(avgAgeMinutes),
    health,
  };
}

async function checkCommodityHealth(): Promise<DataHealth> {
  const now = new Date();
  const STALE_THRESHOLD_MINUTES = 60;
  
  const [count, configCount, staleCount, oldest, newest] = await Promise.all([
    prisma.commodity.count(),
    prisma.commodityConfig.count({ where: { isActive: true } }),
    prisma.commodity.count({ where: { isStale: true } }),
    prisma.commodity.findFirst({ orderBy: { lastUpdated: 'asc' }, select: { lastUpdated: true } }),
    prisma.commodity.findFirst({ orderBy: { lastUpdated: 'desc' }, select: { lastUpdated: true } }),
  ]);
  
  const avgAgeMinutes = newest?.lastUpdated 
    ? (now.getTime() - newest.lastUpdated.getTime()) / 60000 
    : 0;
  
  let health: HealthStatus;
  if (count === 0) {
    health = { status: 'critical', message: 'No commodity data available' };
  } else if (count < configCount * 0.5) {
    health = { status: 'degraded', message: `Only ${count}/${configCount} commodities have data` };
  } else if (avgAgeMinutes > STALE_THRESHOLD_MINUTES) {
    health = { status: 'degraded', message: `Data is ${Math.round(avgAgeMinutes)} minutes old` };
  } else {
    health = { status: 'healthy', message: 'All commodity data fresh' };
  }
  
  return {
    count,
    configCount,
    staleCount,
    oldestUpdate: oldest?.lastUpdated || null,
    newestUpdate: newest?.lastUpdated || null,
    avgAgeMinutes: Math.round(avgAgeMinutes),
    health,
  };
}

async function getRecentScraperRuns() {
  return prisma.scraperRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      scraperName: true,
      dataType: true,
      status: true,
      startedAt: true,
      completedAt: true,
      itemsFound: true,
      itemsInserted: true,
      itemsFailed: true,
      errorMessage: true,
    },
  });
}

export async function GET() {
  try {
    const [indices, crypto, currencies, commodities, recentRuns] = await Promise.all([
      checkMarketIndicesHealth(),
      checkCryptoHealth(),
      checkCurrencyHealth(),
      checkCommodityHealth(),
      getRecentScraperRuns(),
    ]);
    
    // Determine overall status
    const statuses = [indices.health.status, crypto.health.status, currencies.health.status, commodities.health.status];
    const criticalCount = statuses.filter(s => s === 'critical').length;
    const degradedCount = statuses.filter(s => s === 'degraded').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    let overallMessage: string;
    
    if (criticalCount >= 2) {
      overallStatus = 'critical';
      overallMessage = 'Multiple data sources are unavailable';
    } else if (criticalCount > 0 || degradedCount >= 2) {
      overallStatus = 'degraded';
      overallMessage = 'Some data sources need attention';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
      overallMessage = 'Minor issues detected';
    } else {
      overallStatus = 'healthy';
      overallMessage = 'All systems operational';
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overall: {
        status: overallStatus,
        message: overallMessage,
      },
      data: {
        marketIndices: indices,
        cryptocurrencies: crypto,
        currencies: currencies,
        commodities: commodities,
      },
      scraperRuns: recentRuns,
      endpoints: {
        health: '/api/market/health',
        ingest: '/api/market/ingest',
        update: '/api/market/update',
        country: '/api/market/country',
        crypto: '/api/market/crypto',
        currencies: '/api/market/currencies',
        commodities: '/api/market/commodities',
      },
    });
  } catch (error) {
    console.error('[Market Health] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'critical',
        error: 'Failed to check market data health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
