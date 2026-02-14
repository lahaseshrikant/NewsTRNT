// src/app/admin/analytics/export/page.tsx - Export Reports Page
'use client';

import React, { useState } from 'react';
import { AdminRoute } from '@/components/admin/RouteGuard';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  lastGenerated?: string;
}

function ExportReportsContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<{id: string; name: string; generatedAt: string; size: string; format: string}[]>([
    { id: '1', name: 'Traffic Report - January 2026', generatedAt: '2026-02-01', size: '2.4 MB', format: 'PDF' },
    { id: '2', name: 'User Engagement - Q4 2025', generatedAt: '2026-01-15', size: '1.8 MB', format: 'XLSX' },
    { id: '3', name: 'Content Performance - Weekly', generatedAt: '2026-02-04', size: '856 KB', format: 'CSV' },
  ]);

  const reportTemplates: ReportTemplate[] = [
    { id: 'traffic', name: 'Traffic Report', description: 'Page views, unique visitors, bounce rate, and traffic sources', icon: '🌐', category: 'Traffic' },
    { id: 'content', name: 'Content Performance', description: 'Article views, engagement metrics, and trending content', icon: '📊', category: 'Content' },
    { id: 'users', name: 'User Analytics', description: 'User demographics, retention, and behavior patterns', icon: '👥', category: 'Users' },
    { id: 'engagement', name: 'Engagement Report', description: 'Comments, shares, likes, and social interactions', icon: '🎯', category: 'Engagement' },
    { id: 'revenue', name: 'Revenue Report', description: 'Ad revenue, subscriptions, and financial metrics', icon: '💰', category: 'Revenue' },
    { id: 'newsletter', name: 'Newsletter Analytics', description: 'Open rates, click rates, and subscriber growth', icon: '📧', category: 'Newsletter' },
    { id: 'seo', name: 'SEO Report', description: 'Search rankings, keywords, and organic traffic', icon: '🔍', category: 'SEO' },
    { id: 'custom', name: 'Custom Report', description: 'Build a custom report with selected metrics', icon: '⚙️', category: 'Custom' },
  ];

  const handleGenerate = async () => {
    if (!selectedTemplate || !dateFrom || !dateTo) {
      alert('Please select a report template and date range');
      return;
    }
    
    setGenerating(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const template = reportTemplates.find(t => t.id === selectedTemplate);
    setGeneratedReports(prev => [{
      id: Date.now().toString(),
      name: `${template?.name} - ${new Date(dateFrom).toLocaleDateString()} to ${new Date(dateTo).toLocaleDateString()}`,
      generatedAt: new Date().toISOString(),
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      format: format.toUpperCase()
    }, ...prev]);
    
    setGenerating(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Export Reports</h1>
        <p className="text-muted-foreground">Generate and download detailed analytics reports</p>
      </div>

      {/* Report Templates */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Select Report Template</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-border hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <h4 className="font-medium text-foreground">{template.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      {selectedTemplate && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Configure Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>📥 Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Generated Reports</h3>
        </div>
        <div className="divide-y divide-border">
          {generatedReports.map(report => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  {report.format === 'PDF' ? '📄' : report.format === 'XLSX' ? '📊' : '📋'}
                </div>
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Generated {new Date(report.generatedAt).toLocaleDateString()} • {report.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                  {report.format}
                </span>
                <button className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm">
                  Download
                </button>
                <button className="px-3 py-1 text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Export */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Export</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
            <span className="text-2xl">📈</span>
            <p className="font-medium text-foreground mt-2">Today&apos;s Summary</p>
            <p className="text-xs text-muted-foreground">Quick daily stats</p>
          </button>
          <button className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
            <span className="text-2xl">📊</span>
            <p className="font-medium text-foreground mt-2">Weekly Report</p>
            <p className="text-xs text-muted-foreground">Last 7 days analysis</p>
          </button>
          <button className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
            <span className="text-2xl">📉</span>
            <p className="font-medium text-foreground mt-2">Monthly Report</p>
            <p className="text-xs text-muted-foreground">Full month summary</p>
          </button>
          <button className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
            <span className="text-2xl">🎯</span>
            <p className="font-medium text-foreground mt-2">Quarterly Review</p>
            <p className="text-xs text-muted-foreground">Quarter performance</p>
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
