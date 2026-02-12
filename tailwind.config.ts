import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
        xl: '3rem',
        '2xl': '3.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Editorial type scale
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'headline-1': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-2': ['2.5rem', { lineHeight: '1.12', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-3': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-4': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.01em' }],
        'overline': ['0.6875rem', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '0.1em' }],
        'micro': ['0.625rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.08em' }],
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        // Brand palette
        ink: '#0D0D0D',
        paper: '#FAFAF9',
        ivory: '#F5F0EB',
        ash: '#E8E4DF',
        stone: '#9C9890',
        vermillion: {
          DEFAULT: '#C62828',
          light: '#EF5350',
          dark: '#8E0000',
        },
        gold: {
          DEFAULT: '#B8860B',
          light: '#DAA520',
          dark: '#8B6914',
        },
        // Category accent colors
        'cat-politics': '#1B3A5C',
        'cat-tech': '#0D7377',
        'cat-business': '#2D5016',
        'cat-culture': '#6B21A8',
        'cat-science': '#1E40AF',
        'cat-sports': '#B45309',
        'cat-world': '#7C2D12',
        'cat-health': '#065F46',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-custom': 'pulse 2s infinite',
        'diverge': 'diverge 2s ease-in-out infinite',
        'ticker': 'ticker-scroll 30s linear infinite',
        'reveal': 'reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        diverge: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.1)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      spacing: {
        'reading': '42.5rem', // 680px — optimal reading width
      },
      maxWidth: {
        'reading': '42.5rem',
      },
      borderRadius: {
        'editorial': '0.25rem',
      },
      boxShadow: {
        'editorial': '0 1px 3px rgba(13, 13, 13, 0.08)',
        'editorial-lg': '0 8px 32px rgba(13, 13, 13, 0.12)',
        'card-hover': '0 16px 48px rgba(13, 13, 13, 0.14)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
