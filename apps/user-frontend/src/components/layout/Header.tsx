'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useLogo } from '@/contexts/LogoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { getEmailString } from '@/lib/utils';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { SearchIcon } from '@/components/icons/EditorialIcons';
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

// Dynamic navigation will be created in component using categories hook

const moreMenuItems = [
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
  background: 'linear-gradient(135deg, rgba(198, 40, 40, 0.85) 0%, rgba(184, 134, 11, 0.85) 50%, rgba(198, 40, 40, 0.7) 100%)',
  textColor: '#ffffff',
  size: 'medium',
  animation: 'none',
  customCSS: '',
  clipPath: 'none',
  hasNeuralNetwork: true,
  neuralIntensity: 50,
  borderRadius: 8,
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
  const { user, isAuthenticated, logout } = useAuth();
  const { categories } = useCategories(); // Get active categories only
  
  // Memoize navigation array to prevent infinite re-renders
  const navigation: NavigationItem[] = useMemo(() => [
    { name: 'Home', href: '/', priority: 1 },
    { name: 'News', href: '/news', priority: 2 },
    { name: 'Articles', href: '/articles', priority: 3 },
    { name: 'Opinion', href: '/opinion', priority: 4 },
    { name: 'Analysis', href: '/analysis', priority: 5 },
    { name: 'Shorts', href: '/shorts', priority: 6 },
    { name: 'Stories', href: '/web-stories', priority: 7 },
    { name: 'Trending', href: '/trending', priority: 8 },
    ...categories.map((cat, index) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      priority: index + 9 // Categories start after the fixed items
    }))
  ], [categories]); // Only recreate when categories change

  // Destructure setCurrentLogo from useLogo hook
  const { currentLogo, setCurrentLogo } = useLogo();

  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementContainerRef = useRef<HTMLDivElement | null>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Clean up measurement container on unmount
  useEffect(() => {
    return () => {
      if (measurementContainerRef.current) {
        document.body.removeChild(measurementContainerRef.current);
        measurementContainerRef.current = null;
      }
    };
  }, []);

  // Handle user logout
  const handleUserLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  // Load saved logo on component mount and listen for changes
  useEffect(() => {
    // Load saved logo from localStorage
    const savedLogo = localStorage.getItem('NewsTRNT-active-logo');
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
      if (event.key === 'NewsTRNT-active-logo' && event.newValue) {
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

  // Memoize sorted items to prevent recalculation on every render
  const sortedItems = useMemo(() => {
    return [...navigation].sort((a, b) => a.priority - b.priority);
  }, [navigation]);

  // Calculate responsive navigation based on available space
  useEffect(() => {
    const ensureMeasurementContainer = () => {
      if (measurementContainerRef.current) {
        return measurementContainerRef.current;
      }
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '-1';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.style.whiteSpace = 'nowrap';
      document.body.appendChild(el);
      measurementContainerRef.current = el;
      return el;
    };

    const calculateVisibleItems = () => {
      if (typeof window === 'undefined') {
        // Default for SSR with stable layout - show first 4 items
        setVisibleItems(sortedItems.slice(0, 4));
        setHiddenItems(sortedItems.slice(4));
        return;
      }

      const width = window.innerWidth;
      if (width < 768) {
        setVisibleItems([]);
        setHiddenItems(sortedItems);
        return;
      }

      const navWrapper = navRef.current?.parentElement;
      if (!navWrapper) {
        setVisibleItems(sortedItems);
        setHiddenItems([]);
        return;
      }

      const availableWidth = navWrapper.getBoundingClientRect().width - 8; // Small safety margin
      if (availableWidth <= 0) {
        const fallbackVisibleCount = Math.max(2, Math.floor(sortedItems.length / 2));
        setVisibleItems(sortedItems.slice(0, fallbackVisibleCount));
        setHiddenItems(sortedItems.slice(fallbackVisibleCount));
        return;
      }

      const measurementContainer = ensureMeasurementContainer();
      measurementContainer.innerHTML = '';

      const navClone = document.createElement('div');
      navClone.className = 'flex items-center space-x-1 lg:space-x-2 xl:space-x-4';
      measurementContainer.appendChild(navClone);

      const visible: NavigationItem[] = [];
      const hidden: NavigationItem[] = [];
      const measurementElements: HTMLElement[] = [];

      sortedItems.forEach((item) => {
        const itemElement = document.createElement('span');
        itemElement.className = 'px-1.5 lg:px-2 py-2 text-sm font-medium whitespace-nowrap';
        itemElement.textContent = item.name;
        navClone.appendChild(itemElement);

        const currentWidth = navClone.getBoundingClientRect().width;
        if (currentWidth <= availableWidth) {
          visible.push(item);
          measurementElements.push(itemElement);
        } else {
          navClone.removeChild(itemElement);
          hidden.push(item);
        }
      });

      if (visible.length === 0 && sortedItems.length > 0) {
        visible.push(sortedItems[0]);
        hidden.splice(0, 0, ...sortedItems.slice(1));
      }

      if (hidden.length > 0) {
        const moreElement = document.createElement('span');
        moreElement.className = 'px-1.5 lg:px-2 py-2 text-sm font-medium whitespace-nowrap';
        moreElement.textContent = 'More';
        navClone.appendChild(moreElement);

        while (navClone.getBoundingClientRect().width > availableWidth && visible.length > 1) {
          const removedItem = visible.pop();
          const removedElement = measurementElements.pop();
          if (!removedItem || !removedElement) {
            break;
          }
          navClone.removeChild(removedElement);
          hidden.unshift(removedItem);
        }

        navClone.removeChild(moreElement);
      }

      const finalVisible = visible;
      const finalHidden = hidden;

      setVisibleItems((prev) => {
        if (
          prev.length !== finalVisible.length ||
          prev.some((item, index) => item.name !== finalVisible[index]?.name)
        ) {
          return finalVisible;
        }
        return prev;
      });

      setHiddenItems((prev) => {
        if (
          prev.length !== finalHidden.length ||
          prev.some((item, index) => item.name !== finalHidden[index]?.name)
        ) {
          return finalHidden;
        }
        return prev;
      });
    };

    const initialTimeout = setTimeout(calculateVisibleItems, 100);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateVisibleItems, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      clearTimeout(initialTimeout);
    };
  }, [sortedItems]);

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
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(198, 40, 40, 0.${intensity > 5 ? '4' : '3'}))`;
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
      {/* Main Header */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
        <div ref={containerRef} className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 gap-4 sm:gap-6">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5 py-2 group">
                <DivergenceMark size={22} className="text-vermillion flex-shrink-0" />
                <div className="hidden sm:flex flex-col justify-center min-w-0">
                  <h1 className="font-serif text-lg xl:text-xl text-ink leading-tight whitespace-nowrap tracking-tight">
                    NewsTRNT
                  </h1>
                  <p className="text-[9px] xl:text-[10px] text-stone font-mono leading-tight whitespace-nowrap tracking-wide">
                    The Road Not Taken
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation wrapper */}
            <div className="hidden md:flex flex-1 min-w-0 relative">
              {/* Responsive Desktop Navigation */}
              <nav ref={navRef} className="flex items-center justify-start space-x-1 lg:space-x-2 xl:space-x-4 flex-1 min-w-0 relative z-10 pr-6">
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
                        className="flex items-center text-foreground hover:text-primary px-1.5 lg:px-2 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap"
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
                      <div className={`absolute top-full left-0 mt-1 w-56 z-[100] transition-all duration-200 ease-in-out transform origin-top ${
                        openDropdown === item.name 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                      }`}>
                        <div className="dropdown-card py-2">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setOpenDropdown(null)}
                              className="dropdown-item"
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
                      className="text-ink/70 hover:text-ink px-1.5 lg:px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap relative"
                    >
                      {item.name === 'Stories' && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-vermillion rounded-full"></span>
                      )}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* More dropdown for hidden items + additional menu items */}
              {(hiddenItems.length > 0 || moreMenuItems.length > 0) && (
                <div className="relative" ref={(el) => { dropdownRefs.current['more'] = el; }}>
                  <button
                    onClick={() => {
                      setOpenDropdown(openDropdown === 'more' ? null : 'more');
                      setIsProfileOpen(false);
                      setIsNotificationsOpen(false);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center text-foreground hover:text-primary px-1.5 lg:px-2 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap relative"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                    <span className="ml-1 hidden lg:inline">More</span>
                    {hiddenItems.length > 0 && (
                      <span className="ml-1 bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {hiddenItems.length}
                      </span>
                    )}
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
                  
                  {/* More dropdown with smooth animation - hidden nav items + additional menu items */}
                  <div className={`absolute top-full right-0 mt-1 w-56 z-[100] transition-all duration-200 ease-in-out transform origin-top-right ${
                    openDropdown === 'more' 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="dropdown-card py-2">
                      {hiddenItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="dropdown-item"
                        >
                          {item.name === 'Stories' && <span className="w-2 h-2 bg-primary rounded-full inline-block mr-2"></span>}
                          {item.name}
                        </Link>
                      ))}
                      {hiddenItems.length > 0 && (
                        <div className="dropdown-divider"></div>
                      )}
                      {moreMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="dropdown-item"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0 relative z-10 min-w-max ml-4 sm:ml-6 pl-4 sm:pl-6 border-l border-border">
              {/* Search */}
              <div className="relative z-20" ref={searchRef}>
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    setIsProfileOpen(false);
                    setIsNotificationsOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-stone hover:text-ink transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 z-[100] glass-panel p-4">
                    <form onSubmit={handleSearch}>
                      <input
                        type="text"
                        placeholder="Search stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-ash focus:border-vermillion/50 focus:outline-none focus:ring-2 focus:ring-vermillion/10 bg-ivory text-ink placeholder-stone font-mono text-sm transition-all"
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
              <div className="relative z-20" ref={notificationsRef}>
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors relative"
                >
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-vermillion rounded-full"></span>
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 z-[100] dropdown-card py-2">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-primary/10 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">Breaking: Major tech announcement from Silicon Valley</p>
                            <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-primary/10 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">Your daily news digest is ready</p>
                            <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-primary/10 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">Climate summit reaches historic agreement</p>
                            <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 border-t border-border">
                      <Link
                        href="/notifications"
                        className="text-sm text-primary hover:underline font-medium"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative z-20" ref={profileRef}>
                <button 
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 z-[100] dropdown-card py-2">
                    {isAuthenticated && user ? (
                      <>
                        {/* Logged in user */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {user.fullName || 'User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getEmailString(user.email) || 'user@example.com'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="dropdown-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/saved"
                            className="dropdown-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Saved Articles
                          </Link>
                          <Link
                            href="/interests"
                            className="dropdown-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            My Interests
                          </Link>
                          <Link
                            href="/settings"
                            className="dropdown-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Settings
                          </Link>
                          
                          <div className="dropdown-divider"></div>
                          
                          {/* User Logout */}
                          <button
                            className="block w-full text-left px-4 py-2.5 text-sm text-vermillion hover:bg-vermillion/5 transition-colors"
                            onClick={handleUserLogout}
                          >
                            Sign Out
                          </button>
                          

                        </div>
                      </>
                    ) : (
                      <>
                        {/* Not logged in */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-muted-foreground font-semibold">?</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Guest</p>
                              <p className="text-xs text-muted-foreground">Not signed in</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            href="/auth/signin"
                            className="dropdown-item !text-ink font-medium"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/auth/signup"
                            className="dropdown-item !text-vermillion font-medium"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Join NewsTRNT
                          </Link>
                          
                          <div className="dropdown-divider"></div>
                          
                          <Link
                            href="/about"
                            className="dropdown-item"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            About NewsTRNT
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors"
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
          <div className={`md:hidden border-t border-border transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <nav className="flex flex-col space-y-1 py-4">
              {/* Mobile Header Bar - Date & Theme */}
              <div className="flex items-center justify-between px-3 py-2 mb-2 bg-secondary/50 rounded-xl mx-2">
                <div className="flex items-center gap-2 text-stone">
                  <span className="text-xs font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <ThemeToggle />
              </div>
              
              {sortedItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `mobile-${item.name}` ? null : `mobile-${item.name}`)}
                        className="w-full flex items-center justify-between text-foreground hover:text-primary px-3 py-2.5 rounded-md text-base font-semibold transition-colors"
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
                              className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm transition-colors"
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
                      className="text-foreground hover:text-primary px-3 py-2.5 rounded-md text-base font-semibold transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name === 'Stories' && (
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      )}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="border-t border-border mt-2 pt-2">
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary px-3 py-2.5 rounded-md text-sm font-medium transition-colors block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="border-t border-border mt-2 pt-2">
                  {isAuthenticated && user ? (
                    <>
                      {/* Logged in user info */}
                      <div className="px-3 py-2 border-b border-border mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {user.fullName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getEmailString(user.email) || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* User Logout */}
                      <button
                        className="w-full text-left px-3 py-2.5 text-vermillion hover:bg-vermillion/5 transition-colors text-sm font-medium"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleUserLogout();
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Not logged in - show sign in options */}
                      <Link
                        href="/auth/signin"
                        className="block px-3 py-2.5 text-ink hover:bg-ink/5 transition-colors text-sm font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-3 py-2.5 text-vermillion hover:bg-vermillion/5 transition-colors text-sm font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Join NewsTRNT
                      </Link>
                    </>
                  )}
                </div>
                

              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
