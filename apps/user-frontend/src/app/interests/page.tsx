"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userPreferencesApi } from '@/lib/api-client';
import showToast from '@/lib/toast';
import { LaptopIcon, GovernmentIcon, BriefcaseIcon, SoccerIcon, ClapperIcon, HospitalIcon, MicroscopeIcon, GlobeIcon, SproutIcon, BooksIcon } from '@/components/icons/EditorialIcons';

const InterestsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [initialInterests, setInitialInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/interests');
    }
  }, [authLoading, isAuthenticated, router]);

  const availableInterests = [
    { id: 'technology', name: 'Technology', icon: <LaptopIcon size={24} />, description: 'AI, Software, Gadgets' },
    { id: 'politics', name: 'Politics', icon: <GovernmentIcon size={24} />, description: 'Elections, Policy, Government' },
    { id: 'business', name: 'Business', icon: <BriefcaseIcon size={24} />, description: 'Finance, Markets, Economy' },
    { id: 'sports', name: 'Sports', icon: <SoccerIcon size={24} />, description: 'Football, Basketball, Olympics' },
    { id: 'entertainment', name: 'Entertainment', icon: <ClapperIcon size={24} />, description: 'Movies, Music, Celebrity' },
    { id: 'health', name: 'Health', icon: <HospitalIcon size={24} />, description: 'Medical, Wellness, Fitness' },
    { id: 'science', name: 'Science', icon: <MicroscopeIcon size={24} />, description: 'Research, Discovery, Innovation' },
    { id: 'world', name: 'World News', icon: <GlobeIcon size={24} />, description: 'International, Global Events' },
    { id: 'environment', name: 'Environment', icon: <SproutIcon size={24} />, description: 'Climate, Sustainability' },
    { id: 'education', name: 'Education', icon: <BooksIcon size={24} />, description: 'Schools, Universities, Learning' }
  ];

  // Load user's existing interests from backend
  useEffect(() => {
    const loadInterests = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const topics = await userPreferencesApi.getFollowedTopics(user.id);
        const topicNames = topics.map(t => t.name);
        setSelectedInterests(topicNames);
        setInitialInterests(topicNames);
      } catch (error) {
        console.error('Error loading interests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInterests();
  }, [user?.id]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const hasChanges = JSON.stringify([...selectedInterests].sort()) !== JSON.stringify([...initialInterests].sort());

  const handleSave = async () => {
    if (!user?.id) {
      showToast('Please sign in to save interests', 'error');
      return;
    }
    setSaving(true);
    try {
      const topicsToSave = selectedInterests.map(name => {
        const interest = availableInterests.find(i => i.name === name);
        return {
          name,
          slug: interest?.id || name.toLowerCase().replace(/\s+/g, '-'),
        };
      });
      const result = await userPreferencesApi.saveInterests(user.id, topicsToSave);
      if (result.success) {
        setInitialInterests([...selectedInterests]);
        showToast('Interests saved successfully! Your feed will be personalized.', 'success');
      } else {
        showToast(`Saved with ${result.errors} error(s). Some interests may not have been saved.`, 'error');
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      showToast('Failed to save interests. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
  <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink dark:text-paper">Your Interests</h1>
              <p className="text-muted-foreground dark:text-muted-foreground mt-2">
                Select topics you're interested in to personalize your news feed
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="text-vermillion hover:text-vermillion/80 flex items-center"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
  <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-ink dark:text-paper">
                  Selected Interests ({selectedInterests.length}/10)
                </h2>
                <span className="text-sm text-muted-foreground">
                  Select at least 3 interests for better recommendations
                </span>
              </div>
              <div className="w-full bg-ash dark:bg-ash/30 rounded-full h-2">
                <div 
                  className="bg-vermillion h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((selectedInterests.length / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Interest Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {availableInterests.map((interest) => (
              <div
                key={interest.id}
                onClick={() => toggleInterest(interest.name)}
                className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedInterests.includes(interest.name)
                    ? 'border-vermillion bg-vermillion/10 dark:bg-vermillion/20'
                    : 'border-border bg-background hover:border-stone'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{interest.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink dark:text-paper mb-1">
                      {interest.name}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {interest.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedInterests.includes(interest.name) ? (
                      <div className="w-6 h-6 bg-vermillion rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-stone rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-paper">
                  Ready to personalize your feed?
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  These interests will help us show you more relevant news
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedInterests([])}
                  className="px-4 py-2 text-muted-foreground dark:text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedInterests.length < 3 || saving || !hasChanges}
                  className="bg-vermillion text-white px-6 py-2 rounded-lg hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Interests'}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations Preview */}
          {selectedInterests.length >= 3 && (
            <div className="mt-8 bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink dark:text-paper mb-4">
                Your Personalized Feed Preview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-ink dark:text-paper/80">
                    You'll see more articles about: {selectedInterests.join(', ')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-ink dark:text-paper/80">
                    Breaking news alerts for your selected topics
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-ink dark:text-paper/80">
                    Weekly digest emails focused on your interests
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterestsPage;
