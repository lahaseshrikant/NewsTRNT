# NewsTRNT Platform - API Architecture Documentation

## Overview

This project has a **hybrid API architecture** with multiple API layers serving different purposes. This document explains why we have different API files in different locations and how they work together.

## Architecture Layers

### 1. Next.js API Routes (`src/app/api/**/route.ts`)
**Location**: `src/app/api/`  
**Purpose**: Built-in Next.js API routes (App Router)  
**Runs on**: Next.js server (port 3000)  
**When to use**: Simple API endpoints, server-side rendering integration

#### Structure:
```
src/app/api/
├── auth/
│   ├── login/route.ts          # User login endpoint
│   ├── register/route.ts       # User registration
│   ├── logout/route.ts         # User logout
│   ├── verify/route.ts         # Email verification
│   ├── change-password/route.ts # Password change
│   └── me/route.ts             # Get current user
├── articles/
│   ├── route.ts                # GET /api/articles (public articles)
│   └── [id]/route.ts           # GET /api/articles/[id] (single article)
├── categories/
│   └── route.ts                # Categories CRUD
├── admin/
│   ├── stats/route.ts          # Admin statistics
│   └── simple-auth/route.ts    # Simple admin auth
└── placeholder/
    └── [...dimensions]/route.ts # Image placeholder service
```

**Characteristics**:
- Uses Next.js App Router convention
- File-based routing (folder = route path)
- Each `route.ts` exports HTTP method handlers (GET, POST, PUT, DELETE)
- Runs on the same server as the frontend
- Good for: Simple APIs, SSR integration, serverless deployment

---

### 2. Express Backend API (`backend/src/routes/*.ts`)
**Location**: `backend/src/`  
**Purpose**: Dedicated backend server with full Express.js capabilities  
**Runs on**: Express server (port 5000)  
**When to use**: Complex business logic, database operations, admin operations

#### Structure:
```
backend/src/
├── index.ts                    # Express server entry point
├── routes/
│   ├── auth.ts                 # Authentication routes
│   ├── articles.ts             # Article CRUD operations
│   ├── categories.ts           # Category management
│   └── health.ts               # Health check endpoints
├── middleware/
│   ├── auth.ts                 # Authentication middleware
│   ├── errorHandler.ts         # Error handling
│   └── requestLogger.ts        # Logging middleware
└── config/
    └── database.ts             # Database configuration
```

**API Endpoints**:
- `http://localhost:5000/api/auth/*` - Authentication
- `http://localhost:5000/api/articles/*` - Article management
- `http://localhost:5000/api/articles/admin/*` - Admin article operations
- `http://localhost:5000/api/categories/*` - Category management
- `http://localhost:5000/api/health` - Health checks

**Characteristics**:
- Full Express.js server with middleware
- Dedicated database connections
- Complex authentication and authorization
- Better for: Database operations, file uploads, real-time features

---

### 3. Frontend API Client (`src/lib/api/index.ts`)
**Location**: `src/lib/api/`  
**Purpose**: Frontend client library for making API calls  
**Runs on**: Browser/Client-side  
**When to use**: Frontend components need to call APIs

#### Structure:
```
src/lib/api/
└── index.ts                    # API client classes and utilities
    ├── ArticleAPI class        # Article operations
    ├── CategoryAPI class       # Category operations
    ├── APIClient class         # Base HTTP client
    └── Type definitions        # TypeScript interfaces
```

**Usage Example**:
```typescript
import { articleAPI } from '@/lib/api';

// In a React component
const drafts = await articleAPI.getDrafts();
const article = await articleAPI.getArticle('123');
```

**Characteristics**:
- Client-side HTTP client (uses fetch API)
- Handles authentication headers automatically
- Type-safe with TypeScript interfaces
- Abstracts API calls for frontend components

---

### 4. Authentication Libraries (`src/lib/*.ts`)
**Location**: `src/lib/`  
**Purpose**: Various authentication and utility libraries  

#### Key Files:
```
src/lib/
├── unified-admin-auth.ts       # Main admin authentication system
├── simple-admin-auth.ts        # Simple admin auth (legacy)
├── admin-jwt-bridge.ts         # JWT bridge for admin auth
├── auth.ts                     # General authentication utilities
├── security.ts                 # Security utilities
├── database*.ts                # Database abstraction layers
└── config.ts                   # Configuration management
```

---

## Why This Architecture?

### 1. **Separation of Concerns**
- **Next.js API**: Simple, SSR-friendly endpoints
- **Express Backend**: Complex business logic and database operations
- **Frontend Client**: Clean abstraction for UI components
- **Auth Libraries**: Reusable authentication logic

### 2. **Scalability**
- Backend can be scaled independently
- Frontend and backend can be deployed separately
- Different teams can work on different layers

### 3. **Development Flexibility**
- Next.js APIs for rapid prototyping
- Express backend for production-grade features
- Multiple authentication strategies for different needs

### 4. **Performance**
- Express backend optimized for database operations
- Next.js APIs optimized for SSR
- Client-side caching and request optimization

---

## Current API Flow

### For Admin Operations:
```
Frontend Component
    ↓ (uses)
src/lib/api/index.ts (ArticleAPI)
    ↓ (makes HTTP calls to)
Express Backend (localhost:5000)
    ↓ (uses)
backend/src/routes/articles.ts
    ↓ (queries)
PostgreSQL Database
```

### For Public Content:
```
Frontend Component
    ↓ (uses)
Next.js API Routes (localhost:3000/api/*)
    ↓ (may proxy to or directly query)
Database or External APIs
```

---

## File Naming Convention

### Next.js API Routes
- **Pattern**: `src/app/api/{resource}/route.ts`
- **Example**: `src/app/api/articles/route.ts`
- **URL**: `http://localhost:3000/api/articles`

### Express Backend Routes
- **Pattern**: `backend/src/routes/{resource}.ts`
- **Example**: `backend/src/routes/articles.ts`
- **URL**: `http://localhost:5000/api/articles`

### Frontend API Client
- **Pattern**: `src/lib/api/index.ts` (single file with all clients)
- **Classes**: `ArticleAPI`, `CategoryAPI`, etc.
- **Usage**: `import { articleAPI } from '@/lib/api'`

---

## Current Issues and Recommendations

### Issues:
1. **Duplicate routes**: Same endpoints exist in both Next.js and Express
2. **Confusion**: Multiple authentication systems
3. **Complexity**: Too many abstraction layers for a single project

### Recommendations:
1. **Choose one primary API approach**:
   - Use Express backend for all data operations
   - Use Next.js API only for SSR-specific needs

2. **Consolidate authentication**:
   - Use UnifiedAdminAuth as the single source of truth
   - Remove redundant auth systems

3. **Clear routing strategy**:
   - Admin operations → Express backend
   - Public content → Next.js API routes
   - Authentication → Express backend

---

## Environment Variables

```bash
# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:5000/api  # Points to Express backend

# Backend (Express)
PORT=5000
CLIENT_URL=http://localhost:3000  # CORS configuration
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

---

## Getting Started

1. **Start Express Backend**:
   ```bash
   cd backend
   npm run dev  # Runs on http://localhost:5000
   ```

2. **Start Next.js Frontend**:
   ```bash
   npm run dev  # Runs on http://localhost:3000
   ```

3. **API Endpoints Available**:
   - Next.js: `http://localhost:3000/api/*`
   - Express: `http://localhost:5000/api/*`

---

## Troubleshooting

### "Connection Refused" Errors
- Ensure Express backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS configuration in backend

### Authentication Issues
- Check which auth system is being used (UnifiedAdminAuth vs SimpleAdminAuth)
- Verify token format and expiration
- Check middleware configuration

### Import Errors
- Verify export/import syntax (named vs default exports)
- Check file paths and aliases (@/ prefix)
- Ensure TypeScript compilation is successful

---

## Summary

This project uses a **hybrid architecture** with multiple API layers for flexibility and scalability. While this provides power and options, it can be confusing. The key is understanding:

1. **Next.js API routes** (`src/app/api/`) - Simple, SSR-friendly
2. **Express backend** (`backend/src/`) - Complex, database-focused
3. **Frontend client** (`src/lib/api/`) - Browser-based API consumer
4. **Auth libraries** (`src/lib/`) - Authentication utilities

Choose the right layer for your needs, and consider consolidating if the complexity becomes overwhelming.