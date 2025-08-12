# File Cleanup Analysis for NewsTRNT Project

## 🗑️ FILES TO REMOVE (Empty or Duplicates)

### Empty Files - REMOVE ALL:
- `src/app/login/page-redirect.tsx` - Empty file
- `src/app/register/page-redirect.tsx` - Empty file  
- `src/app/auth/forgot-password/page-new.tsx` - Empty file
- `src/components/Header_new.tsx` - Empty file
- `src/components/Footer_new.tsx` - Empty file
- `src/app/page_new.tsx` - Empty file
- `src/app/dashboard/page_new.tsx` - Empty file (if empty)
- `src/app/admin/page_new.tsx` - Empty file (if empty)

### Duplicate/Obsolete Files - REMOVE:
- `next.config.ts` - Empty default config, keep `next.config.js` (our optimized version)
- `src/app/dashboard/test.tsx` - Test file no longer needed
- `src/app/login/page-new.tsx` - Duplicate redirect (same as page.tsx)
- `src/app/register/page-fresh.tsx` - Duplicate redirect (same as page.tsx)

### Backend Duplicate Files - REMOVE:
- `backend/src/routes/articles-simple.ts` - Keep articles.ts as main
- `backend/src/routes/articles-complete.ts` - Keep articles.ts as main  
- `backend/src/routes/categories-clean.ts` - Keep categories.ts as main

### Build Artifacts - REMOVE ENTIRE DIRECTORIES:
- `backend/dist/` - All compiled JavaScript files (regenerated on build)

## ✅ FILES TO KEEP (Active/Important):

### Main Authentication Files:
- `src/app/login/page.tsx` - Main login redirect
- `src/app/register/page.tsx` - Main register redirect
- `src/app/auth/signin/page.tsx` - Actual signin page
- `src/app/auth/signup/page.tsx` - Actual signup page
- `src/app/auth/forgot-password/page.tsx` - Main forgot password page

### Main Component Files:
- `src/components/Header.tsx` - Main header component
- `src/components/Footer.tsx` - Main footer component
- `src/app/page.tsx` - Main homepage
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/app/admin/page.tsx` - Main admin page

### Configuration Files:
- `next.config.js` - Our optimized Next.js config
- `src/lib/config.ts` - Application configuration
- `src/lib/database-real.ts` - Main database interface

### Backend Files:
- `backend/src/routes/articles.ts` - Main articles API
- `backend/src/routes/categories.ts` - Main categories API
- `backend/src/routes/auth.ts` - Authentication API

## 🚀 CLEANUP SUMMARY:
- **Remove**: 15+ unnecessary files
- **Clean**: Backend dist directory
- **Keep**: All active, functional files
- **Result**: Cleaner codebase, faster builds, reduced confusion
