"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newsQuote, setNewsQuote] = useState('');
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const router = useRouter();

  // Fun news-related quotes
  const newsQuotes = [
    "📰 Breaking: You're about to get the best news experience!",
    "🚨 URGENT: Your personalized news feed is waiting...",
    "📱 LIVE: Smart AI is curating your perfect news mix",
    "⚡ FLASH: NewsNerve detected in your area - side effects include being well-informed!",
    "🎯 EXCLUSIVE: Local person about to become incredibly well-informed",
    "🔔 ALERT: Boredom levels dropping rapidly in this browser",
    "📺 THIS JUST IN: Reader discovers amazing news platform",
    "🌟 TRENDING: You + NewsNerve = Perfect Match!"
  ];

  useEffect(() => {
    // Random quote on mount
    setNewsQuote(newsQuotes[Math.floor(Math.random() * newsQuotes.length)]);
    
    // Change quote every 5 seconds with animation
    const interval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => {
        setNewsQuote(newsQuotes[Math.floor(Math.random() * newsQuotes.length)]);
        setPulseAnimation(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to update layout
        window.dispatchEvent(new Event('authStatusChanged'));
        
        // Redirect to homepage to see the full site with header/footer
        window.location.href = '/';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/15 rounded-full blur-2xl animate-ping" style={{animationDuration: '4s'}}></div>
      </div>

      {/* Floating News Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>📰</div>
        <div className="absolute top-32 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>📺</div>
        <div className="absolute bottom-40 left-20 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>📱</div>
        <div className="absolute bottom-20 right-10 text-2xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🌍</div>
        <div className="absolute top-1/2 right-5 text-sm animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>⚡</div>
        <div className="absolute top-1/3 left-5 text-lg animate-bounce" style={{animationDelay: '2.5s', animationDuration: '3.8s'}}>🚨</div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Animated Quote Banner */}
        <div className={`text-center p-4 bg-primary/10 rounded-lg border border-primary/20 transition-all duration-300 ${pulseAnimation ? 'scale-105 bg-primary/20' : ''}`}>
          <p className="text-sm font-medium text-primary animate-pulse">{newsQuote}</p>
        </div>

        {/* Header with Animation */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <h1 className="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary/80">
              📰 NewsNerve
            </h1>
            <p className="text-muted-foreground text-sm mt-1 transition-all duration-300 group-hover:text-primary/60">
              Your world. Your interests. Your news. 🌟
            </p>
          </Link>
          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-bold text-foreground animate-fade-in">
              Welcome Back, News Explorer! 🎯
            </h2>
            <p className="text-sm text-muted-foreground">
              Ready to dive into today's stories? Or{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline">
                join our news adventure 🚀
              </Link>
            </p>
          </div>
        </div>

        {/* Enhanced Login Form */}
        <div className="bg-card rounded-xl shadow-2xl p-8 border border-border transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0 animate-bounce">
                    <span className="text-destructive text-xl">🚫</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      Oops! {error} 🤔
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                  📧 Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-input rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                    placeholder="your@email.com"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    📧
                  </div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                  🔐 Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 pr-12 border border-input rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                    placeholder="Your secret code..."
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    🔐
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 text-lg"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center group">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded transition-colors duration-200"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                  🧠 Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline">
                  🤔 Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  🚀 Launching into news space...
                </div>
              ) : (
                <span className="group-hover:scale-110 transition-transform duration-200">
                  🚀 Launch Into News!
                </span>
              )}
            </button>
          </form>

          {/* Enhanced Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground">🌐 Or continue your news journey with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="group w-full inline-flex justify-center py-3 px-4 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">🔍</span>
                Google Express
              </button>

              <button
                onClick={() => handleSocialLogin('github')}
                className="group w-full inline-flex justify-center py-3 px-4 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">⚫</span>
                GitHub Portal
              </button>
            </div>
          </div>

          {/* Enhanced Demo Credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-muted">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              🎭 Demo Credentials - Pick Your Character:
            </h4>
            <div className="text-xs space-y-3">
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 transition-all duration-200 hover:bg-primary/15 hover:scale-105 cursor-pointer group"
                   onClick={() => setFormData({...formData, email: 'user@newsnerve.com', password: 'testuser123'})}>
                <div className="font-medium text-primary mb-1 group-hover:scale-110 transition-transform duration-200">
                  👤 Regular User (News Explorer)
                </div>
                <div className="text-muted-foreground">📧 user@newsnerve.com</div>
                <div className="text-muted-foreground">🔑 testuser123</div>
                <div className="text-xs text-primary/80 mt-1">Click to auto-fill! ✨</div>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 transition-all duration-200 hover:bg-destructive/15 hover:scale-105 cursor-pointer group"
                   onClick={() => setFormData({...formData, email: 'admin@newsnerve.com', password: 'admin123'})}>
                <div className="font-medium text-destructive mb-1 group-hover:scale-110 transition-transform duration-200">
                  👑 Admin User (News Commander)
                </div>
                <div className="text-muted-foreground">📧 admin@newsnerve.com</div>
                <div className="text-muted-foreground">🔑 admin123</div>
                <div className="text-xs text-destructive/80 mt-1">Click to auto-fill! ✨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="transition-all duration-200 hover:text-primary">
            🤝 By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
              Terms of News Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-2 text-xs opacity-70">
            🎉 Welcome to the future of news consumption!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
