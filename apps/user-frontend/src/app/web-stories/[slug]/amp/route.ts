import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://newstrnt.com';

type StorySlide = {
  id?: string;
  type?: 'image' | 'video' | 'text';
  duration?: number;
  background?: string;
  content?: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    poster?: string;
    alt?: string;
    caption?: string;
    attribution?: string;
    cta?: {
      text?: string;
      url?: string;
    };
  };
};

type StoryPayload = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  coverImage?: string;
  slides: StorySlide[];
};

type RelatedStory = {
  slug: string;
  title: string;
  coverImage?: string;
  category?: string;
};

type BookendItem = {
  type: 'small';
  title: string;
  url: string;
  image: string;
};

const AMP_BOILERPLATE = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`;
const AMP_BOILERPLATE_NO_SCRIPT = `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`;

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toAbsoluteUrl = (url?: string, fallback = `${SITE_URL}/api/placeholder/400/600`): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
};

const slideDurationSec = (slide: StorySlide): number => {
  const ms = Number(slide.duration);
  if (!Number.isFinite(ms)) return 5;
  return Math.min(Math.max(Math.round(ms / 1000), 3), 15);
};

const inferDescription = (story: StoryPayload): string => {
  const text = story.slides
    .map((slide) => {
      const headline = slide.content?.headline?.trim() || '';
      const body = slide.content?.text?.trim() || '';
      return [headline, body].filter(Boolean).join('. ');
    })
    .filter(Boolean)
    .join(' ')
    .trim();

  if (text.length > 0) return text.slice(0, 240);
  return `Experience \"${story.title}\" as a visual Web Story on NewsTRNT.`;
};

const buildAmpStoryPage = (
  slide: StorySlide,
  index: number,
  options: { totalSlides: number }
): string => {
  const headline = escapeHtml(slide.content?.headline || '');
  const text = escapeHtml(slide.content?.text || '');
  const caption = escapeHtml(slide.content?.caption || '');
  const image = slide.content?.image ? toAbsoluteUrl(slide.content.image) : '';
  const video = slide.content?.video ? toAbsoluteUrl(slide.content.video) : '';
  const rawAttribution = slide.content?.attribution || '';
  const attribution = escapeHtml(rawAttribution);
  const creditText = rawAttribution
    ? `${image ? 'Image: ' : video ? 'Video: ' : ''}${attribution}`
    : '';
  const ctaText = escapeHtml(slide.content?.cta?.text || '');
  const ctaUrlRaw = slide.content?.cta?.url;
  const ctaUrl = ctaUrlRaw ? toAbsoluteUrl(ctaUrlRaw, '') : '';
  const actionText = ctaText.length > 22 ? `${ctaText.slice(0, 22)}…` : ctaText;
  const posterBase = image || `${SITE_URL}/logo.png`;
  const poster = slide.content?.poster ? toAbsoluteUrl(slide.content.poster, posterBase) : posterBase;

  const fillLayer = (() => {
    if (video) {
      return `
        <amp-story-grid-layer template="fill">
          <amp-video
            src="${escapeHtml(video)}"
            poster="${escapeHtml(poster)}"
            layout="fill"
            autoplay
            loop
            muted
          ></amp-video>
        </amp-story-grid-layer>
      `;
    }

    if (image) {
      const alt = escapeHtml(slide.content?.alt || slide.content?.headline || 'Web story visual');
      const delaySeconds = (index * 4) % 20; // spread start offsets by slide index
      return `
        <amp-story-grid-layer template="fill">
          <amp-img
            src="${escapeHtml(image)}"
            width="720"
            height="1280"
            layout="responsive"
            alt="${alt}"
            class="bg-media"
            style="animation-delay: ${delaySeconds}s;"
          ></amp-img>
        </amp-story-grid-layer>
      `;
    }

    const background = escapeHtml(slide.background || 'linear-gradient(135deg,#0f172a,#1e293b)');
    return `
      <amp-story-grid-layer template="fill">
        <div class="fallback-fill" style="background:${background};"></div>
      </amp-story-grid-layer>
    `;
  })();

  const brandSvgRaw = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NewsTRNT Logo">
  <g transform="translate(0,6)" stroke="#dc2626" fill="#dc2626">
    <path d="M24 40V24L10 8" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M24 24L38 8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M6 8H42" stroke-width="2" stroke-linecap="round" opacity="0.45" fill="none" />
    <circle cx="24" cy="24" r="2" />
  </g>
  <text x="56" y="32" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="#ffffff" letter-spacing="-0.5" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.6);">News<tspan fill="#dc2626">TRNT</tspan></text>
  <text x="56" y="48" font-family="Arial, sans-serif" font-size="10" fill="#ffffff" letter-spacing="2" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">THE ROAD NOT TAKEN</text>
</svg>`;
  const brandSvgDataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(brandSvgRaw)}`;

  const brandLayer = `
    <amp-story-grid-layer template="vertical" class="brand-layer">
      <div class="brand-chip" animate-in="fade-in" animate-in-duration="0.35s" animate-in-delay="0.02s">
        <amp-img
          src="${brandSvgDataUri}"
          width="120"
          height="32"
          layout="fixed"
          alt="NewsTRNT Logo"
          class="brand-icon"
        ></amp-img>
      </div>
    </amp-story-grid-layer>
  `;

  const textLayer = `
    <amp-story-grid-layer template="vertical" class="content-layer">
      <div class="content-wrap">
        <div class="main-copy" animate-in="fade-in" animate-in-duration="0.5s" animate-in-delay="0.03s">
          ${headline ? `<h1 animate-in="fly-in-left" animate-in-duration="0.55s" animate-in-delay="0.04s">${headline}</h1>` : ''}
          ${text ? `<p class="body" animate-in="fly-in-bottom" animate-in-duration="0.45s" animate-in-delay="0.16s">${text}</p>` : ''}
        </div>
        ${caption ? `<p class="caption" animate-in="fade-in" animate-in-duration="0.45s" animate-in-delay="0.17s">${caption}</p>` : ''}
        ${creditText ? `<p class="credit" animate-in="fade-in" animate-in-duration="0.45s" animate-in-delay="0.20s">${creditText}</p>` : ''}
        ${ctaText && ctaUrl ? `<div class="cta-wrap" animate-in="fly-in-bottom" animate-in-duration="0.45s" animate-in-delay="0.22s"><a href="${escapeHtml(ctaUrl)}" class="cta" target="_blank">${actionText}</a></div>` : ''}
      </div>
    </amp-story-grid-layer>
  `;

  return `
    <amp-story-page id="p-${index + 1}" auto-advance-after="${slideDurationSec(slide)}s">
      ${fillLayer}
      ${brandLayer}
      ${textLayer}
    </amp-story-page>
  `;
};

const buildJsonLd = (story: StoryPayload, canonicalUrl: string, posterUrl: string, ampUrl: string) => {
  const description = inferDescription(story);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: story.title,
    description,
    mainEntityOfPage: canonicalUrl,
    datePublished: story.publishedAt || new Date().toISOString(),
    dateModified: story.updatedAt || story.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: story.author || 'NewsTRNT Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NewsTRNT',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
    image: [posterUrl],
    isAccessibleForFree: true,
    genre: ['Web Story', story.category || 'News'],
    url: canonicalUrl,
    sameAs: [ampUrl],
  };
};

const fetchRelatedStories = async (currentSlug: string, limit = 8): Promise<RelatedStory[]> => {
  try {
    const response = await fetch(`${API_URL}/webstories?limit=24`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const stories = Array.isArray(data?.webStories) ? data.webStories : [];

    return stories
      .filter((story: any) => story?.slug && story.slug !== currentSlug)
      .slice(0, limit)
      .map((story: any) => ({
        slug: String(story.slug),
        title: String(story.title || 'Story'),
        coverImage: typeof story.coverImage === 'string' ? story.coverImage : undefined,
        category: typeof story.category === 'string' ? story.category : undefined,
      }));
  } catch {
    return [];
  }
};

const buildBookendConfig = (stories: RelatedStory[]): string => {
  const items: BookendItem[] = stories.slice(0, 8).map((story) => ({
    type: 'small',
    title: story.title,
    url: `${SITE_URL}/web-stories/${encodeURIComponent(story.slug)}/amp`,
    image: toAbsoluteUrl(story.coverImage),
  }));

  const payload = {
    bookendVersion: 'v1.0',
    shareProviders: ['twitter', 'linkedin', 'email'],
    components: [
      {
        type: 'heading',
        text: 'More Stories',
      },
      ...items,
    ],
  };

  return JSON.stringify(payload).replace(/<\//g, '<\\/');
};

const buildMoreStoriesPage = (stories: RelatedStory[]): string => {
  if (!stories || stories.length === 0) return '';

  const cards = stories.slice(0, 8).map((story) => {
    const image = toAbsoluteUrl(story.coverImage);
    return `
      <a href="${escapeHtml(`${SITE_URL}/web-stories/${encodeURIComponent(story.slug)}/amp`)}" class="more-story-card">
        <amp-img src="${escapeHtml(image)}" width="180" height="320" layout="responsive" alt="${escapeHtml(story.title)}"></amp-img>
        <div class="more-story-title">${escapeHtml(story.title)}</div>
      </a>
    `;
  }).join('');

  return `
    <amp-story-page id="more-stories" auto-advance-after="0s">
      <amp-story-grid-layer template="vertical" class="more-stories-layer">
        <h1>More stories</h1>
        <div class="more-stories-grid">${cards}</div>
      </amp-story-grid-layer>
    </amp-story-page>
  `;
};

const getFirstSlideMedia = (story: StoryPayload): string | null => {
  const firstSlide = story.slides?.[0];
  if (!firstSlide?.content) return null;
  const media = firstSlide.content.image || firstSlide.content.video || firstSlide.content.poster;
  if (!media) return null;
  return toAbsoluteUrl(media, '');
};

const fetchStory = async (slug: string): Promise<StoryPayload | null> => {
  try {
    const response = await fetch(`${API_URL}/webstories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;
    const data = await response.json();

    if (!data?.webStory || !Array.isArray(data.webStory.slides)) return null;

    return data.webStory as StoryPayload;
  } catch {
    return null;
  }
};

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const story = await fetchStory(slug);

  if (!story) {
    return new NextResponse('Web Story not found', { status: 404 });
  }

  const canonicalUrl = `${SITE_URL}/web-stories/${encodeURIComponent(story.slug || slug)}`;
  const ampUrl = `${canonicalUrl}/amp`;
  const posterUrl = toAbsoluteUrl(story.coverImage || story.slides?.[0]?.content?.image || story.slides?.[0]?.content?.video);
  const firstMediaUrl = getFirstSlideMedia(story);
  const publisherLogo = `${SITE_URL}/logo.png`;
  const relatedStories = await fetchRelatedStories(story.slug || slug);

  const totalSlides = story.slides.length > 0 ? story.slides.length : 1;

  const storyPages = story.slides.length > 0
    ? story.slides
        .map((slide, index) =>
          buildAmpStoryPage(slide, index, {
            totalSlides,
          })
        )
        .join('\n')
    : buildAmpStoryPage({
        type: 'text',
        duration: 5000,
        content: {
          headline: story.title,
          text: inferDescription(story),
        },
      }, 0, {
        totalSlides,
      });

  const moreStoriesPage = buildMoreStoriesPage(relatedStories);
  const mainPages = storyPages + moreStoriesPage;

  const bookendConfig = buildBookendConfig(relatedStories);

  const jsonLd = JSON.stringify(buildJsonLd(story, canonicalUrl, posterUrl, ampUrl));
  const description = escapeHtml(inferDescription(story));

  const html = `<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(story.title)}</title>
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(story.title)}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(posterUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(story.title)}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeHtml(posterUrl)}" />

    <link rel="preload" href="${escapeHtml(posterUrl)}" as="image" />
    ${firstMediaUrl ? `<link rel="preload" href="${escapeHtml(firstMediaUrl)}" as="${firstMediaUrl.endsWith('.mp4') ? 'video' : 'image'}" />` : ''}

    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>

    <style amp-boilerplate>${AMP_BOILERPLATE}</style>
    <noscript><style amp-boilerplate>${AMP_BOILERPLATE_NO_SCRIPT}</style></noscript>

    <style amp-custom>
      :root {
        --overlay-bg: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.1) 100%);
      }
      amp-story {
        font-family: 'Poppins', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #fff;
      }
      .fallback-fill {
        width: 100%;
        height: 100%;
      }
      .content-layer {
        align-content: end;
        background: var(--overlay-bg);
      }
      .more-stories-layer {
        align-content: start;
        padding: 28px 22px;
        background: rgba(0,0,0,0.5);
        color: #fff;
      }
      .more-stories-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 18px;
      }
      .more-story-card {
        display: block;
        text-decoration: none;
        color: inherit;
      }
      .more-story-title {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 600;
      }
      .chrome-layer {
        align-content: start;
      }
      .content-wrap {
        position: relative;
        height: 100%;
        padding: 0 24px 18px;
      }
      .brand-layer {
        align-content: start;
        padding-top: calc(16px + env(safe-area-inset-top)); /* aligned below progress bar */
        padding-left: 10px; /* aligned horizontally with progress bar start */
        pointer-events: none;
        z-index: 1000;
      }
      .brand-chip {
        margin: 0;
        display: inline-block;
        pointer-events: auto;
      }
      .brand-icon {
        width: 120px;
        height: 32px;
      }
      .brand-text {
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 800;
        text-transform: none;
        letter-spacing: 0.02em;
        font-size: 12px;
        line-height: 1;
        color: #ffffff;
      }
      .brand-news {
        color: #ffffff;
      }
      .brand-trnt {
        color: #e73b4e; /* primary red accent from homepage */
      }
      .brand-chip span {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .control-wrap {
        position: absolute;
        top: calc(10px + env(safe-area-inset-top));
        right: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 7px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.24);
        backdrop-filter: blur(4px);
      }
      .control-btn {
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.16);
        color: #fff;
        border-radius: 999px;
        padding: 7px 10px;
        min-width: 54px;
        text-align: center;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        line-height: 1;
      }
      .slide-marker {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.9);
        padding: 0 4px;
      }
      @media (max-width: 640px) {
        .control-wrap {
          right: 10px;
          gap: 5px;
          padding: 6px;
        }
        .control-btn {
          min-width: 56px;
          padding: 8px 10px;
          font-size: 11px;
        }
        .slide-marker {
          font-size: 9px;
          letter-spacing: 0.09em;
        }
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(28px, 7vw, 40px);
        line-height: 1.08;
        font-weight: 900;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 2px 18px rgba(0,0,0,0.6);
        opacity: 0;
        transform: translateY(20px);
        animation: text-appear 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards;
      }
      .body {
        margin: 12px 0 0;
        font-size: 16px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.95);
        opacity: 0;
        transform: translateY(20px);
        animation: text-appear 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.20s forwards;
      }
      @keyframes text-appear {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .main-copy {
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: 84px;
      }
      .body {
        margin: 12px 0 0;
        font-size: 16px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.95);
      }
      .caption {
        position: absolute;
        right: 8px;
        bottom: 24px;
        margin: 0;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.95);
        max-width: 85%;
        text-align: right;
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 10;
        opacity: 0;
        transform: translateY(16px);
        animation: caption-fade 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.30s forwards;
      }
      .credit {
        position: absolute;
        right: 8px;
        bottom: 8px;
        margin: 0;
        font-size: 10px;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.82);
        text-align: right;
        max-width: 85%;
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 10;
        opacity: 0;
        transform: translateY(16px);
        animation: caption-fade 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.40s forwards;
      }
      @keyframes caption-fade {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .bg-media {
        animation: slow-zoom 25s ease-in-out 0s infinite alternate;
        transform-origin: center center;
      }
      @keyframes slow-zoom {
        from { transform: scale(1); }
        to { transform: scale(1.16); }
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 11px 18px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(5px);
      }
      .cta-wrap {
        position: absolute;
        left: 24px;
        bottom: 34px;
      }
    </style>

    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <amp-story
      id="story-root"
      standalone
      title="${escapeHtml(story.title)}"
      publisher="NewsTRNT"
      publisher-logo-src="${escapeHtml(publisherLogo)}"
      poster-portrait-src="${escapeHtml(posterUrl)}"
      poster-square-src="${escapeHtml(posterUrl)}"
      poster-landscape-src="${escapeHtml(posterUrl)}"
    >
      ${mainPages}
      <amp-story-bookend layout="nodisplay">
        <script type="application/json">${bookendConfig}</script>
      </amp-story-bookend>
    </amp-story>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
