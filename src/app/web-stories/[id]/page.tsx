"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface WebStorySlide {
  id: string;
  type: 'image' | 'video' | 'text';
  background: string;
  content: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    cta?: {
      text: string;
      url: string;
    };
  };
  duration?: number; // Made optional since we have a fallback
}

interface WebStory {
  id: string;
  title: string;
  category: string;
  slides: WebStorySlide[];
  publishedAt: string;
  author: string;
  views: number;
}

const WebStoryViewer: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  
  // Default slide duration (5 seconds) if not specified
  const DEFAULT_SLIDE_DURATION = 5000;
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused, then auto-start
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Minimum swipe distance for navigation
  const minSwipeDistance = 50;

  // Mock story data - in real app, this would come from API
  const story: WebStory = {
    id: storyId,
    title: 'Climate Summit 2024: Key Highlights',
    category: 'Environment',
    author: 'Environmental Team',
    publishedAt: '2024-01-21T10:30:00Z',
    views: 12540,
    slides: [
      {
        id: 'slide-1',
        type: 'image',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        content: {
          headline: 'Climate Summit 2024',
          text: 'World leaders gather in Dubai for crucial climate discussions that could shape our planet\'s future',
          image: '/api/placeholder/400/700'
        },
        duration: 6000
      },
      {
        id: 'slide-2',
        type: 'text',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        content: {
          headline: '195 Countries Participate',
          text: 'The largest climate summit in history brings together world leaders, activists, and scientists to address the climate crisis',
        },
        duration: 5000
      },
      {
        id: 'slide-3',
        type: 'image',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        content: {
          headline: '$100B Climate Fund Launched',
          text: 'Historic funding commitment to help developing nations transition to renewable energy',
          image: '/api/placeholder/400/700',
          cta: {
            text: 'See More',
            url: '/web-stories'
          }
        },
        duration: 6000
      },
      {
        id: 'slide-4',
        type: 'text',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        content: {
          headline: 'What\'s Next?',
          text: 'Countries have 6 months to submit their updated climate action plans. The next summit will be held in 2025.',
          cta: {
            text: 'Stay Updated',
            url: '/newsletter'
          }
        }
        // No duration specified - will use DEFAULT_SLIDE_DURATION (5000ms)
      }
    ]
  };

  // Calculate current slide and total slides with bounds checking
  const totalSlides = story.slides.length;
  const currentSlide = currentSlideIndex >= 0 && currentSlideIndex < totalSlides 
    ? story.slides[currentSlideIndex] 
    : null;

  console.log('Component state:', { currentSlideIndex, totalSlides, hasCurrentSlide: !!currentSlide });

  // Helper function to get slide duration with fallback
  const getSlideDuration = (slide: WebStorySlide | null): number => {
    return slide?.duration || DEFAULT_SLIDE_DURATION;
  };

  // Auto-advance slides with automatic progression
  useEffect(() => {
    console.log('Progress Effect:', { isPaused, currentSlideIndex, progress, slideId: currentSlide?.id });
    
    if (isPaused || !currentSlide || isLoading) {
      console.log('Skipping progress - paused or loading');
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const startTime = Date.now() - pausedTimeRef.current;
    startTimeRef.current = startTime;
    
    const slideDuration = getSlideDuration(currentSlide);
    console.log('Starting interval for slide index:', currentSlideIndex, 'duration:', slideDuration);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = (elapsed / slideDuration) * 100;
      
      setProgress(Math.min(progressPercent, 100));
      
      if (elapsed >= slideDuration) {
        console.log('Slide completed, current index:', currentSlideIndex, 'total slides:', totalSlides);
        
        // Clear interval immediately to prevent multiple executions
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if (currentSlideIndex < totalSlides - 1) {
          // Auto advance to next slide
          const nextIndex = currentSlideIndex + 1;
          console.log('Moving to slide index:', nextIndex);
          setCurrentSlideIndex(nextIndex);
          setProgress(0);
          pausedTimeRef.current = 0;
        } else {
          // Story finished - redirect to stories page
          console.log('Story completed, redirecting...');
          setProgress(100);
          setTimeout(() => {
            router.push('/web-stories');
          }, 500);
        }
      }
    }, 100); // Increased interval for stability

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentSlideIndex, isPaused, isLoading]); // Removed currentSlide and totalSlides from dependencies

  // Auto-start the story when component mounts and loading is complete
  useEffect(() => {
    console.log('Mount effect - isLoading:', isLoading);
    
    if (!isLoading) {
      const timer = setTimeout(() => {
        console.log('Auto-starting story...');
        setIsPaused(false);
        setProgress(0);
        pausedTimeRef.current = 0;
      }, 300); // Small delay after loading

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Loading effect - shorter duration
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Loading complete');
      setIsLoading(false);
    }, 500); // Reduced from 1000ms
    return () => clearTimeout(timer);
  }, []);

  // Handle touch/click navigation
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const tapX = x - rect.left;
    const tapPosition = tapX / rect.width;

    if (tapPosition < 0.3) {
      // Tap left - previous slide
      goToPreviousSlide();
    } else if (tapPosition > 0.7) {
      // Tap right - next slide
      goToNextSlide();
    } else {
      // Tap center - pause/resume
      setIsPaused(!isPaused);
      if (isPaused) {
        pausedTimeRef.current = 0;
      } else {
        const slideDuration = getSlideDuration(currentSlide);
        pausedTimeRef.current = (progress / 100) * slideDuration;
      }
    }
  };

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPreviousSlide();
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
      pausedTimeRef.current = 0;
      setIsPaused(false); // Resume auto-progression
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
      pausedTimeRef.current = 0;
      setIsPaused(false); // Resume auto-progression
    } else {
      router.push('/web-stories');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'ArrowRight':
          goToNextSlide();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(!isPaused);
          break;
        case 'Escape':
          router.push('/web-stories');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, isPaused, router]);

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  // Safety check for current slide
  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Story not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-pan-y">
      {/* Mobile Container - Centered with mobile dimensions */}
      <div className="h-full w-full max-w-sm mx-auto relative bg-black">
        {/* Enhanced Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-50 flex space-x-1">
          {story.slides.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <div 
                className="h-full bg-white rounded-full transition-all duration-75 shadow-sm"
                style={{ 
                  width: index < currentSlideIndex ? '100%' : 
                         index === currentSlideIndex ? `${progress}%` : '0%',
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)'
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Story Content */}
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={handleTap}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ background: currentSlide.background }}
        >
          {/* Background Image with better loading and fallback */}
          {currentSlide.type === 'image' && currentSlide.content.image && (
            <div className="relative w-full h-full">
              <Image
                src={currentSlide.content.image}
                alt={currentSlide.content.headline || 'Story content'}
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  filter: 'brightness(0.8) contrast(1.1)',
                }}
              />
              {/* Loading overlay */}
              <div className="absolute inset-0 bg-gray-900 animate-pulse" 
                   style={{ display: 'none' }} />
            </div>
          )}

          {/* Video content with enhanced visibility */}
          {currentSlide.type === 'video' && currentSlide.content.video && (
            <div className="relative w-full h-full">
              <video
                src={currentSlide.content.video}
                className="w-full h-full object-cover object-center"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                style={{
                  filter: 'brightness(0.8) contrast(1.1)',
                }}
              />
            </div>
          )}

          {/* Enhanced Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          
          {/* Additional overlay for better text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pb-20 sm:pb-24 text-white z-10">
            {/* Main Content Area */}
            <div className="space-y-4">
              {currentSlide.content.headline && (
                <h1 className="text-xl font-black leading-tight text-shadow-xl drop-shadow-2xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)] text-white">
                  {currentSlide.content.headline}
                </h1>
              )}
              
              {currentSlide.content.text && (
                <p className="text-base font-semibold leading-relaxed text-shadow-lg [text-shadow:_1px_1px_4px_rgb(0_0_0_/_70%)] text-white/95 backdrop-blur-sm bg-black/20 rounded-lg p-3 border border-white/10">
                  {currentSlide.content.text}
                </p>
              )}

              {/* Enhanced Call to Action */}
              {currentSlide.content.cta && (
                <div className="pt-3">
                  <Link
                    href={currentSlide.content.cta.url}
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-white/20 backdrop-blur-sm [text-shadow:_1px_1px_3px_rgb(0_0_0_/_50%)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {currentSlide.content.cta.text}
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Single Line Action Bar */}
            <div className="mt-6 pt-4 border-t border-white/30 backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between">
                {/* Site Branding */}
                <div className="flex items-center">
                  <div className="text-base font-bold text-white [text-shadow:_1px_1px_3px_rgb(0_0_0_/_70%)]">
                    NewsTRNT
                  </div>
                </div>

                {/* Action Buttons in One Line */}
                <div className="flex items-center space-x-2">
                  {/* Like Button */}
                  <button className="w-9 h-9 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center border-2 border-white/40 hover:bg-white/40 transition-all duration-200 hover:scale-110 shadow-lg">
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                    </svg>
                  </button>
                  
                  {/* Save Button */}
                  <button className="w-9 h-9 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center border-2 border-white/40 hover:bg-white/40 transition-all duration-200 hover:scale-110 shadow-lg">
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                  </button>
                  
                  {/* Share Button */}
                  <button className="w-9 h-9 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center border-2 border-white/40 hover:bg-white/40 transition-all duration-200 hover:scale-110 shadow-lg">
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebStoryViewer;
