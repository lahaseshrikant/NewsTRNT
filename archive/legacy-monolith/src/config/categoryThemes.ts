/**
 * Category mood palettes from Creative Direction
 * Each category has a unique duotone identity
 */

export interface CategoryTheme {
  name: string;
  slug: string;
  primary: string;       // Main category color
  accent: string;        // Complementary accent
  primaryLight: string;  // Light tint for backgrounds
  accentLight: string;   // Light accent tint
  gradient: string;      // CSS gradient for headers/banners
  gradientSubtle: string; // Subtle gradient for cards
  mood: string;          // Description
}

export const categoryThemes: Record<string, CategoryTheme> = {
  world: {
    name: 'World News',
    slug: 'world',
    primary: '#1B3A5C',
    accent: '#D4AF37',
    primaryLight: 'rgba(27, 58, 92, 0.08)',
    accentLight: 'rgba(212, 175, 55, 0.12)',
    gradient: 'linear-gradient(135deg, #1B3A5C 0%, #0F2440 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(27,58,92,0.06) 0%, rgba(212,175,55,0.04) 100%)',
    mood: 'Authority, gravity',
  },
  politics: {
    name: 'Politics',
    slug: 'politics',
    primary: '#8B0000',
    accent: '#1C1C1C',
    primaryLight: 'rgba(139, 0, 0, 0.08)',
    accentLight: 'rgba(28, 28, 28, 0.06)',
    gradient: 'linear-gradient(135deg, #8B0000 0%, #5C0000 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(139,0,0,0.06) 0%, rgba(28,28,28,0.03) 100%)',
    mood: 'Power, urgency',
  },
  business: {
    name: 'Business',
    slug: 'business',
    primary: '#0A2540',
    accent: '#00D4AA',
    primaryLight: 'rgba(10, 37, 64, 0.08)',
    accentLight: 'rgba(0, 212, 170, 0.10)',
    gradient: 'linear-gradient(135deg, #0A2540 0%, #051A2D 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(10,37,64,0.06) 0%, rgba(0,212,170,0.04) 100%)',
    mood: 'Trust, precision',
  },
  technology: {
    name: 'Technology',
    slug: 'technology',
    primary: '#0F172A',
    accent: '#6366F1',
    primaryLight: 'rgba(15, 23, 42, 0.08)',
    accentLight: 'rgba(99, 102, 241, 0.10)',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(15,23,42,0.05) 0%, rgba(99,102,241,0.04) 100%)',
    mood: 'Innovation, depth',
  },
  science: {
    name: 'Science',
    slug: 'science',
    primary: '#0C4A6E',
    accent: '#22D3EE',
    primaryLight: 'rgba(12, 74, 110, 0.08)',
    accentLight: 'rgba(34, 211, 238, 0.10)',
    gradient: 'linear-gradient(135deg, #0C4A6E 0%, #083756 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(12,74,110,0.05) 0%, rgba(34,211,238,0.04) 100%)',
    mood: 'Discovery, wonder',
  },
  health: {
    name: 'Health',
    slug: 'health',
    primary: '#14532D',
    accent: '#34D399',
    primaryLight: 'rgba(20, 83, 45, 0.08)',
    accentLight: 'rgba(52, 211, 153, 0.10)',
    gradient: 'linear-gradient(135deg, #14532D 0%, #0D3B20 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(20,83,45,0.05) 0%, rgba(52,211,153,0.04) 100%)',
    mood: 'Life, healing',
  },
  sports: {
    name: 'Sports',
    slug: 'sports',
    primary: '#7C2D12',
    accent: '#FB923C',
    primaryLight: 'rgba(124, 45, 18, 0.08)',
    accentLight: 'rgba(251, 146, 60, 0.10)',
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #5A200C 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(124,45,18,0.05) 0%, rgba(251,146,60,0.04) 100%)',
    mood: 'Intensity, kinetic',
  },
  entertainment: {
    name: 'Entertainment',
    slug: 'entertainment',
    primary: '#4A044E',
    accent: '#F472B6',
    primaryLight: 'rgba(74, 4, 78, 0.08)',
    accentLight: 'rgba(244, 114, 182, 0.10)',
    gradient: 'linear-gradient(135deg, #4A044E 0%, #350338 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(74,4,78,0.05) 0%, rgba(244,114,182,0.04) 100%)',
    mood: 'Glamour, pop',
  },
  environment: {
    name: 'Environment',
    slug: 'environment',
    primary: '#1A4731',
    accent: '#86EFAC',
    primaryLight: 'rgba(26, 71, 49, 0.08)',
    accentLight: 'rgba(134, 239, 172, 0.10)',
    gradient: 'linear-gradient(135deg, #1A4731 0%, #123322 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(26,71,49,0.05) 0%, rgba(134,239,172,0.04) 100%)',
    mood: 'Nature, urgency',
  },
  opinion: {
    name: 'Opinion',
    slug: 'opinion',
    primary: '#000000',
    accent: '#C62828',
    primaryLight: 'rgba(0, 0, 0, 0.06)',
    accentLight: 'rgba(198, 40, 40, 0.10)',
    gradient: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(198,40,40,0.03) 100%)',
    mood: 'Conviction, boldness',
  },
  lifestyle: {
    name: 'Lifestyle',
    slug: 'lifestyle',
    primary: '#831843',
    accent: '#FCA5A5',
    primaryLight: 'rgba(131, 24, 67, 0.08)',
    accentLight: 'rgba(252, 165, 165, 0.10)',
    gradient: 'linear-gradient(135deg, #831843 0%, #5C1030 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(131,24,67,0.05) 0%, rgba(252,165,165,0.04) 100%)',
    mood: 'Elegance, personal',
  },
  education: {
    name: 'Education',
    slug: 'education',
    primary: '#1E3A5F',
    accent: '#93C5FD',
    primaryLight: 'rgba(30, 58, 95, 0.08)',
    accentLight: 'rgba(147, 197, 253, 0.10)',
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #152B47 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(30,58,95,0.05) 0%, rgba(147,197,253,0.04) 100%)',
    mood: 'Knowledge, clarity',
  },
};

/**
 * Get the theme for a given category slug.
 * Falls back to a neutral editorial theme if the slug is unknown.
 */
export function getCategoryTheme(slug: string): CategoryTheme {
  const normalised = slug.toLowerCase().replace(/[\s_]+/g, '-');
  return (
    categoryThemes[normalised] ?? {
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: normalised,
      primary: '#0D0D0D',
      accent: '#C62828',
      primaryLight: 'rgba(13, 13, 13, 0.06)',
      accentLight: 'rgba(198, 40, 40, 0.08)',
      gradient: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
      gradientSubtle: 'linear-gradient(135deg, rgba(13,13,13,0.04) 0%, rgba(198,40,40,0.03) 100%)',
      mood: 'Editorial',
    }
  );
}
