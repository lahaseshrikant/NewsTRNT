"use client";

import { useState, useEffect, useCallback } from'react';
import { API_CONFIG } from'@/config/api';
import adminAuth from'@/lib/auth/admin-auth';

interface ApiIntegration {
 id: string;
 name: string;
 description: string;
 category:'news' |'ai' |'analytics' |'social' |'payment' |'notification' |'storage' |'market';
 icon: string;
 status:'connected' |'disconnected' |'error' |'pending';
 lastSync?: string;
 rateLimit?: string;
 usage?: { current: number; limit: number };
}

const DEFAULT_INTEGRATIONS: ApiIntegration[] = [
 { id:'newsapi', name:'NewsAPI', description:'Fetch headlines and breaking news from 80,000+ sources', category:'news', icon:'📰', status:'disconnected', rateLimit:'100 req/day' },
 { id:'gnews', name:'GNews', description:'Google News aggregation with multi-language support', category:'news', icon:'🌐', status:'disconnected', rateLimit:'100 req/day' },
 { id:'mediastack', name:'Mediastack', description:'Real-time worldwide news data via REST API', category:'news', icon:'📡', status:'disconnected', rateLimit:'500 req/mo' },
 { id:'openai', name:'OpenAI GPT', description:'AI-powered article summarization, tagging, and content generation', category:'ai', icon:'🤖', status:'disconnected', rateLimit:'Token-based' },
 { id:'gemini', name:'Google Gemini', description:'Multi-modal AI for content analysis and generation', category:'ai', icon:'💎', status:'disconnected', rateLimit:'Token-based' },
 { id:'google-analytics', name:'Google Analytics 4', description:'Website traffic and user behavior analytics', category:'analytics', icon:'📊', status:'disconnected' },
 { id:'twitter', name:'X / Twitter API', description:'Social sharing, trending topics, and auto-posting', category:'social', icon:'🐦', status:'disconnected', rateLimit:'300 req/15min' },
 { id:'facebook', name:'Meta Graph API', description:'Facebook and Instagram content sharing and insights', category:'social', icon:'📘', status:'disconnected' },
 { id:'stripe', name:'Stripe', description:'Subscription billing and payment processing', category:'payment', icon:'💳', status:'disconnected' },
 { id:'razorpay', name:'Razorpay', description:'Payment gateway for Indian market with UPI support', category:'payment', icon:'💰', status:'disconnected' },
 { id:'firebase-fcm', name:'Firebase FCM', description:'Push notification delivery to web and mobile', category:'notification', icon:'🔔', status:'disconnected' },
 { id:'sendgrid', name:'SendGrid', description:'Transactional and marketing email delivery', category:'notification', icon:'✉️', status:'disconnected', rateLimit:'100 emails/day free' },
 { id:'cloudinary', name:'Cloudinary', description:'Image and video optimization, transformation, and CDN', category:'storage', icon:'☁️', status:'disconnected' },
 { id:'aws-s3', name:'AWS S3', description:'Scalable object storage for media files and backups', category:'storage', icon:'🗄️', status:'disconnected' },
 { id:'tradingview', name:'TradingView', description:'Real-time stock and crypto market data widgets', category:'market', icon:'📈', status:'disconnected' },
 { id:'alpha-vantage', name:'Alpha Vantage', description:'Stock, forex, and cryptocurrency market data API', category:'market', icon:'💹', status:'disconnected', rateLimit:'5 req/min' },
];

const CATEGORIES = [
 { key:'all', label:'All', icon:'🔗' },
 { key:'news', label:'News Sources', icon:'📰' },
 { key:'ai', label:'AI Services', icon:'🤖' },
 { key:'analytics', label:'Analytics', icon:'📊' },
 { key:'social', label:'Social Media', icon:'📱' },
 { key:'payment', label:'Payments', icon:'💳' },
 { key:'notification', label:'Notifications', icon:'🔔' },
 { key:'storage', label:'Storage & CDN', icon:'☁️' },
 { key:'market', label:'Market Data', icon:'📈' },
];

export default function ExternalApisPage() {
 const [integrations, setIntegrations] = useState<ApiIntegration[]>(DEFAULT_INTEGRATIONS);
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [configuring, setConfiguring] = useState<string | null>(null);
 const [apiKeyInput, setApiKeyInput] = useState('');
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadIntegrations();
 }, []);

 const loadIntegrations = async () => {
 try {
 const res = await fetch(`${API_CONFIG.baseURL}/admin/integrations`, {
 headers: { ...adminAuth.getAuthHeaders() as Record<string, string> }
 });
 if (res.ok) {
 const data = await res.json();
 if (data.integrations) {
 // Merge server data with defaults
 setIntegrations(prev => prev.map(p => {
 const serverItem = data.integrations.find((s: any) => s.id === p.id);
 return serverItem ? { ...p, ...serverItem } : p;
 }));
 }
 }
 } catch {
 // Backend route may not exist yet — use defaults
 } finally {
 setLoading(false);
 }
 };

 const handleConnect = async (id: string) => {
 if (!apiKeyInput.trim()) return;
 setIntegrations(prev => prev.map(p =>
 p.id === id ? { ...p, status:'pending' } : p
 ));
 try {
 const res = await fetch(`${API_CONFIG.baseURL}/admin/integrations/${id}`, {
 method:'POST',
 headers: {'Content-Type':'application/json',
 ...adminAuth.getAuthHeaders() as Record<string, string>
 },
 body: JSON.stringify({ apiKey: apiKeyInput })
 });
 if (res.ok) {
 setIntegrations(prev => prev.map(p => p.id === id ? { ...p, status:'connected', lastSync: new Date().toISOString() } : p));
 } else {
 setIntegrations(prev => prev.map(p => p.id === id ? { ...p, status:'error' } : p));
 }
 } catch {
 setIntegrations(prev => prev.map(p => p.id === id ? { ...p, status:'error' } : p));
 }
 setApiKeyInput('');
 setConfiguring(null);
 };

 const handleDisconnect = async (id: string) => {
 try {
 await fetch(`${API_CONFIG.baseURL}/admin/integrations/${id}`, {
 method:'DELETE',
 headers: { ...adminAuth.getAuthHeaders() as Record<string, string> }
 });
 } catch {}
 setIntegrations(prev => prev.map(p => p.id === id ? { ...p, status:'disconnected', lastSync: undefined } : p));
 };

 const filtered = integrations.filter(i => {
 const matchesCategory = selectedCategory ==='all' || i.category === selectedCategory;
 const matchesSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesCategory && matchesSearch;
 });

 const statusBadge = (status: string) => {
 const map: Record<string, string> = {
 connected:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
 disconnected:'bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]',
 error:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
 pending:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
 };
 return map[status] || map.disconnected;
 };

 const connectedCount = integrations.filter(i => i.status ==='connected').length;

 return (
 <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
 <div>
 <h1 className="text-2xl sm:text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">External APIs & Integrations</h1>
 <p className="text-[rgb(var(--muted-foreground))] mt-1">
 Connect third-party services to enhance your platform • {connectedCount} active
 </p>
 </div>
 <div className="flex items-center gap-2">
 <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
 {connectedCount} Connected
 </div>
 <div className="px-3 py-1.5 bg-[rgb(var(--muted))]/30 text-[rgb(var(--muted-foreground))] rounded-full text-sm font-medium">
 {integrations.length - connectedCount} Available
 </div>
 </div>
 </div>

 {/* Search & Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <div className="flex-1 relative">
 <input
 type="text"
 placeholder="Search integrations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full px-4 py-2.5 pl-10 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40"
 />
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]">🔍</span>
 </div>
 </div>

 {/* Category Tabs */}
 <div className="flex flex-wrap gap-2 mb-6">
 {CATEGORIES.map(cat => (
 <button
 key={cat.key}
 onClick={() => setSelectedCategory(cat.key)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 selectedCategory === cat.key
 ?'bg-[rgb(var(--primary))] text-white shadow-sm'
 :'bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/5'
 }`}
 >
 <span>{cat.icon}</span> {cat.label}
 </button>
 ))}
 </div>

 {/* Integration Cards */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 animate-pulse">
 <div className="h-5 bg-[rgb(var(--muted))]/10 rounded w-1/3 mb-3" />
 <div className="h-4 bg-[rgb(var(--muted))]/10 rounded w-2/3 mb-4" />
 <div className="h-8 bg-[rgb(var(--muted))]/10 rounded w-1/4" />
 </div>
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {filtered.map(api => (
 <div key={api.id} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 hover:shadow-sm transition-all group">
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="text-2xl">{api.icon}</span>
 <div>
 <h3 className="font-semibold text-[rgb(var(--foreground))]">{api.name}</h3>
 <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(api.status)}`}>
 {api.status}
 </span>
 </div>
 </div>
 </div>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3 line-clamp-2">{api.description}</p>

 {api.rateLimit && (
 <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">Rate Limit: {api.rateLimit}</p>
 )}
 {api.lastSync && (
 <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">
 Last sync: {new Date(api.lastSync).toLocaleString()}
 </p>
 )}

 {configuring === api.id ? (
 <div className="space-y-2">
 <input
 type="password"
 placeholder="Enter API key..."
 value={apiKeyInput}
 onChange={(e) => setApiKeyInput(e.target.value)}
 className="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40"
 autoFocus
 />
 <div className="flex gap-2">
 <button
 onClick={() => handleConnect(api.id)}
 disabled={!apiKeyInput.trim()}
 className="flex-1 px-3 py-1.5 bg-[rgb(var(--primary))] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
 >
 Connect
 </button>
 <button
 onClick={() => { setConfiguring(null); setApiKeyInput(''); }}
 className="px-3 py-1.5 bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--muted))]/10/80 transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : api.status ==='connected' ? (
 <div className="flex gap-2">
 <button
 onClick={() => setConfiguring(api.id)}
 className="flex-1 px-3 py-1.5 bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--muted))]/10/80 transition-colors"
 >
 Configure
 </button>
 <button
 onClick={() => handleDisconnect(api.id)}
 className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
 >
 Disconnect
 </button>
 </div>
 ) : (
 <button
 onClick={() => setConfiguring(api.id)}
 className="w-full px-3 py-2 bg-[rgb(var(--primary))] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors opacity-0 group-hover:opacity-100"
 >
 Connect
 </button>
 )}
 </div>
 ))}
 </div>
 )}

 {filtered.length === 0 && !loading && (
 <div className="text-center py-16">
 <span className="text-4xl">🔌</span>
 <p className="mt-4 text-[rgb(var(--muted-foreground))] text-lg">No integrations found matching your criteria</p>
 </div>
 )}
 </div>
 );
}
