'use client';

import React from 'react';

type AdSize = 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper' | 'inline';

interface AdSlotProps {
  size: AdSize;
  className?: string;
  label?: string;
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
 * Replace the inner content with your actual ad provider script (Google AdSense, etc.)
 */
const AdSlot: React.FC<AdSlotProps> = ({ size, className = '', label }) => {
  const dim = adDimensions[size];

  return (
    <div
      className={`ad-slot relative overflow-hidden ${className}`}
      style={{ maxWidth: dim.width, height: dim.height }}
      data-ad-size={size}
    >
      {/* Placeholder — replace with real ad code */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ivory/60 dark:bg-ink/40 border border-dashed border-ash/50 dark:border-ash/20 rounded-xl">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone/60 dark:text-stone/40">
          {label || 'Advertisement'}
        </span>
        <span className="text-[9px] font-mono text-stone/40 dark:text-stone/30 mt-0.5">
          {dim.label}
        </span>
      </div>
    </div>
  );
};

export default AdSlot;
