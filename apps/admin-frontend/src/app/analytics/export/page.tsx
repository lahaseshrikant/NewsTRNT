// src/app/admin/analytics/export/page.tsx - Export Reports Page
'use client';

import React, { useState, useEffect, useCallback } from'react';
import { AdminRoute } from'@/components/auth/RouteGuard';
import adminAuth from'@/lib/auth/admin-auth';
import { API_CONFIG } from'@/config/api';

const API_BASE_URL = API_CONFIG.baseURL;

interface ReportTemplate {
 id: string;
 name: string;
 description: string;
 icon: string;
 category: string;
 endpoint: string;
}

interface GeneratedReport {
 id: string;
 name: string;
 generatedAt: string;
 size: string;
 format: string;
 data: any;
}

function ExportReportsContent() {
 const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
 const [dateFrom, setDateFrom] = useState('');
 const [dateTo, setDateTo] = useState('');
 const [format, setFormat] = useState<'csv' |'json'>('csv');
 const [generating, setGenerating] = useState(false);
 const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

 const reportTemplates: ReportTemplate[] = [
 { id:'overview', name:'Analytics Overview', description:'Page views, unique visitors, and site-wide metrics', icon:'O', category:'Traffic', endpoint:'/admin/analytics/overview' },
 { id:'content', name:'Content Performance', description:'Article views, engagement metrics, and trending content', icon:'C', category:'Content', endpoint:'/admin/stats/dashboard' },
 { id:'users', name:'User Analytics', description:'User demographics, subscriber counts, and activity', icon:'U', category:'Users', endpoint:'/admin/users?limit=1000' },
 { id:'articles', name:'Articles Report', description:'All articles with views, status, and categories', icon:'A', category:'Articles', endpoint:'/articles/admin?limit=1000' },
 { id:'tags', name:'Tags Report', description:'Tag usage counts and articles per tag', icon:'T', category:'Content', endpoint:'/admin/tags?status=active' },
 { id:'webstories', name:'Web Stories Report', description:'Web stories performance and status overview', icon:'W', category:'Content', endpoint:'/webstories/admin?limit=1000' },
 ];

 const convertToCSV = (data: any[], filename: string): string => {
 if (!data || data.length === 0) return'';
 const headers = Object.keys(data[0]);
 const rows = data.map(row =>
 headers.map(h => {
 const val = row[h];
 const str = typeof val ==='object' ? JSON.stringify(val) : String(val ??'');
 return `"${str.replace(/"/g,'""')}"`;
 }).join(',')
 );
 return [headers.join(','), ...rows].join('\n');
 };

 const downloadFile = (content: string, filename: string, mimeType: string) => {
 const blob = new Blob([content], { type: mimeType });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };

 const handleGenerate = async () => {
 if (!selectedTemplate || !dateFrom || !dateTo) {
 alert('Please select a report template and date range');
 return;
 }

 setGenerating(true);
 const template = reportTemplates.find(t => t.id === selectedTemplate);
 if (!template) { setGenerating(false); return; }

 try {
 const separator = template.endpoint.includes('?') ?'&' :'?';
 const url = `${API_BASE_URL}${template.endpoint}${separator}from=${dateFrom}&to=${dateTo}`;
 const res = await fetch(url, {
 headers: { ...adminAuth.getAuthHeaders() }
 });

 if (!res.ok) throw new Error(`API returned ${res.status}`);

 const rawData = await res.json();

 // Normalize data to an exportable array
 let exportData: any[] = [];
 if (Array.isArray(rawData)) {
 exportData = rawData;
 } else if (rawData.articles) {
 exportData = rawData.articles;
 } else if (rawData.users) {
 exportData = rawData.users;
 } else if (rawData.tags) {
 exportData = rawData.tags;
 } else if (rawData.webStories) {
 exportData = rawData.webStories;
 } else {
 // Single object — wrap in array
 exportData = [rawData];
 }

 const dateLabel = `${new Date(dateFrom).toLocaleDateString()}_to_${new Date(dateTo).toLocaleDateString()}`;
 const filename = `${template.name.replace(/\s+/g,'_')}_${dateLabel}`;

 let content: string;
 let mimeType: string;
 let ext: string;

 if (format ==='csv') {
 content = convertToCSV(exportData, filename);
 mimeType ='text/csv;charset=utf-8;';
 ext ='csv';
 } else {
 content = JSON.stringify(exportData, null, 2);
 mimeType ='application/json';
 ext ='json';
 }

 const sizeBytes = new Blob([content]).size;
 const sizeStr = sizeBytes > 1024 * 1024
 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
 : `${(sizeBytes / 1024).toFixed(1)} KB`;

 downloadFile(content, `${filename}.${ext}`, mimeType);

 setGeneratedReports(prev => [{
 id: Date.now().toString(),
 name: `${template.name} - ${new Date(dateFrom).toLocaleDateString()} to ${new Date(dateTo).toLocaleDateString()}`,
 generatedAt: new Date().toISOString(),
 size: sizeStr,
 format: ext.toUpperCase(),
 data: content
 }, ...prev]);

 setSelectedTemplate(null);
 } catch (error: any) {
 console.error('Export failed:', error);
 alert(`Failed to generate report: ${error.message}`);
 }

 setGenerating(false);
 };

 const handleQuickExport = async (period:'today' |'week' |'month' |'quarter') => {
 const now = new Date();
 const to = now.toISOString().split('T')[0];
 let from: string;

 switch (period) {
 case'today':
 from = to;
 break;
 case'week':
 from = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
 break;
 case'month':
 from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
 break;
 case'quarter':
 from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
 break;
 }

 try {
 const res = await fetch(`${API_BASE_URL}/admin/stats/dashboard?from=${from}&to=${to}`, {
 headers: { ...adminAuth.getAuthHeaders() }
 });
 if (!res.ok) throw new Error(`API returned ${res.status}`);
 const data = await res.json();
 const content = JSON.stringify(data, null, 2);
 downloadFile(content, `quick_export_${period}_${to}.json`,'application/json');
 } catch (error: any) {
 alert(`Quick export failed: ${error.message}`);
 }
 };

 const redownload = (report: GeneratedReport) => {
 const mimeType = report.format ==='CSV' ?'text/csv;charset=utf-8;' :'application/json';
 const ext = report.format.toLowerCase();
 downloadFile(report.data, `${report.name.replace(/\s+/g,'_')}.${ext}`, mimeType);
 };

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Export Reports</h1>
 <p className="text-[rgb(var(--muted-foreground))]">Generate and download detailed analytics reports</p>
 </div>

 {/* Report Templates */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Select Report Template</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {reportTemplates.map(template => (
 <button
 key={template.id}
 onClick={() => setSelectedTemplate(template.id)}
 className={`p-4 rounded-xl border-2 text-left transition-all ${
 selectedTemplate === template.id
 ?'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5'
 :'border-[rgb(var(--border))] hover:border-blue-300'
 }`}
 >
 <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center text-sm font-bold text-[rgb(var(--primary))] mb-2">{template.icon}</div>
 <h4 className="font-medium text-[rgb(var(--foreground))]">{template.name}</h4>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{template.description}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Configuration */}
 {selectedTemplate && (
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Configure Report</h3>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">From Date</label>
 <input
 type="date"
 value={dateFrom}
 onChange={(e) => setDateFrom(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">To Date</label>
 <input
 type="date"
 value={dateTo}
 onChange={(e) => setDateTo(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Format</label>
 <select
 value={format}
 onChange={(e) => setFormat(e.target.value as any)}
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="csv">CSV</option>
 <option value="json">JSON</option>
 </select>
 </div>
 <div className="flex items-end">
 <button
 onClick={handleGenerate}
 disabled={generating}
 className="w-full px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
 >
 {generating ? (
 <>
 <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
 Generating...
 </>
 ) : (
 <>Generate Report</>
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Generated Reports */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
 <div className="p-4 border-b border-[rgb(var(--border))]">
 <h3 className="font-semibold text-[rgb(var(--foreground))]">Generated Reports</h3>
 </div>
 <div className="divide-y divide-border">
 {generatedReports.map(report => (
 <div key={report.id} className="p-4 flex items-center justify-between hover:bg-[rgb(var(--muted))]/10/30 transition-colors">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center text-sm font-bold text-[rgb(var(--primary))]">
 {report.format}
 </div>
 <div>
 <p className="font-medium text-[rgb(var(--foreground))]">{report.name}</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">
 Generated {new Date(report.generatedAt).toLocaleDateString()} | {report.size}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs px-2 py-1 rounded bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]">
 {report.format}
 </span>
 <button
 onClick={() => redownload(report)}
 className="px-3 py-1 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] text-sm"
 >
 Download
 </button>
 <button
 onClick={() => setGeneratedReports(prev => prev.filter(r => r.id !== report.id))}
 className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
 >
 Remove
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Quick Export */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Quick Export</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <button onClick={() => handleQuickExport('today')} className="p-4 rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5 transition-colors text-left">
 <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600 dark:text-green-400">D</div>
 <p className="font-medium text-[rgb(var(--foreground))] mt-2">Today&apos;s Summary</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Quick daily stats</p>
 </button>
 <button onClick={() => handleQuickExport('week')} className="p-4 rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5 transition-colors text-left">
 <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">W</div>
 <p className="font-medium text-[rgb(var(--foreground))] mt-2">Weekly Report</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Last 7 days analysis</p>
 </button>
 <button onClick={() => handleQuickExport('month')} className="p-4 rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5 transition-colors text-left">
 <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400">M</div>
 <p className="font-medium text-[rgb(var(--foreground))] mt-2">Monthly Report</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Full month summary</p>
 </button>
 <button onClick={() => handleQuickExport('quarter')} className="p-4 rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5 transition-colors text-left">
 <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">Q</div>
 <p className="font-medium text-[rgb(var(--foreground))] mt-2">Quarterly Review</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Quarter performance</p>
 </button>
 </div>
 </div>
 </div>
 );
}

export default function ExportReportsPage() {
 return (
 <AdminRoute>
 <ExportReportsContent />
 </AdminRoute>
 );
}

