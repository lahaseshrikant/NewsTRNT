# Market Data Feature - Quick Start Guide

## 🚀 **Getting Started in 3 Steps**

### **Step 1: Add the Widget to Any Page**

Open any page component (e.g., `src/app/page.tsx`) and add:

```tsx
import MarketWidget from '@/components/MarketWidget';

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to NewsTRNT</h1>
      
      {/* Market Data Widget */}
      <MarketWidget 
        className="mb-8"
        showCommodities={true}
        showCurrencies={true}
        showCrypto={true}
        maxItems={5}
      />
      
      {/* Rest of your content */}
    </div>
  );
}
```

### **Step 2: Start Development Server**

```bash
npm run dev
```

### **Step 3: View in Browser**

Open http://localhost:3000 and you'll see:
- Your location automatically detected
- Relevant market indices for your country
- Commodities, Currencies, and Crypto tabs
- Real-time updates every minute

---

## 🎯 **Common Use Cases**

### **Use Case 1: Homepage Market Ticker**
```tsx
// Small horizontal ticker at top of page
import { useIndices } from '@/hooks/useMarketData';

export default function MarketTicker() {
  const { indices, isLoading } = useIndices(['SPX', 'DJI', 'IXIC']);
  
  if (isLoading) return null;
  
  return (
    <div className="bg-gray-900 text-white py-2 overflow-x-auto">
      <div className="flex gap-6 px-4">
        {indices.map(idx => (
          <div key={idx.id} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-medium">{idx.symbol}</span>
            <span>{idx.value.toFixed(2)}</span>
            <span className={idx.change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### **Use Case 2: Business News Section**
```tsx
import MarketWidget from '@/components/MarketWidget';

export default function BusinessPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* News Articles */}
      <div className="lg:col-span-2">
        <h2>Latest Business News</h2>
        {/* Article cards */}
      </div>
      
      {/* Market Data Sidebar */}
      <aside>
        <MarketWidget 
          maxItems={8}
          showCommodities={false}
        />
      </aside>
    </div>
  );
}
```

### **Use Case 3: User Dashboard**
```tsx
'use client';

import { useMarketData } from '@/hooks/useMarketData';

export default function UserDashboard() {
  const { indices, commodities, location, refresh } = useMarketData();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Your Market Dashboard</h1>
        <div>
          📍 {location?.countryName}
          <button onClick={refresh}>🔄 Refresh</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2>Your Indices</h2>
          {indices.slice(0, 5).map(idx => (
            <div key={idx.id}>{idx.name}: {idx.value}</div>
          ))}
        </div>
        
        <div>
          <h2>Commodities</h2>
          {commodities.slice(0, 5).map(comm => (
            <div key={comm.id}>{comm.name}: ${comm.value}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **Use Case 4: Specific Country View**
```tsx
import { getMarketDataByCountry } from '@/lib/market-data-service';

export default async function CountryMarkets({ params }: { params: { country: string } }) {
  const data = await getMarketDataByCountry(params.country);
  
  return (
    <div>
      <h1>Market Data for {params.country}</h1>
      {data.indices.map(idx => (
        <div key={idx.id}>
          {idx.symbol}: {idx.value} ({idx.changePercent}%)
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 **Testing Locations**

### **Test Different Countries**

```tsx
import { setManualLocation } from '@/lib/location-service';

// Test US markets
setManualLocation('US', 'United States');

// Test Indian markets
setManualLocation('IN', 'India');

// Test UK markets
setManualLocation('GB', 'United Kingdom');

// Test Japanese markets
setManualLocation('JP', 'Japan');

// Then refresh the page
window.location.reload();
```

### **Available Country Codes**
```
Americas: US, CA, BR, MX, AR, CL
Europe: GB, DE, FR, IT, ES, NL, CH, BE, SE, NO, DK, RU, PL
Asia: JP, CN, HK, IN, KR, TW, SG, MY, TH, ID, PH, VN, PK, BD, LK
Middle East: SA, AE, QA, KW, IL, TR, EG
Africa: ZA, NG, KE, MA
Oceania: AU, NZ
```

---

## 🎨 **Styling Examples**

### **Compact Mode**
```tsx
<MarketWidget 
  className="max-w-md"
  maxItems={3}
  showCommodities={false}
  showCurrencies={false}
  showCrypto={false}
/>
```

### **Full Width Dashboard**
```tsx
<MarketWidget 
  className="w-full"
  maxItems={10}
/>
```

### **Card Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  <MarketWidget maxItems={5} showCommodities={false} showCurrencies={false} showCrypto={false} />
  <MarketWidget maxItems={5} showCommodities={true} showCurrencies={false} showCrypto={false} />
  <MarketWidget maxItems={5} showCommodities={false} showCurrencies={true} showCrypto={false} />
  <MarketWidget maxItems={5} showCommodities={false} showCurrencies={false} showCrypto={true} />
</div>
```

---

## 📱 **API Testing**

### **Browser Console**
```javascript
// Test location detection
const location = await fetch('/api/market/country/US').then(r => r.json());
console.log(location);

// Test commodities
const commodities = await fetch('/api/market/commodities').then(r => r.json());
console.log(commodities);

// Test currencies
const currencies = await fetch('/api/market/currencies').then(r => r.json());
console.log(currencies);

// Test crypto
const crypto = await fetch('/api/market/crypto').then(r => r.json());
console.log(crypto);
```

### **Postman/Thunder Client**

**GET Country Data**
```
GET http://localhost:3000/api/market/country/US
```

**POST Specific Indices**
```
POST http://localhost:3000/api/market/indices
Content-Type: application/json

{
  "symbols": ["SPX", "DJI", "IXIC", "FTSE", "N225"]
}
```

**GET Commodities by Category**
```
GET http://localhost:3000/api/market/commodities?category=Energy
```

**GET Currency Pairs**
```
GET http://localhost:3000/api/market/currencies?pairs=EUR/USD,GBP/USD
```

**GET Cryptocurrencies**
```
GET http://localhost:3000/api/market/crypto?symbols=BTC,ETH,BNB
```

---

## 🐛 **Troubleshooting**

### **Problem: No data displayed**
**Solution**: Check browser console for errors
```javascript
// Open browser console (F12)
localStorage.clear(); // Clear cache
window.location.reload(); // Reload page
```

### **Problem: Wrong country detected**
**Solution**: Manually set location
```javascript
import { setManualLocation } from '@/lib/location-service';
setManualLocation('US', 'United States');
window.location.reload();
```

### **Problem: Data not refreshing**
**Solution**: Check auto-refresh settings
```tsx
<MarketWidget 
  // Disable auto-refresh
  autoRefresh={false}
/>

// Or adjust interval
const { refresh } = useMarketData({
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
});
```

### **Problem: TypeScript errors**
**Solution**: Ensure types are imported
```tsx
import { MarketIndex, LocationData } from '@/types/market';
```

---

## ⚙️ **Configuration**

### **Change Default Location**
Edit `src/lib/location-service.ts`:
```typescript
private getDefaultLocation(): LocationData {
  return {
    country: 'IN', // Change to your preferred country
    countryName: 'India',
    timezone: 'Asia/Kolkata',
    detectionMethod: 'default',
    timestamp: Date.now(),
  };
}
```

### **Adjust Cache Duration**
Edit `src/lib/market-data-service.ts`:
```typescript
private readonly CACHE_DURATION_MARKET_HOURS = 60 * 1000; // 1 minute
private readonly CACHE_DURATION_OFF_HOURS = 10 * 60 * 1000; // 10 minutes
```

### **Add More Indices**
Edit `src/config/market-indices.ts`:
```typescript
export const ASIA_INDICES: IndexConfig[] = [
  // Add your custom index
  {
    symbol: 'CUSTOM',
    name: 'My Custom Index',
    country: 'US',
    region: ['AMERICAS'],
    exchange: 'NYSE',
    currency: 'USD',
    timezone: 'America/New_York',
    marketHours: { open: '09:30', close: '16:00' },
  },
];
```

---

## 🎯 **Performance Tips**

1. **Reduce maxItems** for faster rendering
2. **Disable unused tabs** (showCommodities, showCurrencies, showCrypto)
3. **Increase refreshInterval** to reduce API calls
4. **Use React.memo** for custom components
5. **Enable HTTP caching** in production

---

## 📊 **Example: Full Integration**

```tsx
// app/page.tsx
import MarketWidget from '@/components/MarketWidget';
import { ArticleCard } from '@/components/ArticleCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">NewsTRNT</h1>
          <p className="text-xl">Your world. Your interests. Your news.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Latest News</h2>
            {/* Article cards */}
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Market Widget */}
            <MarketWidget 
              showCommodities={true}
              showCurrencies={true}
              showCrypto={true}
              maxItems={5}
            />
            
            {/* Other sidebar content */}
          </aside>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ **Checklist**

Before going live:
- [ ] Test location detection
- [ ] Verify all API endpoints
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Verify caching works
- [ ] Test error states
- [ ] Check loading states
- [ ] Test refresh functionality
- [ ] Verify TypeScript types
- [ ] Test with different countries

---

## 🚀 **Ready to Go!**

Your market data feature is fully functional. Just add the `<MarketWidget />` component anywhere in your app and it will automatically:
- Detect user location
- Show relevant market indices
- Auto-refresh data
- Handle errors gracefully
- Work in dark mode
- Be fully responsive

**Enjoy your new market data feature! 🎉**
