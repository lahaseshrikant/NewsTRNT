'use client';

import React from 'react';

interface DivergenceMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

/**
 * The Divergence Mark — NewsTRNT's brand symbol.
 * "Two roads diverged in a wood" — represented as two diverging paths
 * that form a subtle "T" shape for TRNT.
 */
export const DivergenceMark: React.FC<DivergenceMarkProps> = ({
  size = 32,
  className = '',
  animated = false,
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'divergence-mark' : ''} ${className}`}
      aria-label="NewsTRNT Divergence Mark"
    >
      {/* Left diverging path */}
      <path
        d="M24 40V24L10 8"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right diverging path */}
      <path
        d="M24 24L38 8"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Horizontal crossbar — the "road not taken" moment */}
      <path
        d="M6 8H42"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Decision point diamond */}
      <circle
        cx="24"
        cy="24"
        r="2.5"
        fill={color}
      />
    </svg>
  );
};

/**
 * Logo lockup: Divergence Mark + NewsTRNT wordmark
 */
export const NewsTRNTLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}> = ({ size = 'md', className = '', showTagline = false }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg', tagline: 'text-micro' },
    md: { icon: 32, text: 'text-xl', tagline: 'text-overline' },
    lg: { icon: 48, text: 'text-3xl', tagline: 'text-caption' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DivergenceMark size={s.icon} />
      <div className="flex flex-col">
        <span className={`font-serif font-bold tracking-tight ${s.text}`}>
          News<span className="text-primary">TRNT</span>
        </span>
        {showTagline && (
          <span className={`text-muted-foreground ${s.tagline} uppercase tracking-widest`}>
            The Road Not Taken
          </span>
        )}
      </div>
    </div>
  );
};

export default DivergenceMark;

