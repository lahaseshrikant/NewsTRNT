'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { getEmailString } from '@/lib/utils';
import { ChartIcon, BookmarkIcon, GearIcon } from '@/components/icons/EditorialIcons';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

type TabId = 'overview' | 'security' | 'preferences' | 'activity';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateProfile, changePassword, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({ fullName: '', username: '' });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/profile');
    }
  }, [loading, isAuthenticated, router]);

  // Populate edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({ fullName: user.fullName || '', username: user.username || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    const result = await updateProfile({ fullName: editForm.fullName, username: editForm.username });
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
    setIsSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setPasswordChanging(true);
    setMessage(null);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' });
    }
    setPasswordChanging(false);
  };

  const handleSendVerification = async () => {
    setMessage(null);
    const result = await authService.sendVerificationEmail();
    if (result.success) {
      setVerificationSent(true);
      setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send verification email.' });
    }
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const confirmation = prompt('Type "delete" to confirm account deletion:');
    if (confirmation?.toLowerCase() !== 'delete') return;
    setMessage({ type: 'error', text: 'Account deletion is not yet available. Please contact support@newstrnt.com' });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
          <p className="font-mono text-xs tracking-wider uppercase text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview', label: 'Overview',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    },
    {
      id: 'security', label: 'Security',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
    },
    {
      id: 'preferences', label: 'Preferences',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
    },
    {
      id: 'activity', label: 'Activity',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    },
  ];

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-ink border-b-2 border-vermillion">
        <div className="container mx-auto py-10 px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-br from-vermillion to-gold rounded-full flex items-center justify-center ring-4 ring-ivory/10 shadow-lg">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.fullName} width={80} height={80} className="rounded-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-serif font-bold">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change avatar"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => setMessage({ type: 'error', text: 'Avatar upload coming soon!' })} />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-ivory">{user.fullName || 'Your Profile'}</h1>
              <p className="text-ivory/50 text-sm mt-0.5">@{user.username || 'user'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-ivory/40 text-xs font-mono">Member since {memberSince}</span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-400 text-xs font-mono">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    Verified
                  </span>
                ) : (
                  <button onClick={handleSendVerification} className="inline-flex items-center gap-1 text-amber-400 text-xs font-mono hover:text-amber-300 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    {verificationSent ? 'Email sent!' : 'Verify email'}
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 self-start">
              <Link href="/settings" className="px-4 py-2 border border-ivory/20 text-ivory text-sm font-mono tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                Settings
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 border border-vermillion/40 text-vermillion text-sm font-mono tracking-wider uppercase hover:bg-vermillion/10 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              )}
            </svg>
            <p className="text-sm">{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-mono tracking-wide whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-vermillion text-vermillion'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold text-foreground">Profile Information</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 text-xs font-mono tracking-wider uppercase text-vermillion border border-vermillion/30 hover:bg-vermillion/10 transition-colors rounded">
                    Edit
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={editForm.fullName} onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-vermillion focus:ring-2 focus:ring-vermillion/10 transition-all" />
                  ) : (
                    <p className="text-foreground text-lg">{user.fullName || 'Not set'}</p>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Username</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <input type="text" value={editForm.username} onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-vermillion focus:ring-2 focus:ring-vermillion/10 transition-all" />
                    </div>
                  ) : (
                    <p className="text-foreground text-lg">@{user.username || 'Not set'}</p>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Email Address</label>
                  <div className="flex items-center gap-3">
                    <p className="text-foreground text-lg">{getEmailString(user.email)}</p>
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-mono bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        Verified
                      </span>
                    ) : (
                      <button onClick={handleSendVerification} className="text-xs font-mono text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-500 transition-colors">
                        {verificationSent ? 'Sent!' : 'Verify now'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Member Since</label>
                  <p className="text-foreground text-lg">{memberSince}</p>
                </div>

                {user.interests && user.interests.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-2">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest: string) => (
                        <span key={interest} className="px-3 py-1.5 bg-vermillion/10 text-vermillion text-xs rounded-full border border-vermillion/20 font-mono">
                          {interest}
                        </span>
                      ))}
                    </div>
                    <Link href="/interests" className="inline-block mt-3 text-xs font-mono text-vermillion hover:underline underline-offset-2">
                      Edit interests &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/30">
                  <button onClick={() => { setIsEditing(false); setEditForm({ fullName: user.fullName || '', username: user.username || '' }); setMessage(null); }}
                    className="px-5 py-2 border border-border text-foreground text-sm rounded-lg hover:bg-muted transition-colors" disabled={isSaving}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    className="px-5 py-2 bg-vermillion text-white text-sm rounded-lg hover:bg-vermillion-dark transition-colors disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/dashboard" className="p-5 bg-card border border-border rounded-lg hover:border-vermillion/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-vermillion"><ChartIcon size={22} /></span>
                  <span className="font-medium text-foreground group-hover:text-vermillion transition-colors">Dashboard</span>
                </div>
                <p className="text-xs text-muted-foreground">View your reading analytics and statistics.</p>
              </Link>
              <Link href="/saved" className="p-5 bg-card border border-border rounded-lg hover:border-vermillion/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-vermillion"><BookmarkIcon size={22} /></span>
                  <span className="font-medium text-foreground group-hover:text-vermillion transition-colors">Saved Articles</span>
                </div>
                <p className="text-xs text-muted-foreground">Access bookmarked stories from your reading list.</p>
              </Link>
              <Link href="/settings" className="p-5 bg-card border border-border rounded-lg hover:border-vermillion/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-vermillion"><GearIcon size={22} /></span>
                  <span className="font-medium text-foreground group-hover:text-vermillion transition-colors">Settings</span>
                </div>
                <p className="text-xs text-muted-foreground">Manage notifications, theme, and display preferences.</p>
              </Link>
            </div>
          </div>
        )}

        {/* ─── SECURITY TAB ─── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Change Password</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure.</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-vermillion focus:ring-2 focus:ring-vermillion/10 transition-all pr-10"
                      placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <EyeIcon open={showCurrentPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-vermillion focus:ring-2 focus:ring-vermillion/10 transition-all pr-10"
                      placeholder="Enter new password (min 8 characters)" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <EyeIcon open={showNewPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1.5">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-vermillion focus:ring-2 focus:ring-vermillion/10 transition-all"
                    placeholder="Confirm new password" />
                  {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button onClick={handlePasswordChange}
                  disabled={passwordChanging || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="px-5 py-2.5 bg-vermillion text-white text-sm rounded-lg hover:bg-vermillion-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {passwordChanging ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            {/* Email Verification */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Email Verification</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {user.isVerified ? (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{user.isVerified ? 'Your email is verified' : 'Your email is not verified'}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isVerified ? `${getEmailString(user.email)} — verified and secure` : 'Verify your email to unlock all features and ensure account security.'}
                    </p>
                  </div>
                  {!user.isVerified && (
                    <button onClick={handleSendVerification} disabled={verificationSent}
                      className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50">
                      {verificationSent ? 'Sent!' : 'Send Verification'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Connected Accounts</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your sign-in methods.</p>
              </div>
              <div className="divide-y divide-border">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">Sign in with your Google account</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">Coming Soon</span>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">GitHub</p>
                      <p className="text-xs text-muted-foreground">Sign in with your GitHub account</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <h2 className="font-serif text-xl font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                  </div>
                  <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PREFERENCES TAB ─── */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Reading Preferences</h2>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { label: 'Auto-play web stories', desc: 'Automatically advance to next slide in web stories', on: false },
                  { label: 'Show reading progress', desc: 'Display reading progress bar on articles', on: true },
                  { label: 'Personalized feed', desc: 'Recommend articles based on your reading history', on: true },
                ].map((pref, idx) => (
                  <div key={pref.label} className={`flex items-center justify-between ${idx > 0 ? 'border-t border-border pt-6' : ''}`}>
                    <div>
                      <p className="text-foreground font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <button className={`w-11 h-6 rounded-full relative transition-colors ${pref.on ? 'bg-vermillion' : 'bg-muted'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${pref.on ? 'right-0.5 bg-white' : 'left-0.5 bg-foreground'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">Interests</h2>
                  <p className="text-sm text-muted-foreground mt-1">Topics you follow for personalized content.</p>
                </div>
                <Link href="/interests" className="text-xs font-mono text-vermillion hover:underline underline-offset-2 uppercase tracking-wider">Manage</Link>
              </div>
              <div className="p-6">
                {user.interests && user.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string) => (
                      <span key={interest} className="px-3 py-1.5 bg-vermillion/10 text-vermillion text-xs rounded-full border border-vermillion/20 font-mono">{interest}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DivergenceMark size={24} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-3">No interests selected yet.</p>
                    <Link href="/interests" className="text-vermillion text-sm font-mono hover:underline">Choose your interests &rarr;</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Notifications</h2>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { label: 'Breaking news alerts', desc: 'Get notified for major breaking stories', on: true },
                  { label: 'Daily digest', desc: 'Receive a curated morning newsletter', on: true },
                  { label: 'Topic updates', desc: 'Updates on topics you follow', on: false },
                  { label: 'Comments & replies', desc: 'When someone replies to your comments', on: true },
                ].map((pref, idx) => (
                  <div key={pref.label} className={`flex items-center justify-between ${idx > 0 ? 'border-t border-border pt-6' : ''}`}>
                    <div>
                      <p className="text-foreground font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <button className={`w-11 h-6 rounded-full relative transition-colors ${pref.on ? 'bg-vermillion' : 'bg-muted'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${pref.on ? 'right-0.5 bg-white' : 'left-0.5 bg-foreground'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── ACTIVITY TAB ─── */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Articles Read', value: '—', icon: '📖' },
                { label: 'Reading Streak', value: '—', icon: '🔥' },
                { label: 'Bookmarks', value: '—', icon: '🔖' },
                { label: 'Comments', value: '—', icon: '💬' },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-lg p-5 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <DivergenceMark size={32} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Activity tracking will be available soon.</p>
                  <p className="text-xs text-muted-foreground mt-1">Your reading history and interactions will appear here.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
