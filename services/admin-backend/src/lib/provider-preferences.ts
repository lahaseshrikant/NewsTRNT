// Provider preferences management - simplified version without database dependency
// Preferences are stored in-memory with default values
// For persistent storage, configure via environment variables or call backend API

export type ProviderCategory = 'indices' | 'cryptocurrencies' | 'currencies' | 'commodities';
export type FallbackStrategy = 'sequential';

interface ProviderPreference {
  category: ProviderCategory;
  providerOrder: string[];
  fallbackStrategy: FallbackStrategy;
  metadata: Record<string, unknown>;
  updatedAt?: Date;
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

// In-memory storage for preferences (resets on server restart)
const preferencesCache: Map<ProviderCategory, ProviderPreference> = new Map();

export function getValidProviders(category: ProviderCategory): string[] {
  return VALID_PROVIDERS[category];
}

export async function getProviderPreference(category: ProviderCategory): Promise<ProviderPreference> {
  // Check cache first
  const cached = preferencesCache.get(category);
  if (cached) {
    return cached;
  }

  // Return default preference
  return {
    category,
    providerOrder: DEFAULT_PROVIDER_ORDER[category],
    fallbackStrategy: 'sequential',
    metadata: {},
  };
}

export async function getAllProviderPreferences(): Promise<Record<ProviderCategory, ProviderPreference>> {
  const categories: ProviderCategory[] = ['indices', 'cryptocurrencies', 'currencies', 'commodities'];

  const entries = await Promise.all(categories.map((cat) => getProviderPreference(cat)));

  return entries.reduce<Record<ProviderCategory, ProviderPreference>>((acc, entry) => {
    acc[entry.category] = entry;
    return acc;
  }, {} as Record<ProviderCategory, ProviderPreference>);
}

function sanitizeOrder(category: ProviderCategory, inputOrder: string[]): string[] {
  const valid = VALID_PROVIDERS[category];
  const seen = new Set<string>();

  const normalized = inputOrder
    .map((id) => id?.toLowerCase().trim())
    .filter((id): id is string => Boolean(id) && valid.includes(id))
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  // Add any missing providers at the end
  for (const provider of valid) {
    if (!seen.has(provider)) {
      normalized.push(provider);
    }
  }

  return normalized;
}

interface UpdatePayload {
  category: ProviderCategory;
  providerOrder: string[];
  fallbackStrategy?: FallbackStrategy;
  metadata?: Record<string, unknown>;
}

export async function updateProviderPreference(payload: UpdatePayload): Promise<ProviderPreference> {
  const fallbackStrategy: FallbackStrategy = payload.fallbackStrategy ?? 'sequential';
  const providerOrder = sanitizeOrder(payload.category, payload.providerOrder);
  const metadata = payload.metadata ?? {};

  const preference: ProviderPreference = {
    category: payload.category,
    providerOrder,
    fallbackStrategy,
    metadata,
    updatedAt: new Date(),
  };

  // Store in cache
  preferencesCache.set(payload.category, preference);

  return preference;
}

export function getDefaultProviderOrder(category: ProviderCategory): string[] {
  return DEFAULT_PROVIDER_ORDER[category];
}
