import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://newstrnt.com';

type StorySlide = {
  type?: 'image' | 'video' | 'text';
  content?: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    alt?: string;
  };
};

type StoryPayload = {
  id?: string;
  slug?: string;
  title: string;
  category?: string;
  description?: string;
  coverImage?: string;
  publishedAt?: string;
  duration?: number;
  slides?: StorySlide[];
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
};

type RelatedStory = {
  slug: string;
  title: string;
  category?: string;
  coverImage?: string;
};

const sanitizeImageUrl = (url?: string | null, fallback = '/api/placeholder/400/600'): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return fallback;

  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    return trimmed;
  }

  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return 'Recently published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently published';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const inferDescription = (story: StoryPayload): string => {
  if (story.description && story.description.trim()) return story.description.trim();
  const contentText = (story.slides || [])
    .map((slide) => [slide.content?.headline, slide.content?.text].filter(Boolean).join('. '))
    .filter(Boolean)
    .join(' ')
    .trim();

  return contentText.slice(0, 240) || `Read “${story.title}” as an immersive NewsTRNT Web Story.`;
};

const fetchStory = async (slug: string): Promise<StoryPayload | null> => {
  try {
    const response = await fetch(`${API_URL}/webstories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.webStory || null;
  } catch {
    return null;
  }
};

const fetchRelatedStories = async (slug: string): Promise<RelatedStory[]> => {
  try {
    const response = await fetch(`${API_URL}/webstories?limit=18`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const stories = Array.isArray(data?.webStories) ? data.webStories : [];
    return stories
      .filter((item: any) => item?.slug && item.slug !== slug)
      .slice(0, 4)
      .map((item: any) => ({
        slug: String(item.slug),
        title: String(item.title || 'Web Story'),
        category: typeof item.category === 'string' ? item.category : undefined,
        coverImage: typeof item.coverImage === 'string' ? item.coverImage : undefined,
      }));
  } catch {
    return [];
  }
};

export default async function WebStoryPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await fetchStory(slug);

  if (!story) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-bold">Web Story Not Found</h1>
          <p className="mt-3 text-muted-foreground">This story is unavailable or has been removed.</p>
          <Link
            href="/web-stories"
            className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-primary-foreground"
          >
            Browse Web Stories
          </Link>
        </div>
      </main>
    );
  }

  const storySlug = story.slug || slug;
  const coverImage = sanitizeImageUrl(
    story.coverImage || story.slides?.[0]?.content?.image || story.slides?.[0]?.content?.video
  );
  const description = inferDescription(story);
  const totalSlides = story.slides?.length || 0;
  const ampHref = `/web-stories/${encodeURIComponent(storySlug)}/amp`;
  const relatedStories = await fetchRelatedStories(storySlug);
  const canonicalUrl = `${SITE_URL}/web-stories/${encodeURIComponent(storySlug)}`;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <div className="relative min-h-[75vh] w-full flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Background Cover */}
        <div className="absolute inset-0 z-0">
          <Image src={coverImage} alt={story.title} fill className="object-cover opacity-30 blur-2xl scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1fr,400px] gap-12 items-center">
          {/* Left Column: Text */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="px-3 py-1 text-xs font-mono tracking-wider uppercase border border-[rgb(var(--primary))]/20 rounded-full bg-[rgb(var(--primary))]/5 text-[rgb(var(--primary))]">Web Story</span>
              <span className="px-3 py-1 text-xs font-mono tracking-wider uppercase border border-border rounded-full bg-background/50 backdrop-blur-sm">{story.category || 'Editorial'}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              {story.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={ampHref} className="group relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm tracking-wider uppercase bg-primary text-primary-foreground rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)]">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play Story
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
              
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground ml-4">
                <div className="flex items-center gap-1.5 focus:outline-none">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {totalSlides} {totalSlides === 1 ? 'Slide' : 'Slides'}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div>{formatDate(story.publishedAt)}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Phone Mockup */}
          <div className="relative mx-auto w-full max-w-[340px] perspective-[1000px] hidden lg:block">
            <Link href={ampHref} className="block relative aspect-[9/16] rounded-[2.5rem] border-[8px] border-background shadow-2xl shadow-black/50 overflow-hidden transform-gpu rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
              <Image src={coverImage} alt={story.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Phone Status Bar Simulation */}
              <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-between px-5 text-white/90 text-[10px] font-medium z-20">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> 
                </div>
              </div>

              {/* Tap Indicator */}
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10">
                  Click to Experience
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-20 layout-gpu">
                <h3 className="text-white font-serif text-xl font-bold leading-snug shadow-black">{story.title}</h3>
                <div className="w-full h-1 bg-white/20 mt-4 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-white rounded-full" />
                </div>
              </div>
            </Link>
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[rgb(var(--primary))]/20 blur-[100px] -z-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content Breakdown Layout (For SEO and standard reading) */}
      {story.slides && story.slides.length > 0 && (
        <section className="py-24 lg:py-32 bg-background relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--border))] to-transparent opacity-50" />
          
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="text-center mb-20 lg:mb-32">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-mono font-bold tracking-[0.2em] text-[rgb(var(--primary))] uppercase border border-[rgb(var(--primary))]/20 rounded-full bg-[rgb(var(--primary))]/5">
                Article Format
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground">
                Story Overview
              </h2>
              <p className="text-muted-foreground mt-6 font-medium text-lg md:text-xl max-w-2xl mx-auto">
                Scroll through an adaptive layout designed for deep reading, paired with full vertical native imagery.
              </p>
            </div>
            
            <div className="space-y-24 md:space-y-40">
              {story.slides.map((slide, index) => {
                const slideImage = sanitizeImageUrl(slide.content?.image || slide.content?.video || coverImage);
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className="group grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Image Area - 9:16 aspect ratio */}
                    <div className={`relative w-full max-w-[360px] mx-auto ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                      <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 isolate">
                        <Image 
                          src={slideImage} 
                          alt={slide.content?.headline || `Slide ${index + 1}`} 
                          fill 
                          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        {/* Overlay vignette */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
                        
                        {/* Counter bubble inside image */}
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-white font-mono text-[10px] tracking-widest uppercase border border-white/20 shadow-lg">
                          {String(index + 1).padStart(2, '0')} / {String(story.slides!.length).padStart(2, '0')}
                        </div>
                      </div>
                      {/* Decorative glow elements behind */}
                      <div className={`absolute top-1/4 -bottom-10 w-[120%] bg-gradient-to-tr from-[rgb(var(--primary))]/15 to-transparent blur-3xl -z-10 rounded-full transition-all duration-700 opacity-0 group-hover:opacity-100 ${isEven ? '-right-10' : '-left-10'}`} />
                    </div>
                    
                    {/* Text Area */}
                    <div className={`flex flex-col justify-center ${isEven ? 'md:order-2 md:pl-8' : 'md:order-1 md:pr-8 text-left md:text-right'}`}>
                      <div className={`flex items-center gap-4 mb-6 opacity-60 ${!isEven ? 'md:justify-end' : ''}`}>
                        {isEven && <span className="h-px bg-foreground flex-1 max-w-[3rem]" />}
                        <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-foreground">
                          Chapter {index + 1}
                        </span>
                        {!isEven && <span className="h-px bg-foreground flex-1 max-w-[3rem] hidden md:block" />}
                        {!isEven && <span className="h-px bg-foreground flex-1 max-w-[3rem] md:hidden" />}
                      </div>
                      
                      {slide.content?.headline && (
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] text-foreground mb-8 transition-colors group-hover:text-[rgb(var(--primary))]">
                          {slide.content.headline}
                        </h3>
                      )}
                      
                      {slide.content?.text && (
                        <div className="prose prose-lg lg:prose-xl prose-invert max-w-none text-muted-foreground leading-relaxed font-sans">
                          <p>{slide.content.text}</p>
                        </div>
                      )}
                      
                      {/* Reading dots indicator */}
                      <div className={`mt-12 flex gap-2 ${!isEven ? 'md:justify-end' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--primary))] transition-transform duration-500 group-hover:scale-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--primary))]/50 transition-transform duration-500 delay-75 group-hover:scale-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--primary))]/20 transition-transform duration-500 delay-150 group-hover:scale-150" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section className="py-24 bg-[rgb(var(--muted))]/30 border-t border-[rgb(var(--border))]/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-[rgb(var(--primary))] font-mono text-xs uppercase tracking-widest font-bold mb-2 block">Keep Exploring</span>
                <h2 className="text-4xl font-serif font-bold">Related Stories</h2>
              </div>
              <Link href="/web-stories" className="group flex items-center gap-2 font-mono text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
                View All Web Stories
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedStories.map((item) => (
                <Link key={item.slug} href={`/web-stories/${item.slug}/amp`} className="group block h-full">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4 border border-[rgb(var(--border))]/50 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-2">
                    <Image src={sanitizeImageUrl(item.coverImage)} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 inset-x-0 p-6">
                      {item.category && (
                        <span className="inline-block px-3 py-1 mb-3 text-[10px] font-mono tracking-widest uppercase bg-white/20 text-white backdrop-blur-md rounded-full border border-white/20">
                          {item.category}
                        </span>
                      )}
                      <h4 className="text-white font-serif text-lg font-bold leading-snug line-clamp-3">{item.title}</h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
