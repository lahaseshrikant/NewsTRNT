"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { dbApi, WebStory, WebStorySlide } from '@/lib/api-client';

const WebStoryViewer: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const storySlug = params.slug as string;
  
  // Default slide duration (5 seconds) if not specified
  const DEFAULT_SLIDE_DURATION = 5000;
  
  const [story, setStory] = useState<WebStory | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused, then auto-start
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Minimum swipe distance for navigation
  const minSwipeDistance = 50;

  // Load story from database
  useEffect(() => {
    const loadStory = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const loadedStory = await dbApi.getWebStory(storySlug);
        if (loadedStory) {
          setStory(loadedStory);
        } else {
          setLoadError('Story not found');
        }
      } catch (err) {
        console.error('Error loading story:', err);
        setLoadError('Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };

    loadStory();
  }, [storySlug]);

  // Calculate current slide and total slides with bounds checking
  const slides = story?.slides || [];
  const totalSlides = slides.length;
  const currentSlide = currentSlideIndex >= 0 && currentSlideIndex < totalSlides 
    ? slides[currentSlideIndex] 
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
    console.log('Mount effect - isLoading:', isLoading, 'story:', !!story);
    
    if (!isLoading && story && totalSlides > 0) {
      const timer = setTimeout(() => {
        console.log('Auto-starting story...');
        setIsPaused(false);
        setProgress(0);
        pausedTimeRef.current = 0;
      }, 300); // Small delay after loading

      return () => clearTimeout(timer);
    }
  }, [isLoading, story, totalSlides]);

  // Navigation functions
  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
      pausedTimeRef.current = 0;
      setIsPaused(false);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
      pausedTimeRef.current = 0;
      setIsPaused(false);
    } else if (totalSlides > 0) {
      router.push('/web-stories');
    }
  };

  // Keyboard navigation - must be called unconditionally (before any returns)
  useEffect(() => {
    if (isLoading || loadError || !story) return;
    
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
          setIsPaused(prev => !prev);
          break;
        case 'Escape':
          router.push('/web-stories');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, isPaused, router, isLoading, loadError, story]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !story || totalSlides === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-bold mb-2">Story Not Found</h2>
          <p className="text-stone mb-6">{loadError || 'This story may have been removed or is not available.'}</p>
          <Link
            href="/web-stories"
            className="inline-block bg-paper text-ink px-6 py-3 rounded-full font-medium hover:bg-ivory transition-colors"
          >
            Browse All Stories
          </Link>
        </div>
      </div>
    );
  }

  // Handle touch/click navigation
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const tapX = x - rect.left;
    const tapPosition = tapX / rect.width;

    if (tapPosition < 0.3) {
      goToPreviousSlide();
    } else if (tapPosition > 0.7) {
      goToNextSlide();
    } else {
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
              <div className="absolute inset-0 bg-ink animate-pulse" 
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
                    className="inline-flex items-center bg-vermillion hover:bg-vermillion/90 text-white px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-white/20 backdrop-blur-sm [text-shadow:_1px_1px_3px_rgb(0_0_0_/_50%)]"
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
