"use client";

import React, { useState, useEffect } from'react';
import { siteConfig } from'@/config/site';
import { showToast } from'@/lib/utils/toast';
import adminAuth from'@/lib/auth/admin-auth';
import { API_CONFIG } from'@/config/api';
import {
 EnvelopeIcon,
 ServerIcon,
 ChartBarIcon,
 GlobeIcon,
 CogIcon,
 BoltIcon,
 DocumentTextIcon,
} from'@/components/icons/AdminIcons';

const API_BASE_URL = API_CONFIG.baseURL;

// Helper function to safely get nested object values
const getNestedValue = (obj: any, path: string, defaultValue: any =''): any => {
 const keys = path.split('.');
 let current = obj;
 for (const key of keys) {
 if (current === null || current === undefined || typeof current !=='object') {
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
 if (current === null || current === undefined || typeof current !=='object') {
 return {};
 }
 current = current[key];
 }
 return current || {};
};

interface ConfigSection {
 id: string;
 title: string;
 icon: React.ReactNode;
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
 const token = adminAuth.getToken();
 const response = await fetch(`${API_BASE_URL}/admin/site-config`, {
 headers: {'Authorization': `Bearer ${token}`,'Content-Type':'application/json'
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
 if (!current[keys[i]] || typeof current[keys[i]] !=='object') {
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
 id:'contact',
 title:'Contact Information',
 icon: <EnvelopeIcon className="w-4 h-4" />,
 description:'Phone numbers, emails, and addresses'
 },
 {
 id:'business',
 title:'Business Info',
 icon: <ServerIcon className="w-4 h-4" />,
 description:'Company details, hours, and response times'
 },
 {
 id:'metrics',
 title:'Site Metrics',
 icon: <ChartBarIcon className="w-4 h-4" />,
 description:'Visitor counts and engagement stats'
 },
 {
 id:'social',
 title:'Social Media',
 icon: <GlobeIcon className="w-4 h-4" />,
 description:'Social platform links and handles'
 },
 {
 id:'technical',
 title:'Technical Settings',
 icon: <CogIcon className="w-4 h-4" />,
 description:'File formats, limits, and API settings'
 },
 {
 id:'features',
 title:'Feature Flags',
 icon: <BoltIcon className="w-4 h-4" />,
 description:'Enable/disable platform features'
 },
 {
 id:'legal',
 title:'Legal Pages',
 icon: <DocumentTextIcon className="w-4 h-4" />,
 description:'Terms, privacy policy, and legal content'
 }
 ];

 const getAffectedPages = (field: string): string[] => {
 const pageMapping: { [key: string]: string[] } = {'contactInfo.general.email': ['Contact Page','Footer','About Page'],'contactInfo.general.phone': ['Contact Page','Header','Footer'],'contactInfo.general.address': ['Contact Page','Footer','About Page'],'businessInfo.name': ['Header','Footer','About Page','All Pages (Title)'],'businessInfo.tagline': ['Homepage','About Page','Meta Description'],'socialMedia.twitter': ['Footer','Article Sharing','Contact Page'],'socialMedia.facebook': ['Footer','Article Sharing','Contact Page'],'metrics.monthlyVisitors': ['About Page','Advertise Page','Homepage Stats'],'features.newsletter': ['Footer','Article Pages','Homepage'],'features.comments': ['Article Pages','Blog Posts'],
 // Add more mappings as needed
 };
 return pageMapping[field] || ['Unknown'];
 };

 const detectChanges = (): ChangePreview[] => {
 const changesDetected: ChangePreview[] = [];
 
 const compareObjects = (original: any, current: any, prefix =''): void => {
 if (!current || typeof current !=='object') return;
 
 Object.keys(current).forEach(key => {
 const fullKey = prefix ? `${prefix}.${key}` : key;
 const originalValue = original?.[key];
 const currentValue = current[key];
 
 if (typeof currentValue ==='object' && currentValue !== null && !Array.isArray(currentValue)) {
 // Only recurse if originalValue is also an object, otherwise treat as a change
 if (typeof originalValue ==='object' && originalValue !== null) {
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
 const token = adminAuth.getToken();
 console.log('Config save - Token found:', !!token,'Token preview:', token ? token.substring(0, 20) +'...' :'none');
 
 if (!token) {
 throw new Error('No authentication token found. Please log in again.');
 }
 
 const detectedChanges = detectChanges();
 
 // Save each changed field to the database
 for (const change of detectedChanges) {
 const response = await fetch(`${API_BASE_URL}/admin/site-config/${encodeURIComponent(change.field)}`, {
 method:'PUT',
 headers: {'Authorization': `Bearer ${token}`,'Content-Type':'application/json'
 },
 body: JSON.stringify({
 value: change.newValue, // Send as-is, Prisma Json type handles serialization
 type: typeof change.newValue ==='boolean' ?'boolean' : 
 typeof change.newValue ==='number' ?'number' :'string',
 label: change.field.split('.').pop() || change.field,
 group: activeSection,
 isPublic: true
 })
 });
 
 console.log('Config save response for', change.field,'Status:', response.status,'OK:', response.ok);
 
 if (!response.ok) {
 const errorText = await response.text();
 console.error('Failed to save config:', change.field,'Status:', response.status,'Response:', errorText);
 throw new Error(`Failed to save ${change.field}: ${response.status} ${errorText}`);
 }
 }
 
 // Update originalConfig to match current config (no more pending changes)
 setOriginalConfig(JSON.parse(JSON.stringify(config)));
 setHasChanges(false);
 setLastSaved(new Date());
 setShowPreview(false);
 
 showToast('Configuration saved successfully! Changes are now live on the site.','success');
 
 } catch (error) {
 console.error('Error saving config:', error);
 showToast('Error saving configuration. Please try again.','error');
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
 if (!current[keys[i]] || typeof current[keys[i]] !=='object') {
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
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Contact Information</h3>
 
 {/* General Contact */}
 <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <h4 className="font-medium text-[rgb(var(--foreground))] mb-4">General Contact</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Email</label>
 <input
 type="email"
 value={getNestedValue(config,'contact.general.email')}
 onChange={(e) => updateConfig('contact','general.email', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Phone</label>
 <input
 type="tel"
 value={getNestedValue(config,'contact.general.phone')}
 onChange={(e) => updateConfig('contact','general.phone', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 <div className="mt-4">
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Street Address</label>
 <input
 type="text"
 value={getNestedValue(config,'contact.general.address.street')}
 onChange={(e) => updateConfig('contact','general.address.street', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">City</label>
 <input
 type="text"
 value={getNestedValue(config,'contact.general.address.city')}
 onChange={(e) => updateConfig('contact','general.address.city', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">State</label>
 <input
 type="text"
 value={getNestedValue(config,'contact.general.address.state')}
 onChange={(e) => updateConfig('contact','general.address.state', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">ZIP</label>
 <input
 type="text"
 value={getNestedValue(config,'contact.general.address.zip')}
 onChange={(e) => updateConfig('contact','general.address.zip', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Country</label>
 <input
 type="text"
 value={getNestedValue(config,'contact.general.address.country')}
 onChange={(e) => updateConfig('contact','general.address.country', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 </div>

 {/* Department Contacts */}
 {Object.entries(getNestedObject(config,'contact.departments')).map(([dept, contact]: [string, any]) => (
 <div key={dept} className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <h4 className="font-medium text-[rgb(var(--foreground))] mb-4 capitalize">{dept} Department</h4>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Name</label>
 <input
 type="text"
 value={contact?.name ||''}
 onChange={(e) => updateConfig('contact', `departments.${dept}.name`, e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Email</label>
 <input
 type="email"
 value={contact?.email ||''}
 onChange={(e) => updateConfig('contact', `departments.${dept}.email`, e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Phone</label>
 <input
 type="tel"
 value={contact?.phone ||''}
 onChange={(e) => updateConfig('contact', `departments.${dept}.phone`, e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 );

 const renderBusinessSection = () => (
 <div className="space-y-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Business Information</h3>
 
 <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Business Name</label>
 <input
 type="text"
 value={getNestedValue(config,'name')}
 onChange={(e) => updateConfig('business','name', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Tagline</label>
 <input
 type="text"
 value={getNestedValue(config,'tagline')}
 onChange={(e) => updateConfig('business','tagline', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 
 <div className="mt-4">
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Description</label>
 <textarea
 value={getNestedValue(config,'description')}
 onChange={(e) => updateConfig('business','description', e.target.value)}
 rows={3}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Website URL</label>
 <input
 type="url"
 value={getNestedValue(config,'url')}
 onChange={(e) => updateConfig('business','url', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Weekday Hours</label>
 <input
 type="text"
 value={getNestedValue(config,'business.businessHours.weekdays')}
 onChange={(e) => updateConfig('business','businessHours.weekdays', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Weekend Hours</label>
 <input
 type="text"
 value={getNestedValue(config,'business.businessHours.weekends')}
 onChange={(e) => updateConfig('business','businessHours.weekends', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 </div>
 </div>
 );

 const renderMetricsSection = () => (
 <div className="space-y-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Site Metrics</h3>
 
 <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Monthly Visitors</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.monthlyVisitors')}
 onChange={(e) => updateConfig('metrics','monthlyVisitors', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Page Views</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.pageViews')}
 onChange={(e) => updateConfig('metrics','pageViews', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Email Subscribers</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.emailSubscribers')}
 onChange={(e) => updateConfig('metrics','emailSubscribers', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Social Followers</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.socialFollowers')}
 onChange={(e) => updateConfig('metrics','socialFollowers', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Average Session Time</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.averageSessionTime')}
 onChange={(e) => updateConfig('metrics','averageSessionTime', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Bounce Rate</label>
 <input
 type="text"
 value={getNestedValue(config,'metrics.bounceRate')}
 onChange={(e) => updateConfig('metrics','bounceRate', e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 </div>
 </div>
 );

 const renderSocialSection = () => (
 <div className="space-y-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Social Media</h3>
 
 <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {Object.entries(getNestedObject(config,'social')).map(([platform, url]: [string, any]) => (
 <div key={platform}>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2 capitalize">{platform}</label>
 <input
 type="url"
 value={(url as string) ||''}
 onChange={(e) => updateConfig('social', platform, e.target.value)}
 className="w-full bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-[rgb(var(--foreground))]"
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
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Feature Flags</h3>
 
 <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4">
 <div className="space-y-4">
 {Object.entries(getNestedObject(config,'features')).map(([feature, enabled]: [string, any]) => (
 <div key={feature} className="flex items-center justify-between p-3 bg-[rgb(var(--background))] rounded-lg">
 <div>
 <div className="font-medium text-[rgb(var(--foreground))] capitalize">
 {feature.replace(/([A-Z])/g,' $1').trim()}
 </div>
 <div className="text-sm text-[rgb(var(--muted-foreground))]">
 {feature ==='newsletter' &&'Enable newsletter subscription functionality'}
 {feature ==='comments' &&'Allow user comments on articles'}
 {feature ==='darkMode' &&'Enable dark mode toggle'}
 {feature ==='notifications' &&'Push notifications system'}
 {feature ==='socialSharing' &&'Social media sharing buttons'}
 {feature ==='search' &&'Site-wide search functionality'}
 {feature ==='analytics' &&'Analytics and tracking'}
 </div>
 </div>
 <button
 role="switch"
 aria-checked={!!enabled}
 onClick={() => updateConfig('features', feature, !enabled)}
 className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]/40 ${
 enabled ?'bg-[rgb(var(--primary))]' :'bg-[rgb(var(--muted))]'
 }`}
 >
 <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-[rgb(var(--card))] shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
 enabled ?'translate-x-5' :'translate-x-0'
 }`} />
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 );

 const renderCurrentSection = () => {
 switch (activeSection) {
 case'contact': return renderContactSection();
 case'business': return renderBusinessSection();
 case'metrics': return renderMetricsSection();
 case'social': return renderSocialSection();
 case'features': return renderFeaturesSection();
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
 <div className="space-y-6">

 {/* Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Site Configuration</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
 Manage all site settings from this central location
 {lastSaved && (
 <span className="ml-2 text-emerald-600">
 &bull; Last saved: {lastSaved.toLocaleString()}
 </span>
 )}
 </p>
 </div>
 <div className="flex gap-2">
 {hasChanges && (
 <button
 onClick={handlePreviewChanges}
 className="h-9 rounded-lg border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-400"
 >
 Preview Changes
 </button>
 )}
 <button
 onClick={handleSaveChanges}
 disabled={!hasChanges || isSaving}
 className="h-9 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90 disabled:opacity-40 disabled:cursor-not-allowed"
 >
 {isSaving ?'Saving...' :'Save Changes'}
 </button>
 </div>
 </div>

 {/* Change Counter */}
 {hasChanges && (
 <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/10">
 <span className="text-sm text-amber-700 dark:text-amber-300">
 {detectChanges().length} unsaved change(s) — save when ready.
 </span>
 </div>
 )}

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
 {/* Sidebar */}
 <nav className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
 {configSections.map((section) => {
 const active = activeSection === section.id;
 return (
 <button
 key={section.id}
 onClick={() => setActiveSection(section.id)}
 className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
 active
 ?'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
 :'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]'
 }`}
 >
 <span className="shrink-0">{section.icon}</span>
 <div className="min-w-0">
 <div className="text-sm font-medium truncate">{section.title}</div>
 <div className="text-[11px] opacity-60 truncate">{section.description}</div>
 </div>
 </button>
 );
 })}
 </nav>

 {/* Main Content */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
 {renderCurrentSection()}
 </div>
 </div>

 {/* Preview Modal */}
 {showPreview && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
 <div className="mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
 <div className="border-b border-[rgb(var(--border))] px-5 py-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Preview Changes</h3>
 <button
 onClick={() => setShowPreview(false)}
 className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
 </button>
 </div>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
 Review the changes below before applying them to your site
 </p>
 </div>
 
 <div className="max-h-96 overflow-y-auto p-5">
 {changes.length === 0 ? (
 <p className="text-sm text-[rgb(var(--muted-foreground))]">No changes detected</p>
 ) : (
 <div className="space-y-3">
 {changes.map((change, index) => (
 <div key={index} className="rounded-lg border border-[rgb(var(--border))] p-4">
 <div className="mb-2 text-sm font-medium text-[rgb(var(--foreground))]">
 {change.field.split('.').pop()?.replace(/([A-Z])/g,' $1').trim()}
 </div>
 <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
 <div>
 <div className="mb-1 text-[11px] uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Current</div>
 <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/10 dark:text-red-400">
 {JSON.stringify(change.currentValue)}
 </div>
 </div>
 <div>
 <div className="mb-1 text-[11px] uppercase tracking-wider text-[rgb(var(--muted-foreground))]">New</div>
 <div className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
 {JSON.stringify(change.newValue)}
 </div>
 </div>
 </div>
 <div>
 <div className="mb-1 text-[11px] uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Affected Pages</div>
 <div className="flex flex-wrap gap-1">
 {change.affectedPages.map((page, i) => (
 <span
 key={i}
 className="rounded-md bg-[rgb(var(--primary))]/10 px-2 py-0.5 text-[11px] font-medium text-[rgb(var(--primary))]"
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
 
 <div className="flex justify-end gap-2 border-t border-[rgb(var(--border))] px-5 py-4">
 <button
 onClick={() => setShowPreview(false)}
 className="h-9 rounded-lg border border-[rgb(var(--border))] px-4 text-sm font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10"
 >
 Cancel
 </button>
 <button
 onClick={handleSaveChanges}
 disabled={isSaving}
 className="h-9 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50"
 >
 {isSaving ?'Applying...' :'Apply Changes'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default AdminConfigPage;