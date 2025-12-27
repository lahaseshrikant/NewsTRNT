// Market Data Auto-Update Service
// Continuously updates market data in background
// Runs updates based on data type (crypto: 2min, indices: 5min, currencies: 15min)
// Now fetches active symbols from database configuration

import { 
  updateStockIndices, 
  updateCryptocurrencies, 
  updateCurrencyRates,
  updateCommodities
} from './market-cache';
import { getActiveSymbols } from './market-config';
import { refreshTradingViewFallback } from './tradingview-runner';

// Update intervals in milliseconds (can be changed dynamically)
let UPDATE_INTERVALS = {
  crypto: 2 * 60 * 1000,       // 2 minutes - highly volatile
  indices: 5 * 60 * 1000,      // 5 minutes - market hours
  currencies: 15 * 60 * 1000,  // 15 minutes - more stable
  commodities: 30 * 60 * 1000, // 30 minutes - commodities
  scraper: 60 * 60 * 1000,     // 60 minutes - TradingView fallback refresh
};

let isRunning = false;
let intervals: NodeJS.Timeout[] = [];

/**
 * Start auto-update service
 */
export function startMarketDataUpdates() {
  if (isRunning) {
    console.log('[Auto-Update] Service already running');
    return;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Market Data Auto-Update Service Starting...');
  console.log('='.repeat(60));
  console.log('📊 Cryptocurrencies: Every 2 minutes');
  console.log('📈 Stock Indices: Every 5 minutes');
  console.log('💱 Currency Rates: Every 15 minutes');
  console.log('🛢️  Commodities: Every 30 minutes');
  console.log('='.repeat(60));
  console.log('');

  isRunning = true;

  // Initial update - run all immediately on startup
  console.log('[Auto-Update] Running initial data fetch...');
  console.log('[Auto-Update] Loading active symbols from database configuration...');
  
  // Fetch active symbols from database config
  getActiveSymbols().then(activeSymbols => {
    console.log(`[Auto-Update] Active symbols: ${activeSymbols.indices.length} indices, ${activeSymbols.cryptos.length} cryptos, ${activeSymbols.commodities.length} commodities`);
  }).catch(err => console.error('[Auto-Update] Failed to load active symbols:', err));
  
  Promise.all([
    updateCryptocurrencies().catch(err => console.error('[Auto-Update] Crypto init failed:', err)),
    updateCurrencyRates().catch(err => console.error('[Auto-Update] Currency init failed:', err)),
    refreshTradingViewFallback().catch(err => console.error('[Auto-Update] TradingView init failed:', err)),
    // Note: Stock indices and commodities update takes time due to rate limiting, skip on startup
  ]).then(() => {
    console.log('[Auto-Update] ✅ Initial data fetch complete\n');
  });

  // Crypto updates - Every 2 minutes
  const cryptoInterval = setInterval(async () => {
    console.log('[Auto-Update] 🪙 Starting crypto update...');
    try {
      const result = await updateCryptocurrencies();
      console.log(`[Auto-Update] ✅ Crypto updated: ${result.successCount} coins\n`);
    } catch (error) {
      console.error('[Auto-Update] ❌ Crypto update failed:', error, '\n');
    }
  }, UPDATE_INTERVALS.crypto);

  // Stock indices updates - Every 5 minutes
  const indicesInterval = setInterval(async () => {
    console.log('[Auto-Update] 📈 Starting stock indices update...');
    try {
      const result = await updateStockIndices();
      console.log(`[Auto-Update] ✅ Indices updated: ${result.successCount} indices\n`);
    } catch (error) {
      console.error('[Auto-Update] ❌ Indices update failed:', error, '\n');
    }
  }, UPDATE_INTERVALS.indices);

  // Currency updates - Every 15 minutes
  const currencyInterval = setInterval(async () => {
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
    console.log('[Auto-Update] 🛢️  Starting commodities update...');
    try {
      const result = await updateCommodities();
      console.log(`[Auto-Update] ✅ Commodities updated: ${result.successCount} items\n`);
    } catch (error) {
      console.error('[Auto-Update] ❌ Commodities update failed:', error, '\n');
    }
  }, UPDATE_INTERVALS.commodities);

  intervals.push(cryptoInterval, indicesInterval, currencyInterval, commoditiesInterval);

  // TradingView scraper refresh - default hourly
  const tradingViewInterval = setInterval(async () => {
    console.log('[Auto-Update] 🧹 Refreshing TradingView fallback snapshot...');
    try {
      const result = await refreshTradingViewFallback();
      console.log(
        `[Auto-Update] ✅ TradingView fallback refreshed: ${result.successCount} indices updated (missed ${result.missCount})`,
      );
    } catch (error) {
      console.error('[Auto-Update] ❌ TradingView fallback refresh failed:', error);
    }
  }, UPDATE_INTERVALS.scraper);

  intervals.push(tradingViewInterval);

  // Log status every 30 minutes
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
export function updateIntervals(newIntervals: {
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
  
  return UPDATE_INTERVALS;
}

export async function runTradingViewScrapeNow() {
  console.log('[Auto-Update] Manual TradingView scrape triggered');
  return refreshTradingViewFallback();
}

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
