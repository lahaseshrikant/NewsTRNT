# 🗄️ Database Setup - Supabase (Scalable & Free)

## Why Supabase?
- ✅ Free PostgreSQL database (500MB)
- ✅ Built-in authentication
- ✅ Real-time subscriptions  
- ✅ Auto-scaling
- ✅ No Docker needed
- ✅ Production ready

## Setup Steps:

### 1. Create Supabase Account
```
Visit: https://supabase.com
Sign up with GitHub
Create new project: "NewsTRNT-db"
Choose region: US East (closest to Vercel)
```

### 2. Get Database URL
```
Go to: Settings → Database
Copy: Connection string (URI)
Example: postgresql://postgres:[password]@[host]:5432/postgres
```

### 3. Update Environment
```bash
# Add to .env.local
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 4. Run Database Schema
```bash
# Use Prisma to push schema
npx prisma db push

# Legacy method (deprecated, archived in deprecated/database/):
# -- Copy schema from deprecated/database/schema.sql
# -- Paste in Supabase SQL Editor
# -- Click "Run"
```

### 5. Seed Initial Data  
```bash
# Use Prisma to seed data
npx prisma db seed

# Legacy method (deprecated, archived in deprecated/database/):
# -- Copy seed data from deprecated/database/seed_data.sql
# -- Paste in Supabase SQL Editor  
# -- Click "Run"
```

## Result:
✅ Professional PostgreSQL database
✅ Real-time capabilities
✅ Built-in authentication
✅ Scales to millions of users
✅ Free forever (generous limits)
