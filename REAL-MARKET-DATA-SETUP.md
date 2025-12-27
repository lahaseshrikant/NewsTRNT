# Real Market Data Integration Guide

## 🎯 Overview
This guide will help you set up real market data APIs for live stock, commodity, cryptocurrency, and currency exchange data.

## 📋 Required API Keys

### 1. **Alpha Vantage** (Stock Indices & Commodities)
- **Website**: https://www.alphavantage.co/support/#api-key
- **Free Tier**: 25 requests per day, 5 requests per minute
- **Premium**: $49.99/month for 500 requests/day
- **What it provides**: 
  - Global stock quotes
  - Commodity prices (Oil, Gold, Silver, etc.)
  - Forex data
  - Technical indicators

**Registration Steps:**
1. Visit https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Agree to terms
4. Click "GET FREE API KEY"
5. Copy the API key
6. Add to `.env.local`: `ALPHA_VANTAGE_API_KEY="your-key-here"`

### 2. **Finnhub** (Real-time Stock Data)
- **Website**: https://finnhub.io/register
- **Free Tier**: 60 API calls/minute
- **Premium**: $29/month for unlimited calls
- **What it provides**:
  - Real-time stock quotes
  - Company profiles
  - Market news
  - Financial statements

**Registration Steps:**
1. Visit https://finnhub.io/register
2. Sign up with email
3. Verify email
4. Go to Dashboard → API Keys
5. Copy your API key
6. Add to `.env.local`: `FINNHUB_API_KEY="your-key-here"`

### 3. **CoinGecko** (Cryptocurrency Data)
- **Website**: https://www.coingecko.com/en/api
- **Free Tier**: 10-50 calls/minute (NO API KEY NEEDED for basic plan)
- **Premium**: $129/month for Pro plan
- **What it provides**:
  - Cryptocurrency prices
  - Market data
  - Historical data
  - NFT data

**No Registration Needed for Free Tier!**
- The free API works without an API key
- Rate limit: 10-50 calls/minute
- For premium features, register at: https://www.coingecko.com/en/api/pricing

### 4. **Exchange Rate API** (Currency Conversion)
- **Website**: https://www.exchangerate-api.com/
- **Free Tier**: 1,500 requests/month (NO API KEY NEEDED)
- **Premium**: $9/month for 100,000 requests
- **What it provides**:
  - Real-time exchange rates
  - 160+ currencies
  - Historical rates

**No Registration Needed for Basic Usage!**
- Uses: `https://api.exchangerate-api.com/v4/latest/USD`
- For premium features: https://www.exchangerate-api.com/docs/

## 🚀 Quick Setup

### Step 1: Get API Keys
1. Register for Alpha Vantage (required for stocks)
2. Register for Finnhub (optional but recommended)
3. CoinGecko and Exchange Rate API work without keys!

### Step 2: Configure Environment Variables
Edit `.env.local` in your project root:

```env
# Market Data API Keys
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
FINNHUB_API_KEY="your-finnhub-key"  # Optional
EXCHANGE_RATE_API_KEY=""  # Not needed for free tier
COINGECKO_API_KEY=""  # Not needed for free tier

# Enable real data
ENABLE_REAL_MARKET_DATA="true"
```

### Step 3: Test API Connectivity
The monitoring page is located at `src/app/admin/market-data/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function TestMarketAPI() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPIs() {
      const res = await fetch('/api/market/test-connectivity');
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }
    testAPIs();
  }, []);

  if (loading) return <div>Testing APIs...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connectivity Test</h1>
      <div className="space-y-2">
        <div>Alpha Vantage: {results.alphaVantage ? '✅' : '❌'}</div>
        <div>Finnhub: {results.finnhub ? '✅' : '❌'}</div>
        <div>CoinGecko: {results.coingecko ? '✅' : '❌'}</div>
        <div>Exchange Rate: {results.exchangeRate ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}
```

### Step 4: Restart Development Server
```bash
npm run dev
```

Visit: http://localhost:3000/admin/market-data (admin panel)

## 📊 API Usage & Rate Limits

### Free Tier Limits
| API | Requests/Minute | Requests/Day | Requests/Month |
|-----|-----------------|--------------|----------------|
| Alpha Vantage | 5 | 25 | 750 |
| Finnhub | 60 | - | - |
| CoinGecko | 10-50 | - | - |
| Exchange Rate | - | - | 1,500 |

### Caching Strategy
To stay within rate limits, the app implements aggressive caching:
- **Market Hours**: 30-second cache
- **Off Hours**: 5-minute cache
- **Crypto**: 1-minute cache (24/7 markets)
- **Currency**: 1-hour cache (slow-moving)

## 🔧 Troubleshooting

### "API Key Invalid" Error
- Double-check your API key in `.env.local`
- Make sure there are no extra spaces
- Restart your development server after changes

### Rate Limit Exceeded
- Free tier limits are strict
- Wait a minute and try again
- Consider upgrading to premium tier
- Check cache is working properly

### No Data Showing
1. Check `.env.local` has `ENABLE_REAL_MARKET_DATA="true"`
2. Verify API keys are correct
3. Check browser console for errors
4. Test API connectivity at `/admin/market-data`

### Mock Data Still Showing
- App falls back to mock data if APIs fail
- Check API connectivity test results
- Verify environment variables are loaded
- Clear browser cache

## 💰 Cost Optimization Tips

1. **Use Free Tiers First**: CoinGecko and Exchange Rate API work without keys
2. **Implement Caching**: Already done - 30s to 5min cache
3. **Batch Requests**: Fetch multiple symbols in one API call
4. **Monitor Usage**: Track API calls in your dashboard
5. **Upgrade Strategically**: Start with Alpha Vantage premium if needed

## 🎯 Recommended Setup for Production

### Minimum (Free):
- Alpha Vantage: Stock indices
- CoinGecko: Crypto (no key needed)
- Exchange Rate API: Currencies (no key needed)
- **Total Cost**: $0/month

### Recommended (Paid):
- Alpha Vantage Premium: $49.99/month
- Finnhub: $29/month
- CoinGecko Pro: $129/month
- **Total Cost**: $207.99/month

### Enterprise:
- Multiple API keys for redundancy
- Redis cache for better performance
- WebSocket connections for real-time updates
- Custom data aggregation service

## 📝 Alternative Free APIs

If you need more data without costs:

1. **Yahoo Finance API**: Unofficial but widely used
   - Library: `yahoo-finance2` npm package
   - Free, unlimited, no key needed
   
2. **Polygon.io**: Stock data
   - Free: 5 calls/minute
   - Good for basic stock quotes

3. **Twelve Data**: Stock & Forex
   - Free: 8 calls/minute, 800/day
   - https://twelvedata.com/

4. **Binance API**: Crypto only
   - Free, unlimited for public data
   - Best for crypto-only apps

## 🔐 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** only
3. **Add `.env.local` to `.gitignore`**
4. **Rotate keys regularly** (every 90 days)
5. **Monitor usage** for suspicious activity
6. **Use IP whitelisting** if available
7. **Implement rate limiting** on your backend

## 📚 Additional Resources

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Exchange Rate API Docs](https://www.exchangerate-api.com/docs/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review API provider documentation
3. Check rate limits in provider dashboard
4. Verify environment variables are set
5. Test each API independently

## 📈 Next Steps

1. Register for API keys
2. Add keys to `.env.local`
3. Test API connectivity
4. Monitor usage and performance
5. Consider premium tiers based on needs
6. Implement additional caching if needed
7. Add error handling and fallbacks
