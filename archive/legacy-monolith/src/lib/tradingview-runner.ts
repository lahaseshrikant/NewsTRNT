/**
 * TradingView Scraper Runner
 * 
 * Runs the Python TradingView scraper and optionally ingests the data.
 * 
 * Modes:
 * 1. Direct API mode (recommended): Scraper POSTs directly to /api/market/ingest
 * 2. Legacy JSON mode: Scraper writes JSON, then we ingest via tradingview-fallback
 */

import { spawn } from 'child_process';
import path from 'path';
import { ingestTradingViewSnapshot } from './tradingview-fallback';

function resolvePythonBinary() {
  if (process.env.PYTHON_BIN) {
    return process.env.PYTHON_BIN;
  }

  if (process.platform === 'win32') {
    return path.resolve(process.cwd(), '.venv', 'Scripts', 'python.exe');
  }

  return path.resolve(process.cwd(), '.venv', 'bin', 'python');
}

interface ScraperOptions {
  limit?: number;
  outputPath?: string;
  useDirectApi?: boolean;
  apiUrl?: string;
  apiKey?: string;
}

function buildScriptArgs(options: ScraperOptions) {
  const scriptDir = path.resolve(process.cwd(), 'scraper-ai', 'scraping');
  const scriptFile = 'tradingview_indices.py';
  const args: string[] = [scriptFile];

  // Add limit if specified
  if (options.limit) {
    args.push('--limit', String(options.limit));
  }

  // Direct API mode (recommended)
  if (options.useDirectApi !== false) {
    const apiUrl = options.apiUrl || getIngestApiUrl();
    args.push('--api', apiUrl);
    
    const apiKey = options.apiKey || process.env.MARKET_INGEST_API_KEY;
    if (apiKey) {
      args.push('--api-key', apiKey);
    }
  }

  // Legacy JSON output (optional backup or if API mode disabled)
  if (options.outputPath || options.useDirectApi === false) {
    const outputPath = options.outputPath
      ? path.resolve(process.cwd(), options.outputPath)
      : path.resolve(process.cwd(), 'data', 'tradingview_indices.json');
    args.push('--output', outputPath);
  }

  return { scriptDir, args };
}

function getIngestApiUrl(): string {
  // In development, use localhost
  // In production, use the configured base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/market/ingest`;
}

export async function runTradingViewScraper(options: ScraperOptions = {}) {
  const pythonBinary = resolvePythonBinary();
  const { scriptDir, args } = buildScriptArgs(options);

  console.log(`[TradingView Runner] Starting scraper with args:`, args);

  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(pythonBinary, args, {
      cwd: scriptDir,
      env: process.env,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const error = new Error(`TradingView scraper exited with code ${code}: ${stderr}`);
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Run scraper with direct API ingestion (recommended)
 * Data goes directly to database without JSON file intermediate step
 */
export async function runTradingViewScraperWithApiIngestion(options: Omit<ScraperOptions, 'useDirectApi'> = {}) {
  return runTradingViewScraper({
    ...options,
    useDirectApi: true,
  });
}

/**
 * Run scraper with legacy JSON file mode
 * Use this if direct API mode fails or for debugging
 */
export async function runTradingViewScraperLegacy(options: Omit<ScraperOptions, 'useDirectApi'> = {}) {
  await runTradingViewScraper({
    ...options,
    useDirectApi: false,
  });
  return ingestTradingViewSnapshot();
}

/**
 * Refresh TradingView fallback data
 * Runs scraper and ingests data (uses direct API mode by default)
 */
export async function refreshTradingViewFallback(options: ScraperOptions = {}) {
  // Default to direct API mode
  const useDirectApi = options.useDirectApi !== false;
  
  if (useDirectApi) {
    // Direct API mode - scraper handles ingestion
    const result = await runTradingViewScraper(options);
    console.log('[TradingView Runner] Direct API ingestion completed');
    return { mode: 'api', stdout: result.stdout, stderr: result.stderr };
  } else {
    // Legacy mode - we handle ingestion
    await runTradingViewScraper({ ...options, useDirectApi: false });
    const ingestResult = await ingestTradingViewSnapshot();
    return { mode: 'legacy', ...ingestResult };
  }
}
