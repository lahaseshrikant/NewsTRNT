"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [settings, setSettings] = useState({
    // Account Settings — populated from user
    email: '',
    fullName: '',
    username: '',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    breakingNews: true,
    weeklyDigest: true,
    personalizedRecommendations: true,
    
    // Display Settings
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    articlesPerPage: 20,
    
    // Privacy Settings
    profileVisibility: 'public',
    shareReadingHistory: false,
    allowPersonalization: true,
    dataCollection: true
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/settings');
    }
  }, [loading, isAuthenticated, router]);

  // Populate settings from user data
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.fullName || '',
        username: user.username || '',
      }));
    }
  }, [user]);

  const tabs = [
    { id: 'account', name: 'Account' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'display', name: 'Display' },
    { id: 'privacy', name: 'Privacy' },
    { id: 'subscription', name: 'Subscription' }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile({
      fullName: settings.fullName,
      username: settings.username,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
    }

    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    setMessage(null);
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.new.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    setIsSaving(true);
    const result = await changePassword(passwordForm.current, passwordForm.new);
    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' });
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <p className="font-mono text-xs tracking-wider uppercase text-stone">Loading settings...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
  <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ivory">Settings</h1>
              <p className="text-ivory/60 mt-2">
                Manage your account preferences and privacy settings
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="font-mono text-xs tracking-wider uppercase text-ivory/60 hover:text-ivory flex items-center"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Status Message */}
        {message && (
          <div className={`max-w-6xl mx-auto mb-6 p-4 rounded border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="bg-ivory dark:bg-ash/10 p-4 border border-ash dark:border-ash/20">
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left font-mono text-xs tracking-wider uppercase transition-colors ${
                        activeTab === tab.id
                          ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink border-l-2 border-vermillion'
                          : 'text-stone hover:text-ink dark:hover:text-ivory hover:bg-ash/10'
                      }`}
                    >
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-ivory dark:bg-ash/10 border border-ash dark:border-ash/20">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">Account Information</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={settings.fullName}
                            onChange={(e) => handleSettingChange('fullName', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={settings.username}
                            onChange={(e) => handleSettingChange('username', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                      </div>
                      
                      <div className="pt-4 border-t border-ash dark:border-ash/20">
                        <h3 className="font-serif text-lg font-semibold text-ink dark:text-ivory mb-4">Password</h3>
                        {!showPasswordForm ? (
                          <button 
                            onClick={() => setShowPasswordForm(true)}
                            className="bg-ink dark:bg-ivory text-ivory dark:text-ink px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-ink/80 dark:hover:bg-ivory/80 transition-colors"
                          >
                            Change Password
                          </button>
                        ) : (
                          <div className="space-y-4 max-w-md">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                              <input
                                type="password"
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                              <input
                                type="password"
                                value={passwordForm.new}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                              <input
                                type="password"
                                value={passwordForm.confirm}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button 
                                onClick={handleChangePassword}
                                disabled={isSaving}
                                className="bg-vermillion text-white px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors disabled:opacity-50"
                              >
                                {isSaving ? 'Updating...' : 'Update Password'}
                              </button>
                              <button 
                                onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: '', new: '', confirm: '' }); }}
                                className="border border-ash text-ink dark:text-ivory px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-ash/10 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Email Notifications</h3>
                            <p className="text-sm text-stone">Receive news updates via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.emailNotifications}
                              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Push Notifications</h3>
                            <p className="text-sm text-stone">Receive notifications on your device</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.pushNotifications}
                              onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Breaking News Alerts</h3>
                            <p className="text-sm text-stone">Get instant alerts for breaking news</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.breakingNews}
                              onChange={(e) => handleSettingChange('breakingNews', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Weekly Digest</h3>
                            <p className="text-sm text-stone">Weekly summary of top stories</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.weeklyDigest}
                              onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display Settings */}
                {activeTab === 'display' && (
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">Display Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-ink dark:text-ivory mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                          className="w-full px-3 py-2 border border-ash dark:border-ash/20 focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-paper dark:bg-ink text-ink dark:text-ivory"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-ink dark:text-ivory mb-2">
                          Language
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="w-full px-3 py-2 border border-ash dark:border-ash/20 focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-paper dark:bg-ink text-ink dark:text-ivory"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-ink dark:text-ivory mb-2">
                          Articles per page
                        </label>
                        <select
                          value={settings.articlesPerPage}
                          onChange={(e) => handleSettingChange('articlesPerPage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-ash dark:border-ash/20 focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-paper dark:bg-ink text-ink dark:text-ivory"
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="30">30</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">Privacy &amp; Data</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Allow Personalization</h3>
                            <p className="text-sm text-stone">Use reading history to personalize content</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.allowPersonalization}
                              onChange={(e) => handleSettingChange('allowPersonalization', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-ink dark:text-ivory">Data Collection</h3>
                            <p className="text-sm text-stone">Allow analytics to improve our service</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.dataCollection}
                              onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-ash peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vermillion/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vermillion"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-ash dark:border-ash/20">
                        <h3 className="font-serif text-lg font-semibold text-ink dark:text-ivory mb-4">Data Management</h3>
                        <div className="space-y-3">
                          <button className="bg-ink dark:bg-ivory text-ivory dark:text-ink px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-ink/80 dark:hover:bg-ivory/80 transition-colors">
                            Download My Data
                          </button>
                          <button className="bg-vermillion text-white px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors ml-3">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Settings */}
                {activeTab === 'subscription' && (
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">Subscription</h2>
                    
                    <div className="bg-ivory dark:bg-ash/10 border border-ash dark:border-ash/20 p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-ink dark:text-ivory">Free Plan</h3>
                          <p className="text-stone">Access to basic news and features</p>
                        </div>
                        <span className="font-mono text-2xl font-bold text-ink dark:text-ivory">$0/month</span>
                      </div>
                    </div>
                    
                    <div className="border border-ash dark:border-ash/20 p-6">
                      <h3 className="font-serif text-lg font-semibold text-ink dark:text-ivory mb-4">Upgrade to Premium</h3>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-stone">
                          <span className="text-vermillion mr-2 font-mono">+</span>
                          Ad-free reading experience
                        </li>
                        <li className="flex items-center text-stone">
                          <span className="text-vermillion mr-2 font-mono">+</span>
                          Premium articles and analysis
                        </li>
                        <li className="flex items-center text-stone">
                          <span className="text-vermillion mr-2 font-mono">+</span>
                          Advanced personalization
                        </li>
                        <li className="flex items-center text-stone">
                          <span className="text-vermillion mr-2 font-mono">+</span>
                          Priority customer support
                        </li>
                      </ul>
                      <button className="bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                        Upgrade to Premium &mdash; $9.99/month
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="px-6 py-4 bg-ivory dark:bg-ash/10 border-t border-ash dark:border-ash/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone">
                      Changes are saved automatically
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-vermillion text-white px-6 py-2 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
