'use client';

import React from'react';

interface IconProps {
 size?: number;
 className?: string;
 strokeWidth?: number;
}

const defaultProps = { size: 20, className:'', strokeWidth: 1.75 };

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
 <path d="M3.47186258,13.4213562 L6.31457505,10.5786438 C6.70707174,10.1861471 7.3434346,10.1861471 7.73593129,10.5786438 C8.1003925,10.943105 8.12642544,11.5178385 7.81403012,11.9123387 L7.73593129,12 L4.89321881,14.8427125 C3.71572875,16.0202025 3.71572875,17.9292911 4.89321881,19.1067812 C6.02865566,20.242218 7.84436716,20.2827693 9.02839505,19.2284351 L9.15728753,19.1067812 L12,16.2640687 C12.3924967,15.871572 13.0288596,15.871572 13.4213562,16.2640687 C13.7858174,16.6285299 13.8118504,17.2032635 13.4994551,17.5977636 L13.4213562,17.6854249 L10.5786438,20.5281374 C8.61616033,22.4906209 5.43434601,22.4906209 3.47186258,20.5281374 C1.56102344,18.6172983 1.5107382,15.5504592 3.32100685,13.5787779 L3.47186258,13.4213562 Z M13.4213562,3.47186258 C15.3838397,1.50937914 18.565654,1.50937914 20.5281374,3.47186258 C22.4906209,5.43434601 22.4906209,8.61616033 20.5281374,10.5786438 L17.6854249,13.4213562 C17.2929283,13.8138529 16.6565654,13.8138529 16.2640687,13.4213562 C15.871572,13.0288596 15.871572,12.3924967 16.2640687,12 L19.1067812,9.15728753 C20.2842712,7.97979746 20.2842712,6.07070887 19.1067812,4.89321881 C17.9292911,3.71572875 16.0202025,3.71572875 14.8427125,4.89321881 L12,7.73593129 C11.6075033,8.12842798 10.9711404,8.12842798 10.5786438,7.73593129 C10.1861471,7.3434346 10.1861471,6.70707174 10.5786438,6.31457505 L13.4213562,3.47186258 Z M13.4213562,9.15728753 C13.8138529,8.76479084 14.4502158,8.76479084 14.8427125,9.15728753 C15.2352092,9.54978421 15.2352092,10.1861471 14.8427125,10.5786438 L10.5786438,14.8427125 C10.1861471,15.2352092 9.54978421,15.2352092 9.15728753,14.8427125 C8.76479084,14.4502158 8.76479084,13.8138529 9.15728753,13.4213562 L13.4213562,9.15728753 Z" />
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

