// Site-wide configuration
export const siteConfig = {
  // Basic Site Information
  name: "NewsTRNT",
  tagline: "The Road Not Taken",
  description: "Independent news platform bringing you diverse perspectives and underreported stories - the complete picture, powered by smart technology",
  url: "https://newstrnt.com",
  
  // Contact Information
  contact: {
    general: {
      email: "contact@newstrnt.com",
      phone: "+91-000-000-0000" // optional general line
    },
    
    departments: {
      advertising: {
        email: "advertising@newstrnt.com",
        phone: "+91-000-000-0001",
        name: "Advertising Team"
      },
      support: {
        email: "support@newstrnt.com",
        phone: "+91-000-000-0002",
        name: "Customer Support"
      },
      editorial: {
        email: "editorial@newstrnt.com",
        phone: "+91-000-000-0003",
        name: "Editorial Team"
      },
      press: {
        email: "press@newstrnt.com",
        phone: "+91-000-000-0004",
        name: "Press Relations"
      },
      careers: {
        email: "careers@newstrnt.com",
        phone: "+91-000-000-0005",
        name: "Human Resources"
      },
      legal: {
        email: "legal@newstrnt.com",
        phone: "+91-000-000-0006",
        name: "Legal Department"
      }
    }
  },

  // Social Media Links
  social: {
    twitter: "https://twitter.com/newstrnt",
    facebook: "https://facebook.com/newstrnt",
    linkedin: "https://linkedin.com/company/newstrnt",
    instagram: "https://instagram.com/newstrnt",
    youtube: "https://youtube.com/@newstrnt",
    reddit: "https://reddit.com/r/newstrnt"
  },

  // Business Information
  business: {
    founded: "2024",
    headquarters: "India",
    timezone: "IST",
    responseTime: {
      support: "24 hours",
      advertising: "2-3 business days",
      general: "48 hours"
    },
    businessHours: {
      weekdays: "9 AM – 6 PM IST",
      weekends: "Closed"
    }
  },

  // Technical Information
  technical: {
    apiVersion: "v1",
    supportedFormats: {
      images: ["JPG", "PNG", "GIF", "WebP"],
      videos: ["MP4", "WebM", "MOV"],
      documents: ["PDF", "DOC", "DOCX", "TXT"]
    },
    maxFileSize: "10MB",
    cdn: "https://cdn.newstrnt.com"
  },

  // Analytics & Metrics (for advertising page)
  metrics: {
    averageSessionTime: "5+ minutes",
    returningUsers: "65%"
  },

  // Legal Pages
  legal: {
    termsUrl: "/terms",
    privacyUrl: "/privacy",
    cookiesUrl: "/cookies",
    disclaimerUrl: "/disclaimer"
  },

  // Feature Flags
  features: {
    liveChat: true,
    newsletter: true,
    pushNotifications: true,
    darkMode: true,
    multiLanguage: false,
    paywall: false
  }
};

// Helper functions
export const getContactByDepartment = (department: keyof typeof siteConfig.contact.departments) => {
  return siteConfig.contact.departments[department];
};

export const getFormattedAddress = () => {
  return 'India';
};

export const getBusinessHours = () => {
  return 'Available via email';
};

// Export individual sections for easier imports
export const contactInfo = siteConfig.contact;
export const socialLinks = siteConfig.social;
export const businessInfo = siteConfig.business;
export const siteMetrics = siteConfig.metrics;
