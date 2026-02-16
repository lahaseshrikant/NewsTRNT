"use client";

import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

interface HealthCheck {
  service: string;
  url: string;
  status: 'checking' | 'online' | 'offline' | 'degraded';
  responseTime?: number;
  details?: Record<string, any>;
}

export default function DebugPage() {
  const [services, setServices] = useState<HealthCheck[]>([
    { service: 'Admin Backend', url: `${API_CONFIG.baseURL.replace('/api', '')}/api/health`, status: 'checking' },
    { service: 'User Backend', url: 'http://localhost:5000/api/health', status: 'checking' },
    { service: 'Admin Frontend', url: '/api/health', status: 'checking' },
  ]);
  const [authInfo, setAuthInfo] = useState<Record<string, any>>({});
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAllServices();
    loadAuthInfo();
    loadEnvVars();
  }, []);

  const loadAuthInfo = () => {
    const user = adminAuth.getUser();
    const token = adminAuth.getToken();
    setAuthInfo({
      isAuthenticated: adminAuth.isAuthenticated(),
      user: user ? { ...user, permissions: `${user.permissions?.length || 0} permissions` } : null,
      tokenPresent: !!token,
      tokenLength: token?.length || 0,
      tokenKey: 'admin_token',
    });
  };

  const loadEnvVars = () => {
    setEnvVars({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '(not set — fallback: http://localhost:5002/api)',
      NEXT_PUBLIC_MARKET_API_URL: process.env.NEXT_PUBLIC_MARKET_API_URL || '(not set)',
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      'API_CONFIG.baseURL': API_CONFIG.baseURL,
    });
  };

  const checkService = async (index: number) => {
    const s = services[index];
    const start = Date.now();
    try {
      const res = await fetch(s.url, {
        method: 'GET',
        headers: { ...adminAuth.getAuthHeaders() as Record<string, string> },
        signal: AbortSignal.timeout(5000),
      });
      const duration = Date.now() - start;
      const data = await res.json().catch(() => ({}));
      setServices(prev => prev.map((item, i) =>
        i === index ? { ...item, status: res.ok ? 'online' : 'degraded', responseTime: duration, details: data } : item
      ));
    } catch {
      setServices(prev => prev.map((item, i) =>
        i === index ? { ...item, status: 'offline', responseTime: Date.now() - start } : item
      ));
    }
  };

  const checkAllServices = () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })));
    services.forEach((_, i) => checkService(i));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-gray-400 animate-pulse';
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'offline': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'degraded': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Debug & Diagnostics</h1>
          <p className="text-muted-foreground mt-1">System health checks, auth state, and environment info</p>
        </div>
        <button
          onClick={checkAllServices}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          🔄 Refresh All
        </button>
      </div>

      {/* Service Health */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">🏥 Service Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={s.service} className={`p-4 rounded-xl border ${statusBg(s.status)} transition-all`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColor(s.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{s.service}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize font-medium">{s.status}</span>
                {s.responseTime !== undefined && <span>• {s.responseTime}ms</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth State */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">🔐 Authentication State</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(authInfo).map(([key, value]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-muted-foreground whitespace-nowrap">{key}</td>
                  <td className="py-2.5 font-mono text-foreground break-all">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environment */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">⚙️ Environment Variables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-muted-foreground whitespace-nowrap">{key}</td>
                  <td className="py-2.5 font-mono text-foreground break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">🛠️ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800"
          >
            🗑️ Clear LocalStorage
          </button>
          <button
            onClick={() => window.location.href = '/api-test'}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800"
          >
            🧪 API Test Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/system/audit-logs'}
            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors border border-purple-200 dark:border-purple-800"
          >
            📋 Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
}
