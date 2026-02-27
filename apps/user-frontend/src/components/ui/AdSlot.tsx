'use client';

import React from 'react';

type AdSize = 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper' | 'inline';

interface AdSlotProps {
  size: AdSize;
  className?: string;
  label?: string;
  /** When true, shows the placeholder even without a real ad (useful for development) */
  showPlaceholder?: boolean;
}

const adDimensions: Record<AdSize, { width: string; height: string; label: string }> = {
  banner: { width: '100%', height: '90px', label: '728×90' },
  leaderboard: { width: '100%', height: '90px', label: '970×90' },
  rectangle: { width: '300px', height: '250px', label: '300×250' },
  skyscraper: { width: '300px', height: '600px', label: '300×600' },
  inline: { width: '100%', height: '120px', label: 'In-Feed' },
};

/**
 * AdSlot — placeholder for ad placements.
 * 
 * By default renders nothing (collapses) so no empty ad space is shown.
 * Set `showPlaceholder` to true during development to see the ad slot outlines.
 * Replace the inner content with your actual ad provider script (Google AdSense, etc.)
 * once ads are configured.
 */
const AdSlot: React.FC<AdSlotProps> = ({ size, className = '', label, showPlaceholder = false }) => {
  const dim = adDimensions[size];

  // TODO: Replace this check with real ad availability logic
  // e.g. check if an ad provider has filled this slot
  const hasAd = false;

  // If no real ad and placeholder not requested, render nothing (collapse)
  if (!hasAd && !showPlaceholder) {
    return null;
  }

  return (
    <div
      className={`ad-slot relative overflow-hidden ${className}`}
      style={{ maxWidth: dim.width, height: dim.height }}
      data-ad-size={size}
    >
      {/* Placeholder — replace with real ad code */}
      {!hasAd && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ivory/60 dark:bg-ink/40 border border-dashed border-ash/50 dark:border-ash/20 rounded-xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-stone/60 dark:text-stone/40">
            {label || 'Advertisement'}
          </span>
          <span className="text-[9px] font-mono text-stone/40 dark:text-stone/30 mt-0.5">
            {dim.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdSlot;
