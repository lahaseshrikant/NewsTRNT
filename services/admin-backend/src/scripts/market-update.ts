#!/usr/bin/env ts-node
import { updateStockIndices, updateCryptocurrencies, updateCurrencyRates, updateCommodities } from '../lib/market-cache';

async function run() {
  console.log('Starting manual market update...');
  const results: Record<string, any> = {};

  try {
    results.indices = await updateStockIndices();
    console.log('Indices update result', results.indices);
  } catch (e) {
    console.error('Indices update failed', e);
  }

  try {
    results.crypto = await updateCryptocurrencies();
    console.log('Crypto update result', results.crypto);
  } catch (e) {
    console.error('Crypto update failed', e);
  }

  try {
    results.currencies = await updateCurrencyRates();
    console.log('Currencies update result', results.currencies);
  } catch (e) {
    console.error('Currency update failed', e);
  }

  try {
    results.commodities = await updateCommodities();
    console.log('Commodities update result', results.commodities);
  } catch (e) {
    console.error('Commodities update failed', e);
  }

  console.log('Manual update complete:', JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error('Market update script error', err);
  process.exit(1);
});