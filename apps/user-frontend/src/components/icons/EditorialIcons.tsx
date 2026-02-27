'use client';

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const defaultProps = { size: 20, className: '', strokeWidth: 1.75 };

/** Trending flame icon — replaces 🔥 */
export const TrendingIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </svg>
);

/** Latest/breaking news icon — replaces 📰 */
export const BreakingIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

/** Editor's pick / star icon — replaces ⭐ */
export const EditorPickIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 22 12 18.56 6.82 22 8 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

/** Web stories icon — replaces 📱 */
export const StoriesIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/** Popular / trending up — replaces 📈 */
export const PopularIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/** Categories / grid icon — replaces 📂 */
export const CategoriesIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

/** Newsletter / mail icon — replaces 📬 */
export const NewsletterIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

/** Follow / link icon — replaces 🔗 */
export const FollowIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/** Tags icon — replaces 🏷️ */
export const TagsIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

/** Search icon — replaces 🔍 */
export const SearchIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/** Clock / time icon */
export const ClockIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/** Bookmark icon */
export const BookmarkIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

/** Share icon */
export const ShareIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

/** Arrow right */
export const ArrowRightIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/** Globe / World icon */
export const GlobeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

/** Home icon — replaces 🏠 */
export const HomeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

/** Chart / Analytics icon — replaces 📊 */
export const ChartIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/** Alert / Breaking icon — replaces 🚨 */
export const AlertIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/** Government / Capitol icon — replaces 🏛️ */
export const GovernmentIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 20h20" />
    <path d="M5 20V10" />
    <path d="M19 20V10" />
    <path d="M9 20V10" />
    <path d="M15 20V10" />
    <path d="M2 10l10-7 10 7" />
  </svg>
);

/** Rocket icon — replaces 🚀 */
export const RocketIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

/** Book icon — replaces 📖 */
export const BookIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

/** Calendar icon — replaces 📅 */
export const CalendarIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/** Wrench icon — replaces 🔧 */
export const WrenchIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

/** Microscope icon — replaces 🔬 */
export const MicroscopeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 100-14h-1" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 01-2-2V6h6v4a2 2 0 01-2 2z" />
    <path d="M12 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3" />
  </svg>
);

/** Clapperboard icon — replaces 🎬 */
export const ClapperIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 11v8a2 2 0 002 2h12a2 2 0 002-2v-8H4z" />
    <path d="M4 11l16 0" />
    <path d="M4 11l3-8h10l3 8" />
    <path d="M8 3l3 8" />
    <path d="M13 3l3 8" />
  </svg>
);

/** Briefcase icon — replaces 💼 */
export const BriefcaseIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

/** Laptop icon — replaces 💻 */
export const LaptopIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 01-.9 1.45H3.62a1 1 0 01-.9-1.45L4 16" />
  </svg>
);

/** Trophy icon — replaces 🏆 */
export const TrophyIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
  </svg>
);

/** Gear / Settings icon — replaces ⚙️ */
export const GearIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

/** Gamepad icon — replaces 🎮 */
export const GamepadIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="4" />
  </svg>
);

/** Target icon — replaces 🎯 */
export const TargetIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/** Building icon — replaces 🏢 */
export const BuildingIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="8.01" y2="6" />
    <line x1="16" y1="6" x2="16.01" y2="6" />
    <line x1="8" y1="10" x2="8.01" y2="10" />
    <line x1="16" y1="10" x2="16.01" y2="10" />
    <line x1="8" y1="14" x2="8.01" y2="14" />
    <line x1="16" y1="14" x2="16.01" y2="14" />
  </svg>
);

/** Comment / Speech bubble icon — replaces 💬 */
export const CommentIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

/** Thought bubble / Opinion icon — replaces 💭 */
export const OpinionIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);

/** Article / Document icon — replaces 📄 */
export const ArticleIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/** User icon — replaces 👤 */
export const UserIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/** Tools / Wrench+Screwdriver icon — replaces 🛠️ */
export const ToolsIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

/** Scale / Legal icon — replaces ⚖️ */
export const ScaleIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v18" />
    <path d="M16 3H8" />
    <path d="M21 12l-4-8-4 8a5 5 0 008 0z" />
    <path d="M11 12l-4-8-4 8a5 5 0 008 0z" />
  </svg>
);

/** Sparkle icon — replaces ✨ */
export const SparkleIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

/** Pen / Writing icon — replaces ✍️ */
export const PenIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

/** Shield icon — replaces 🛡️ */
export const ShieldIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/** Coffee / Cup icon — replaces ☕ */
export const CoffeeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

/** Pin icon — replaces 📌 */
export const PinIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" />
  </svg>
);

/** Music note icon — replaces 🎵 */
export const MusicNoteIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

/** TV icon — replaces 📺 */
export const TvIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

/** Medal icon — replaces 🏅 */
export const MedalIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.21 15L2.66 7.14a2 2 0 01.13-2.2L4.4 2.8A2 2 0 016 2h12a2 2 0 011.6.8l1.6 2.14a2 2 0 01.14 2.2L16.79 15" />
    <circle cx="12" cy="17" r="5" />
    <path d="M12 12v2" />
  </svg>
);

/** Heart icon — replaces 💚 */
export const HeartIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

/** Lightbulb icon — replaces 💡 */
export const LightbulbIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
  </svg>
);

/** Clipboard icon — replaces 📋 */
export const ClipboardIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

/** Megaphone icon — replaces 📢 */
export const MegaphoneIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11l18-5v12L3 13v-2z" />
    <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
  </svg>
);

/** Sprout / Environment icon — replaces 🌱 */
export const SproutIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 00-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

/** Books / Education icon — replaces 📚 */
export const BooksIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h6" />
  </svg>
);

/** Investigate / Detective icon — replaces 🕵️ */
export const InvestigateIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

/** Theater masks icon — replaces 🎭 */
export const TheaterIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 4v9.5A6.5 6.5 0 008.5 20 6.5 6.5 0 0015 13.5V4z" />
    <path d="M6 8h.01" />
    <path d="M11 8h.01" />
    <path d="M6 13c.6.9 1.6 1.5 2.5 1.5S10.4 13.9 11 13" />
    <path d="M15 4v2.5a6.5 6.5 0 0011 0V4H15z" />
  </svg>
);

/** Telescope icon — replaces 🔭 */
export const TelescopeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 21l6-5 6 5" />
    <path d="M12 13V16" />
    <circle cx="12" cy="10" r="3" />
    <path d="M3 7l3 3" />
    <path d="M18 4l3 3" />
    <path d="M12 2v3" />
  </svg>
);

/** Ballot / Vote icon — replaces 🗳️ */
export const BallotIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="14" rx="2" />
    <path d="M10 8V5a2 2 0 014 0v3" />
    <path d="M8 14l3 3 5-5" />
  </svg>
);

/** Trend down icon — replaces 📉 */
export const TrendDownIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

/** Check circle icon — replaces ✅ */
export const CheckCircleIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/** Flask / Chemistry icon — replaces 🧪 */
export const FlaskIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 3h6" />
    <path d="M10 9V3h4v6l5 10H5z" />
    <path d="M6 19h12" />
  </svg>
);

/** Brain icon — replaces 🧠 */
export const BrainIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a4 4 0 014 4 3 3 0 013 3 3 3 0 01-1 5.83V18a2 2 0 01-2 2h-1" />
    <path d="M12 2a4 4 0 00-4 4 3 3 0 00-3 3 3 3 0 001 5.83V18a2 2 0 002 2h1" />
    <path d="M12 2v20" />
  </svg>
);

/** Hospital icon — replaces 🏥 */
export const HospitalIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

/** Pill icon — replaces 💊 */
export const PillIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.5 1.5l-8 8a4.95 4.95 0 007 7l8-8a4.95 4.95 0 00-7-7z" />
    <path d="M6 10l4-4" />
  </svg>
);

/** Graduation cap icon — replaces 🎓 */
export const GraduationCapIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10l-10-5L2 10l10 5 10-5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
    <line x1="22" y1="10" x2="22" y2="16" />
  </svg>
);

/** Atom icon — replaces ⚛️ */
export const AtomIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" />
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z" />
    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z" />
  </svg>
);

/** DNA icon — replaces 🧬 */
export const DnaIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <path d="M17 6l-2.5-2.5" />
    <path d="M14 8l-1-1" />
    <path d="M7 18l2.5 2.5" />
    <path d="M3.5 14.5l.5.5" />
    <path d="M20 9l.5.5" />
    <path d="M6.5 12.6l1 .9" />
    <path d="M16.5 10.5l1 .9" />
  </svg>
);

/** Map icon — replaces 🗺️ */
export const MapIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

/** Cookie icon — replaces 🍪 */
export const CookieIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="8" r="1" fill="currentColor" />
    <circle cx="10" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="13" cy="11" r="1" fill="currentColor" />
  </svg>
);

/** Nutrition / Leaf icon — replaces 🥦 */
export const NutritionIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2.5 1.5 7.5a7.5 7.5 0 01-7.5 9z" />
    <path d="M11 20V10" />
    <path d="M6 10s3.5-2 5 0" />
  </svg>
);

/** Soccer ball icon — replaces ⚽ */
export const SoccerIcon: React.FC<IconProps> = ({ size = defaultProps.size, className, strokeWidth = defaultProps.strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0110 10" />
    <path d="M12 2v4l4 2" />
    <path d="M12 12l4-2v-4" />
    <path d="M12 12h5l1.5 4" />
    <path d="M12 12l-5 0-1.5 4" />
    <path d="M12 12v5l-3 3" />
  </svg>
);

