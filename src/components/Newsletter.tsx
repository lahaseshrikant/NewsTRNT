'use client';

import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface NewsletterProps {
  variant?: 'default' | 'footer' | 'modal';
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({ variant = 'default', className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          You're all set!
        </h3>
        <p className="text-muted-foreground">
          Thank you for subscribing to our newsletter. You'll receive the latest news updates in your inbox.
        </p>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <div className="flex items-center mb-4">
          <EnvelopeIcon className="w-6 h-6 text-vermillion mr-2" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Stay Updated
          </h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Get the latest news delivered straight to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 border border-ash dark:border-ash/20 bg-paper dark:bg-ink text-ink dark:text-ivory placeholder-stone focus:ring-2 focus:ring-vermillion/30 focus:border-vermillion"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-vermillion text-white font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-ivory dark:bg-ash/10 border border-ash dark:border-ash/20 p-8 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-ink dark:bg-ivory">
            <EnvelopeIcon className="w-8 h-8 text-ivory dark:text-ink" />
          </div>
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          Stay in the Loop
        </h3>
        <p className="text-stone mb-6 max-w-md mx-auto">
          Subscribe to our newsletter and never miss breaking news, exclusive stories, and insider insights.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-ash dark:border-ash/20 bg-paper dark:bg-ink text-ink dark:text-ivory placeholder-stone focus:ring-2 focus:ring-vermillion/30 focus:border-vermillion"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
