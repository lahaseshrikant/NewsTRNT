// Market data module — barrel re-exports
export { startMarketDataUpdates, stopMarketDataUpdates, getServiceStatus } from './auto-update';
export { updateStockIndices, updateCryptocurrencies, updateCurrencyRates, updateCommodities } from './cache';
export { getActiveSymbols } from './config';
export {
  fetchIndexFromAlphaVantage,
  fetchIndexFromFinnhub,
  fetchIndexFromMarketStack,
  fetchIndexFromTwelveData,
  fetchIndexFromFMP,
  fetchCryptoFromCoinGecko,
  fetchExchangeRates,
  fetchCommodityPrice,
  fetchMetalPrice,
  testAPIConnectivity,
} from './providers';
export { getProviderPreference } from './provider-preferences';
