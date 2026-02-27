'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getEmailString } from '@/lib/utils';
import { ChartIcon, BookmarkIcon, GearIcon } from '@/components/icons/EditorialIcons';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/profile');
    }
  }, [loading, isAuthenticated, router]);

  // Populate edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile({
      fullName: editForm.fullName,
      username: editForm.username,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }

    setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-ink border-b-2 border-vermillion">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-vermillion rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-white">{user.fullName}</h1>
                <p className="text-white/60 text-sm">@{user.username || 'user'}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/settings"
                className="px-4 py-2 border border-white/30 text-white text-sm rounded hover:bg-white/10 transition-colors"
              >
                Settings
              </Link>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-vermillion text-white text-sm rounded hover:bg-vermillion/90 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl font-semibold text-foreground">Profile Information</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Full Name */}
            <div>
              <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:border-vermillion"
                />
              ) : (
                <p className="font-serif text-lg font-medium text-foreground">{user.fullName || 'Not set'}</p>
              )}
            </div>

            {/* Username */}
            <div className="border-t border-border pt-6">
              <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:border-vermillion"
                />
              ) : (
                <p className="font-serif text-lg font-medium text-foreground">@{user.username || 'Not set'}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="border-t border-border pt-6">
              <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1">Email</label>
              <p className="font-serif text-lg font-medium text-foreground">{getEmailString(user.email)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.isVerified ? (
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">⚠ Not verified</span>
                )}
              </p>
            </div>

            {/* Member Since */}
            <div className="border-t border-border pt-6">
              <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-1">Member Since</label>
              <p className="font-serif text-lg font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="border-t border-border pt-6">
                <label className="font-mono text-xs tracking-wider uppercase text-muted-foreground block mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-vermillion/10 text-vermillion text-sm rounded-full border border-vermillion/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="p-6 border-t border-border flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ fullName: user.fullName || '', username: user.username || '' });
                  setMessage(null);
                }}
                className="px-4 py-2 border border-border text-foreground text-sm rounded hover:bg-ash/10 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-vermillion text-white text-sm rounded hover:bg-vermillion/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard"
            className="p-4 bg-muted/50 border border-border rounded-lg hover:border-vermillion/50 transition-colors text-center"
          >
            <span className="mb-2 block"><ChartIcon size={24} /></span>
            <span className="text-sm font-medium text-foreground">Dashboard</span>
          </Link>
          <Link
            href="/saved"
            className="p-4 bg-muted/50 border border-border rounded-lg hover:border-vermillion/50 transition-colors text-center"
          >
            <span className="mb-2 block"><BookmarkIcon size={24} /></span>
            <span className="text-sm font-medium text-foreground">Saved Articles</span>
          </Link>
          <Link
            href="/settings"
            className="p-4 bg-muted/50 border border-border rounded-lg hover:border-vermillion/50 transition-colors text-center"
          >
            <span className="mb-2 block"><GearIcon size={24} /></span>
            <span className="text-sm font-medium text-foreground">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
