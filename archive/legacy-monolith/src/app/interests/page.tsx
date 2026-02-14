"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const InterestsPage: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology', 'Politics', 'Business'
  ]);

  const availableInterests = [
    { id: 'technology', name: 'Technology', icon: '💻', description: 'AI, Software, Gadgets' },
    { id: 'politics', name: 'Politics', icon: '🏛️', description: 'Elections, Policy, Government' },
    { id: 'business', name: 'Business', icon: '💼', description: 'Finance, Markets, Economy' },
    { id: 'sports', name: 'Sports', icon: '⚽', description: 'Football, Basketball, Olympics' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', description: 'Movies, Music, Celebrity' },
    { id: 'health', name: 'Health', icon: '🏥', description: 'Medical, Wellness, Fitness' },
    { id: 'science', name: 'Science', icon: '🔬', description: 'Research, Discovery, Innovation' },
    { id: 'world', name: 'World News', icon: '🌍', description: 'International, Global Events' },
    { id: 'environment', name: 'Environment', icon: '🌱', description: 'Climate, Sustainability' },
    { id: 'education', name: 'Education', icon: '📚', description: 'Schools, Universities, Learning' }
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    // TODO: Save to backend
    console.log('Saving interests:', selectedInterests);
    alert('Interests saved successfully!');
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Header */}
      <div className="bg-paper dark:bg-ink shadow-sm border-b border-ash dark:border-ash/20">
  <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink dark:text-paper">Your Interests</h1>
              <p className="text-stone dark:text-stone mt-2">
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
            <div className="bg-paper dark:bg-ink rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-ink dark:text-paper">
                  Selected Interests ({selectedInterests.length}/10)
                </h2>
                <span className="text-sm text-stone">
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
                    : 'border-ash dark:border-ash/20 bg-paper dark:bg-ink hover:border-stone'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{interest.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink dark:text-paper mb-1">
                      {interest.name}
                    </h3>
                    <p className="text-sm text-stone dark:text-stone">
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
          <div className="bg-paper dark:bg-ink rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-paper">
                  Ready to personalize your feed?
                </h3>
                <p className="text-stone dark:text-stone">
                  These interests will help us show you more relevant news
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedInterests([])}
                  className="px-4 py-2 text-stone dark:text-stone hover:text-ink dark:hover:text-paper"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedInterests.length < 3}
                  className="bg-vermillion text-white px-6 py-2 rounded-lg hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Interests
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations Preview */}
          {selectedInterests.length >= 3 && (
            <div className="mt-8 bg-paper dark:bg-ink rounded-lg p-6 shadow-sm">
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
