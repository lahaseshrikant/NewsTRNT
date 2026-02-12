"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account Settings
    email: 'user@example.com',
    fullName: 'John Doe',
    username: 'johndoe',
    
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

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

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
                        <button className="bg-ink dark:bg-ivory text-ivory dark:text-ink px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-ink/80 dark:hover:bg-ivory/80 transition-colors">
                          Change Password
                        </button>
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
                      className="bg-vermillion text-white px-6 py-2 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors"
                    >
                      Save Changes
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
