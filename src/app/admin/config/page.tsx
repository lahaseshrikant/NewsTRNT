"use client";

import React, { useState, useEffect } from 'react';
import { siteConfig } from '@/config/site';
import Breadcrumb from '@/components/Breadcrumb';
import { showToast } from '@/lib/toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to safely get nested object values
const getNestedValue = (obj: any, path: string, defaultValue: any = ''): any => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  return current ?? defaultValue;
};

// Helper function to safely get nested object
const getNestedObject = (obj: any, path: string): any => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return {};
    }
    current = current[key];
  }
  return current || {};
};

interface ConfigSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface ChangePreview {
  field: string;
  currentValue: any;
  newValue: any;
  affectedPages: string[];
}

const AdminConfigPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('contact');
  const [config, setConfig] = useState(siteConfig);
  const [originalConfig, setOriginalConfig] = useState(siteConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [changes, setChanges] = useState<ChangePreview[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved config from database
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/admin/site-config`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.config && Object.keys(data.config).length > 0) {
            // Deep clone the default config first
            const mergedConfig = JSON.parse(JSON.stringify(siteConfig));
            
            // Deep merge function
            const deepMerge = (target: any, source: any, path: string[]) => {
              const keys = path;
              if (keys.length === 0) return;
              
              let current = target;
              for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                  current[keys[i]] = {};
                }
                current = current[keys[i]];
              }
              if (current) {
                current[keys[keys.length - 1]] = source;
              }
            };
            
            Object.entries(data.config).forEach(([key, value]) => {
              try {
                // Value is already parsed by JSON response, use it directly
                const parsed = value;
                const keys = key.split('.');
                deepMerge(mergedConfig, parsed, keys);
              } catch (e) {
                console.error('Error merging config key:', key, e);
              }
            });
            setConfig(mergedConfig);
            // Also set as original so we can detect changes from loaded state
            setOriginalConfig(JSON.parse(JSON.stringify(mergedConfig)));
          }
        }
      } catch (error) {
        console.error('Error loading site config:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  const configSections: ConfigSection[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      icon: '📞',
      description: 'Manage phone numbers, emails, and addresses'
    },
    {
      id: 'business',
      title: 'Business Info',
      icon: '🏢',
      description: 'Company details, hours, and response times'
    },
    {
      id: 'metrics',
      title: 'Site Metrics',
      icon: '📊',
      description: 'Update visitor counts and engagement stats'
    },
    {
      id: 'social',
      title: 'Social Media',
      icon: '📱',
      description: 'Social platform links and handles'
    },
    {
      id: 'technical',
      title: 'Technical Settings',
      icon: '⚙️',
      description: 'File formats, limits, and API settings'
    },
    {
      id: 'features',
      title: 'Feature Flags',
      icon: '🚀',
      description: 'Enable/disable platform features'
    },
    {
      id: 'legal',
      title: 'Legal Pages',
      icon: '📋',
      description: 'Terms, privacy policy, and legal content'
    }
  ];

  const getAffectedPages = (field: string): string[] => {
    const pageMapping: { [key: string]: string[] } = {
      'contactInfo.general.email': ['Contact Page', 'Footer', 'About Page'],
      'contactInfo.general.phone': ['Contact Page', 'Header', 'Footer'],
      'contactInfo.general.address': ['Contact Page', 'Footer', 'About Page'],
      'businessInfo.name': ['Header', 'Footer', 'About Page', 'All Pages (Title)'],
      'businessInfo.tagline': ['Homepage', 'About Page', 'Meta Description'],
      'socialMedia.twitter': ['Footer', 'Article Sharing', 'Contact Page'],
      'socialMedia.facebook': ['Footer', 'Article Sharing', 'Contact Page'],
      'metrics.monthlyVisitors': ['About Page', 'Advertise Page', 'Homepage Stats'],
      'features.newsletter': ['Footer', 'Article Pages', 'Homepage'],
      'features.comments': ['Article Pages', 'Blog Posts'],
      // Add more mappings as needed
    };
    return pageMapping[field] || ['Unknown'];
  };

  const detectChanges = (): ChangePreview[] => {
    const changesDetected: ChangePreview[] = [];
    
    const compareObjects = (original: any, current: any, prefix = ''): void => {
      if (!current || typeof current !== 'object') return;
      
      Object.keys(current).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const originalValue = original?.[key];
        const currentValue = current[key];
        
        if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
          // Only recurse if originalValue is also an object, otherwise treat as a change
          if (typeof originalValue === 'object' && originalValue !== null) {
            compareObjects(originalValue, currentValue, fullKey);
          } else {
            // The structure changed or originalValue was undefined
            changesDetected.push({
              field: fullKey,
              currentValue: originalValue,
              newValue: currentValue,
              affectedPages: getAffectedPages(fullKey)
            });
          }
        } else if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          changesDetected.push({
            field: fullKey,
            currentValue: originalValue,
            newValue: currentValue,
            affectedPages: getAffectedPages(fullKey)
          });
        }
      });
    };
    
    compareObjects(originalConfig, config);
    return changesDetected;
  };

  const handlePreviewChanges = () => {
    const detectedChanges = detectChanges();
    setChanges(detectedChanges);
    setShowPreview(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      console.log('Config save - Token found:', !!token, 'Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const detectedChanges = detectChanges();
      
      // Save each changed field to the database
      for (const change of detectedChanges) {
        const response = await fetch(`${API_BASE_URL}/api/admin/site-config/${encodeURIComponent(change.field)}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: change.newValue, // Send as-is, Prisma Json type handles serialization
            type: typeof change.newValue === 'boolean' ? 'boolean' : 
                  typeof change.newValue === 'number' ? 'number' : 'string',
            label: change.field.split('.').pop() || change.field,
            group: activeSection,
            isPublic: true
          })
        });
        
        console.log('Config save response for', change.field, 'Status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to save config:', change.field, 'Status:', response.status, 'Response:', errorText);
          throw new Error(`Failed to save ${change.field}: ${response.status} ${errorText}`);
        }
      }
      
      // Update originalConfig to match current config (no more pending changes)
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setHasChanges(false);
      setLastSaved(new Date());
      setShowPreview(false);
      
      showToast('Configuration saved successfully! Changes are now live on the site.', 'success');
      
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Error saving configuration. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig(prev => {
      // Deep clone the config to avoid mutation issues
      const newConfig = JSON.parse(JSON.stringify(prev));
      
      // Combine section and field to get the full path
      const fullPath = section ? `${section}.${field}` : field;
      const keys = fullPath.split('.');
      let current = newConfig;
      
      // Navigate to the parent object, creating intermediate objects if needed
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the value
      if (current) {
        current[keys[keys.length - 1]] = value;
      }
      return newConfig;
    });
  };

  const renderContactSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
      
      {/* General Contact */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-4">General Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={getNestedValue(config, 'contact.general.email')}
              onChange={(e) => updateConfig('contact', 'general.email', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <input
              type="tel"
              value={getNestedValue(config, 'contact.general.phone')}
              onChange={(e) => updateConfig('contact', 'general.phone', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">Street Address</label>
          <input
            type="text"
            value={getNestedValue(config, 'contact.general.address.street')}
            onChange={(e) => updateConfig('contact', 'general.address.street', e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City</label>
            <input
              type="text"
              value={getNestedValue(config, 'contact.general.address.city')}
              onChange={(e) => updateConfig('contact', 'general.address.city', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">State</label>
            <input
              type="text"
              value={getNestedValue(config, 'contact.general.address.state')}
              onChange={(e) => updateConfig('contact', 'general.address.state', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">ZIP</label>
            <input
              type="text"
              value={getNestedValue(config, 'contact.general.address.zip')}
              onChange={(e) => updateConfig('contact', 'general.address.zip', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Country</label>
            <input
              type="text"
              value={getNestedValue(config, 'contact.general.address.country')}
              onChange={(e) => updateConfig('contact', 'general.address.country', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Department Contacts */}
      {Object.entries(getNestedObject(config, 'contact.departments')).map(([dept, contact]: [string, any]) => (
        <div key={dept} className="bg-muted/20 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-4 capitalize">{dept} Department</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <input
                type="text"
                value={contact?.name || ''}
                onChange={(e) => updateConfig('contact', `departments.${dept}.name`, e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={contact?.email || ''}
                onChange={(e) => updateConfig('contact', `departments.${dept}.email`, e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <input
                type="tel"
                value={contact?.phone || ''}
                onChange={(e) => updateConfig('contact', `departments.${dept}.phone`, e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBusinessSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
      
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
            <input
              type="text"
              value={getNestedValue(config, 'name')}
              onChange={(e) => updateConfig('business', 'name', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tagline</label>
            <input
              type="text"
              value={getNestedValue(config, 'tagline')}
              onChange={(e) => updateConfig('business', 'tagline', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            value={getNestedValue(config, 'description')}
            onChange={(e) => updateConfig('business', 'description', e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Website URL</label>
            <input
              type="url"
              value={getNestedValue(config, 'url')}
              onChange={(e) => updateConfig('business', 'url', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Weekday Hours</label>
            <input
              type="text"
              value={getNestedValue(config, 'business.businessHours.weekdays')}
              onChange={(e) => updateConfig('business', 'businessHours.weekdays', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Weekend Hours</label>
            <input
              type="text"
              value={getNestedValue(config, 'business.businessHours.weekends')}
              onChange={(e) => updateConfig('business', 'businessHours.weekends', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Site Metrics</h3>
      
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Monthly Visitors</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.monthlyVisitors')}
              onChange={(e) => updateConfig('metrics', 'monthlyVisitors', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Page Views</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.pageViews')}
              onChange={(e) => updateConfig('metrics', 'pageViews', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Subscribers</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.emailSubscribers')}
              onChange={(e) => updateConfig('metrics', 'emailSubscribers', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Social Followers</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.socialFollowers')}
              onChange={(e) => updateConfig('metrics', 'socialFollowers', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Average Session Time</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.averageSessionTime')}
              onChange={(e) => updateConfig('metrics', 'averageSessionTime', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bounce Rate</label>
            <input
              type="text"
              value={getNestedValue(config, 'metrics.bounceRate')}
              onChange={(e) => updateConfig('metrics', 'bounceRate', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Social Media</h3>
      
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(getNestedObject(config, 'social')).map(([platform, url]: [string, any]) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-foreground mb-2 capitalize">{platform}</label>
              <input
                type="url"
                value={(url as string) || ''}
                onChange={(e) => updateConfig('social', platform, e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                placeholder={`https://${platform}.com/yourhandle`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Feature Flags</h3>
      
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="space-y-4">
          {Object.entries(getNestedObject(config, 'features')).map(([feature, enabled]: [string, any]) => (
            <div key={feature} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <div className="font-medium text-foreground capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {feature === 'newsletter' && 'Enable newsletter subscription functionality'}
                  {feature === 'comments' && 'Allow user comments on articles'}
                  {feature === 'darkMode' && 'Enable dark mode toggle'}
                  {feature === 'notifications' && 'Push notifications system'}
                  {feature === 'socialSharing' && 'Social media sharing buttons'}
                  {feature === 'search' && 'Site-wide search functionality'}
                  {feature === 'analytics' && 'Analytics and tracking'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!enabled}
                  onChange={(e) => updateConfig('features', feature, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'contact': return renderContactSection();
      case 'business': return renderBusinessSection();
      case 'metrics': return renderMetricsSection();
      case 'social': return renderSocialSection();
      case 'features': return renderFeaturesSection();
      default: return renderContactSection();
    }
  };

  // Only detect changes when user clicks Preview or Save, not on every render
  const [hasChanges, setHasChanges] = useState(false);
  
  // Check for changes when config updates (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const changesDetected = detectChanges();
      setHasChanges(changesDetected.length > 0);
    }, 500);
    return () => clearTimeout(timer);
  }, [config]);

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Site Configuration' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Site Configuration</h1>
            <p className="text-muted-foreground">
              Manage all site settings from this central location
              {lastSaved && (
                <span className="ml-2 text-green-600">
                  • Last saved: {lastSaved.toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            {hasChanges && (
              <button
                onClick={handlePreviewChanges}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                👁️ Preview Changes
              </button>
            )}
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasChanges && !isSaving
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Change Counter */}
        {hasChanges && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800 dark:text-yellow-400">⚠️</span>
              <span className="text-yellow-800 dark:text-yellow-400 font-medium">
                {detectChanges().length} unsaved change(s) detected
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Configuration Sections</h3>
              <nav className="space-y-2">
                {configSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{section.icon}</span>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-70">{section.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-6">
              {renderCurrentSection()}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Preview Changes</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-muted-foreground mt-2">
                  Review the changes below before applying them to your site
                </p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {changes.length === 0 ? (
                  <p className="text-muted-foreground">No changes detected</p>
                ) : (
                  <div className="space-y-4">
                    {changes.map((change, index) => (
                      <div key={index} className="bg-muted/20 rounded-lg p-4">
                        <div className="font-medium text-foreground mb-2">
                          {change.field.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Value:</div>
                            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded text-sm">
                              {JSON.stringify(change.currentValue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">New Value:</div>
                            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded text-sm">
                              {JSON.stringify(change.newValue)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Affected Pages:</div>
                          <div className="flex flex-wrap gap-1">
                            {change.affectedPages.map((page, i) => (
                              <span
                                key={i}
                                className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded text-xs"
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Applying Changes...' : 'Apply Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfigPage;

