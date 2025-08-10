"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  // Fun welcome messages for new users
  const welcomeMessages = [
    "🎉 Welcome to the NewsNerve family - where curiosity meets clarity!",
    "🚀 You're about to join thousands of informed news explorers!",
    "🌟 Ready to transform how you consume news? Let's get started!",
    "🎯 Join the revolution of personalized, AI-powered news discovery!",
    "🔥 About to become a certified news ninja? Awesome choice!",
    "⚡ Welcome aboard the NewsNerve express - next stop: being amazingly informed!",
    "🎪 Step right up to the greatest news show on earth!",
    "🦸‍♀️ Ready to unlock your news superpowers? Let's do this!"
  ];

  useEffect(() => {
    setWelcomeMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  }, []);

  // Password strength calculator
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return { text: "Type a password", color: "text-muted-foreground", emoji: "🤔" };
    if (passwordStrength <= 25) return { text: "Weak - needs work!", color: "text-destructive", emoji: "😰" };
    if (passwordStrength <= 50) return { text: "Getting better...", color: "text-yellow-500", emoji: "😐" };
    if (passwordStrength <= 75) return { text: "Good password!", color: "text-blue-500", emoji: "😊" };
    return { text: "Fortress-level security!", color: "text-green-500", emoji: "🛡️" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
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
        
        // Redirect to homepage
        window.location.href = '/';
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    // TODO: Implement social signup
    console.log(`Sign up with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-primary/15 rounded-full blur-2xl animate-ping" style={{animationDuration: '5s'}}></div>
      </div>

      {/* Floating Registration Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-8 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3.2s'}}>✍️</div>
        <div className="absolute top-28 right-16 text-xl animate-bounce" style={{animationDelay: '1.2s', animationDuration: '4.1s'}}>📝</div>
        <div className="absolute bottom-36 left-16 text-lg animate-bounce" style={{animationDelay: '2.1s', animationDuration: '3.8s'}}>👋</div>
        <div className="absolute bottom-16 right-8 text-2xl animate-bounce" style={{animationDelay: '0.8s', animationDuration: '3.5s'}}>🎉</div>
        <div className="absolute top-1/2 right-4 text-sm animate-bounce" style={{animationDelay: '1.8s', animationDuration: '4.2s'}}>🌟</div>
        <div className="absolute top-2/5 left-4 text-lg animate-bounce" style={{animationDelay: '2.8s', animationDuration: '3.9s'}}>🚀</div>
        <div className="absolute top-3/4 left-1/3 text-md animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>💫</div>
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Animated Welcome Banner */}
        <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20 animate-fade-in">
          <p className="text-sm font-medium text-primary">{welcomeMessage}</p>
        </div>

        {/* Header with Animation */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <h1 className="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary/80">
              ✨ NewsNerve
            </h1>
            <p className="text-muted-foreground text-sm mt-1 transition-all duration-300 group-hover:text-primary/60">
              Your world. Your interests. Your news. 🌍
            </p>
          </Link>
          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-bold text-foreground animate-fade-in">
              Join the News Revolution! 🎯
            </h2>
            <p className="text-sm text-muted-foreground">
              Already a news explorer?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline">
                Sign in to continue your journey 🚀
              </Link>
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          <div className={`h-2 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`h-2 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`h-2 w-8 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
        </div>

        {/* Enhanced Registration Form */}
        <div className="bg-card rounded-xl shadow-2xl p-8 border border-border transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0 animate-bounce">
                    <span className="text-destructive text-xl">🚫</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      Oops! {errors.general} 🤔
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                  👋 First Name
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 ${
                      errors.firstName ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="John"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    👋
                  </div>
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-destructive animate-shake">{errors.firstName}</p>
                )}
              </div>

              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                  👤 Last Name
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 ${
                      errors.lastName ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="Doe"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    👤
                  </div>
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-destructive animate-shake">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
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
                  className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 ${
                    errors.email ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="john@example.com"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                  📧
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive animate-shake">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                🔐 Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-12 border rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 ${
                    errors.password ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Create your secret code..."
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
              {errors.password && (
                <p className="mt-1 text-xs text-destructive animate-shake">{errors.password}</p>
              )}
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 25 ? 'bg-destructive' :
                          passwordStrength <= 50 ? 'bg-yellow-500' :
                          passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${getPasswordStrengthText().color}`}>
                      {getPasswordStrengthText().emoji} {getPasswordStrengthText().text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors duration-200">
                🔒 Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-12 border rounded-lg shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 ${
                    errors.confirmPassword ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Confirm your secret code..."
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                  🔒
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 text-lg"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive animate-shake">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Enhanced Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start group">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 text-primary focus:ring-primary border-input rounded transition-colors duration-200 ${
                      errors.agreeToTerms ? 'border-destructive' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-foreground group-hover:text-primary transition-colors duration-200 cursor-pointer">
                    🤝 I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-xs text-destructive animate-shake">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex items-center h-5">
                  <input
                    id="subscribeNewsletter"
                    name="subscribeNewsletter"
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded transition-colors duration-200"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="subscribeNewsletter" className="text-foreground group-hover:text-primary transition-colors duration-200 cursor-pointer">
                    📬 Subscribe to our newsletter for the latest news updates and exclusive content!
                  </label>
                </div>
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
                  🚀 Creating your news command center...
                </div>
              ) : (
                <span className="group-hover:scale-110 transition-transform duration-200">
                  🎉 Join the News Revolution!
                </span>
              )}
            </button>
          </form>

          {/* Enhanced Social Signup */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground">🌐 Or join the revolution with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialSignup('google')}
                className="group w-full inline-flex justify-center py-3 px-4 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">🔍</span>
                Google Express
              </button>

              <button
                onClick={() => handleSocialSignup('github')}
                className="group w-full inline-flex justify-center py-3 px-4 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">⚫</span>
                GitHub Portal
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="transition-all duration-200 hover:text-primary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200">
              Sign in here 🚀
            </Link>
          </p>
          <p className="text-xs opacity-70">
            🎊 Welcome to the future of news - where every story matters!
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

export default RegisterPage;
