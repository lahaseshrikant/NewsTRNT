/**
 * TradingView Scraper Runner
 * 
 * Runs the Python TradingView scraper and optionally ingests the data.
 * 
 * Modes:
 * 1. Direct API mode (recommended): Scraper POSTs directly to /api/market/ingest
 * 2. Legacy JSON mode: Scraper writes JSON, then we ingest via tradingview-fallback
 */

// This module used to spawn an internal Python scraper. That logic has
// been moved out to a separate scraper service.  The functions below now
// simply notify that service via HTTP.


interface ScraperOptions {
  limit?: number;
  type?: string;
}

async function callScraperService(options: ScraperOptions = {}) {
  const url = process.env.SCRAPER_SERVICE_URL;
  if (!url) {
    throw new Error('SCRAPER_SERVICE_URL not configured');
  }
  const body = JSON.stringify(options);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`scraper service returned ${resp.status}: ${text}`);
  }
  return resp.json();
}

// trigger external scraper service
export async function runTradingViewScraper(options: ScraperOptions = {}) {
  console.log('[TradingView Runner] notifying external scraper', options);
  return callScraperService(options);
}

/**
 * Run scraper with direct API ingestion (recommended)
 * Data goes directly to database without JSON file intermediate step
 */
export async function runTradingViewScraperWithApiIngestion(options: Omit<ScraperOptions, 'useDirectApi'> = {}) {
  // alias for backwards compatibility
  return runTradingViewScraper(options);
}

/**
 * Run scraper with legacy JSON file mode
 * Use this if direct API mode fails or for debugging
 */
export async function runTradingViewScraperLegacy(options: Omit<ScraperOptions, 'useDirectApi'> = {}) {
  // legacy just calls external service; snapshot ingestion is handled there
  return runTradingViewScraper(options);
}

/**
 * Refresh TradingView fallback data
 * Runs scraper and ingests data (uses direct API mode by default)
 */
export async function refreshTradingViewFallback(options: ScraperOptions = {}) {
  // simple proxy to runTradingViewScraper for backwards compatibility
  return runTradingViewScraper(options);
}
