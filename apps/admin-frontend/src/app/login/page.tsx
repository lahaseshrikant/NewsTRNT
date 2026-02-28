"use client";

import React, { Suspense, useState, useEffect } from'react';
import { useRouter, useSearchParams } from'next/navigation';
import adminAuth from'@/lib/auth/admin-auth';

function AdminLoginContent() {
 const [credentials, setCredentials] = useState({ email:'', password:'' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [checkingAuth, setCheckingAuth] = useState(true);
 const router = useRouter();
 const searchParams = useSearchParams();

 useEffect(() => {
 if (adminAuth.isAuthenticated()) {
 router.replace(searchParams.get('redirect') ||'/');
 } else {
 setCheckingAuth(false);
 }
 }, [router, searchParams]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 const result = await adminAuth.login(credentials.email, credentials.password);

 if (result.success) {
 router.push(searchParams.get('redirect') ||'/');
 } else {
 setError(result.message);
 }

 setLoading(false);
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setCredentials(prev => ({
 ...prev,
 [e.target.name]: e.target.value
 }));
 };

 if (checkingAuth) {
 return (
 <div className="min-h-screen bg-[rgb(var(--muted))]/30 flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
 <div className="max-w-md w-full mx-4">
 <div className="bg-[rgb(var(--card))] py-8 px-6 shadow-sm rounded-xl border border-[rgb(var(--border))]/60">
 <div className="text-center mb-8">
 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
 <span className="text-white font-bold text-2xl">N</span>
 </div>
 <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
 NewsTRNT Admin
 </h2>
 <p className="text-[rgb(var(--muted-foreground))] mt-2">Unified Admin System</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
 {error}
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
 Email Address
 </label>
 <input
 name="email"
 type="email"
 required
 value={credentials.email}
 onChange={handleInputChange}
 className="w-full px-4 py-3 border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-colors"
 placeholder="admin@NewsTRNT.com"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
 Password
 </label>
 <input
 name="password"
 type="password"
 required
 value={credentials.password}
 onChange={handleInputChange}
 className="w-full px-4 py-3 border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-colors"
 placeholder="Enter your password"
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-[rgb(var(--primary))] text-white py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-sm"
 >
 {loading ? (
 <div className="flex items-center justify-center space-x-2">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 <span>Authenticating...</span>
 </div>
 ) : ('Access Admin Portal'
 )}
 </button>
 </form>

 {process.env.NODE_ENV ==='development' && (
 <div className="mt-6 p-4 bg-[rgb(var(--background))] rounded-lg">
 <p className="text-sm text-[rgb(var(--muted-foreground))] text-center mb-3">Admin Types:</p>
 <div className="space-y-3">
 <div className="text-center">
 <p className="text-xs text-[rgb(var(--primary))] mb-1 font-semibold">ADMIN</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Content, Users, Analytics</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Use ADMIN_EMAIL from .env.local</p>
 </div>
 <div className="border-t border-[rgb(var(--border))] pt-3">
 <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold text-center">SUPER ADMIN</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2 text-center">System, Logo, Database</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">Use SUPER_ADMIN_EMAIL from .env.local</p>
 </div>
 </div>
 </div>
 )}

 <div className="mt-6 text-center">
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
 © 2025 NewsTRNT. Unified Admin System.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function AdminLogin() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-[rgb(var(--muted))]/30 flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 }>
 <AdminLoginContent />
 </Suspense>
 );
}
