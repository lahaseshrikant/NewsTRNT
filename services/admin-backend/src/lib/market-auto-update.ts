// Market Data Auto-Update Service
// Continuously updates market data in background
// Runs updates based on data type (crypto: 2min, indices: 5min, currencies: 15min)
// Now fetches active symbols from database configuration

import prisma from '../config/database';
import { 
  updateStockIndices, 
  updateCryptocurrencies, 
  updateCurrencyRates,
  updateCommodities
} from './market-cache';
import { getActiveSymbols } from './market-config';
// scraper-runner removed; external scraping service will post to /api/market/ingest


// Update intervals in milliseconds (can be changed dynamically)
let UPDATE_INTERVALS = {
  crypto: 2 * 60 * 1000,       // 2 minutes - highly volatile
  indices: 5 * 60 * 1000,      // 5 minutes - market hours
  currencies: 15 * 60 * 1000,  // 15 minutes - more stable
  commodities: 30 * 60 * 1000, // 30 minutes - commodities
  scraper: 60 * 60 * 1000,     // 60 minutes - TradingView fallback refresh (unused)
};

// read persisted intervals from settings and apply
async function loadIntervalsFromDb() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'market_update_intervals' },
    });
    if (setting && setting.value) {
      const val = setting.value as any;
      // expect minutes
      if (typeof val.crypto === 'number') UPDATE_INTERVALS.crypto = val.crypto * 60 * 1000;
      if (typeof val.indices === 'number') UPDATE_INTERVALS.indices = val.indices * 60 * 1000;
      if (typeof val.currencies === 'number') UPDATE_INTERVALS.currencies = val.currencies * 60 * 1000;
      if (typeof val.commodities === 'number') UPDATE_INTERVALS.commodities = val.commodities * 60 * 1000;
      // scraper interval not exposed
      console.log('[Auto-Update] Loaded intervals from DB', val);
    }
  } catch (err) {
    console.error('[Auto-Update] Failed to load intervals from DB', err);
  }
}

let isRunning = false;
let intervals: NodeJS.Timeout[] = [];

// track whether we've already warned about maintenance so we don't spam the log
let maintenanceMessageShown = false;

/**
 * Start auto-update service
 */
async function isAutoUpdateEnabled(): Promise<boolean> {
  try {
    // use the global maintenance setting; when maintenance is active we
    // disable *all* background jobs including market updates
    // check for a global maintenance flag first
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'site_maintenance' },
    });
    if (!setting) {
      // no maintenance entry means regular operation
      // also look for and warn about the legacy market_auto_update key
      const legacy = await prisma.systemSetting.findUnique({
        where: { key: 'market_auto_update' },
      });
      if (legacy) {
        console.warn('[Auto-Update] legacy market_auto_update setting exists; ignoring');
      }
      maintenanceMessageShown = false;
      return true;
    }
    // the setting may be stored as a plain boolean or an object with
    // { enabled: boolean }
    const raw = setting.value;
    let active = false;
    if (typeof raw === 'boolean') {
      active = raw;
    } else if (raw && typeof (raw as any).enabled === 'boolean') {
      active = (raw as any).enabled;
    }
    if (active) {
      if (!maintenanceMessageShown) {
        console.log('[Auto-Update] disabled due to site maintenance mode');
        maintenanceMessageShown = true;
      }
      return false;
    }
    maintenanceMessageShown = false;
    return true;
  } catch (err) {
    console.error('[Auto-Update] failed to read maintenance flag:', err);
    // on error we keep running rather than silently disabling
    return true;
  }
}

export async function startMarketDataUpdates() {
  if (isRunning) {
    console.log('[Auto-Update] Service already running');
    return;
  }

  // clear out any previous console history so only new log lines remain
  console.clear();

  // load persisted intervals before doing anything else
  await loadIntervalsFromDb();

  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Market Data Auto-Update Service Starting...');
  console.log('='.repeat(60));
  console.log('📊 Cryptocurrencies: Every 2 minutes');
  console.log('� Currency Rates: Every 15 minutes');
  console.log('🛢️  Commodities: Every 30 minutes');
  console.log('📈 Stock Indices: Every 5 minutes');
  console.log('='.repeat(60));
  console.log('');

  isRunning = true;

  // load persisted intervals before scheduling
  await loadIntervalsFromDb();

  // Initial update - run all immediately on startup (if enabled)
  (async () => {
    if (await isAutoUpdateEnabled()) {
      console.log('[Auto-Update] Running initial data fetch...');
      console.log('[Auto-Update] Loading active symbols from database configuration...');
      
      // Fetch active symbols from database config
      try {
        const activeSymbols = await getActiveSymbols();
        console.log(`[Auto-Update] Active symbols: ${activeSymbols.indices.length} indices, ${activeSymbols.cryptos.length} cryptos, ${activeSymbols.commodities.length} commodities`);
      } catch (err) {
        console.error('[Auto-Update] Failed to load active symbols:', err);
      }
      
      const ops: Promise<any>[] = [
        updateCryptocurrencies().catch(err => console.error('[Auto-Update] Crypto init failed:', err)),
        updateCurrencyRates().catch(err => console.error('[Auto-Update] Currency init failed:', err)),
        updateCommodities().catch(err => console.error('[Auto-Update] Commodities init failed:', err)),
        // Note: Stock indices update takes time due to rate limiting, skip on startup
      ];

      // we no longer run an internal scraper; external scraper service will
      // post data to the ingest endpoint. just note for clarity.
      console.log('[Auto-Update] using external scraper service (if configured)');

      await Promise.all(ops);
      console.log('[Auto-Update] ✅ Initial data fetch complete\n');
    } else {
      console.log('[Auto-Update] initial fetch skipped because auto-update disabled');
    }
  })();

  // Crypto updates - Every 2 minutes
  const cryptoInterval = setInterval(async () => {
    if (!(await isAutoUpdateEnabled())) {
      console.log('[Auto-Update] 🪙 Crypto update skipped (disabled)');
      return;
    }
    console.log('[Auto-Update] 🪙 Starting crypto update...');
    try {
      const result = await updateCryptocurrencies();
      console.log(`[Auto-Update] ✅ Crypto updated: ${result.successCount} coins\n`);
    } catch (error) {
      console.error('[Auto-Update] ❌ Crypto update failed:', error, '\n');
    }
  }, UPDATE_INTERVALS.crypto);

      // Currency updates - Every 15 minutes
      const currencyInterval = setInterval(async () => {
        if (!(await isAutoUpdateEnabled())) {
          console.log('[Auto-Update] 💱 Currency update skipped (disabled)');
          return;
        }
        console.log('[Auto-Update] 💱 Starting currency rates update...');
        try {
          const result = await updateCurrencyRates();
          console.log(`[Auto-Update] ✅ Currencies updated: ${result.successCount} rates\n`);
        } catch (error) {
          console.error('[Auto-Update] ❌ Currency update failed:', error, '\n');
        }
      }, UPDATE_INTERVALS.currencies);

      // Commodities updates - Every 30 minutes
      const commoditiesInterval = setInterval(async () => {
        if (!(await isAutoUpdateEnabled())) {
          console.log('[Auto-Update] 🛢️  Commodities update skipped (disabled)');
          return;
        }
        console.log('[Auto-Update] 🛢️  Starting commodities update...');
        try {
          const result = await updateCommodities();
          console.log(`[Auto-Update] ✅ Commodities updated: ${result.successCount} items\n`);
        } catch (error) {
          console.error('[Auto-Update] ❌ Commodities update failed:', error, '\n');
        }
      }, UPDATE_INTERVALS.commodities);

      // Stock indices updates - Every 5 minutes
      const indicesInterval = setInterval(async () => {
        if (!(await isAutoUpdateEnabled())) {
          console.log('[Auto-Update] 📈 Stock indices update skipped (disabled)');
          return;
        }
        console.log('[Auto-Update] 📈 Starting stock indices update...');
        try {
          const result = await updateStockIndices();
          console.log(`[Auto-Update] ✅ Indices updated: ${result.successCount} indices\n`);
        } catch (error) {
          console.error('[Auto-Update] ❌ Indices update failed:', error, '\n');
        }
      }, UPDATE_INTERVALS.indices);

      intervals.push(cryptoInterval, currencyInterval, commoditiesInterval, indicesInterval);

  // Log overall service status periodically (every 30 minutes)
  const statusInterval = setInterval(() => {
    const now = new Date();
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Market Data Service Status - ${now.toLocaleString()}`);
    console.log('✅ Service running normally');
    console.log('='.repeat(60) + '\n');
  }, 30 * 60 * 1000);

  intervals.push(statusInterval);

  console.log('[Auto-Update] ✅ Service started successfully\n');
}

/**
 * Stop auto-update service
 */
export function stopMarketDataUpdates() {
  if (!isRunning) {
    console.log('[Auto-Update] Service not running');
    return;
  }

  console.log('[Auto-Update] Stopping service...');
  
  intervals.forEach(interval => clearInterval(interval));
  intervals = [];
  isRunning = false;

  console.log('[Auto-Update] ✅ Service stopped\n');
}

/**
 * Get service status
 */
export function getServiceStatus() {
  return {
    isRunning,
    intervals: {
      crypto: `${UPDATE_INTERVALS.crypto / 1000}s`,
      indices: `${UPDATE_INTERVALS.indices / 1000}s`,
      currencies: `${UPDATE_INTERVALS.currencies / 1000}s`,
      commodities: `${UPDATE_INTERVALS.commodities / 1000}s`,
      scraper: `${UPDATE_INTERVALS.scraper / 1000}s`,
    },
    intervalsMinutes: {
      crypto: UPDATE_INTERVALS.crypto / 60000,
      indices: UPDATE_INTERVALS.indices / 60000,
      currencies: UPDATE_INTERVALS.currencies / 60000,
      commodities: UPDATE_INTERVALS.commodities / 60000,
      scraper: UPDATE_INTERVALS.scraper / 60000,
    },
  };
}

/**
 * Update service intervals (requires restart to take effect)
 */
export async function updateIntervals(newIntervals: {
  crypto?: number;
  indices?: number;
  currencies?: number;
  commodities?: number;
  scraper?: number;
}) {
  if (newIntervals.crypto !== undefined) {
    UPDATE_INTERVALS.crypto = newIntervals.crypto * 60 * 1000; // Convert minutes to ms
  }
  if (newIntervals.indices !== undefined) {
    UPDATE_INTERVALS.indices = newIntervals.indices * 60 * 1000;
  }
  if (newIntervals.currencies !== undefined) {
    UPDATE_INTERVALS.currencies = newIntervals.currencies * 60 * 1000;
  }
  if (newIntervals.commodities !== undefined) {
    UPDATE_INTERVALS.commodities = newIntervals.commodities * 60 * 1000;
  }
  if (newIntervals.scraper !== undefined) {
    UPDATE_INTERVALS.scraper = newIntervals.scraper * 60 * 1000;
  }
  
  console.log('[Auto-Update] Intervals updated:', {
    crypto: `${UPDATE_INTERVALS.crypto / 60000} min`,
    indices: `${UPDATE_INTERVALS.indices / 60000} min`,
    currencies: `${UPDATE_INTERVALS.currencies / 60000} min`,
    commodities: `${UPDATE_INTERVALS.commodities / 60000} min`,
    scraper: `${UPDATE_INTERVALS.scraper / 60000} min`,
  });
  
  // persist to DB so future restarts keep same values
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'market_update_intervals' },
      update: { value: {
        crypto: UPDATE_INTERVALS.crypto / 60000,
        indices: UPDATE_INTERVALS.indices / 60000,
        currencies: UPDATE_INTERVALS.currencies / 60000,
        commodities: UPDATE_INTERVALS.commodities / 60000,
      }} as any,
      create: { key: 'market_update_intervals',
                value: {
                  crypto: UPDATE_INTERVALS.crypto / 60000,
                  indices: UPDATE_INTERVALS.indices / 60000,
                  currencies: UPDATE_INTERVALS.currencies / 60000,
                  commodities: UPDATE_INTERVALS.commodities / 60000,
                },
                category: 'market',
                description: 'Refresh intervals (minutes) for market auto-update',
      } as any,
    });
    console.log('[Auto-Update] intervals saved to DB');
  } catch (err) {
    console.error('[Auto-Update] failed to persist intervals:', err);
  }
  
  return UPDATE_INTERVALS;
}

// exported helper removed; scraping is handled by the external service

// Auto-start in production/development
if (process.env.NODE_ENV !== 'test') {
  // Start after a small delay to let server initialize
  setTimeout(() => {
    startMarketDataUpdates();
  }, 5000); // 5 second delay
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Auto-Update] Received SIGINT, shutting down gracefully...');
  stopMarketDataUpdates();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Auto-Update] Received SIGTERM, shutting down gracefully...');
  stopMarketDataUpdates();
  process.exit(0);
});
