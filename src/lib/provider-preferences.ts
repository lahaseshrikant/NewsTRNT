import prisma from '@backend/config/database';
import type { Prisma } from '@prisma/client';

export type ProviderCategory = 'indices' | 'cryptocurrencies' | 'currencies' | 'commodities';
export type FallbackStrategy = 'sequential';

interface ProviderPreferencePayload {
  category: ProviderCategory;
  providerOrder: string[];
  fallbackStrategy?: FallbackStrategy;
  metadata?: Prisma.InputJsonValue;
}

const DEFAULT_PROVIDER_ORDER: Record<ProviderCategory, string[]> = {
  indices: ['marketstack', 'twelvedata', 'alphavantage', 'fmp', 'finnhub', 'tradingview'],
  cryptocurrencies: ['coingecko'],
  currencies: ['exchange-rate'],
  commodities: ['alphavantage', 'fmp', 'twelvedata'],
};

const VALID_PROVIDERS: Record<ProviderCategory, string[]> = {
  indices: ['marketstack', 'twelvedata', 'alphavantage', 'fmp', 'finnhub', 'tradingview'],
  cryptocurrencies: ['coingecko'],
  currencies: ['exchange-rate'],
  commodities: ['alphavantage', 'fmp', 'twelvedata'],
};

export function getValidProviders(category: ProviderCategory): string[] {
  return VALID_PROVIDERS[category];
}

export async function getProviderPreference(category: ProviderCategory) {
  const record = await prisma.marketProviderPreference.findUnique({
    where: { category },
  });

  if (!record) {
    return {
      category,
      providerOrder: DEFAULT_PROVIDER_ORDER[category],
      fallbackStrategy: 'sequential' as FallbackStrategy,
      metadata: {},
    };
  }

  return {
    category,
    providerOrder: record.providerOrder.length > 0 ? record.providerOrder : DEFAULT_PROVIDER_ORDER[category],
    fallbackStrategy: (record.fallbackStrategy as FallbackStrategy) || 'sequential',
    metadata: (record.metadata as Record<string, unknown>) || {},
    updatedAt: record.updatedAt,
  };
}

export async function getAllProviderPreferences() {
  const categories: ProviderCategory[] = ['indices', 'cryptocurrencies', 'currencies', 'commodities'];

  const entries = await Promise.all(categories.map((category) => getProviderPreference(category)));

  return entries.reduce<Record<ProviderCategory, Awaited<ReturnType<typeof getProviderPreference>>>>((acc, entry) => {
    acc[entry.category as ProviderCategory] = entry as Awaited<ReturnType<typeof getProviderPreference>>;
    return acc;
  }, {} as Record<ProviderCategory, Awaited<ReturnType<typeof getProviderPreference>>>);
}

function sanitizeOrder(category: ProviderCategory, inputOrder: string[]): string[] {
  const valid = VALID_PROVIDERS[category];
  const seen = new Set<string>();

  const normalized = inputOrder
    .map((id) => id?.toLowerCase().trim())
    .filter((id): id is string => Boolean(id) && valid.includes(id as string))
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  for (const provider of valid) {
    if (!seen.has(provider)) {
      normalized.push(provider);
    }
  }

  return normalized;
}

export async function updateProviderPreference(payload: ProviderPreferencePayload) {
  const fallbackStrategy: FallbackStrategy = payload.fallbackStrategy ?? 'sequential';
  const providerOrder = sanitizeOrder(payload.category, payload.providerOrder);
  const metadata: Prisma.InputJsonValue = payload.metadata ?? {};

  const record = await prisma.marketProviderPreference.upsert({
    where: { category: payload.category },
    update: {
      providerOrder,
      fallbackStrategy,
      metadata,
    },
    create: {
      category: payload.category,
      providerOrder,
      fallbackStrategy,
      metadata,
    },
  });

  return {
    category: record.category as ProviderCategory,
    providerOrder: record.providerOrder,
    fallbackStrategy: record.fallbackStrategy as FallbackStrategy,
    metadata: (record.metadata as Record<string, unknown>) || {},
    updatedAt: record.updatedAt,
  };
}

export function getDefaultProviderOrder(category: ProviderCategory) {
  return DEFAULT_PROVIDER_ORDER[category];
}
