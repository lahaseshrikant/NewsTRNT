"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, ReactElement } from 'react';

interface LogoConfig {
  type: 'image' | 'code' | 'text';
  imageUrl?: string;
  customCode?: string;
  codeLanguage?: string;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  shape?: 'square' | 'circle' | 'rounded';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadowIntensity?: number;
  animation?: string;
  size?: 'small' | 'medium' | 'large';
  clipPath?: string;
  gradient?: {
    enabled: boolean;
    direction: string;
    colors: string[];
  };
}

interface LogoContextType {
  currentLogo: LogoConfig;
  setCurrentLogo: (logo: LogoConfig) => void;
  renderLogo: (size?: 'small' | 'medium' | 'large', className?: string) => ReactElement;
}

const defaultLogo: LogoConfig = {
  type: 'text',
  text: 'NN',
  fontSize: 24,
  fontWeight: 'bold',
  fontFamily: 'Arial, sans-serif',
  color: '#ffffff',
  backgroundColor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  shape: 'rounded',
  borderRadius: 8,
  borderWidth: 0,
  borderColor: '#ffffff',
  shadowIntensity: 2,
  animation: 'none',
  size: 'medium',
  clipPath: 'none',
  gradient: {
    enabled: true,
    direction: '135deg',
    colors: ['#3b82f6', '#8b5cf6']
  }
};

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({ children }: { children: ReactNode }) {
  const [currentLogo, setCurrentLogo] = useState<LogoConfig>(defaultLogo);

  // Load saved logo on mount and listen for changes
  useEffect(() => {
    // Load saved logo from localStorage
    const savedLogo = localStorage.getItem('newstrnt-active-logo');
    if (savedLogo) {
      try {
        const logoConfig = JSON.parse(savedLogo);
        setCurrentLogo({ ...defaultLogo, ...logoConfig });
      } catch (error) {
        console.error('Error loading saved logo:', error);
      }
    }

    // Listen for logo change events
    const handleLogoChange = (event: CustomEvent) => {
      setCurrentLogo(event.detail.config);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'newstrnt-active-logo' && event.newValue) {
        try {
          const logoConfig = JSON.parse(event.newValue);
          setCurrentLogo({ ...defaultLogo, ...logoConfig });
        } catch (error) {
          console.error('Error parsing logo from storage:', error);
        }
      }
    };

    window.addEventListener('logoChanged', handleLogoChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('logoChanged', handleLogoChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const animationClasses: { [key: string]: string } = {
    none: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    ping: 'animate-ping',
    float: 'logo-float',
    glow: 'logo-glow'
  };

  const renderLogo = (size: 'small' | 'medium' | 'large' = 'medium', className: string = '') => {
    const borderRadius = currentLogo.borderRadius || 0;
    const borderWidth = currentLogo.borderWidth || 0;
    const borderColor = currentLogo.borderColor || '#ffffff';
    const shadowIntensity = currentLogo.shadowIntensity || 2;

    const getBorderRadius = () => {
      if (currentLogo.shape === 'circle') return '50%';
      if (currentLogo.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return currentLogo.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadow = () => {
      const shadows = [
        'none',
        '0 1px 3px rgba(0,0,0,0.12)',
        '0 4px 6px rgba(0,0,0,0.1)',
        '0 10px 15px rgba(0,0,0,0.1)',
        '0 20px 25px rgba(0,0,0,0.15)'
      ];
      return shadows[shadowIntensity] || shadows[2];
    };

    // Handle different logo types
    if (currentLogo.type === 'image' && currentLogo.imageUrl) {
      return (
        <div
          className={`relative ${sizeClasses[size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[currentLogo.animation || 'none']} ${className}`}
          style={{
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            boxShadow: getShadow()
          }}
        >
          <img
            src={currentLogo.imageUrl} 
            alt="Logo" 
            className="w-full h-full object-cover"
            style={{
              clipPath: currentLogo.clipPath || 'none'
            }}
          />
        </div>
      );
    }

    if (currentLogo.type === 'code' && currentLogo.customCode) {
      return (
        <div
          className={`${sizeClasses[size]} ${animationClasses[currentLogo.animation || 'none']} ${className}`}
          dangerouslySetInnerHTML={{ 
            __html: currentLogo.customCode 
          }}
        />
      );
    }

    // Default text logo
    const backgroundStyle = currentLogo.gradient?.enabled 
      ? `linear-gradient(${currentLogo.gradient.direction}, ${currentLogo.gradient.colors.join(', ')})`
      : currentLogo.backgroundColor;

    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center text-white font-bold transition-all duration-500 hover:scale-105 ${animationClasses[currentLogo.animation || 'none']} ${className}`}
        style={{
          background: backgroundStyle,
          borderRadius: getBorderRadius(),
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          boxShadow: getShadow(),
          fontSize: currentLogo.fontSize ? `${currentLogo.fontSize}px` : '16px',
          fontWeight: currentLogo.fontWeight || 'bold',
          fontFamily: currentLogo.fontFamily || 'Arial, sans-serif',
          color: currentLogo.color || '#ffffff',
          clipPath: currentLogo.clipPath || 'none'
        }}
      >
        {currentLogo.text || 'NN'}
      </div>
    );
  };

  return (
    <LogoContext.Provider value={{ currentLogo, setCurrentLogo, renderLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}
