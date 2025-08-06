// Site-wide configuration
export const siteConfig = {
  // Basic Site Information
  name: "NewsNerve",
  tagline: "Your world. Your interests. Your news.",
  description: "AI-powered news platform delivering personalized news experiences",
  url: "https://newsnerve.com",
  
  // Contact Information
  contact: {
    // General Contact
    general: {
      email: "contact@newsnerve.com",
      phone: "+1 (555) 0123",
      address: {
        street: "123 News Street",
        city: "San Francisco",
        state: "CA",
        zip: "94102",
        country: "USA"
      }
    },
    
    // Department-specific Contacts
    departments: {
      advertising: {
        email: "advertising@newsnerve.com",
        phone: "+1 (555) 0124",
        name: "Advertising Team"
      },
      support: {
        email: "support@newsnerve.com",
        phone: "+1 (555) 0125",
        name: "Customer Support"
      },
      editorial: {
        email: "editorial@newsnerve.com",
        phone: "+1 (555) 0126",
        name: "Editorial Team"
      },
      press: {
        email: "press@newsnerve.com",
        phone: "+1 (555) 0127",
        name: "Press Relations"
      },
      careers: {
        email: "careers@newsnerve.com",
        phone: "+1 (555) 0128",
        name: "Human Resources"
      },
      legal: {
        email: "legal@newsnerve.com",
        phone: "+1 (555) 0129",
        name: "Legal Department"
      }
    }
  },

  // Social Media Links
  social: {
    twitter: "https://twitter.com/newsnerve",
    facebook: "https://facebook.com/newsnerve",
    linkedin: "https://linkedin.com/company/newsnerve",
    instagram: "https://instagram.com/newsnerve",
    youtube: "https://youtube.com/@newsnerve",
    reddit: "https://reddit.com/r/newsnerve"
  },

  // Business Information
  business: {
    founded: "2024",
    employees: "50-100",
    headquarters: "San Francisco, CA",
    timezone: "PST",
    businessHours: {
      weekdays: "9:00 AM - 6:00 PM PST",
      weekends: "10:00 AM - 4:00 PM PST"
    },
    responseTime: {
      support: "24 hours",
      advertising: "2-3 business days",
      general: "48 hours"
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
    cdn: "https://cdn.newsnerve.com"
  },

  // Analytics & Metrics (for advertising page)
  metrics: {
    monthlyVisitors: "2.5M+",
    pageViews: "8M+",
    emailSubscribers: "500K+",
    socialFollowers: "1M+",
    averageSessionTime: "5+ minutes",
    bounceRate: "35%",
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
  const addr = siteConfig.contact.general.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`;
};

export const getBusinessHours = () => {
  return `${siteConfig.business.businessHours.weekdays} (Weekdays), ${siteConfig.business.businessHours.weekends} (Weekends)`;
};

// Export individual sections for easier imports
export const contactInfo = siteConfig.contact;
export const socialLinks = siteConfig.social;
export const businessInfo = siteConfig.business;
export const siteMetrics = siteConfig.metrics;
