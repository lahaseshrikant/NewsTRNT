# Quick Reference: API Endpoints and Files

## When to Use Which API Layer

### Use Next.js API Routes (`src/app/api/`) when:
- ✅ Simple CRUD operations
- ✅ Server-side rendering integration
- ✅ Serverless deployment
- ✅ Quick prototyping

### Use Express Backend (`backend/src/`) when:
- ✅ Complex business logic
- ✅ Database operations with transactions
- ✅ File uploads and processing
- ✅ Admin operations
- ✅ Real-time features (WebSockets)
- ✅ Third-party integrations

## Current API Mapping

| Feature | Next.js Route | Express Route | Frontend Client |
|---------|---------------|---------------|-----------------|
| **Public Articles** | `src/app/api/articles/route.ts` | `backend/src/routes/articles.ts` | `articleAPI.getPublicArticles()` |
| **Admin Articles** | ❌ Not implemented | `backend/src/routes/articles.ts` | `articleAPI.getDrafts()` |
| **Single Article** | `src/app/api/articles/[id]/route.ts` | `backend/src/routes/articles.ts` | `articleAPI.getArticle(id)` |
| **Categories** | `src/app/api/categories/route.ts` | `backend/src/routes/categories.ts` | `categoryAPI.getCategories()` |
| **Authentication** | `src/app/api/auth/*/route.ts` | `backend/src/routes/auth.ts` | Direct API calls |
| **Admin Stats** | `src/app/api/admin/stats/route.ts` | ❌ Not implemented | Manual fetch |

## File Purposes Quick Reference

```
📁 Project Structure
├── 🟦 Next.js Frontend (Port 3000)
│   ├── src/app/api/              # Next.js API routes
│   ├── src/lib/api/index.ts      # Frontend API client
│   ├── src/lib/unified-admin-auth.ts  # Admin authentication
│   └── src/app/admin/            # Admin UI components
│
├── 🟩 Express Backend (Port 5000)
│   ├── backend/src/routes/       # Express API routes
│   ├── backend/src/middleware/   # Authentication & logging
│   └── backend/src/config/       # Database & config
│
└── 📋 Documentation
    ├── ARCHITECTURE.md           # This detailed guide
    └── API-REFERENCE.md          # This quick reference
```

## Common Development Patterns

### 1. Adding a New Admin Feature
```typescript
// 1. Add Express route
// backend/src/routes/articles.ts
router.post('/admin/articles', authenticateToken, requireAdmin, async (req, res) => {
  // Implementation
});

// 2. Add to Frontend API client
// src/lib/api/index.ts
export class ArticleAPI {
  async createArticle(data): Promise<Article> {
    return this.makeRequest('/articles/admin', { method: 'POST', body: data });
  }
}

// 3. Use in React component
// src/app/admin/articles/page.tsx
const result = await articleAPI.createArticle(formData);
```

### 2. Adding a Public Feature
```typescript
// Option A: Next.js API (simpler)
// src/app/api/news/route.ts
export async function GET() {
  return NextResponse.json({ news: [] });
}

// Option B: Express API (more powerful)
// backend/src/routes/news.ts
router.get('/news', async (req, res) => {
  res.json({ news: [] });
});
```

## Authentication Flow

```
🔐 Authentication Chain:
1. User logs in → UnifiedAdminAuth.login()
2. Session stored in localStorage
3. API client reads session → creates base64 token
4. Express middleware validates token
5. Request processed with user context
```

## Environment Setup

```bash
# Terminal 1: Start Express Backend
cd backend
npm run dev

# Terminal 2: Start Next.js Frontend  
npm run dev

# Access Points:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Admin Panel: http://localhost:3000/admin
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `net::ERR_CONNECTION_REFUSED` | Backend not running | Start Express server on port 5000 |
| `401 Unauthorized` | Invalid/missing token | Check UnifiedAdminAuth login status |
| `Import/Export errors` | Wrong import syntax | Check if using default vs named exports |
| `CORS errors` | Frontend can't reach backend | Check CORS config in backend |
| `Port conflicts` | Multiple servers on same port | Kill existing processes or change ports |

## Best Practices

### ✅ Do:
- Use Express backend for admin operations
- Use Next.js API for simple public endpoints
- Keep authentication in UnifiedAdminAuth
- Use TypeScript interfaces for API responses
- Handle errors gracefully in API client

### ❌ Don't:
- Mix authentication systems
- Put complex logic in Next.js API routes
- Hardcode API URLs (use environment variables)
- Skip error handling
- Duplicate endpoints unnecessarily

## Quick Commands

```bash
# Kill all Node processes (if servers conflict)
taskkill /F /IM node.exe

# Find what's using a port
netstat -ano | findstr :5000

# Check if servers are running
netstat -ano | findstr ":3000\|:5000"

# Restart with clean cache
rm -rf .next node_modules/.cache
npm run dev
```