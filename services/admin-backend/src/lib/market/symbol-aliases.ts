/**
 * Symbol Alias Map
 * Maps non-canonical symbol formats (used by various scrapers / providers)
 * to the canonical ^ -prefixed symbol stored in MarketIndexConfig.
 *
 * Rule: canonical symbols use the Yahoo-Finance convention (^ prefix for
 * major indices).  This file is the ONLY place where alias resolution lives.
 * Add new entries here whenever a new provider or scraper uses a different
 * symbol for the same index.
 */

// scraperSymbol (UPPER) → canonical config symbol
export const INDEX_SYMBOL_ALIASES: Record<string, string> = {
  // ── Americas ────────────────────────────────────────────────────────────────
  'SPX':           '^GSPC',   // S&P 500
  'SP500':         '^GSPC',
  'US500':         '^GSPC',
  'SPY':           '^GSPC',

  'DJI':           '^DJI',    // Dow Jones
  'DJIA':          '^DJI',
  'US30USD':       '^DJI',
  'US30':          '^DJI',

  'COMP':          '^IXIC',   // NASDAQ Composite
  'NDX100':        '^NDX',    // NASDAQ 100
  'NAS100':        '^NDX',

  'RUT2000':       '^RUT',    // Russell 2000
  'RUA':           '^RUT',    // (Russell 3000 → closest is ^RUT)

  'TSX':           '^GSPTSE', // TSX Canada
  'SPTSX':         '^GSPTSE',

  'IBOV':          '^BVSP',   // Brazil Bovespa
  'BVSP':          '^BVSP',

  'ME':            '^MXX',    // Mexico IPC
  'MXX':           '^MXX',
  'BMV':           '^MXX',

  'IMV':           '^MERV',   // Argentina MERVAL
  'MERVAL':        '^MERV',

  'SP_IPSA':       '^IPSA',   // Chile (may not be in config yet)
  'IPSA':          '^IPSA',

  // ── Europe ─────────────────────────────────────────────────────────────────
  'UKX':           '^FTSE',   // FTSE 100
  'FTSE100':       '^FTSE',
  'UK100':         '^FTSE',

  'FTMC':          '^FTMC',   // FTSE 250

  'DAX':           '^GDAXI',  // DAX Germany
  'DAX40':         '^GDAXI',
  'DEU40':         '^GDAXI',
  'DE30EUR':       '^GDAXI',
  'GER40':         '^GDAXI',

  'PX1':           '^FCHI',   // CAC 40 France
  'CAC40':         '^FCHI',
  'CAC':           '^FCHI',
  'FRA40':         '^FCHI',

  'SX5E':          '^STOXX50E', // Euro Stoxx 50
  'STOXX50':       '^STOXX50E',
  'EU50':          '^STOXX50E',

  'SXXP':          '^STOXX',   // STOXX 600
  'STOXX600':      '^STOXX',

  'AEX':           '^AEX',    // Netherlands
  'NL25EUR':       '^AEX',
  'NET25':         '^AEX',

  'IBC':           '^IBEX',   // Spain IBEX 35
  'IBEX35':        '^IBEX',
  'IBEX':          '^IBEX',

  'FTMIB':         '^FTSEMIB', // Italy
  'FTSEMIB':       '^FTSEMIB',

  'SMI':           '^SSMI',   // Switzerland
  'SSMI':          '^SSMI',

  'BEL20':         '^BFX',    // Belgium
  'BEL':           '^BFX',

  'PSI20':         '^PSI20',  // Portugal
  'PSI':           '^PSI20',

  'OMXS30':        '^OMX',    // Sweden
  'OMX30':         '^OMX',

  'IMOEX':         '^IMOEX',  // Russia
  'MOEX':          '^IMOEX',

  'WIG20':         '^WIG20',  // Poland (add to config if needed)

  'OMXH25':        '^OMXH25', // Finland (add to config if needed)

  'OMXC25':        '^OMXC25', // Denmark (add to config if needed)

  'BUX':           '^BUX',    // Hungary

  'GD':            '^GD',     // Greece ATHEX

  'BET':           '^BET',    // Romania

  'BELEX15':       '^BELEX15', // Serbia

  // ── Asia-Pacific ────────────────────────────────────────────────────────────
  'NI225':         '^N225',   // Nikkei 225 Japan
  'JP225':         '^N225',
  'N225':          '^N225',
  'JPN225':        '^N225',

  'TOPIX':         '^TOPX',   // TOPIX Japan

  'SSE':           '^SSE',    // Shanghai
  '000001':        '^SSE',

  'SZSE':          '^SZSE',   // Shenzhen
  '399001':        '^SZSE',

  'CSI300':        '^CSI300',

  'HSI':           '^HSI',    // Hang Seng
  'HK33HKD':       '^HSI',
  'HANGSENG':      '^HSI',

  'HSCE':          '^HSCE',   // Hang Seng China Enterprises

  'NIFTY':         '^NSEI',   // India Nifty 50
  'NIFTY50':       '^NSEI',
  'NSE':           '^NSEI',

  'SENSEX':        '^BSESN',  // India SENSEX
  'BSE':           '^BSESN',

  'BANKNIFTY':     '^NSEBANK', // India Bank Nifty

  'KOSPI':         '^KS11',   // South Korea
  'KOSPI200':      '^KS11',
  'KR100':         '^KS11',

  'KOSDAQ':        '^KQ11',

  'TWSE':          '^TWII',   // Taiwan
  'TAIEX':         '^TWII',

  'XJO':           '^AXJO',   // ASX 200 Australia
  'ASX200':        '^AXJO',
  'AU200AUD':      '^AXJO',
  'AU200':         '^AXJO',

  'AORD':          '^AORD',   // All Ordinaries Australia

  'NZ50G':         '^NZ50',   // New Zealand

  'STI':           '^STI',    // Singapore

  'FBMKLCI':       '^KLSE',   // Malaysia
  'KLCI':          '^KLSE',

  'SET50':         '^SET',    // Thailand
  'SET':           '^SET',

  'COMPOSITE':     '^JKSE',   // Indonesia IDX Composite
  'JKSE':          '^JKSE',
  'IDX30':         '^JKSE',   // IDX 30 is subset, closest is ^JKSE

  'PSEI':          '^PSEI',   // Philippines

  'VNINDEX':       '^VNINDEX', // Vietnam

  // ── Middle East & Africa ────────────────────────────────────────────────────
  'TASI':          '^TASI',   // Saudi Arabia
  'TADAWUL':       '^TASI',

  'ADI':           '^ADI',    // Abu Dhabi

  'DFMGI':         '^DFMGI',  // Dubai

  'GNRI':          '^QSI',    // Qatar (GNRI is QE)
  'QE':            '^QSI',

  'TA35':          '^TA35',   // Israel

  'EGX30':         '^EGX30',  // Egypt

  'NGS30':         '^NGS30',  // Nigeria

  'SA40':          '^J203',   // South Africa Top 40 (JSE J203)
  'JSE':           '^J203',
  'TOP40':         '^J203',

  // ── Other / Misc ────────────────────────────────────────────────────────────
  'ICAP':          '^COLCAP',  // Colombia (add to config if needed)
  'MXNUAMPEGEN':  '^SPBLPGPT', // Peru (add to config if needed)

  'NYA':           '^NYA',    // NYSE Composite (add to config if needed)
  'N100':          '^N100',   // Euronext 100 (add to config if needed)
  'OMXTGI':        '^OMXTGI', // Tallinn (add to config if needed)
  'OMXRGI':        '^OMXRGI', // Riga (add to config if needed)
  'XU100':         '^XU100',  // Turkey BIST 100 (add to config if needed)
};

/**
 * Resolve a raw symbol (from any provider or scraper) to the canonical
 * ^ -prefixed symbol used in MarketIndexConfig.
 *
 * Resolution order:
 * 1. If the raw symbol already exists in configSymbols → use it as-is
 * 2. Check alias map (exact uppercase match)
 * 3. Try the ^ -prefixed variant (e.g. "FTSE" → "^FTSE")
 * 4. Fall back to raw symbol unchanged
 */
export function resolveIndexSymbol(raw: string, configSymbols: Set<string>): string {
  if (!raw) return raw;

  // 1. Already canonical
  if (configSymbols.has(raw)) return raw;

  // 2. Alias map lookup
  const upper = raw.toUpperCase();
  const aliased = INDEX_SYMBOL_ALIASES[upper];
  if (aliased && configSymbols.has(aliased)) return aliased;
  if (aliased) return aliased; // return alias even if not in config yet

  // 3. Try adding ^ prefix
  const withCaret = `^${raw}`;
  if (configSymbols.has(withCaret)) return withCaret;

  // 4. Strip ^ and look up without
  if (raw.startsWith('^')) {
    const bare = raw.slice(1);
    const aliasedBare = INDEX_SYMBOL_ALIASES[bare.toUpperCase()];
    if (aliasedBare && configSymbols.has(aliasedBare)) return aliasedBare;
  }

  // 5. Unchanged
  return raw;
}
