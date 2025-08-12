# Centralized Site Configuration

This document explains how to use the centralized configuration system for managing site-wide settings, contact information, and other configuration data.

## Configuration File Location

All site configuration is stored in `/src/config/site.ts`

## What You Can Configure

### 📞 Contact Information
- General contact details (email, phone, address)
- Department-specific contacts (advertising, support, editorial, press, careers, legal)
- Business hours and response times

### 📱 Social Media Links
- All social media platform URLs

### 📊 Business Information
- Company details, metrics, and operational information

### ⚙️ Technical Settings
- Supported file formats, max file sizes, API versions

### 🎛️ Feature Flags
- Enable/disable features like live chat, newsletter, dark mode, etc.

## How to Update Configuration

### 1. Contact Information
```typescript
// To change phone numbers, emails, or addresses:
// Edit /src/config/site.ts

contact: {
  general: {
    email: "contact@NewsTRNT.com",     // ← Change here
    phone: "+1 (555) 0123",           // ← Change here
  },
  departments: {
    advertising: {
      email: "advertising@NewsTRNT.com",  // ← Change here
      phone: "+1 (555) 0124",            // ← Change here
    }
  }
}
```

### 2. Business Metrics
```typescript
// To update site statistics:
metrics: {
  monthlyVisitors: "2.5M+",    // ← Change here
  pageViews: "8M+",           // ← Change here
  emailSubscribers: "500K+",  // ← Change here
}
```

### 3. Feature Flags
```typescript
// To enable/disable features:
features: {
  liveChat: true,              // ← Toggle here
  newsletter: true,            // ← Toggle here
  darkMode: true,             // ← Toggle here
}
```

## Using the Configuration

### In Components
```typescript
import { siteConfig, getContactByDepartment } from '@/config/site';

// Get general contact info
const email = siteConfig.contact.general.email;

// Get department-specific contact
const adEmail = getContactByDepartment('advertising').email;

// Get business metrics
const visitors = siteConfig.metrics.monthlyVisitors;
```

### Using the ContactInfo Component
```typescript
import ContactInfo from '@/components/ContactInfo';

// Basic usage
<ContactInfo department="advertising" />

// With additional info
<ContactInfo 
  department="support" 
  showBusinessHours={true} 
  showResponseTime={true}
  layout="vertical"
/>

// General contact
<ContactInfo department="general" />
```

## Benefits

### ✅ Centralized Management
- Update contact details in one place
- Changes automatically reflect across all pages
- No need to hunt through multiple files

### ✅ Type Safety
- TypeScript ensures valid department names
- Autocomplete for configuration options
- Compile-time error checking

### ✅ Consistency
- Same contact information everywhere
- Standardized formatting
- Feature flags control what's shown

### ✅ Maintainability
- Easy to update phone numbers, emails, metrics
- Simple to add new departments or features
- Clear separation of configuration and code

## Pages That Use This Configuration

- ✅ **Advertise Page**: Contact info, metrics, file formats
- 🔄 **Footer**: Can be updated to use ContactInfo component
- 🔄 **Header**: Can use feature flags for conditional features
- 🔄 **Contact Page**: Should use centralized contact data
- 🔄 **About Page**: Can use business information

## Next Steps

1. **Update Footer**: Replace hardcoded contact info with ContactInfo component
2. **Update Header**: Use feature flags for conditional navigation items
3. **Create Contact Page**: Use centralized contact data
4. **Update All Pages**: Replace hardcoded phone numbers and emails

## Example: Updating Phone Numbers

**Old Way** (updating each file individually):
```typescript
// advertise/page.tsx
<Link href="tel:+1-555-0123">+1 (555) 0123</Link>

// contact/page.tsx  
<Link href="tel:+1-555-0123">+1 (555) 0123</Link>

// footer/page.tsx
<Link href="tel:+1-555-0123">+1 (555) 0123</Link>
```

**New Way** (update once in config):
```typescript
// /src/config/site.ts
contact: {
  general: {
    phone: "+1 (555) 9999"  // ← Change once here
  }
}

// All pages automatically get the new number
<ContactInfo department="general" />
```

This system makes the NewsTRNT platform much easier to maintain and update!
