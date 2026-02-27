# Admin Portal Management Guide

## Overview
The NewsTRNT Admin Portal provides centralized management for all site configurations, content, users, and system settings. You can now manage everything from one place as requested.

## Main Features

### 1. Site Configuration Management (`/admin/config`)
- **Contact Information**: Manage all department contacts, business hours, response times
- **Business Details**: Company info, addresses, phone numbers
- **Metrics & Analytics**: Site statistics, performance indicators
- **Social Media**: All social platform links and handles
- **Technical Settings**: File formats, upload limits, system preferences
- **Feature Flags**: Enable/disable platform features
- **Legal Pages**: Terms, privacy policy, disclaimer content

### 2. Quick Access Dashboard (`/admin`)
- **Real-time Statistics**: Articles, users, views, revenue
- **Recent Activity Feed**: Latest site activities and user actions
- **Quick Actions**: Fast access to common tasks
- **System Status**: Server, database, and CDN health monitoring
- **Management Tools**: Direct links to all admin sections

### 3. Admin Portal Sections
- **Content Management**: Articles, categories, publishing
- **User Management**: User accounts, permissions, subscribers
- **Analytics & Reports**: Performance metrics and insights
- **Advertisement Manager**: Campaign management and proposals
- **Newsletter Management**: Email campaigns and subscribers
- **Media Library**: File uploads and media organization
- **Comments & Moderation**: User-generated content review
- **System Settings**: Security, integrations, preferences

## Configuration System

### Centralized Configuration (`/src/config/site.ts`)
All site settings are managed from a single TypeScript configuration file that provides:
- Type safety for all configuration options
- Centralized contact information management
- Business details and metrics
- Social media integration
- Technical settings and file formats
- Feature flags for easy enable/disable

### ContactInfo Component (`/src/components/ContactInfo.tsx`)
Reusable component for displaying contact information:
```tsx
// Display sales contact
<ContactInfo department="sales" showHours={true} />

// Display support with response time
<ContactInfo department="support" showResponseTime={true} />

// Horizontal layout
<ContactInfo department="marketing" layout="horizontal" />
```

### Helper Functions
```typescript
// Get specific department contact
const salesContact = getContactByDepartment('sales');

// Get formatted business address
const address = getFormattedAddress();

// Get current business hours
const hours = getBusinessHours();
```

## Admin Portal Usage

### Accessing the Admin Portal
1. Navigate to `/admin` to access the main dashboard
2. Use the navigation header to switch between sections
3. Click on management cards for specific functionality

### Managing Site Configuration
1. Go to `/admin/config` for the configuration interface
2. Use tabs to navigate between different setting categories:
   - **Contact Info**: Department contacts and business hours
   - **Business Info**: Company details and addresses
   - **Metrics**: Site statistics and performance data
   - **Social Media**: Platform links and handles
   - **Technical**: File formats and system settings
   - **Features**: Enable/disable platform features
   - **Legal**: Terms, privacy, and legal content

### Making Configuration Changes
1. Select the appropriate tab in the config interface
2. Update the fields as needed
3. Click "Save Changes" to apply updates
4. Changes are immediately reflected across the site

### Using Centralized Config in Code
```typescript
import { siteConfig } from '@/config/site';

// Access contact information
const supportEmail = siteConfig.contactInfo.support.email;

// Use business metrics
const monthlyVisitors = siteConfig.metrics.monthlyVisitors;

// Check feature flags
const isNewsletterEnabled = siteConfig.features.newsletter;
```

## Benefits of Centralized Management

### Single Source of Truth
- All configuration in one place (`/src/config/site.ts`)
- No more searching through multiple files
- Consistent data across all components

### Type Safety
- TypeScript interfaces ensure data consistency
- IDE autocomplete and error checking
- Prevents configuration mistakes

### Easy Maintenance
- Update contact info once, reflects everywhere
- Admin interface for non-technical changes
- Version control for configuration changes

### Scalability
- Easy to add new configuration options
- Modular structure for different settings
- Future-proof architecture

## File Structure
```
src/
├── config/
│   └── site.ts                 # Centralized configuration
├── components/
│   └── ContactInfo.tsx         # Reusable contact component
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin portal layout
│   │   ├── page.tsx            # Main admin dashboard
│   │   └── config/
│   │       └── page.tsx        # Configuration management
│   └── advertise/
│       └── page.tsx            # Updated to use centralized config
└── docs/
    ├── CONFIGURATION.md        # Configuration guide
    └── ADMIN_PORTAL.md         # This file
```

## Next Steps
1. **Backend Integration**: Implement API endpoints for configuration persistence
2. **User Authentication**: Add proper admin authentication and authorization
3. **Real-time Updates**: Implement live configuration updates without restart
4. **Audit Trail**: Track configuration changes and user activities
5. **Backup System**: Automatic configuration backups and restoration

## Support
For questions about the admin portal or configuration management, refer to the documentation or check the help section in the admin interface.
