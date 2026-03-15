'use client';

import { useEffect, useState } from 'react';

/**
 * Reading progress bar that sits at the very top of the viewport.
 * Shows how far the user has scrolled through the current page.
 * Ideal for article detail pages but works on any page.
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Prefer progress based on the article container (header + body + comments).
      // Fallback to full-page scroll if we don't find it.
      const contentContainer =
        document.getElementById('article-container') ?? document.getElementById('article-content');

      if (contentContainer) {
        const rect = contentContainer.getBoundingClientRect();
        const containerTop = scrollTop + rect.top;
        const containerBottom = scrollTop + rect.bottom;
        const start = containerTop;
        const end = containerBottom - window.innerHeight;

        if (end <= start) {
          setProgress(100);
          setVisible(false);
          return;
        }

        const pct = Math.min(100, Math.max(0, ((scrollTop - start) / (end - start)) * 100));
        setProgress(pct);
        // Show as soon as the user reaches the top of the article container.
        setVisible(scrollTop >= start - 10);
        return;
      }

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(0);
        setVisible(false);
        return;
      }

      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
      // Only show after scrolling at least 50px
      setVisible(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
