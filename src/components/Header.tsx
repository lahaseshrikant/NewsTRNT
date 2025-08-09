'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAdmin } from '@/contexts/AdminContext';
import { useLogo } from '@/contexts/LogoContext';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  priority: number; // 1 = highest priority, 10 = lowest
  submenu?: { name: string; href: string }[];
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', priority: 1 },
  { name: 'World', href: '/category/world', priority: 2 },
  { name: 'Politics', href: '/category/politics', priority: 3 },
  { name: 'Technology', href: '/category/technology', priority: 4 },
  { name: 'Business', href: '/category/business', priority: 5 },
  { name: 'Sports', href: '/category/sports', priority: 6 },
  { name: 'Stories', href: '/web-stories', priority: 7 },
  { name: 'Entertainment', href: '/category/entertainment', priority: 8 },
  { name: 'Health', href: '/category/health', priority: 9 },
  { name: 'Science', href: '/category/science', priority: 10 },
];

const moreMenuItems = [
  { name: 'News Shorts', href: '/shorts' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Services', href: '/services' },
  { name: 'Careers', href: '/careers' },
];

interface LogoConfig {
  type: 'typography' | 'shape' | 'image' | 'code' | 'current';
  text: string;
  shape: string;
  background: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
  animation: 'none' | 'pulse' | 'glow' | 'bounce' | 'spin';
  customCSS: string;
  clipPath?: string;
  hasNeuralNetwork: boolean;
  neuralIntensity: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadowIntensity?: number;
  imageUrl?: string;
  imageFile?: File;
  customCode?: string;
  codeLanguage?: 'svg' | 'html' | 'css' | 'react';
}

const defaultLogo: LogoConfig = {
  type: 'current',
  text: 'NN',
  shape: 'none',
  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(67, 56, 202, 0.8) 50%, rgba(124, 58, 237, 0.8) 100%)',
  textColor: '#ffffff',
  size: 'medium',
  animation: 'none',
  customCSS: '',
  clipPath: 'none',
  hasNeuralNetwork: true,
  neuralIntensity: 50,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  shadowIntensity: 3,
  imageUrl: '',
  customCode: '',
  codeLanguage: 'svg'
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<NavigationItem[]>([]);
  
  const router = useRouter();
  const { isAdmin, logout } = useAdmin();
  const { currentLogo, setCurrentLogo } = useLogo();
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load saved logo on component mount and listen for changes
  useEffect(() => {
    // Load saved logo from localStorage
    const savedLogo = localStorage.getItem('newsnerve-active-logo');
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

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'newsnerve-active-logo' && event.newValue) {
        try {
          const logoConfig = JSON.parse(event.newValue);
          setCurrentLogo({ ...defaultLogo, ...logoConfig });
        } catch (error) {
          console.error('Error handling storage change:', error);
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

  // Calculate responsive navigation
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (typeof window === 'undefined' || !containerRef.current) {
        // Default for SSR
        const sortedItems = [...navigation].sort((a, b) => a.priority - b.priority);
        setVisibleItems(sortedItems.slice(0, 4));
        setHiddenItems(sortedItems.slice(4));
        return;
      }

      const containerWidth = containerRef.current.offsetWidth;
      const rightSideWidth = 200; // Approximate width of right side icons
      const logoWidth = window.innerWidth < 640 ? 40 : 180; // Smaller logo on mobile
      const moreButtonWidth = 80; // Width of "More" button
      const availableWidth = containerWidth - logoWidth - rightSideWidth - moreButtonWidth - 40; // 40px padding

      const itemWidth = window.innerWidth < 1024 ? 80 : 100; // Smaller items on tablet
      const maxItems = Math.floor(availableWidth / itemWidth);

      // Always show items based on priority
      const sortedItems = [...navigation].sort((a, b) => a.priority - b.priority);
      const visible = sortedItems.slice(0, Math.max(2, maxItems));
      const hidden = sortedItems.slice(Math.max(2, maxItems));

      setVisibleItems(visible);
      setHiddenItems(hidden);
    };

    // Initial calculation
    calculateVisibleItems();

    const handleResize = () => {
      calculateVisibleItems();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      
      // Check dropdown refs
      const clickedInsideDropdown = Object.values(dropdownRefs.current).some(ref => 
        ref && ref.contains(event.target as Node)
      );
      if (!clickedInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const renderDynamicLogo = () => {
    // Safely get logo properties with defaults
    const logoSize = (currentLogo.size as keyof typeof sizeClasses) || 'medium';
    const logoAnimation = (currentLogo.animation as keyof typeof animationClasses) || 'none';
    const logoTextSize = (currentLogo.size as keyof typeof textSizeClasses) || 'medium';
    
    const sizeClasses = {
      small: 'w-6 h-6 sm:w-8 sm:h-8',
      medium: 'w-8 h-8 sm:w-10 sm:h-10',
      large: 'w-10 h-10 sm:w-12 sm:h-12'
    };

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      glow: 'animate-pulse filter drop-shadow-lg',
      bounce: 'animate-bounce',
      spin: 'animate-spin'
    };

    const textSizeClasses = {
      small: 'text-xs',
      medium: 'text-xs sm:text-sm',
      large: 'text-sm sm:text-base'
    };

    // Handle new properties with defaults for backward compatibility
    const borderRadius = currentLogo.borderRadius || 0;
    const borderWidth = currentLogo.borderWidth || 0;
    const borderColor = currentLogo.borderColor || '#ffffff';
    const shadowIntensity = currentLogo.shadowIntensity || 2;

    // Determine styling based on shape and border radius
    const getBorderRadius = () => {
      if (currentLogo.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return currentLogo.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadowStyle = () => {
      if (shadowIntensity === 0) return '';
      const intensity = shadowIntensity;
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(37, 99, 235, 0.${intensity > 5 ? '4' : '3'}))`;
    };

    // Handle different logo types
    if (currentLogo.type === 'image' && currentLogo.imageUrl) {
      return (
        <div 
          className={`relative ${sizeClasses[logoSize]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logoAnimation]}`}
          style={{
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
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
          className={`relative ${sizeClasses[logoSize]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logoAnimation]}`}
          style={{
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
          dangerouslySetInnerHTML={{ 
            __html: currentLogo.codeLanguage === 'svg' ? currentLogo.customCode : 
                   `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; background: #f3f4f6; color: #6b7280;">Custom Code</div>`
          }}
        />
      );
    }

    return (
      <div 
        className={`relative ${sizeClasses[logoSize]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logoAnimation]}`}
        style={{
          background: currentLogo.backgroundColor,
          clipPath: currentLogo.clipPath || 'none',
          borderRadius: getBorderRadius(),
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          filter: getShadowStyle()
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-100"></div>
          <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse animation-delay-300"></div>
          <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse animation-delay-700"></div>
        </div>
        
        {/* Main logo content */}
        <div className="relative z-10 flex items-center space-x-0.5">
          <span 
            className={`font-black ${textSizeClasses[logoTextSize]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
            style={{ color: currentLogo.color }}
          >
            {currentLogo.text?.charAt(0) || 'N'}
          </span>
          
          {(currentLogo.text?.length || 0) > 1 && (
            <>
              {/* Dynamic connecting element - DNA-like helix */}
              <div className="relative w-1 h-3 sm:h-4 flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-white to-purple-300 rounded-full animate-pulse"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 4 16">
                  <path 
                    d="M1 2 Q2.5 4, 1 6 Q-0.5 8, 1 10 Q2.5 12, 1 14" 
                    stroke="rgba(255,255,255,0.9)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                  />
                  <path 
                    d="M3 2 Q1.5 4, 3 6 Q4.5 8, 3 10 Q1.5 12, 3 14" 
                    stroke="rgba(255,255,255,0.7)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                    style={{animationDelay: '0.3s'}}
                  />
                </svg>
              </div>
              
              <span 
                className={`font-black ${textSizeClasses[logoTextSize]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
                style={{ color: currentLogo.color }}
              >
                {currentLogo.text?.charAt(1) || 'N'}
              </span>
            </>
          )}
        </div>

        {/* Live pulse indicators */}
        <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Breaking news indicator */}
        <div className="absolute -bottom-0.5 -left-0.5 w-2 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-80"></div>
      </div>
    );
  };

  return (
    <>
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <span className="text-sm font-semibold mr-2">BREAKING:</span>
            <div className="text-sm animate-pulse">
              Latest breaking news updates from around the world • Stay informed with real-time news coverage
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg sticky top-0 z-50 transition-colors duration-300">
        <div ref={containerRef} className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                {/* Dynamic NewsNerve Logo */}
                {renderDynamicLogo()}
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-lg xl:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NewsNerve
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Your world. Your interests. Your news.
                  </p>
                </div>
              </Link>
            </div>

            {/* Responsive Desktop Navigation */}
            <nav ref={navRef} className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
              {visibleItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  ref={(el) => {
                    dropdownRefs.current[item.name] = el;
                  }}
                >
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => {
                          setOpenDropdown(openDropdown === item.name ? null : item.name);
                          setIsProfileOpen(false);
                          setIsNotificationsOpen(false);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        {item.name}
                        <svg
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ease-in-out ${
                            openDropdown === item.name ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown with smooth animation */}
                      <div className={`absolute top-full left-0 mt-1 w-56 transition-all duration-200 ease-in-out transform origin-top ${
                        openDropdown === item.name 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                      }`}>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap relative"
                    >
                      {item.name === 'Stories' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* More dropdown for hidden items */}
              {(hiddenItems.length > 0 || moreMenuItems.length > 0) && (
                <div className="relative" ref={(el) => { dropdownRefs.current['more'] = el; }}>
                  <button
                    onClick={() => {
                      setOpenDropdown(openDropdown === 'more' ? null : 'more');
                      setIsProfileOpen(false);
                      setIsNotificationsOpen(false);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                    <span className="ml-1 hidden lg:inline">More</span>
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ease-in-out ${
                        openDropdown === 'more' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* More dropdown with smooth animation */}
                  <div className={`absolute top-full right-0 mt-1 w-56 transition-all duration-200 ease-in-out transform origin-top-right ${
                    openDropdown === 'more' 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                      {hiddenItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          {item.name === 'Stories' && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>}
                          {item.name}
                        </Link>
                      ))}
                      {hiddenItems.length > 0 && moreMenuItems.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      )}
                      {moreMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    setIsProfileOpen(false);
                    setIsNotificationsOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4">
                    <form onSubmit={handleSearch}>
                      <input
                        type="text"
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                    </form>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors relative"
                >
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">Breaking: Major tech announcement from Silicon Valley</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">Your daily news digest is ready</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">Climate summit reaches historic agreement</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 border-t dark:border-gray-700">
                      <Link
                        href="/notifications"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">JD</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/saved"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        🔖 Saved Articles
                      </Link>
                      <Link
                        href="/interests"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        ❤️ My Interests
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      
                      {/* Admin Section */}
                      {isAdmin && (
                        <>
                          <div className="border-t dark:border-gray-700 my-1"></div>
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admin</p>
                          </div>
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            🏛️ Admin Panel
                          </Link>
                          <Link
                            href="/admin/content/new"
                            className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            ✏️ New Article
                          </Link>
                          <Link
                            href="/admin/logo-manager"
                            className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            🎨 Logo Manager
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t dark:border-gray-700 my-1"></div>
                      {isAdmin ? (
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                            router.push('/');
                          }}
                        >
                          🚪 Admin Logout
                        </button>
                      ) : (
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setIsProfileOpen(false);
                            console.log('Logout clicked');
                          }}
                        >
                          🚪 Sign Out
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation with smooth slide */}
          <div className={`md:hidden border-t dark:border-gray-700 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <nav className="flex flex-col space-y-2 py-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `mobile-${item.name}` ? null : `mobile-${item.name}`)}
                        className="w-full flex items-center justify-between text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                      >
                        {item.name}
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ease-in-out ${
                            openDropdown === `mobile-${item.name}` ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Mobile submenu with smooth animation */}
                      <div className={`ml-4 transition-all duration-200 ease-in-out overflow-hidden ${
                        openDropdown === `mobile-${item.name}` 
                          ? 'max-h-96 opacity-100 mt-2' 
                          : 'max-h-0 opacity-0'
                      }`}>
                        <div className="space-y-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 px-3 py-2 text-sm transition-colors duration-150"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setOpenDropdown(null);
                              }}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name === 'Stories' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      )}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                {/* Admin Mobile Buttons */}
                {isAdmin && (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admin</p>
                    </div>
                    <Link
                      href="/admin"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏛️ Admin Panel
                    </Link>
                    <Link
                      href="/admin/content/new"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ✏️ New Article
                    </Link>
                    <Link
                      href="/admin/logo-manager"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🎨 Logo Manager
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2"></div>
                  </>
                )}
                
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm transition-colors duration-200 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="px-3 py-2 sm:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
                
                {/* Mobile Logout */}
                {isAdmin && (
                  <button
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                      router.push('/');
                    }}
                  >
                    🚪 Admin Logout
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
