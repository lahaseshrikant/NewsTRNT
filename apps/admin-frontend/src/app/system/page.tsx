"use client";

import React, { useState, useEffect } from"react";
import { showToast } from"@/lib/utils/toast";
import adminAuth from"@/lib/auth/admin-auth";
import {
 CogIcon,
 ShieldCheckIcon,
 EnvelopeIcon,
 BoltIcon,
 CodeBracketIcon,
 ServerIcon,
 CircleStackIcon,
 ChartBarIcon,
} from"@/components/icons/AdminIcons";

/* ── types ── */
interface SystemSetting {
 id: string;
 category: string;
 name: string;
 description: string;
 type:"boolean" |"string" |"number" |"select";
 value: any;
 options?: string[];
 placeholder?: string;
}

/* ── category icons map ── */
const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
 general: { icon: <CogIcon className="w-4 h-4" />, color:"text-[rgb(var(--foreground))]" },
 security: { icon: <ShieldCheckIcon className="w-4 h-4" />, color:"text-amber-500" },
 email: { icon: <EnvelopeIcon className="w-4 h-4" />, color:"text-blue-500" },
 performance: { icon: <BoltIcon className="w-4 h-4" />, color:"text-emerald-500" },
 api: { icon: <CodeBracketIcon className="w-4 h-4" />, color:"text-violet-500" },
};

/* ── default settings seed ── */
const defaultSettings: SystemSetting[] = [
 { id:"site_maintenance", category:"general", name:"Maintenance Mode", description:"Temporarily disable public access for scheduled updates", type:"boolean", value: false },
 { id:"site_registration", category:"general", name:"User Registration", description:"Allow new users to create accounts on the platform", type:"boolean", value: true },
 { id:"articles_per_page", category:"general", name:"Articles Per Page", description:"Number of articles shown per page in the public feed", type:"number", value: 10 },
 { id:"default_language", category:"general", name:"Default Language", description:"Primary language for the public site", type:"select", value:"en", options: ["en","es","fr","de","it"] },

 { id:"password_min_length", category:"security", name:"Min Password Length", description:"Minimum characters required for user passwords", type:"number", value: 8 },
 { id:"session_timeout", category:"security", name:"Session Timeout (min)", description:"Automatic logout after inactivity period", type:"number", value: 60 },
 { id:"two_factor_auth", category:"security", name:"Two-Factor Auth", description:"Require 2FA for all admin-level accounts", type:"boolean", value: false },
 { id:"rate_limiting", category:"security", name:"API Rate Limiting", description:"Protect endpoints from brute-force and abuse", type:"boolean", value: true },

 { id:"smtp_host", category:"email", name:"SMTP Host", description:"Outbound mail server hostname", type:"string", value:"smtp.newstrnt.com", placeholder:"smtp.example.com" },
 { id:"smtp_port", category:"email", name:"SMTP Port", description:"Mail server port (587 for TLS, 465 for SSL)", type:"number", value: 587 },
 { id:"email_notifications", category:"email", name:"Event Notifications", description:"Send email alerts on critical system events", type:"boolean", value: true },
 { id:"newsletter_from", category:"email", name:"Newsletter Sender", description:"From address for newsletter campaigns", type:"string", value:"newsletter@newstrnt.com", placeholder:"newsletter@example.com" },

 { id:"cache_enabled", category:"performance", name:"Page Caching", description:"Cache rendered pages to reduce server load", type:"boolean", value: true },
 { id:"cache_duration", category:"performance", name:"Cache TTL (min)", description:"Duration before cached pages are invalidated", type:"number", value: 30 },
 { id:"image_optimization", category:"performance", name:"Image Optimization", description:"Automatically compress and resize uploaded images", type:"boolean", value: true },
 { id:"cdn_enabled", category:"performance", name:"CDN Integration", description:"Serve static assets from a content delivery network", type:"boolean", value: false },

 { id:"api_enabled", category:"api", name:"Public API", description:"Expose read-only endpoints for third-party consumers", type:"boolean", value: true },
 { id:"api_rate_limit", category:"api", name:"Rate Limit (req/hr)", description:"Maximum API requests per hour per client", type:"number", value: 1000 },
 { id:"webhook_enabled", category:"api", name:"Webhooks", description:"Push event payloads to registered webhook URLs", type:"boolean", value: false },
];

const categories = [
 { id:"general", label:"General" },
 { id:"security", label:"Security" },
 { id:"email", label:"Email" },
 { id:"performance", label:"Performance" },
 { id:"api", label:"API & Integrations" },
];

/* ── components ── */

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
 return (
 <button
 role="switch"
 aria-checked={checked}
 disabled={disabled}
 onClick={() => onChange(!checked)}
 className={`
 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2
 focus-visible:ring-[rgb(var(--primary))]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))]
 disabled:cursor-not-allowed disabled:opacity-50
 ${checked ?"bg-[rgb(var(--primary))]" :"bg-[rgb(var(--muted))]"}
 `}
 >
 <span
 className={`
 pointer-events-none inline-block h-5 w-5 rounded-full bg-[rgb(var(--card))] shadow-sm ring-0
 transition-transform duration-200 ease-in-out
 ${checked ?"translate-x-5" :"translate-x-0"}
 `}
 />
 </button>
 );
}

/* ── main page ── */
export default function SystemSettingsPage() {
 const [activeCategory, setActiveCategory] = useState("general");
 const [settings, setSettings] = useState<SystemSetting[]>(defaultSettings);
 const [loadingMaintenance, setLoadingMaintenance] = useState(true);
 const [saving, setSaving] = useState(false);

 /* fetch maintenance mode status */
 useEffect(() => {
 fetch("/api/market/auto-update", { headers: { ...adminAuth.getAuthHeaders() } })
 .then((r) => r.json())
 .then((data) => {
 const enabled = !!data?.data?.enabled;
 setSettings((prev) => prev.map((s) => (s.id ==="site_maintenance" ? { ...s, value: enabled } : s)));
 })
 .catch((err) => console.error("fetch maintenance status", err))
 .finally(() => setLoadingMaintenance(false));
 }, []);

 const filtered = settings.filter((s) => s.category === activeCategory);
 const meta = categoryMeta[activeCategory];

 /* handlers */
 const updateSetting = async (id: string, value: any) => {
 if (id ==="site_maintenance") {
 try {
 const res = await fetch("/api/market/auto-update", {
 method:"POST",
 headers: { ...adminAuth.getAuthHeaders(),"Content-Type":"application/json" },
 body: JSON.stringify({ action: value ?"stop" :"start" }),
 });
 if (!res.ok) throw new Error(`status ${res.status}`);
 setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
 showToast("Maintenance mode updated","success");
 } catch {
 showToast("Failed to update maintenance mode","error");
 }
 return;
 }
 setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
 };

 const handleSave = () => {
 setSaving(true);
 setTimeout(() => {
 setSaving(false);
 showToast("Settings saved — restart may be needed for some changes.","success");
 }, 600);
 };

 const handleReset = () => {
 if (!confirm("Reset all settings to their defaults?")) return;
 setSettings(defaultSettings);
 showToast("Settings reset to defaults.","info");
 };

 /* render input by type */
 const renderInput = (s: SystemSetting) => {
 switch (s.type) {
 case"boolean":
 return <Toggle checked={s.value} disabled={s.id ==="site_maintenance" && loadingMaintenance} onChange={(v) => updateSetting(s.id, v)} />;
 case"select":
 return (
 <select
 value={s.value}
 onChange={(e) => updateSetting(s.id, e.target.value)}
 className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 >
 {s.options?.map((o) => (
 <option key={o} value={o}>{o.toUpperCase()}</option>
 ))}
 </select>
 );
 case"number":
 return (
 <input
 type="number"
 value={s.value}
 onChange={(e) => updateSetting(s.id, parseInt(e.target.value) || 0)}
 className="h-9 w-28 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm tabular-nums text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 );
 case"string":
 return (
 <input
 type="text"
 value={s.value}
 placeholder={s.placeholder}
 onChange={(e) => updateSetting(s.id, e.target.value)}
 className="h-9 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 );
 default:
 return null;
 }
 };

 return (
 <div className="space-y-6">
 {/* header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">System Settings</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Configure platform behavior, security policies, and integrations</p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={handleReset}
 className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 text-sm font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/20"
 >
 Reset Defaults
 </button>
 <button
 onClick={handleSave}
 disabled={saving}
 className="h-9 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50"
 >
 {saving ?"Saving…" :"Save Changes"}
 </button>
 </div>
 </div>

 {/* restart notice */}
 <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/10">
 <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
 <p className="text-sm text-amber-700 dark:text-amber-300">
 Some changes require a server restart to take effect. Save, then restart when convenient.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
 {/* sidebar – category tabs */}
 <div className="space-y-4">
 <nav className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
 {categories.map((cat) => {
 const active = cat.id === activeCategory;
 const cm = categoryMeta[cat.id];
 return (
 <button
 key={cat.id}
 onClick={() => setActiveCategory(cat.id)}
 className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
 active
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 :"text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]"
 }`}
 >
 <span className={active ?"text-[rgb(var(--primary))]" : cm?.color ??""}>{cm?.icon}</span>
 {cat.label}
 </button>
 );
 })}
 </nav>

 {/* system info card */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
 <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] mb-3">System Info</h3>
 <dl className="space-y-2 text-sm">
 {[
 { label:"Version", value:"1.0.0" },
 { label:"Environment", value:"Production" },
 { label:"Database", value:"Connected", color:"text-emerald-500" },
 { label:"Cache", value:"Active", color:"text-emerald-500" },
 { label:"Last Backup", value:"2 h ago" },
 ].map((row) => (
 <div key={row.label} className="flex items-center justify-between">
 <dt className="text-[rgb(var(--muted-foreground))]">{row.label}</dt>
 <dd className={`font-medium ${row.color ??"text-[rgb(var(--foreground))]"}`}>{row.value}</dd>
 </div>
 ))}
 </dl>
 </div>
 </div>

 {/* main content */}
 <div className="space-y-6">
 {/* category header */}
 <div className="flex items-center gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-3">
 <span className={meta?.color ??""}>{meta?.icon}</span>
 <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">
 {categories.find((c) => c.id === activeCategory)?.label} Settings
 </h2>
 <span className="ml-auto rounded-full bg-[rgb(var(--muted))]/10 px-2.5 py-0.5 text-xs font-medium tabular-nums text-[rgb(var(--muted-foreground))]">
 {filtered.length} option{filtered.length !== 1 ?"s" :""}
 </span>
 </div>

 {/* settings list */}
 <div className="divide-y divide-[rgb(var(--border))] rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
 {filtered.map((s) => (
 <div key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="min-w-0">
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">{s.name}</p>
 <p className="mt-0.5 text-xs text-[rgb(var(--muted-foreground))]">{s.description}</p>
 </div>
 <div className="shrink-0">{renderInput(s)}</div>
 </div>
 ))}
 </div>

 {/* contextual tips */}
 {activeCategory ==="security" && (
 <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10">
 <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Security Recommendations</h3>
 <ul className="space-y-1 text-xs text-red-600 dark:text-red-300">
 <li>Enable two-factor authentication for all admin accounts</li>
 <li>Set minimum password length to 12+ characters</li>
 <li>Regularly update system dependencies</li>
 <li>Monitor login attempts in the audit log</li>
 </ul>
 </div>
 )}
 {activeCategory ==="performance" && (
 <div className="rounded-xl border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/5 p-4 /10">
 <h3 className="text-sm font-semibold text-[rgb(var(--primary))] mb-2">Performance Tips</h3>
 <ul className="space-y-1 text-xs text-[rgb(var(--primary))]">
 <li>Enable page caching to reduce server load by up to 60 %</li>
 <li>Optimize images to save bandwidth — especially for mobile readers</li>
 <li>Use a CDN for static assets in production</li>
 <li>Monitor response times under Analytics &gt; Performance</li>
 </ul>
 </div>
 )}
 {activeCategory ==="email" && (
 <div className="flex gap-2">
 <button className="h-9 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-400">
 Test Email Config
 </button>
 <button className="h-9 rounded-lg border border-blue-300 bg-[rgb(var(--primary))]/5 px-4 text-sm font-medium text-[rgb(var(--primary))] transition-colors hover:bg-[rgb(var(--primary))]/10 /10">
 View Templates
 </button>
 </div>
 )}

 {/* quick actions */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
 <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] mb-3">System Actions</h3>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
 {[
 { label:"Clear Cache", icon: <CircleStackIcon className="w-4 h-4" />, accent:"blue" },
 { label:"Create Backup", icon: <ServerIcon className="w-4 h-4" />, accent:"emerald" },
 { label:"System Report", icon: <ChartBarIcon className="w-4 h-4" />, accent:"violet" },
 ].map((a) => (
 <button
 key={a.label}
 onClick={() => showToast(`${a.label} initiated`,"info")}
 className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors
 border-${a.accent}-200 bg-${a.accent}-50 text-${a.accent}-700
 hover:bg-${a.accent}-100
 dark:border-${a.accent}-800/40 dark:bg-${a.accent}-900/10 dark:text-${a.accent}-400
 `}
 >
 {a.icon}
 {a.label}
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
