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
Create new project: "newsnerve-db"
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
```sql
-- Copy schema from database/schema.sql
-- Paste in Supabase SQL Editor
-- Click "Run"
```

### 5. Seed Initial Data  
```sql
-- Copy seed data from database/seed_data.sql
-- Paste in Supabase SQL Editor  
-- Click "Run"
```

## Result:
✅ Professional PostgreSQL database
✅ Real-time capabilities
✅ Built-in authentication
✅ Scales to millions of users
✅ Free forever (generous limits)
