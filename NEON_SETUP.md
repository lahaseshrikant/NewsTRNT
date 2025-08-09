# 🚀 Neon Database Setup - Complete Guide

## Step 1: Create Neon Account (5 minutes)
```
1. Visit: https://neon.tech
2. Sign up with GitHub (recommended)
3. Create new project: "newsnerve-production"
4. Choose region: US East (best for Vercel)
```

## Step 2: Get Connection Details (2 minutes)
```
1. Go to Dashboard
2. Click "Connection Details"
3. Copy the connection string
Example: postgresql://username:password@host/dbname?sslmode=require
```

## Step 3: Update Environment (3 minutes)
```bash
# Create/update .env.local
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Step 4: Install Database Package (2 minutes)
```bash
npm install @vercel/postgres
npm install drizzle-orm drizzle-kit
```

## Step 5: Setup Database Schema (3 minutes)
```
1. Go to Neon Console → SQL Editor
2. Copy schema from database/schema.sql
3. Paste and run
4. Copy seed data from database/seed_data.sql  
5. Paste and run
```

## Result:
✅ Professional PostgreSQL database
✅ Populated with real data structure
✅ Ready for production scaling
✅ Connected to your app
