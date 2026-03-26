"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import adminAuth from '@/lib/auth/admin-auth';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.baseURL;

interface StorySlide {
  id: string;
  type: 'image' | 'video' | 'text';
  background: string;
  content: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    poster?: string;
    alt?: string;
    caption?: string;
    attribution?: string;
    cta?: {
      text: string;
      url: string;
    };
  };
  duration: number;
}

interface StoryData {
  title: string;
  category: string;
  priority: 'high' | 'normal' | 'low';
  status: 'draft' | 'published';
  coverImage?: string;
  slides: StorySlide[];
}

type QualityIssue = {
  level: 'warning' | 'error';
  code: string;
  message: string;
};

const CreateWebStory: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get('id');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  type CardKey = 'storySettings' | 'slideEditor' | 'slideList' | 'preview';
  type CardSize = 'small' | 'medium' | 'large';
  type CardPosition = 'left' | 'center' | 'right';

  const [cardConfig, setCardConfig] = useState<Record<CardKey, { collapsed: boolean; size: CardSize; position: CardPosition }>>({
    storySettings: { collapsed: false, size: 'medium', position: 'left' },
    slideEditor: { collapsed: false, size: 'medium', position: 'center' },
    slideList: { collapsed: false, size: 'medium', position: 'left' },
    preview: { collapsed: false, size: 'large', position: 'right' },
  });

  const toggleCardCollapse = (card: CardKey) => {
    setCardConfig(prev => ({ ...prev, [card]: { ...prev[card], collapsed: !prev[card].collapsed } }));
  };

  const cycleCardSize = (card: CardKey) => {
    setCardConfig(prev => {
      const current = prev[card].size;
      const next: CardSize = current === 'small' ? 'medium' : current === 'medium' ? 'large' : 'small';
      return { ...prev, [card]: { ...prev[card], size: next } };
    });
  };

  const moveCard = (card: CardKey) => {
    setCardConfig(prev => {
      const current = prev[card].position;
      const next: CardPosition = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
      return { ...prev, [card]: { ...prev[card], position: next } };
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>, card: CardKey) => {
    event.dataTransfer.setData('text/plain', card);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetPosition: CardPosition) => {
    event.preventDefault();
    const card = event.dataTransfer.getData('text/plain') as CardKey;
    if (card && cardConfig[card]) {
      setCardConfig(prev => ({
        ...prev,
        [card]: { ...prev[card], position: targetPosition },
      }));
    }
  };

  const cardSizeClasses = (size: CardSize) => {
    if (size === 'small') return 'min-h-[150px]';
    if (size === 'medium') return 'min-h-[250px]';
    return 'min-h-[360px]';
  };

  const [storyData, setStoryData] = useState<StoryData>({
    title: '',
    category: 'Technology',
    priority: 'normal',
    status: 'draft',
    slides: [
      {
        id: '1',
        type: 'text',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        content: { headline: '', text: '' },
        duration: 5000,
      },
    ],
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const backgroundOptions = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
  ];

  const activeSlide = storyData.slides[activeSlideIndex];

  const addSlide = () => {
    const newSlide: StorySlide = {
      id: Date.now().toString(),
      type: 'text',
      background: backgroundOptions[0],
      content: { headline: '', text: '' },
      duration: 5000,
    };
    setStoryData(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
    setActiveSlideIndex(storyData.slides.length);
  };

  const removeSlide = (index: number) => {
    if (storyData.slides.length <= 1) return;
    setStoryData(prev => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }));
    if (activeSlideIndex >= storyData.slides.length - 1) {
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    }
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= storyData.slides.length) return;
    const nextSlides = [...storyData.slides];
    const [moved] = nextSlides.splice(from, 1);
    nextSlides.splice(to, 0, moved);
    setStoryData(prev => ({ ...prev, slides: nextSlides }));
    setActiveSlideIndex(to);
  };

  const duplicateSlide = (index: number) => {
    const source = storyData.slides[index];
    if (!source) return;
    const cloned: StorySlide = {
      ...source,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content: {
        ...source.content,
        cta: source.content.cta ? { ...source.content.cta } : undefined,
      },
    };

    const nextSlides = [...storyData.slides];
    nextSlides.splice(index + 1, 0, cloned);
    setStoryData(prev => ({ ...prev, slides: nextSlides }));
    setActiveSlideIndex(index + 1);
  };

  const addSlideTemplate = (template: 'hero' | 'detail' | 'cta') => {
    const title = storyData.title.trim() || 'Story update';
    const normalizedTitle = title.length > 56 ? `${title.slice(0, 56)}…` : title;

    const templateMap: Record<typeof template, StorySlide> = {
      hero: {
        id: `${Date.now()}-hero`,
        type: 'image',
        background: backgroundOptions[0],
        content: {
          headline: normalizedTitle,
          text: 'A quick visual brief for this story.',
          caption: '',
          attribution: '',
        },
        duration: 5000,
      },
      detail: {
        id: `${Date.now()}-detail`,
        type: 'text',
        background: backgroundOptions[2],
        content: {
          headline: 'Key Point',
          text: 'Add one clear supporting fact or insight here.',
        },
        duration: 5000,
      },
      cta: {
        id: `${Date.now()}-cta`,
        type: 'text',
        background: backgroundOptions[4],
        content: {
          headline: 'Read More',
          text: 'Continue the full story on NewsTRNT.',
          cta: {
            text: 'Continue',
            url: 'https://newstrnt.com/web-stories',
          },
        },
        duration: 6000,
      },
    };

    const newSlide = templateMap[template];
    setStoryData(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
    setActiveSlideIndex(storyData.slides.length);
  };

  const generateQuickDraft = () => {
    const title = storyData.title.trim();
    if (!title) {
      window.alert('Add a title first to generate a quick story draft.');
      return;
    }

    const shortTitle = title.length > 64 ? `${title.slice(0, 64)}…` : title;
    const generated: StorySlide[] = [
      {
        id: `${Date.now()}-q1`,
        type: 'image',
        background: backgroundOptions[0],
        content: {
          headline: shortTitle,
          text: 'What happened and why it matters.',
        },
        duration: 5000,
      },
      {
        id: `${Date.now()}-q2`,
        type: 'text',
        background: backgroundOptions[1],
        content: {
          headline: 'Context',
          text: 'Add one concise context line for audience clarity.',
        },
        duration: 5000,
      },
      {
        id: `${Date.now()}-q3`,
        type: 'text',
        background: backgroundOptions[2],
        content: {
          headline: 'Key Takeaway',
          text: 'Highlight the key insight in one sentence.',
        },
        duration: 5000,
      },
      {
        id: `${Date.now()}-q4`,
        type: 'text',
        background: backgroundOptions[4],
        content: {
          headline: 'Continue Reading',
          text: 'Open the full report for deeper coverage.',
          cta: { text: 'Read Full Story', url: 'https://newstrnt.com' },
        },
        duration: 6000,
      },
    ];

    setStoryData(prev => ({ ...prev, slides: generated }));
    setActiveSlideIndex(0);
  };

  const autofillActiveSlideFromTitle = () => {
    const title = storyData.title.trim();
    if (!title) return;
    const active = storyData.slides[activeSlideIndex];
    if (!active) return;

    updateSlideContent(activeSlideIndex, {
      headline: active.content.headline?.trim() || title,
      text: active.content.text?.trim() || `Top highlights from ${title}.`,
      caption: active.content.caption?.trim() || 'NewsTRNT visual brief',
      attribution: active.content.attribution?.trim() || 'Source: NewsTRNT',
      cta: active.content.cta || {
        text: 'Read full story',
        url: 'https://newstrnt.com',
      },
    });
  };

  const updateSlide = (index: number, updates: Partial<StorySlide>) => {
    setStoryData(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => (i === index ? { ...slide, ...updates } : slide)),
    }));
  };

  const updateSlideContent = (index: number, contentUpdates: Partial<StorySlide['content']>) => {
    setStoryData(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === index ? { ...slide, content: { ...slide.content, ...contentUpdates } } : slide
      ),
    }));
  };

  const sanitizeMediaUrl = (url?: string | null, fallback = '/api/placeholder/400/600'): string => {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return fallback;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    if (trimmed.startsWith('/')) return trimmed;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
      return fallback;
    } catch {
      return trimmed;
    }
  };

  const guessCoverImage = (data: StoryData): string => {
    if (data.coverImage && data.coverImage.trim()) {
      return sanitizeMediaUrl(data.coverImage);
    }

    const firstSlide = data.slides?.[0];
    if (!firstSlide) {
      return '/api/placeholder/400/600';
    }

    if (firstSlide.type === 'image' && firstSlide.content.image) {
      return sanitizeMediaUrl(firstSlide.content.image);
    }

    if (firstSlide.type === 'video' && firstSlide.content.video) {
      return sanitizeMediaUrl(firstSlide.content.video);
    }

    return '/api/placeholder/400/600';
  };

  const getClientQualityIssues = (data: StoryData): QualityIssue[] => {
    const issues: QualityIssue[] = [];
    const title = (data.title || '').trim();

    if (title.length < 18) {
      issues.push({
        level: 'warning',
        code: 'weak_title',
        message: 'Title looks short. Consider a more compelling headline.',
      });
    }

    data.slides.forEach((slide, index) => {
      const mediaUrl = slide.content.image || slide.content.video;
      const altText = (slide.content.alt || '').trim();
      if (mediaUrl && !altText) {
        issues.push({
          level: 'warning',
          code: 'missing_alt_text',
          message: `Slide ${index + 1}: Add alt text for better accessibility and AMP quality.`,
        });
      }

      if (typeof mediaUrl === 'string' && mediaUrl.includes('placeholder')) {
        issues.push({
          level: 'error',
          code: 'placeholder_media',
          message: `Slide ${index + 1}: Placeholder media detected.`,
        });
      }
    });

    return issues;
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: adminAuth.getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || err?.message || `Image upload failed (${res.status})`);
    }

    const data = await res.json();
    const url = data?.url || data?.files?.[0]?.url;
    if (!url) throw new Error('Image upload response did not return URL');
    return url;
  };

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        uploadedUrls.push(await uploadImageToServer(files[i]));
      }

      if (uploadedUrls.length === 1) {
        updateSlideContent(index, { image: uploadedUrls[0] });
        updateSlide(index, { type: 'image' });
        return;
      }

      const nextSlides = [...storyData.slides];
      nextSlides[index] = {
        ...nextSlides[index],
        type: 'image',
        background: nextSlides[index].background,
        content: { ...nextSlides[index].content, image: uploadedUrls[0] },
      };

      for (let i = 1; i < uploadedUrls.length; i++) {
        nextSlides.splice(index + i, 0, {
          id: Date.now().toString() + '-' + i,
          type: 'image',
          background: backgroundOptions[0],
          content: { headline: '', text: '', image: uploadedUrls[i] },
          duration: 5000,
        });
      }

      setStoryData(prev => ({ ...prev, slides: nextSlides }));
      setActiveSlideIndex(index);
    } catch (error: any) {
      console.error('[WebStories] Image upload failed:', error);
      window.alert(`Image upload failed: ${error?.message || 'unknown error'}`);
    }
  };

  useEffect(() => {
    if (!previewMode || !isPlaying) return;
    const timeout = window.setTimeout(() => {
      setActiveSlideIndex(prev => (prev + 1) % storyData.slides.length);
    }, storyData.slides[activeSlideIndex]?.duration || 5000);
    return () => window.clearTimeout(timeout);
  }, [previewMode, isPlaying, activeSlideIndex, storyData.slides]);

  useEffect(() => {
    if (!storyId) return;

    const fetchStory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/webstories/admin/${storyId}`, {
          headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          console.error('[WebStories] failed to fetch story for edit', res.status);
          return;
        }

        const data = await res.json();
        const story = data?.webStory || data?.story;
        if (!story) {
          console.warn('[WebStories] edit story no data found in response', data);
          return;
        }

        setStoryData({
          title: story.title || '',
          category: story.category || story.categorySlug || 'Technology',
          priority: story.priority || 'normal',
          status: story.status || 'draft',
          coverImage: story.coverImage || '',
          slides: Array.isArray(story.slides) && story.slides.length > 0
            ? story.slides.map((slide: any) => ({
                id: slide.id || `${Date.now()}-${Math.random()}`,
                type: slide.type || 'text',
                background: slide.background || backgroundOptions[0],
                content: {
                  headline: slide.content?.headline || '',
                  text: slide.content?.text || '',
                  image: slide.content?.image || '',
                  video: slide.content?.video || '',
                  poster: slide.content?.poster || '',
                  alt: slide.content?.alt || '',
                  caption: slide.content?.caption || '',
                  attribution: slide.content?.attribution || '',
                  cta: slide.content?.cta || undefined,
                },
                duration: slide.duration || 5000,
              }))
            : [{
                id: '1',
                type: 'text',
                background: backgroundOptions[0],
                content: { headline: '', text: '' },
                duration: 5000,
              }],
        });

        setActiveSlideIndex(0);
      } catch (error) {
        console.error('[WebStories] failed to load existing story', error);
      }
    };

    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (!previewMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewMode(false);
        setIsPlaying(false);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveSlideIndex(prev => (prev - 1 + storyData.slides.length) % storyData.slides.length);
        setIsPlaying(false);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveSlideIndex(prev => (prev + 1) % storyData.slides.length);
        setIsPlaying(false);
      } else if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
        event.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMode, storyData.slides.length]);

  const saveStory = async (publish = false) => {
    if (!storyData.title.trim()) {
      window.alert('Title is required to save web story.');
      return;
    }

    setSaving(true);
    try {
      const categoryValue = (storyData as any).category?.toString()?.trim() || '';

      const sanitizedSlides = storyData.slides.map(slide => ({
        ...slide,
        content: {
          ...slide.content,
          image: slide.content.image ? sanitizeMediaUrl(slide.content.image) : undefined,
          video: slide.content.video ? sanitizeMediaUrl(slide.content.video) : undefined,
          poster: slide.content.poster ? sanitizeMediaUrl(slide.content.poster) : undefined,
        },
      }));

      const payload: any = {
        title: storyData.title,
        priority: storyData.priority,
        coverImage: guessCoverImage({ ...storyData, slides: sanitizedSlides }),
        slides: sanitizedSlides,
        status: publish ? 'published' : 'draft',
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      if (categoryValue) {
        payload.category = categoryValue;
        payload.categoryId = categoryValue.toLowerCase();
      }

      if (publish) {
        const qualityIssues = getClientQualityIssues({ ...storyData, slides: sanitizedSlides });
        const blocking = qualityIssues.filter(issue => issue.level === 'error');
        if (blocking.length > 0) {
          window.alert(`Cannot publish yet:\n\n${blocking.map(issue => `• ${issue.message}`).join('\n')}`);
          return;
        }

        if (qualityIssues.length > 0) {
          const proceed = window.confirm(
            `Quality checks found ${qualityIssues.length} warning(s):\n\n${qualityIssues
              .slice(0, 6)
              .map(issue => `• ${issue.message}`)
              .join('\n')}\n\nPublish anyway?`
          );
          if (!proceed) {
            return;
          }
        }
      }

      console.debug('[WebStories] save payload', payload);

      const savingUrl = storyId ? `${API_BASE_URL}/webstories/admin/${storyId}` : `${API_BASE_URL}/webstories/admin`;
      const savingMethod = storyId ? 'PUT' : 'POST';

      const res = await fetch(savingUrl, {
        method: savingMethod,
        headers: { 'Content-Type': 'application/json', ...adminAuth.getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => null);
      console.debug('[WebStories] save response', savingMethod, savingUrl, res.status, responseData);

      if (!res.ok) {
        if (Array.isArray(responseData?.qualityIssues) && responseData.qualityIssues.length > 0) {
          const issueSummary = responseData.qualityIssues
            .slice(0, 8)
            .map((issue: QualityIssue) => `• ${issue.message}`)
            .join('\n');
          throw new Error(`${responseData?.error || 'Story quality checks failed'}\n\n${issueSummary}`);
        }
        const message = responseData?.error || responseData?.message || `Failed to save story (${res.status})`;
        throw new Error(message);
      }

      window.alert(`Web story ${storyId ? 'updated' : 'created'} successfully`);
      if (!storyId) {
        // For new story, redirect to list.
        router.push('/content/web-stories');
      }
      // if editing, stay on the same page with existing storyId

    } catch (error: any) {
      console.error('[WebStories] Failed to save story:', error);
      window.alert(`Save failed: ${error?.message || 'unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const cardControls = (card: CardKey) => (
    <div className="flex gap-1">
      <button onClick={() => toggleCardCollapse(card)} className="rounded bg-[rgb(var(--muted))]/20 px-2 py-1 text-xs">
        {cardConfig[card].collapsed ? 'Expand' : 'Collapse'}
      </button>
      <button onClick={() => cycleCardSize(card)} className="rounded bg-[rgb(var(--muted))]/20 px-2 py-1 text-xs">
        {cardConfig[card].size}
      </button>
      <button onClick={() => moveCard(card)} className="rounded bg-[rgb(var(--muted))]/20 px-2 py-1 text-xs">
        Move {cardConfig[card].position === 'left' ? 'Right' : 'Left'}
      </button>
    </div>
  );

  const renderStorySettingsCard = () => {
    const config = cardConfig.storySettings;
    return (
      <div className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 ${cardSizeClasses(config.size)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="cursor-grab px-2 py-1 rounded border border-[rgb(var(--border))] text-xs"
              draggable
              onDragStart={e => handleDragStart(e, 'storySettings')}
            >
              ↕
            </span>
            <h3 className="text-lg font-semibold">Story Settings</h3>
          </div>
          {cardControls('storySettings')}
        </div>
        {!config.collapsed && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input value={storyData.title} onChange={e => setStoryData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter story title..." className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select value={storyData.category} onChange={e => setStoryData(prev => ({ ...prev, category: e.target.value }))} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-[rgb(var(--foreground))]" style={{ colorScheme: 'dark light' }}>
                <option>Technology</option>
                <option>Business</option>
                <option>Environment</option>
                <option>Sports</option>
                <option>Entertainment</option>
                <option>Science</option>
                <option>Health</option>
                <option>Politics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select value={storyData.priority} onChange={e => setStoryData(prev => ({ ...prev, priority: e.target.value as 'high' | 'normal' | 'low' }))} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-[rgb(var(--foreground))]" style={{ colorScheme: 'dark light' }}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
              <input
                type="text"
                value={storyData.coverImage ?? ''}
                onChange={e => setStoryData(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="Leave blank to use first slide"
                className="w-full rounded-lg border px-3 py-2"
              />
              <p className="text-xs text-muted-foreground mt-1">If this is empty, the first slide image/video automatically becomes cover.</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Story Progress</p>
              <p className="text-sm">{storyData.slides.length} slides</p>
              <p className="text-sm">~{Math.round(storyData.slides.reduce((sum, slide) => sum + slide.duration, 0) / 1000)}s duration</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={generateQuickDraft} className="rounded border border-[rgb(var(--border))] px-2.5 py-1 text-xs">Quick 4-slide draft</button>
                <button onClick={autofillActiveSlideFromTitle} className="rounded border border-[rgb(var(--border))] px-2.5 py-1 text-xs">Autofill active slide</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSlideListCard = () => {
    const config = cardConfig.slideList;
    return (
      <div className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 ${cardSizeClasses(config.size)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="cursor-grab px-2 py-1 rounded border border-[rgb(var(--border))] text-xs"
              draggable
              onDragStart={e => handleDragStart(e, 'slideList')}
            >
              ↕
            </span>
            <h3 className="text-lg font-semibold">Slides</h3>
          </div>
          {cardControls('slideList')}
        </div>
        {!config.collapsed && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <button onClick={addSlide} className="rounded bg-[rgb(var(--primary))] px-3 py-1 text-sm text-white">Add</button>
              <button onClick={() => addSlideTemplate('hero')} className="rounded border border-[rgb(var(--border))] px-2.5 py-1 text-xs">Hero</button>
              <button onClick={() => addSlideTemplate('detail')} className="rounded border border-[rgb(var(--border))] px-2.5 py-1 text-xs">Detail</button>
              <button onClick={() => addSlideTemplate('cta')} className="rounded border border-[rgb(var(--border))] px-2.5 py-1 text-xs">CTA</button>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-auto">
              {storyData.slides.map((slide, index) => (
                <div key={slide.id} onClick={() => setActiveSlideIndex(index)} className={`rounded-lg border p-3 cursor-pointer ${index === activeSlideIndex ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10' : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Slide {index + 1}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{slide.content.headline || 'Untitled'} • {slide.duration / 1000}s</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); moveSlide(index, index - 1); }} disabled={index === 0} className="rounded px-1 py-0.5 text-xs disabled:opacity-40">↑</button>
                      <button onClick={e => { e.stopPropagation(); moveSlide(index, index + 1); }} disabled={index === storyData.slides.length - 1} className="rounded px-1 py-0.5 text-xs disabled:opacity-40">↓</button>
                      <button onClick={e => { e.stopPropagation(); duplicateSlide(index); }} className="rounded px-1 py-0.5 text-xs">⎘</button>
                      <button onClick={e => { e.stopPropagation(); removeSlide(index); }} className="text-red-500 text-xs">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSlideEditorCard = () => {
    const config = cardConfig.slideEditor;
    return (
      <div className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 ${cardSizeClasses(config.size)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="cursor-grab px-2 py-1 rounded border border-[rgb(var(--border))] text-xs"
              draggable
              onDragStart={e => handleDragStart(e, 'slideEditor')}
            >
              ↕
            </span>
            <h3 className="text-lg font-semibold">Slide Editor</h3>
          </div>
          {cardControls('slideEditor')}
        </div>
        {!config.collapsed && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => updateSlide(activeSlideIndex, { type: 'text' })} className={`rounded px-3 py-1 text-sm ${activeSlide.type === 'text' ? 'bg-[rgb(var(--primary))] text-white' : 'bg-[rgb(var(--muted))]/10'}`}>Text</button>
              <button onClick={() => updateSlide(activeSlideIndex, { type: 'image' })} className={`rounded px-3 py-1 text-sm ${activeSlide.type === 'image' ? 'bg-[rgb(var(--primary))] text-white' : 'bg-[rgb(var(--muted))]/10'}`}>Image</button>
              <button onClick={() => updateSlide(activeSlideIndex, { type: 'video' })} className={`rounded px-3 py-1 text-sm ${activeSlide.type === 'video' ? 'bg-[rgb(var(--primary))] text-white' : 'bg-[rgb(var(--muted))]/10'}`}>Video</button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Headline</label>
              <input value={activeSlide.content.headline || ''} onChange={e => updateSlideContent(activeSlideIndex, { headline: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea value={activeSlide.content.text || ''} onChange={e => updateSlideContent(activeSlideIndex, { text: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2" />
            </div>

            {activeSlide.type === 'image' && (
              <div>
                <label className="block text-sm font-medium mb-1">Background Image</label>
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(activeSlideIndex, e)} />
                  <button onClick={() => fileInputRef.current?.click()} className="rounded border px-3 py-2 text-sm">Upload Image</button>
                  {activeSlide.content.image && <button onClick={() => updateSlideContent(activeSlideIndex, { image: '' })} className="rounded border px-3 py-2 text-sm text-red-500">Remove</button>}
                </div>
              </div>
            )}

            {activeSlide.type === 'video' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <input
                    type="url"
                    value={activeSlide.content.video || ''}
                    onChange={e => updateSlideContent(activeSlideIndex, { video: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={activeSlide.content.poster || ''}
                    onChange={e => updateSlideContent(activeSlideIndex, { poster: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>
            )}

            {(activeSlide.type === 'image' || activeSlide.type === 'video') && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Alt Text (Accessibility)</label>
                  <input
                    value={activeSlide.content.alt || ''}
                    onChange={e => updateSlideContent(activeSlideIndex, { alt: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Describe the visual for screen readers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Caption</label>
                  <input
                    value={activeSlide.content.caption || ''}
                    onChange={e => updateSlideContent(activeSlideIndex, { caption: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Optional caption"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attribution</label>
                  <input
                    value={activeSlide.content.attribution || ''}
                    onChange={e => updateSlideContent(activeSlideIndex, { attribution: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Photo/Video credit"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <div className="grid grid-cols-4 gap-2">
                {backgroundOptions.map((bg, idx) => (
                  <button key={idx} onClick={() => updateSlide(activeSlideIndex, { background: bg })} className={`h-8 rounded border ${activeSlide.background === bg ? 'border-[rgb(var(--primary))]' : 'border-[rgb(var(--border))]'}`} style={{ background: bg }} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CTA Text</label>
              <input value={activeSlide.content.cta?.text || ''} onChange={e => updateSlideContent(activeSlideIndex, { cta: { text: e.target.value, url: activeSlide.content.cta?.url || '' } })} className="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CTA URL</label>
              <input value={activeSlide.content.cta?.url || ''} onChange={e => updateSlideContent(activeSlideIndex, { cta: { text: activeSlide.content.cta?.text || '', url: e.target.value } })} type="url" className="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration: {activeSlide.duration / 1000}s</label>
              <input type="range" min={3000} max={10000} step={1000} value={activeSlide.duration} onChange={e => updateSlide(activeSlideIndex, { duration: Number(e.target.value) })} className="w-full" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewCard = () => {
    const config = cardConfig.preview;
    return (
      <div className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 ${cardSizeClasses(config.size)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="cursor-grab px-2 py-1 rounded border border-[rgb(var(--border))] text-xs"
              draggable
              onDragStart={e => handleDragStart(e, 'preview')}
            >
              ↕
            </span>
            <h3 className="text-lg font-semibold">Live Preview</h3>
          </div>
          {cardControls('preview')}
        </div>
        {!config.collapsed && (
          <div className="flex justify-center">
            <div className="relative w-full max-w-[360px] aspect-[9/16] overflow-hidden rounded-3xl border border-white/10" style={{ background: activeSlide.background }}>
              {activeSlide.type === 'video' && activeSlide.content.video ? (
                <video
                  src={activeSlide.content.video}
                  poster={activeSlide.content.poster}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : activeSlide.content.image ? (
                <Image src={activeSlide.content.image} alt={activeSlide.content.alt || 'Active slide'} fill className="object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/42 to-black/72" />
              <div className="absolute inset-0 p-4 text-white">
                <div className="flex justify-between text-[11px] text-white/75">
                  <div>{activeSlideIndex + 1} / {storyData.slides.length}</div>
                  <div>{Math.round(activeSlide.duration / 1000)}s</div>
                </div>
                <div className="absolute inset-x-4 bottom-20 space-y-3">
                  <div className="space-y-2">
                    {activeSlide.content.headline && <h2 className="text-[1.45rem] font-semibold leading-tight tracking-tight">{activeSlide.content.headline}</h2>}
                    {activeSlide.content.text && <p className="text-[0.9rem] leading-relaxed text-white/90">{activeSlide.content.text}</p>}
                  </div>
                  {(activeSlide.content.caption || activeSlide.content.attribution) && (
                    <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-[11px] leading-relaxed text-white/85 backdrop-blur-sm">
                      {activeSlide.content.caption && <p>{activeSlide.content.caption}</p>}
                      {activeSlide.content.attribution && <p className="mt-1 text-white/70">{activeSlide.content.attribution}</p>}
                    </div>
                  )}
                  {activeSlide.content.cta && activeSlide.content.cta.text && activeSlide.content.cta.url && (
                    <a href={activeSlide.content.cta.url} target="_blank" rel="noreferrer" className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/35 bg-white/15 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur-sm transition-colors hover:bg-white/25">
                      {activeSlide.content.cta.text}
                    </a>
                  )}
                </div>
                <div className="absolute inset-x-4 bottom-4 h-1 w-auto rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(((activeSlideIndex + 1) / storyData.slides.length) * 100)}%` }} />
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button className="rounded bg-white/20 px-3 py-1 text-xs" onClick={() => setIsPlaying(prev => !prev)}>{isPlaying ? 'Pause' : 'Play'}</button>
                <button className="rounded bg-white/20 px-3 py-1 text-xs" onClick={() => setActiveSlideIndex(prev => (prev - 1 + storyData.slides.length) % storyData.slides.length)}>Prev</button>
                <button className="rounded bg-white/20 px-3 py-1 text-xs" onClick={() => setActiveSlideIndex(prev => (prev + 1) % storyData.slides.length)}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (previewMode) {
    const storyTotal = storyData.slides.length || 1;
    const progress = Math.round(((activeSlideIndex + 1) / storyTotal) * 100);
    return (
      <div className="fixed inset-0 z-50 bg-black text-white" role="dialog" aria-modal="true" aria-label="Web story preview">
        <div className="absolute inset-0 bg-black/90" />
        <div className="relative h-full flex flex-col items-center justify-center p-4 gap-4">
          <div className="relative w-full max-w-[420px] h-full max-h-[calc(100vh-3.5rem)] rounded-3xl overflow-hidden border border-white/20 bg-black shadow-xl" style={{ background: activeSlide.background }}>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-2 text-xs text-white hover:bg-white/40"
              onClick={() => {
                setActiveSlideIndex(prev => (prev - 1 + storyData.slides.length) % storyData.slides.length);
                setIsPlaying(false);
              }}
            >
              ❮
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-2 text-xs text-white hover:bg-white/40"
              onClick={() => {
                setActiveSlideIndex(prev => (prev + 1) % storyData.slides.length);
                setIsPlaying(false);
              }}
            >
              ❯
            </button>
            {activeSlide.content.image ? (
              <Image src={activeSlide.content.image} alt={activeSlide.content.alt || 'Story image'} fill className="object-cover" />
            ) : activeSlide.type === 'video' && activeSlide.content.video ? (
              <video
                src={activeSlide.content.video}
                poster={activeSlide.content.poster}
                className="h-full w-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/42 to-black/72" />
            <div className="absolute inset-0 p-4">
              <div className="flex items-center justify-between gap-2">
                <button className="rounded bg-white/20 px-3 py-1 text-xs" onClick={() => setPreviewMode(false)}>
                  Exit
                </button>
                <div className="flex gap-2">
                  <button className="rounded bg-white/20 px-3 py-1 text-xs" onClick={() => setIsPlaying(prev => !prev)}>
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    className="rounded bg-white/20 px-3 py-1 text-xs"
                    onClick={() => {
                      setActiveSlideIndex(prev => (prev - 1 + storyData.slides.length) % storyData.slides.length);
                      setIsPlaying(false);
                    }}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded bg-white/20 px-3 py-1 text-xs"
                    onClick={() => {
                      setActiveSlideIndex(prev => (prev + 1) % storyData.slides.length);
                      setIsPlaying(false);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-6 bottom-24 space-y-4">
                <div className="space-y-3">
                  {activeSlide.content.headline && <h2 className="text-[1.9rem] font-semibold leading-tight tracking-tight">{activeSlide.content.headline}</h2>}
                  {activeSlide.content.text && <p className="text-[0.98rem] leading-relaxed text-white/90">{activeSlide.content.text}</p>}
                </div>
                {(activeSlide.content.caption || activeSlide.content.attribution) ? (
                  <div className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-xs leading-relaxed text-white/85 backdrop-blur-sm">
                    {activeSlide.content.caption && <p>{activeSlide.content.caption}</p>}
                    {activeSlide.content.attribution && <p className="mt-1 text-white/70">{activeSlide.content.attribution}</p>}
                  </div>
                ) : null}
                {activeSlide.content.cta && activeSlide.content.cta.text && activeSlide.content.cta.url ? (
                  <a href={activeSlide.content.cta.url} target="_blank" rel="noreferrer" className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-white/35 bg-white/15 px-5 text-xs font-semibold uppercase tracking-[0.1em] backdrop-blur-sm transition-colors hover:bg-white/25">
                    {activeSlide.content.cta.text}
                  </a>
                ) : null}
              </div>
              <div className="absolute inset-x-4 bottom-4 space-y-1">
                <div className="h-1 w-full rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/80">
                  <span>{activeSlideIndex + 1} / {storyTotal}</span>
                  <span>{Math.round((activeSlide.duration || 5000) / 1000)}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-[rgb(var(--border))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Create Web Story</h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Build an immersive visual story experience</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPreviewMode(true);
                setIsPlaying(true);
              }}
              className="rounded-lg bg-[rgb(var(--muted))]/10 px-4 py-2 text-sm"
            >
              Preview
            </button>
            <button
              onClick={() => saveStory(false)}
              disabled={saving}
              className="rounded-lg bg-[rgb(var(--muted))]/10 px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => saveStory(true)}
              disabled={saving}
              className="rounded-lg bg-[rgb(var(--primary))] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6" onDragOver={handleDragOver} onDrop={e => handleDrop(e, 'left')}>
          {cardConfig.storySettings.position === 'left' && renderStorySettingsCard()}
          {cardConfig.slideList.position === 'left' && renderSlideListCard()}
          {cardConfig.slideEditor.position === 'left' && renderSlideEditorCard()}
          {cardConfig.preview.position === 'left' && renderPreviewCard()}
        </div>

        <div className="lg:col-span-4 space-y-6" onDragOver={handleDragOver} onDrop={e => handleDrop(e, 'center')}>
          {cardConfig.storySettings.position === 'center' && renderStorySettingsCard()}
          {cardConfig.slideList.position === 'center' && renderSlideListCard()}
          {cardConfig.slideEditor.position === 'center' && renderSlideEditorCard()}
          {cardConfig.preview.position === 'center' && renderPreviewCard()}
        </div>

        <div className="lg:col-span-4 space-y-6" onDragOver={handleDragOver} onDrop={e => handleDrop(e, 'right')}>
          {cardConfig.storySettings.position === 'right' && renderStorySettingsCard()}
          {cardConfig.slideList.position === 'right' && renderSlideListCard()}
          {cardConfig.slideEditor.position === 'right' && renderSlideEditorCard()}
          {cardConfig.preview.position === 'right' && renderPreviewCard()}
        </div>
      </div>
    </div>
  );
};

export default CreateWebStory;
