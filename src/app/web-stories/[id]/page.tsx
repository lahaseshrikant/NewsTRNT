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
  duration: number;
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
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
          image: '/api/placeholder/400/700',
          cta: {
            text: 'Learn More',
            url: '/category/environment'
          }
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
            text: 'Read Full Story',
            url: '/articles/climate-summit-2024'
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
        },
        duration: 5000
      }
    ]
  };

  const currentSlide = story.slides[currentSlideIndex];
  const totalSlides = story.slides.length;

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || !currentSlide) return;

    startTimeRef.current = Date.now() - pausedTimeRef.current;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = (elapsed / currentSlide.duration) * 100;
      
      setProgress(Math.min(progressPercent, 100));
      
      if (elapsed >= currentSlide.duration) {
        if (currentSlideIndex < totalSlides - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1);
          setProgress(0);
          pausedTimeRef.current = 0;
        } else {
          // Story finished
          setProgress(100);
          router.push('/web-stories');
        }
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSlideIndex, isPaused, currentSlide, totalSlides, router]);

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
        pausedTimeRef.current = (progress / 100) * currentSlide.duration;
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
      setCurrentSlideIndex(currentSlideIndex - 1);
      setProgress(0);
      pausedTimeRef.current = 0;
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setProgress(0);
      pausedTimeRef.current = 0;
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

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-pan-y">
      {/* Progress Bars */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 flex space-x-1">
        {story.slides.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 sm:h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ 
                width: index < currentSlideIndex ? '100%' : 
                       index === currentSlideIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 sm:top-8 left-2 sm:left-4 right-2 sm:right-4 z-40 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-xs sm:text-sm font-bold">N</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium">{story.author}</p>
            <p className="text-xs opacity-75">{new Date(story.publishedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Pause/Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            {isPaused ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/>
              </svg>
            )}
          </button>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            {isMuted ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.645 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.645l3.738-3.814a1 1 0 011.617.814zM16.22 6.22a.75.75 0 011.06 0 4.5 4.5 0 010 6.36.75.75 0 01-1.06-1.06 3 3 0 000-4.24.75.75 0 010-1.06z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 00-1.617.814L4.645 6H2a1 1 0 00-1 1v6a1 1 0 001 1h2.645l3.738 3.186A1 1 0 0010 16V2z"/>
              </svg>
            )}
          </button>

          {/* Close Button */}
          <Link
            href="/web-stories"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </Link>
        </div>
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
        {/* Background Image */}
        {currentSlide.type === 'image' && currentSlide.content.image && (
          <Image
            src={currentSlide.content.image}
            alt={currentSlide.content.headline || ''}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pb-16 sm:pb-20 text-white">
          {currentSlide.content.headline && (
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4 leading-tight">
              {currentSlide.content.headline}
            </h1>
          )}
          
          {currentSlide.content.text && (
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 leading-relaxed opacity-90">
              {currentSlide.content.text}
            </p>
          )}

          {/* Call to Action */}
          {currentSlide.content.cta && (
            <Link
              href={currentSlide.content.cta.url}
              className="inline-flex items-center bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium hover:bg-gray-100 transition-colors w-fit text-sm sm:text-base"
              onClick={(e) => e.stopPropagation()}
            >
              {currentSlide.content.cta.text}
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </Link>
          )}
        </div>

        {/* Navigation Hints - Hidden on mobile for cleaner UI */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 hidden sm:flex items-center space-x-4 text-white/60 text-sm">
          <span>← Previous</span>
          <span>Tap to pause</span>
          <span>Next →</span>
        </div>

        {/* Side indicators for touch areas */}
        <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-start pl-2 sm:pl-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-white/20 rounded-full p-1 sm:p-2">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        
        <div className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-end pr-2 sm:pr-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-white/20 rounded-full p-1 sm:p-2">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
        {currentSlideIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default WebStoryViewer;
