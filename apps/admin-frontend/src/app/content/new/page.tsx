"use client";

import React, { useState, useEffect, useCallback, useRef } from'react';
import dynamic from'next/dynamic';
import { useSearchParams, useRouter } from'next/navigation';
import { articleAPI, type Article } from'@/lib/api';
import { API_CONFIG } from'@/config/api';
import adminAuth from'@/lib/auth/admin-auth';
import ArticlePreview from'@/components/editors/ArticlePreview';
import { showToast } from'@/lib/utils/toast';
import { useCategories } from'@/hooks/useCategories';

interface ArticleForm {
 title: string;
 content: string; // HTML content (rich text)
 summary: string;
 categoryId: string;
 subCategoryId?: string;
 tags: string[];
 status:'draft' |'scheduled' |'published';
 featured: boolean;
 publishDate: string;
 seoTitle: string;
 seoDescription: string;
 seoKeywords: string[];
 imageUrl: string;
 contentType:'news' |'article' |'opinion' |'analysis' |'review' |'interview';
 authorType:'staff' |'wire' |'contributor' |'ai' |'syndicated';
 author?: string;
 shortContent?: string;
}

interface Category {
 id: string;
 name: string;
 slug: string;
}

type PlacementRatio = '2x1' | '16x9' | '1x1' | '3x2' | '4x3' | '9x16' | '16x10' | '21x9' | '4x5' | '5x4' | '3x4';
type CropMode = 'none' | 'auto' | 'manual';
type PreviewFitMode = 'cover' | 'contain' | 'fill';
type ThemeBackgroundMode = 'auto' | 'light' | 'dark';
type RepeatDirection = 'both' | 'x' | 'y';
type CanvasPlacement = 'featured' | 'card' | 'list' | 'thumb' | 'newsThumb' | 'hero' | 'banner' | 'story' | 'portraitCard';

const PLACEMENT_RATIO_OPTIONS: Array<{ ratio: PlacementRatio; label: string; usage: string; widthTarget: string }> = [
 { ratio:'2x1', label:'2:1', usage:'Featured card (home feed)', widthTarget:'800' },
 { ratio:'16x9', label:'16:9', usage:'Article hero', widthTarget:'1024+' },
 { ratio:'1x1', label:'1:1', usage:'Thumbnail cards', widthTarget:'80-96' },
 { ratio:'3x2', label:'3:2', usage:'Compact card', widthTarget:'120' },
 { ratio:'4x3', label:'4:3', usage:'List card', widthTarget:'160' },
 { ratio:'9x16', label:'9:16', usage:'Web stories', widthTarget:'full-height' },
 { ratio:'16x10', label:'16:10', usage:'Trending / Divergence', widthTarget:'variable' },
 { ratio:'21x9', label:'21:9', usage:'Ultra-wide hero strips', widthTarget:'1280+' },
 { ratio:'4x5', label:'4:5', usage:'Mobile portrait feed', widthTarget:'480' },
 { ratio:'5x4', label:'5:4', usage:'Editorial cards', widthTarget:'600' },
 { ratio:'3x4', label:'3:4', usage:'Portrait list cards', widthTarget:'360' },
];

const CANVAS_PLACEMENTS: Record<CanvasPlacement, {
 label: string;
 source: string;
 width: number;
 height: number;
 objectFit: 'cover' | 'contain' | 'fill';
}> = {
 featured: { label: 'Featured', source: 'ArticleCard.featured', width: 800, height: 400, objectFit: 'cover' },
 card: { label: 'Card', source: 'ArticleCard.default', width: 400, height: 192, objectFit: 'cover' },
 list: { label: 'List', source: 'ArticleCard.list', width: 160, height: 112, objectFit: 'cover' },
 thumb: { label: 'Compact Thumb', source: 'ArticleCard.compact', width: 128, height: 80, objectFit: 'cover' },
 newsThumb: { label: 'News Thumb', source: 'NewsCard', width: 96, height: 96, objectFit: 'cover' },
 hero: { label: 'Hero', source: 'Article hero mock', width: 1200, height: 675, objectFit: 'cover' },
 banner: { label: 'Banner', source: 'Wide market banner mock', width: 1440, height: 480, objectFit: 'cover' },
 story: { label: 'Story', source: 'Story/vertical mock', width: 720, height: 1280, objectFit: 'cover' },
 portraitCard: { label: 'Portrait Card', source: 'Portrait card mock', width: 600, height: 800, objectFit: 'cover' },
};

const SliderWithNumber: React.FC<{
 label: string;
 value: number;
 min: number;
 max: number;
 step?: number;
 suffix?: string;
 onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, suffix = '', onChange }) => (
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 {label}: {Number(value).toFixed(step < 1 ? 2 : 0)}{suffix}
 <div className="mt-1 grid grid-cols-[1fr_84px] gap-2">
 <input
 type="range"
 min={min}
 max={max}
 step={step}
 value={value}
 onChange={(e) => onChange(Number(e.target.value))}
 className="w-full"
 />
 <input
 type="number"
 min={min}
 max={max}
 step={step}
 value={Number(value.toFixed(step < 1 ? 2 : 0))}
 onChange={(e) => onChange(Number(e.target.value))}
 className="h-8 rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))]"
 />
 </div>
 </label>
);

// Dynamically import AdvancedNewsEditor client-side only - MOVED OUTSIDE COMPONENT
const AdvancedNewsEditor = dynamic(() => import('@/components/editors/AdvancedNewsEditor'), { 
 ssr: false,
 loading: () => (
 <div className="border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] p-8">
 <div className="flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
 <span className="ml-3 text-[rgb(var(--muted-foreground))]">Loading advanced editor...</span>
 </div>
 </div>
 )
});

const NewArticle: React.FC = () => {
 const searchParams = useSearchParams();
 const router = useRouter();
 const editingId = searchParams.get('id'); // Get article ID for editing
 const isEditing = !!editingId;

 const [formData, setFormData] = useState<ArticleForm>({
 title:'',
 content:'',
 summary:'',
 categoryId:'',
 tags: [],
 status:'draft',
 featured: false,
 publishDate:'',
 seoTitle:'',
 seoDescription:'',
 seoKeywords: [],
 imageUrl:'',
 contentType:'article',
 authorType:'staff',
 author:'',
 shortContent:''
 });

 const [tagInput, setTagInput] = useState('');
 const [loading, setLoading] = useState(false);
 
 // Get dynamic categories (include inactive for admin)
 const { categories, loading: categoriesLoading } = useCategories({ 
 includeInactive: true,
 includeSubCategories: true
 });
 const [saving, setSaving] = useState(false);
 const [keywordInput, setKeywordInput] = useState('');
 const [viewMode, setViewMode] = useState<'edit' |'preview' |'split'>('edit');
 const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' |'saving' |'unsaved'>('saved');
 
 // Debounced content for preview updates
 const [debouncedContent, setDebouncedContent] = useState(formData.content);
 const [previewUpdating, setPreviewUpdating] = useState(false);
 const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const lastContentRef = useRef(formData.content);

 // Auto-save to localStorage 
 useEffect(() => {
 // Only auto-save if:
 // 1. Has content to save
 // 2. Not currently in a saving state
 if (formData.title && !saving) {
 setAutoSaveStatus('saving');
 const timeoutId = setTimeout(() => {
 localStorage.setItem('newArticleDraft', JSON.stringify({
 ...formData,
 id: editingId || undefined, // Include article ID if editing existing article
 timestamp: Date.now()
 }));
 setAutoSaveStatus('saved');
 }, 2000); // Save 2 seconds after last change
 
 return () => clearTimeout(timeoutId);
 }
 }, [formData, editingId, saving]);

 // Debounce content updates for preview
 useEffect(() => {
 // Only proceed if content actually changed
 if (formData.content === lastContentRef.current) {
 return;
 }
 
 if (debounceTimeoutRef.current) {
 clearTimeout(debounceTimeoutRef.current);
 }
 
 // Show updating status when content changes
 setPreviewUpdating(true);
 
 debounceTimeoutRef.current = setTimeout(() => {
 setDebouncedContent(formData.content);
 setPreviewUpdating(false);
 lastContentRef.current = formData.content;
 }, 500); // Update preview 500ms after user stops typing
 
 return () => {
 if (debounceTimeoutRef.current) {
 clearTimeout(debounceTimeoutRef.current);
 }
 };
 }, [formData.content]); // Remove debouncedContent from dependencies to prevent infinite loop

 // Keyboard shortcuts
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 // Ctrl+S or Cmd+S to save as draft
 if ((e.ctrlKey || e.metaKey) && e.key ==='s') {
 e.preventDefault();
 handleSubmit('draft');
 }
 
 // Ctrl+Shift+P or Cmd+Shift+P to toggle preview
 if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key ==='P') {
 e.preventDefault();
 setViewMode(prev => prev ==='preview' ?'edit' :'preview');
 }
 
 // Ctrl+Shift+S or Cmd+Shift+S to toggle split view
 if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key ==='S') {
 e.preventDefault();
 setViewMode(prev => prev ==='split' ?'edit' :'split');
 }
 
 // Ctrl+Enter or Cmd+Enter to publish
 if ((e.ctrlKey || e.metaKey) && e.key ==='Enter') {
 e.preventDefault();
 if (formData.title && formData.content && formData.categoryId) {
 handleSubmit('published');
 }
 }
 };

 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [formData.title, formData.content, formData.categoryId]);

 // Load draft on mount
 useEffect(() => {
 if (!isEditing) {
 const savedDraft = localStorage.getItem('newArticleDraft');
 if (savedDraft) {
 try {
 const draft = JSON.parse(savedDraft);
 // Only load if it's less than 24 hours old
 if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
 const shouldLoad = confirm('Found a saved draft from your last session. Load it?');
 if (shouldLoad) {
 const { timestamp: _timestamp, id: _id, ...draftData } = draft;
 setFormData(prev => ({
 ...prev,
 ...draftData,
 contentType: draftData.contentType || prev.contentType,
 authorType: draftData.authorType || prev.authorType,
 }));
 setAutoSaveStatus('unsaved');
 
 // If the draft has an existing article ID, update the URL to edit mode
 if (draft.id) {
 window.history.replaceState(
 {},'',
 `/content/new?id=${draft.id}`
 );
 // The URL change will trigger a re-render and set isEditing to true
 router.refresh();
 }
 }
 }
 } catch (error) {
 console.error('Error loading draft:', error);
 }
 }
 }
 }, [isEditing, router]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const PRO_EDITOR_RESULT_KEY = 'newstrnt-pro-image-editor-result';

 // Load article (if editing) on component mount
 useEffect(() => {
 if (isEditing && editingId) {
 fetchArticleForEditing(editingId);
 }
 }, [isEditing, editingId]);



 const fetchArticleForEditing = async (articleId: string) => {
 try {
 setLoading(true);
 setError('');
 
 const response = await articleAPI.getArticle(articleId);
 if (response.success && response.article) {
 const article = response.article;
 
 // Populate form with existing article data
 setFormData({
 title: article.title ||'',
 content: article.content ||'',
 summary: article.summary ||'',
 categoryId: article.category?.id ||'',
 tags: Array.isArray(article.tags) ? article.tags : [],
 status: article.status ||'draft',
 featured: article.isFeatured || false,
 publishDate: article.publishedAt ? 
 new Date(article.publishedAt).toISOString().slice(0, 16) :'',
 seoTitle:'', // TODO: Add SEO fields to API
 seoDescription:'',
 seoKeywords: [],
 imageUrl: article.imageUrl ||'',
 contentType: (article as any)?.contentType ||'article',
 authorType: (article as any)?.authorType ||'staff',
 author: (article as any)?.authorName || article.author?.fullName ||'',
 shortContent: (article as any)?.shortContent ||''
 });

 // Content will be loaded directly into the editor via the value prop
 } else {
 throw new Error('Article not found');
 }
 } catch (err) {
 let message ='Failed to load article';
 if (err instanceof Error) {
 message = err.message;
 // Enhance network diagnostics
 if (/Backend server is not accessible/i.test(err.message)) {
 message +='\nTroubleshooting: Ensure Express API is running on' + API_CONFIG.baseURL +'\nIf your backend uses a different port, set NEXT_PUBLIC_API_URL accordingly.';
 } else if (/401|Invalid or expired token/i.test(err.message)) {
 message +='\nAuthentication issue: Re-login to admin panel.';
 } else if (/Failed to fetch|NetworkError/i.test(err.message)) {
 message +='\nNetwork error: Check CORS, server status, or mixed content (HTTP vs HTTPS).';
 }
 }
 setError(message);
 console.error('Error fetching article:', err);
 } finally {
 setLoading(false);
 }
 };

 const openProEditorInNewTab = useCallback(() => {
 const query = formData.imageUrl ? `?imageUrl=${encodeURIComponent(formData.imageUrl)}` : '';
 window.open(`/content/image-editor${query}`, '_blank', 'noopener,noreferrer');
 }, [formData.imageUrl]);

 useEffect(() => {
 const applyResult = (url: string) => {
 if (!url) return;
 setFormData((prev) => ({ ...prev, imageUrl: url }));
 setEditorSourceUrl(url);
 setEditorSourceName('pro-editor-result');
 showToast('Updated featured image from Pro Image Editor', 'success');
 };

 const onStorage = (event: StorageEvent) => {
 if (event.key !== PRO_EDITOR_RESULT_KEY || !event.newValue) return;
 try {
 const parsed = JSON.parse(event.newValue) as { url?: string };
 if (parsed?.url) applyResult(parsed.url);
 } catch {
 // no-op
 }
 };

 const onMessage = (event: MessageEvent) => {
 if (event.origin !== window.location.origin) return;
 if (event.data?.type !== PRO_EDITOR_RESULT_KEY) return;
 const url = event.data?.payload?.url;
 if (typeof url === 'string' && url.trim()) {
 applyResult(url);
 }
 };

 window.addEventListener('storage', onStorage);
 window.addEventListener('message', onMessage);
 return () => {
 window.removeEventListener('storage', onStorage);
 window.removeEventListener('message', onMessage);
 };
 }, []);

 const handleInputChange = useCallback((field: keyof ArticleForm, value: any) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 setError(''); // Clear error when user makes changes
 }, []);

 // Optimize editor onChange to prevent re-renders
 const handleEditorChange = useCallback((html: string, plain: string, wordCount?: number) => {
 handleInputChange('content', html);
 setPlainTextCount(wordCount || plain.split(/\s+/).filter((w: string) => w.length).length);
 }, [handleInputChange]);

 // Handle image upload
 const handleImageUpload = useCallback(async (
 file: File,
 options?: {
 generatePlacementCrops?: boolean;
 placementCropRatios?: PlacementRatio[];
 cropMode?: Exclude<CropMode, 'none'>;
 cropFitMode?: PreviewFitMode;
 focalX?: number;
 focalY?: number;
 backgroundTheme?: ThemeBackgroundMode;
 repeatPattern?: boolean;
 repeatDirection?: RepeatDirection;
 },
 ): Promise<string> => {
 const formData = new FormData();
 formData.append('image', file);
 if (options?.generatePlacementCrops) {
 formData.append('generatePlacementCrops', 'true');
 if (options.placementCropRatios?.length) {
 formData.append('placementCropRatios', options.placementCropRatios.join(','));
 }
 if (options.cropMode) {
 formData.append('cropMode', options.cropMode);
 }
 if (options.cropFitMode) {
 formData.append('cropFitMode', options.cropFitMode);
 }
 if (typeof options.focalX === 'number') {
 formData.append('focalX', String(options.focalX));
 }
 if (typeof options.focalY === 'number') {
 formData.append('focalY', String(options.focalY));
 }
 if (options.backgroundTheme) {
 formData.append('backgroundTheme', options.backgroundTheme);
 }
 if (typeof options.repeatPattern === 'boolean') {
 formData.append('repeatPattern', String(options.repeatPattern));
 }
 if (options.repeatDirection) {
 formData.append('repeatDirection', options.repeatDirection);
 }
 }

 try {
 const response = await fetch('/api/upload/images', {
 method:'POST',
 headers: {
 ...adminAuth.getAuthHeaders()
 },
 body: formData,
 });

 const result = await response.json();

 if (!response.ok || !result.success) {
 throw new Error(result.error ||'Upload failed');
 }

 return result.url;
 } catch (error) {
 console.error('Image upload error:', error);
 throw error;
 }
 }, []);

 const [plainTextCount, setPlainTextCount] = useState(0);
 const [imageUploading, setImageUploading] = useState(false);
 const [imageUploadError, setImageUploadError] = useState<string | null>(null);
 const [editorSourceUrl, setEditorSourceUrl] = useState<string>('');
 const [editorSourceName, setEditorSourceName] = useState<string>('image');
 const [editorReady, setEditorReady] = useState(false);
 const [zoom, setZoom] = useState(1);
 const [rotationDeg, setRotationDeg] = useState(0);
 const [flipX, setFlipX] = useState(false);
 const [flipY, setFlipY] = useState(false);
 const [brightness, setBrightness] = useState(100);
 const [contrast, setContrast] = useState(100);
 const [saturation, setSaturation] = useState(100);
 const [blurPx, setBlurPx] = useState(0);
 const [hueRotate, setHueRotate] = useState(0);
 const [grayscale, setGrayscale] = useState(0);
 const [sepia, setSepia] = useState(0);
 const [vignette, setVignette] = useState(0);
 const [panX, setPanX] = useState(0);
 const [panY, setPanY] = useState(0);
 const [cropRect, setCropRect] = useState({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
 const [cropAspectLock, setCropAspectLock] = useState<'free' | PlacementRatio>('free');
 const [cropDragMode, setCropDragMode] = useState<null | 'move' | 'nw' | 'ne' | 'sw' | 'se'>(null);
 const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number; rect: { x: number; y: number; w: number; h: number } } | null>(null);
 const [panDragStart, setPanDragStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
 const [generatePlacementCrops, setGeneratePlacementCrops] = useState(true);
 const [cropMode, setCropMode] = useState<CropMode>('auto');
 const [previewFitMode, setPreviewFitMode] = useState<PreviewFitMode>('cover');
 const [backgroundTheme, setBackgroundTheme] = useState<ThemeBackgroundMode>('auto');
 const [repeatPattern, setRepeatPattern] = useState(false);
 const [repeatDirection, setRepeatDirection] = useState<RepeatDirection>('both');
 const [focalX, setFocalX] = useState(50);
 const [focalY, setFocalY] = useState(50);
 const [canvasPlacement, setCanvasPlacement] = useState<CanvasPlacement>('featured');
 const [selectedPlacementRatios, setSelectedPlacementRatios] = useState<PlacementRatio[]>(['2x1', '16x9', '4x3', '1x1']);
 const [suggestedRatios, setSuggestedRatios] = useState<PlacementRatio[]>(['2x1', '16x9', '4x3']);
 const [sourceAspectLabel, setSourceAspectLabel] = useState('—');
 const [canvasActive, setCanvasActive] = useState(false);
 const canvasRef = useRef<HTMLDivElement | null>(null);
 const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
 const editorImageRef = useRef<HTMLImageElement | null>(null);
 const editorObjectUrlRef = useRef<string | null>(null);

 useEffect(() => {
 const source = editorSourceUrl || formData.imageUrl;
 if (!source) return;

 const image = new Image();
 image.crossOrigin = 'anonymous';
 image.onload = () => {
 editorImageRef.current = image;
 setEditorReady(true);
 const width = image.naturalWidth || 1;
 const height = image.naturalHeight || 1;
 const ratio = width / height;
 setSourceAspectLabel(`${width}×${height} (${ratio.toFixed(2)}:1)`);

 let suggestions: PlacementRatio[];
 if (ratio >= 1.9) {
 suggestions = ['21x9', '2x1', '16x9', '16x10'];
 } else if (ratio <= 0.8) {
 suggestions = ['9x16', '4x5', '3x4', '1x1'];
 } else {
 suggestions = ['16x9', '4x3', '5x4', '3x2', '1x1'];
 }

 setSuggestedRatios(suggestions);
 };
 image.onerror = () => {
 setEditorReady(false);
 setSuggestedRatios(['16x9', '4x3', '1x1']);
 setSourceAspectLabel('unavailable');
 };
 image.src = source;
 }, [editorSourceUrl, formData.imageUrl]);

 useEffect(() => {
 if (!editorSourceUrl && formData.imageUrl) {
 setEditorSourceUrl(formData.imageUrl);
 setEditorSourceName('remote-image');
 }
 }, [editorSourceUrl, formData.imageUrl]);

 useEffect(() => {
 return () => {
 if (editorObjectUrlRef.current) {
 URL.revokeObjectURL(editorObjectUrlRef.current);
 editorObjectUrlRef.current = null;
 }
 };
 }, []);

 const startEditingLocalFile = useCallback((file: File) => {
 setImageUploadError(null);
 if (editorObjectUrlRef.current) {
 URL.revokeObjectURL(editorObjectUrlRef.current);
 }
 const nextUrl = URL.createObjectURL(file);
 editorObjectUrlRef.current = nextUrl;
 setEditorSourceUrl(nextUrl);
 setEditorSourceName(file.name || 'upload');
 setEditorReady(false);
 setZoom(1);
 setRotationDeg(0);
 setFlipX(false);
 setFlipY(false);
 setBrightness(100);
 setContrast(100);
 setSaturation(100);
 setBlurPx(0);
 setHueRotate(0);
 setGrayscale(0);
 setSepia(0);
 setVignette(0);
 setPanX(0);
 setPanY(0);
 setCropRect({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
 setCropAspectLock('free');
 setCropMode('manual');
 }, []);

 const togglePlacementRatio = useCallback((ratio: PlacementRatio, checked: boolean) => {
 setSelectedPlacementRatios((current) => {
 if (checked) {
 return current.includes(ratio) ? current : [...current, ratio];
 }
 if (current.length === 1 && current[0] === ratio) {
 return current;
 }
 return current.filter((item) => item !== ratio);
 });
 }, []);

 const applyAutoSuggestion = useCallback(() => {
 setCropMode('auto');
 setGeneratePlacementCrops(true);
 setSelectedPlacementRatios(suggestedRatios);
 }, [suggestedRatios]);

 const parseAspectFromRatio = useCallback((ratio: PlacementRatio): number => {
 const [w, h] = ratio.split('x').map(Number);
 if (!w || !h) return 1;
 return w / h;
 }, []);
 const drawEditorCanvas = useCallback(() => {
 const canvas = previewCanvasRef.current;
 const sourceImage = editorImageRef.current;
 if (!canvas || !sourceImage) return;

 const preset = CANVAS_PLACEMENTS[canvasPlacement];
 const canvasWidth = preset.width;
 const canvasHeight = preset.height;
 canvas.width = canvasWidth;
 canvas.height = canvasHeight;

 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 const fillStyle = backgroundTheme === 'dark' ? 'rgb(22,24,29)' : backgroundTheme === 'light' ? 'rgb(245,245,245)' : 'rgb(120,120,120)';
 ctx.clearRect(0, 0, canvasWidth, canvasHeight);
 ctx.fillStyle = fillStyle;
 ctx.fillRect(0, 0, canvasWidth, canvasHeight);

 if (repeatPattern) {
 const repetition = repeatDirection === 'x' ? 'repeat-x' : repeatDirection === 'y' ? 'repeat-y' : 'repeat';
 const pattern = ctx.createPattern(sourceImage, repetition);
 if (pattern) {
 ctx.save();
 ctx.globalAlpha = 0.45;
 ctx.fillStyle = pattern;
 ctx.fillRect(0, 0, canvasWidth, canvasHeight);
 ctx.restore();
 }
 }

 const sourceW = sourceImage.naturalWidth;
 const sourceH = sourceImage.naturalHeight;
 const sx = Math.max(0, Math.min(sourceW - 1, Math.round(cropRect.x * sourceW)));
 const sy = Math.max(0, Math.min(sourceH - 1, Math.round(cropRect.y * sourceH)));
 const sw = Math.max(1, Math.min(sourceW - sx, Math.round(cropRect.w * sourceW)));
 const sh = Math.max(1, Math.min(sourceH - sy, Math.round(cropRect.h * sourceH)));

 const sourceAspect = sw / sh;
 const targetAspect = canvasWidth / canvasHeight;

 let drawW = canvasWidth;
 let drawH = canvasHeight;

 if (previewFitMode === 'contain') {
 if (sourceAspect > targetAspect) {
 drawW = canvasWidth;
 drawH = drawW / sourceAspect;
 } else {
 drawH = canvasHeight;
 drawW = drawH * sourceAspect;
 }
 } else if (previewFitMode === 'cover') {
 if (sourceAspect > targetAspect) {
 drawH = canvasHeight;
 drawW = drawH * sourceAspect;
 } else {
 drawW = canvasWidth;
 drawH = drawW / sourceAspect;
 }
 }

 ctx.save();
 ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blurPx}px) hue-rotate(${hueRotate}deg) grayscale(${grayscale}%) sepia(${sepia}%)`;
 ctx.translate(canvasWidth / 2, canvasHeight / 2);
 ctx.rotate((rotationDeg * Math.PI) / 180);
 ctx.scale((flipX ? -1 : 1) * zoom, (flipY ? -1 : 1) * zoom);
 ctx.drawImage(sourceImage, sx, sy, sw, sh, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
 ctx.restore();

 if (vignette > 0) {
 const gradient = ctx.createRadialGradient(
 canvasWidth / 2,
 canvasHeight / 2,
 Math.min(canvasWidth, canvasHeight) * 0.15,
 canvasWidth / 2,
 canvasHeight / 2,
 Math.max(canvasWidth, canvasHeight) * 0.65,
 );
 gradient.addColorStop(0, 'rgba(0,0,0,0)');
 gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.85, vignette / 100)})`);
 ctx.fillStyle = gradient;
 ctx.fillRect(0, 0, canvasWidth, canvasHeight);
 }
 }, [backgroundTheme, blurPx, brightness, canvasPlacement, contrast, cropRect.h, cropRect.w, cropRect.x, cropRect.y, flipX, flipY, grayscale, hueRotate, panX, panY, previewFitMode, repeatDirection, repeatPattern, rotationDeg, saturation, sepia, vignette, zoom]);

 useEffect(() => {
 drawEditorCanvas();
 }, [drawEditorCanvas]);

 const beginCropDrag = (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se', event: React.MouseEvent) => {
 event.preventDefault();
 event.stopPropagation();
 const node = canvasRef.current;
 if (!node) return;
 const rect = node.getBoundingClientRect();
 const px = (event.clientX - rect.left) / rect.width;
 const py = (event.clientY - rect.top) / rect.height;
 setCropDragMode(mode);
 setCropDragStart({ x: px, y: py, rect: { ...cropRect } });
 };

 const applyCropDrag = (event: React.MouseEvent<HTMLDivElement>) => {
 if (cropMode !== 'manual' || !cropDragMode || !cropDragStart) return;
 const node = canvasRef.current;
 if (!node) return;
 const rect = node.getBoundingClientRect();
 const px = (event.clientX - rect.left) / rect.width;
 const py = (event.clientY - rect.top) / rect.height;
 const dx = px - cropDragStart.x;
 const dy = py - cropDragStart.y;

 const minSize = 0.08;
 const next = { ...cropDragStart.rect };

 if (cropDragMode === 'move') {
 next.x = Math.max(0, Math.min(1 - next.w, cropDragStart.rect.x + dx));
 next.y = Math.max(0, Math.min(1 - next.h, cropDragStart.rect.y + dy));
 } else {
 if (cropDragMode.includes('n')) {
 const newY = Math.max(0, Math.min(cropDragStart.rect.y + cropDragStart.rect.h - minSize, cropDragStart.rect.y + dy));
 next.h = cropDragStart.rect.h + (cropDragStart.rect.y - newY);
 next.y = newY;
 }
 if (cropDragMode.includes('s')) {
 next.h = Math.max(minSize, Math.min(1 - cropDragStart.rect.y, cropDragStart.rect.h + dy));
 }
 if (cropDragMode.includes('w')) {
 const newX = Math.max(0, Math.min(cropDragStart.rect.x + cropDragStart.rect.w - minSize, cropDragStart.rect.x + dx));
 next.w = cropDragStart.rect.w + (cropDragStart.rect.x - newX);
 next.x = newX;
 }
 if (cropDragMode.includes('e')) {
 next.w = Math.max(minSize, Math.min(1 - cropDragStart.rect.x, cropDragStart.rect.w + dx));
 }

 if (cropAspectLock !== 'free') {
 const lockedAspect = parseAspectFromRatio(cropAspectLock);
 if (lockedAspect > 0) {
 if (next.w / next.h > lockedAspect) {
 next.w = next.h * lockedAspect;
 } else {
 next.h = next.w / lockedAspect;
 }
 next.w = Math.min(next.w, 1 - next.x);
 next.h = Math.min(next.h, 1 - next.y);
 }
 }
 }

 setCropRect(next);
 setFocalX((next.x + next.w / 2) * 100);
 setFocalY((next.y + next.h / 2) * 100);
 };

 const stopCropDrag = () => {
 setCropDragMode(null);
 setCropDragStart(null);
 setPanDragStart(null);
 };

 const beginPanDrag = (event: React.MouseEvent<HTMLDivElement>) => {
 if (!event.altKey) return;
 event.preventDefault();
 setPanDragStart({ x: event.clientX, y: event.clientY, panX, panY });
 };

 const applyPanDrag = (event: React.MouseEvent<HTMLDivElement>) => {
 if (!panDragStart) return;
 const dx = event.clientX - panDragStart.x;
 const dy = event.clientY - panDragStart.y;
 setPanX(panDragStart.panX + dx);
 setPanY(panDragStart.panY + dy);
 };

 const handleCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
 event.preventDefault();
 const delta = event.deltaY > 0 ? -0.05 : 0.05;
 setZoom((current) => Math.max(1, Math.min(4, Number((current + delta).toFixed(2)))));
 };

 const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
 applyPanDrag(event);
 applyCropDrag(event);
 };

 useEffect(() => {
 const onKey = (event: KeyboardEvent) => {
 if (!canvasActive) return;
 const step = event.shiftKey ? 0.02 : 0.005;

 if (event.key === '+' || event.key === '=') {
 event.preventDefault();
 setZoom((current) => Math.min(4, Number((current + 0.05).toFixed(2))));
 return;
 }
 if (event.key === '-' || event.key === '_') {
 event.preventDefault();
 setZoom((current) => Math.max(1, Number((current - 0.05).toFixed(2))));
 return;
 }
 if (event.key.toLowerCase() === 'r') {
 event.preventDefault();
 setRotationDeg((current) => current + (event.shiftKey ? -5 : 5));
 return;
 }
 if (event.key.toLowerCase() === '0') {
 event.preventDefault();
 setZoom(1);
 setRotationDeg(0);
 setPanX(0);
 setPanY(0);
 return;
 }
 if (cropMode === 'manual') {
 if (event.key === 'ArrowLeft') {
 event.preventDefault();
 setCropRect((current) => ({ ...current, x: Math.max(0, current.x - step) }));
 }
 if (event.key === 'ArrowRight') {
 event.preventDefault();
 setCropRect((current) => ({ ...current, x: Math.min(1 - current.w, current.x + step) }));
 }
 if (event.key === 'ArrowUp') {
 event.preventDefault();
 setCropRect((current) => ({ ...current, y: Math.max(0, current.y - step) }));
 }
 if (event.key === 'ArrowDown') {
 event.preventDefault();
 setCropRect((current) => ({ ...current, y: Math.min(1 - current.h, current.y + step) }));
 }
 }
 };

 window.addEventListener('keydown', onKey);
 return () => window.removeEventListener('keydown', onKey);
 }, [canvasActive, cropMode]);

 const uploadEditedCanvas = useCallback(async () => {
 const canvas = previewCanvasRef.current;
 if (!canvas) return;

 setImageUploadError(null);
 setImageUploading(true);
 try {
 const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92));
 if (!blob) {
 throw new Error('Failed to create edited image output');
 }

 const editedFile = new File([blob], `edited-${editorSourceName.replace(/\.[^/.]+$/, '') || 'image'}.webp`, {
 type: 'image/webp',
 });

 const shouldStoreCrops = generatePlacementCrops && cropMode !== 'none';
 const url = await handleImageUpload(editedFile, {
 generatePlacementCrops: shouldStoreCrops,
 placementCropRatios: selectedPlacementRatios,
 cropMode: cropMode === 'none' ? undefined : cropMode,
 cropFitMode: previewFitMode,
 focalX,
 focalY,
 backgroundTheme,
 repeatPattern,
 repeatDirection,
 });

 setFormData(prev => ({ ...prev, imageUrl: url }));
 setEditorSourceUrl(url);
 showToast('Edited image uploaded','success');
 } catch (error) {
 console.error('Edited canvas upload failed:', error);
 setImageUploadError(error instanceof Error ? error.message : 'Upload failed');
 } finally {
 setImageUploading(false);
 }
 }, [backgroundTheme, cropMode, editorSourceName, focalX, focalY, generatePlacementCrops, handleImageUpload, previewFitMode, repeatDirection, repeatPattern, selectedPlacementRatios]);

 const renderSingleCanvasPreview = () => {
 const source = editorSourceUrl || formData.imageUrl;
 if (!source) return null;

 const preset = CANVAS_PLACEMENTS[canvasPlacement];
 const previewBackgroundClass = backgroundTheme === 'dark'
 ? 'bg-[rgb(22,24,29)]'
 : backgroundTheme === 'light'
 ? 'bg-[rgb(245,245,245)]'
 : 'bg-[rgb(var(--muted))]/30';

 const cropStyle: React.CSSProperties = {
 left: `${cropRect.x * 100}%`,
 top: `${cropRect.y * 100}%`,
 width: `${cropRect.w * 100}%`,
 height: `${cropRect.h * 100}%`,
 };

 return (
 <div className="mt-4 space-y-3">
 <div className="flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
 <span>Canvas source: {preset.source} · {preset.width}×{preset.height} · default fit {preset.objectFit}</span>
 <span>Source ratio: {sourceAspectLabel} · Wheel=zoom · Alt+drag=pan</span>
 </div>
 <div
 ref={canvasRef}
 className={`relative overflow-hidden rounded-xl border border-[rgb(var(--border))]/50 ${previewBackgroundClass} select-none`}
 style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
 tabIndex={0}
 onFocus={() => setCanvasActive(true)}
 onBlur={() => setCanvasActive(false)}
 onWheel={handleCanvasWheel}
 onMouseDown={beginPanDrag}
 onMouseMove={handleCanvasMouseMove}
 onMouseUp={stopCropDrag}
 onMouseLeave={stopCropDrag}
 >
 <canvas ref={previewCanvasRef} className="h-full w-full" />
 {cropMode === 'manual' && (
 <>
 <div className="absolute inset-0 bg-black/20 pointer-events-none" />
 <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" style={cropStyle}>
 <div className="pointer-events-none absolute left-1/3 top-0 h-full w-px bg-white/60" />
 <div className="pointer-events-none absolute left-2/3 top-0 h-full w-px bg-white/60" />
 <div className="pointer-events-none absolute top-1/3 left-0 h-px w-full bg-white/60" />
 <div className="pointer-events-none absolute top-2/3 left-0 h-px w-full bg-white/60" />
 <div className="absolute inset-0 cursor-move" onMouseDown={(e) => beginCropDrag('move', e)} />
 <button type="button" className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('nw', e)} />
 <button type="button" className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('ne', e)} />
 <button type="button" className="absolute -left-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('sw', e)} />
 <button type="button" className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('se', e)} />
 <button type="button" className="absolute left-1/2 -top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('ne', e)} />
 <button type="button" className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('se', e)} />
 <button type="button" className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('sw', e)} />
 <button type="button" className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white" onMouseDown={(e) => beginCropDrag('se', e)} />
 </div>
 </>
 )}
 </div>
 </div>
 );
 };

 const addTag = () => {
 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
 setFormData(prev => ({
 ...prev,
 tags: [...prev.tags, tagInput.trim()]
 }));
 setTagInput('');
 }
 };

 const removeTag = (tagToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 tags: prev.tags.filter(tag => tag !== tagToRemove)
 }));
 };

 const addKeyword = () => {
 if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
 setFormData(prev => ({
 ...prev,
 seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
 }));
 setKeywordInput('');
 }
 };

 const removeKeyword = (keywordToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
 }));
 };

 const validateForm = (status:'draft' |'scheduled' |'published') => {
 if (!formData.title.trim()) {
 setError('Title is required');
 return false;
 }
 if (!formData.content.trim()) {
 setError('Content is required');
 return false;
 }
 if (status ==='published' || status ==='scheduled') {
 if (!formData.categoryId) {
 setError('Category is required for published articles');
 return false;
 }
 
 // Check if selected category is active
 const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
 if (selectedCategory && !selectedCategory.isActive) {
 setError('Cannot publish article with inactive category. Please select an active category.');
 return false;
 }
 
 if (!formData.summary.trim()) {
 setError('Summary is required for published articles');
 return false;
 }
 }
 if (status ==='scheduled' && !formData.publishDate) {
 setError('Publish date is required for scheduled articles');
 return false;
 }
 return true;
 };

 const handleSubmit = async (status:'draft' |'scheduled' |'published') => {
 if (!validateForm(status)) {
 return;
 }

 setSaving(true);
 setError('');

 try {
 const normalizedPublishDate = formData.publishDate
 ? new Date(formData.publishDate).toISOString()
 : undefined;
 const articleData = {
 title: formData.title,
 content: formData.content,
 summary: formData.summary,
 categoryId: formData.categoryId || undefined,
 subCategoryId: formData.subCategoryId || undefined,
 imageUrl: formData.imageUrl.trim() ? formData.imageUrl.trim() : null,
 tags: formData.tags,
 isPublished: status ==='published',
 publishedAt: status ==='published'
 ? (normalizedPublishDate || new Date().toISOString())
 : status ==='scheduled'
 ? normalizedPublishDate
 : undefined,
 isFeatured: formData.featured,
 isTrending: false,
 isBreaking: false
 };

 let response;
 if (isEditing && editingId) {
 response = await articleAPI.updateArticle(editingId, articleData);
 } else {
 response = await articleAPI.createArticle(articleData);
 }

 if (response.success) {
 const actionText = isEditing ?'updated' : 
 (status ==='draft' ?'saved as draft' : 
 status ==='scheduled' ?'scheduled' :'published');
 
 // For drafts, show success message but stay on page for continued editing
 if (status ==='draft') {
 // If this was a new article, update URL to edit mode with the new article ID
 if (!isEditing && response.article?.id) {
 const newUrl = `/content/new?id=${response.article.id}`;
 window.history.replaceState({},'', newUrl);
 // Clear localStorage draft since it's now saved to database
 localStorage.removeItem('newArticleDraft');
 // Show toast notification for new draft
 showToast('Draft saved successfully! You can continue editing.','success');
 } else if (isEditing) {
 // Show toast notification for updated draft
 showToast('Draft updated successfully!','success');
 } else {
 // Fallback message
 showToast('Draft saved successfully!','success');
 }
 
 // Show success notification without redirecting
 setAutoSaveStatus('saved');
 } else {
 // For published/scheduled articles, show alert and redirect
 // Redirect to articles list or show success message
 showToast(`Article ${actionText} successfully!`,'success');
 router.push('/content');
 }
 
 // Reset form only for published/scheduled articles (not drafts)
 if (!isEditing && status !=='draft') {
 setFormData({
 title:'',
 content:'',
 summary:'',
 categoryId:'',
 tags: [],
 status:'draft',
 featured: false,
 publishDate:'',
 seoTitle:'',
 seoDescription:'',
 seoKeywords: [],
 imageUrl:'',
 contentType:'article',
 authorType:'staff',
 author:'',
 shortContent:''
 });
 }
 } else {
 setError('Failed to save article');
 }
 } catch (error) {
 console.error('Error saving article:', error);
 const errorMessage = error instanceof Error ? error.message :'Failed to save article. Please try again.';
 setError(errorMessage);
 showToast(errorMessage,'error');
 } finally {
 setSaving(false);
 }
 };

 // Form renderer (shared between Edit & Split modes)
 const renderArticleForm = () => (
 <div className="space-y-8">
 {/* Article Title */}
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Article Title *
 </label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => handleInputChange('title', e.target.value)}
 placeholder="Enter a compelling article title..."
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 </div>

 {/* Category / Publish Date / Featured */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Category *
 </label>
 <select
 value={formData.categoryId}
 onChange={(e) => handleInputChange('categoryId', e.target.value)}
 disabled={categoriesLoading}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
 >
 <option value="">Select category...</option>
 {categories.map(cat => (
 <option key={cat.id} value={cat.id}>
 {cat.name} {!cat.isActive &&'(Inactive)'}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Subcategory
 </label>
 <select
 value={formData.subCategoryId ||''}
 onChange={(e) => handleInputChange('subCategoryId', e.target.value || undefined)}
 disabled={categoriesLoading || !formData.categoryId}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
 >
 <option value="">Select subcategory...</option>
 {formData.categoryId && categories
 .find(cat => cat.id === formData.categoryId)
 ?.subCategories?.map(subCat => (
 <option key={subCat.id} value={subCat.id}>
 {subCat.name}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Publish Date & Time
 </label>
 <input
 type="datetime-local"
 value={formData.publishDate}
 onChange={(e) => handleInputChange('publishDate', e.target.value)}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div className="flex items-end">
 <label className="flex items-center space-x-3 cursor-pointer">
 <input
 type="checkbox"
 checked={formData.featured}
 onChange={(e) => handleInputChange('featured', e.target.checked)}
 className="w-5 h-5 text-[rgb(var(--primary))] border-2 border-[rgb(var(--border))]/50 rounded focus:ring-[rgb(var(--primary))]"
 />
 <span className="text-sm font-semibold text-[rgb(var(--foreground))]">
 Featured Article
 </span>
 </label>
 </div>
 </div>

 {/* Content Type / Author Type */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Content Type *
 </label>
 <select
 value={formData.contentType}
 onChange={(e) => handleInputChange('contentType', e.target.value as ArticleForm['contentType'])}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
 >
 <option value="news">News (Breaking/Quick Updates)</option>
 <option value="article">Article (In-depth Content)</option>
 <option value="opinion">Opinion (Editorial/Commentary)</option>
 <option value="analysis">Analysis (Deep Dive/Investigation)</option>
 <option value="review">Review (Product/Service/Event)</option>
 <option value="interview">Interview (Q&A/Profile)</option>
 </select>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
 {formData.contentType ==='news' ?'Quick news items with short summaries' : 
 formData.contentType ==='article' ?'Long-form editorial content' :
 formData.contentType ==='opinion' ?'Opinion pieces and commentary' :
 formData.contentType ==='analysis' ?'In-depth analysis and investigation' :
 formData.contentType ==='review' ?'Reviews of products, services, or events' :'Interview format content'}
 </p>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Author Type *
 </label>
 <select
 value={formData.authorType}
 onChange={(e) => handleInputChange('authorType', e.target.value as ArticleForm['authorType'])}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
 >
 <option value="staff">Staff Writer</option>
 <option value="wire">Wire Service (AP, Reuters)</option>
 <option value="contributor">Contributor/Freelance</option>
 <option value="ai">AI Generated</option>
 <option value="syndicated">Syndicated Content</option>
 </select>
 </div>
 </div>

 {/* Author Name (conditional on authorType) */}
 {(formData.authorType ==='wire' || formData.authorType ==='contributor' || formData.authorType ==='syndicated') && (
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Author/Source Name
 </label>
 <input
 type="text"
 value={formData.author ||''}
 onChange={(e) => handleInputChange('author', e.target.value)}
 placeholder={
 formData.authorType ==='wire' ?'e.g., Associated Press, Reuters' :
 formData.authorType ==='contributor' ?'e.g., John Doe' :'e.g., The New York Times'
 }
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 </div>
 )}

 {/* Short Content (for news type) */}
 {formData.contentType ==='news' && (
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Short Content (60-100 words) *
 </label>
 <textarea
 value={formData.shortContent ||''}
 onChange={(e) => handleInputChange('shortContent', e.target.value)}
 placeholder="Brief news content (60-100 words)..."
 rows={4}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] resize-none"
 />
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
 Word count: {(formData.shortContent ||'').split(/\s+/).filter(w => w).length} words
 </p>
 </div>
 )}

 {/* Summary */}
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Summary *
 </label>
 <textarea
 value={formData.summary}
 onChange={(e) => handleInputChange('summary', e.target.value)}
 placeholder="Brief summary of the article (50-300 characters)..."
 rows={3}
 maxLength={300}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] resize-none"
 />
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{formData.summary.length}/300 characters</p>
 </div>

 {/* Tags */}
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Tags
 </label>
 <div className="flex items-center space-x-2 mb-3">
 <input
 type="text"
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 onKeyPress={(e) => e.key ==='Enter' && (e.preventDefault(), addTag())}
 placeholder="Add a tag..."
 className="flex-1 px-4 py-2 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 <button
 onClick={addTag}
 type="button"
 className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-colors duration-300"
 >
 Add
 </button>
 </div>
 <div className="flex flex-wrap gap-2">
 {formData.tags.map((tag, index) => (
 <span
 key={index}
 className="inline-flex items-center space-x-1 px-3 py-1 bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] rounded-full text-sm"
 >
 <span>{tag}</span>
 <button
 type="button"
 onClick={() => removeTag(tag)}
 className="text-blue-500 hover:text-[rgb(var(--primary))]"
 >
 ×
 </button>
 </span>
 ))}
 </div>
 </div>

 {/* SEO Settings */}
 <div className="space-y-6 border-t border-[rgb(var(--border))]/50 pt-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">SEO Settings</h3>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 SEO Title
 </label>
 <input
 type="text"
 value={formData.seoTitle}
 onChange={(e) => handleInputChange('seoTitle', e.target.value)}
 placeholder="SEO-optimized title (leave blank to use article title)"
 maxLength={60}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{formData.seoTitle.length}/60 characters</p>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 SEO Description
 </label>
 <textarea
 value={formData.seoDescription}
 onChange={(e) => handleInputChange('seoDescription', e.target.value)}
 placeholder="Brief description for SEO (150-160 characters)..."
 rows={2}
 maxLength={160}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] resize-none"
 />
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{formData.seoDescription.length}/160 characters</p>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 SEO Keywords
 </label>
 <div className="flex items-center space-x-2 mb-3">
 <input
 type="text"
 value={keywordInput}
 onChange={(e) => setKeywordInput(e.target.value)}
 onKeyPress={(e) => e.key ==='Enter' && (e.preventDefault(), addKeyword())}
 placeholder="Add SEO keyword..."
 className="flex-1 px-4 py-2 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 <button
 type="button"
 onClick={addKeyword}
 className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-colors duration-300"
 >
 Add
 </button>
 </div>
 <div className="flex flex-wrap gap-2">
 {formData.seoKeywords.map((keyword, index) => (
 <span
 key={index}
 className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
 >
 <span>{keyword}</span>
 <button
 type="button"
 onClick={() => removeKeyword(keyword)}
 className="text-purple-500 hover:text-purple-700"
 >
 ×
 </button>
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Featured Image */}
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Featured Image
 </label>
 <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
 <input
 type="url"
 value={formData.imageUrl}
 onChange={(e) => {
 handleInputChange('imageUrl', e.target.value);
 setEditorSourceUrl(e.target.value);
 setEditorSourceName('remote-image');
 }}
 placeholder="https://example.com/image.jpg"
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 <label className="inline-flex items-center justify-center px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))]/10 cursor-pointer">
 <input
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) {
 startEditingLocalFile(file);
 }
 }}
 />
 {imageUploading ? 'Uploading…' : 'Choose file'}
 </label>
 </div>
 {imageUploadError && (
 <p className="text-xs text-red-500 mt-1">{imageUploadError}</p>
 )}
 <div className="mt-2 flex items-center gap-2">
 <button
 type="button"
 onClick={openProEditorInNewTab}
 className="h-8 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 px-3 text-xs text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20"
 >
 Open Pro Image Editor (New Tab)
 </button>
 <span className="text-xs text-[rgb(var(--muted-foreground))]">Full editing controls are in dedicated tab for better space and UX.</span>
 </div>
 <details className="mt-3 rounded-lg border border-[rgb(var(--border))]/40 p-3">
 <summary className="cursor-pointer text-xs font-medium text-[rgb(var(--muted-foreground))]">Show inline legacy controls</summary>
 <div className="mt-3 space-y-3">
 <div className="flex flex-wrap items-center gap-2">
 {Object.entries(CANVAS_PLACEMENTS).map(([key, preset]) => (
 <button
 key={key}
 type="button"
 onClick={() => setCanvasPlacement(key as CanvasPlacement)}
 className={`h-8 rounded-md border px-2 text-xs transition-colors ${canvasPlacement === key ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]' : 'border-[rgb(var(--border))]/60 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))]/10'}`}
 >
 {preset.label}
 </button>
 ))}
 </div>

 <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
 <label className="inline-flex items-center gap-2 text-xs text-[rgb(var(--foreground))]">
 <input
 type="checkbox"
 checked={generatePlacementCrops}
 onChange={(e) => setGeneratePlacementCrops(e.target.checked)}
 className="h-4 w-4 rounded border-[rgb(var(--border))]/60"
 />
 Generate placement crops
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Crop mode
 <select value={cropMode} onChange={(e) => setCropMode(e.target.value as CropMode)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))]">
 <option value="none">No crop</option>
 <option value="auto">Auto-crop</option>
 <option value="manual">Manual focal</option>
 </select>
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Fit simulation
 <select value={previewFitMode} onChange={(e) => setPreviewFitMode(e.target.value as PreviewFitMode)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))]">
 <option value="cover">cover (site default)</option>
 <option value="contain">contain</option>
 <option value="fill">fill</option>
 </select>
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Background
 <select value={backgroundTheme} onChange={(e) => setBackgroundTheme(e.target.value as ThemeBackgroundMode)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))]">
 <option value="auto">Auto</option>
 <option value="light">Light</option>
 <option value="dark">Dark</option>
 </select>
 </label>
 </div>

 <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
 <SliderWithNumber label="Zoom" value={zoom} min={1} max={4} step={0.01} suffix="x" onChange={setZoom} />
 <SliderWithNumber label="Rotate" value={rotationDeg} min={-180} max={180} step={1} suffix="°" onChange={setRotationDeg} />
 <SliderWithNumber label="Brightness" value={brightness} min={40} max={200} step={1} suffix="%" onChange={setBrightness} />
 <SliderWithNumber label="Contrast" value={contrast} min={40} max={200} step={1} suffix="%" onChange={setContrast} />
 <SliderWithNumber label="Saturation" value={saturation} min={0} max={220} step={1} suffix="%" onChange={setSaturation} />
 <SliderWithNumber label="Blur" value={blurPx} min={0} max={15} step={0.1} suffix="px" onChange={setBlurPx} />
 <SliderWithNumber label="Hue" value={hueRotate} min={-180} max={180} step={1} suffix="°" onChange={setHueRotate} />
 <SliderWithNumber label="Grayscale" value={grayscale} min={0} max={100} step={1} suffix="%" onChange={setGrayscale} />
 <SliderWithNumber label="Sepia" value={sepia} min={0} max={100} step={1} suffix="%" onChange={setSepia} />
 <SliderWithNumber label="Vignette" value={vignette} min={0} max={100} step={1} suffix="%" onChange={setVignette} />
 <SliderWithNumber label="Pan X" value={panX} min={-600} max={600} step={1} suffix="px" onChange={setPanX} />
 <SliderWithNumber label="Pan Y" value={panY} min={-600} max={600} step={1} suffix="px" onChange={setPanY} />
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <button type="button" onClick={() => setFlipX((prev) => !prev)} className="h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs">Flip X</button>
 <button type="button" onClick={() => setFlipY((prev) => !prev)} className="h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs">Flip Y</button>
 <button type="button" onClick={() => { setZoom(1); setRotationDeg(0); setPanX(0); setPanY(0); setBrightness(100); setContrast(100); setSaturation(100); setBlurPx(0); setHueRotate(0); setGrayscale(0); setSepia(0); setVignette(0); }} className="h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs">Reset transforms</button>
 </div>

 <div className="grid gap-2 sm:grid-cols-3">
 <label className="inline-flex items-center gap-2 text-xs text-[rgb(var(--foreground))]">
 <input type="checkbox" checked={repeatPattern} onChange={(e) => setRepeatPattern(e.target.checked)} className="h-3.5 w-3.5" />
 Repeat pattern
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Repeat direction
 <select value={repeatDirection} onChange={(e) => setRepeatDirection(e.target.value as RepeatDirection)} disabled={!repeatPattern} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))] disabled:opacity-50">
 <option value="both">Both (X + Y)</option>
 <option value="x">Horizontal only</option>
 <option value="y">Vertical only</option>
 </select>
 </label>
 <div className="flex items-end gap-2">
 <button type="button" onClick={applyAutoSuggestion} className="h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))]/10">Auto suggest</button>
 <button type="button" onClick={uploadEditedCanvas} disabled={!editorReady || imageUploading} className="h-8 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 px-2 text-xs text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20 disabled:opacity-50">Apply & Upload</button>
 </div>
 </div>

 {cropMode === 'manual' && (
 <div className="space-y-2 rounded-md border border-[rgb(var(--border))]/40 p-2">
 <div className="grid gap-2 sm:grid-cols-3">
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Focus X: {Math.round(focalX)}%
 <input type="range" min={0} max={100} value={focalX} onChange={(e) => setFocalX(Number(e.target.value))} className="mt-1 w-full" />
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Focus Y: {Math.round(focalY)}%
 <input type="range" min={0} max={100} value={focalY} onChange={(e) => setFocalY(Number(e.target.value))} className="mt-1 w-full" />
 </label>
 <label className="text-xs text-[rgb(var(--muted-foreground))]">
 Crop aspect lock
 <select value={cropAspectLock} onChange={(e) => setCropAspectLock(e.target.value as 'free' | PlacementRatio)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs text-[rgb(var(--foreground))]">
 <option value="free">Free</option>
 {PLACEMENT_RATIO_OPTIONS.map((option) => (
 <option key={option.ratio} value={option.ratio}>{option.label}</option>
 ))}
 </select>
 </label>
 </div>
 <div className="grid gap-2 sm:grid-cols-4">
 <SliderWithNumber label="Crop X" value={cropRect.x * 100} min={0} max={100} step={0.1} suffix="%" onChange={(value) => setCropRect((current) => ({ ...current, x: Math.max(0, Math.min(1 - current.w, value / 100)) }))} />
 <SliderWithNumber label="Crop Y" value={cropRect.y * 100} min={0} max={100} step={0.1} suffix="%" onChange={(value) => setCropRect((current) => ({ ...current, y: Math.max(0, Math.min(1 - current.h, value / 100)) }))} />
 <SliderWithNumber label="Crop W" value={cropRect.w * 100} min={8} max={100} step={0.1} suffix="%" onChange={(value) => setCropRect((current) => ({ ...current, w: Math.max(0.08, Math.min(1 - current.x, value / 100)) }))} />
 <SliderWithNumber label="Crop H" value={cropRect.h * 100} min={8} max={100} step={0.1} suffix="%" onChange={(value) => setCropRect((current) => ({ ...current, h: Math.max(0.08, Math.min(1 - current.y, value / 100)) }))} />
 </div>
 </div>
 )}

 <div className="flex flex-wrap gap-2">
 {PLACEMENT_RATIO_OPTIONS.map((option) => (
 <label key={option.ratio} className="inline-flex items-center gap-1 rounded-md border border-[rgb(var(--border))]/50 px-2 py-1 text-xs text-[rgb(var(--foreground))]">
 <input
 type="checkbox"
 checked={selectedPlacementRatios.includes(option.ratio)}
 onChange={(e) => togglePlacementRatio(option.ratio, e.target.checked)}
 disabled={!generatePlacementCrops || cropMode === 'none'}
 className="h-3.5 w-3.5"
 />
 {option.label}
 </label>
 ))}
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Suggested ratios: {suggestedRatios.join(', ')} · Keyboard: +/- zoom, R rotate, arrows move crop (Shift = faster), 0 reset view.</p>
 {renderSingleCanvasPreview()}
 </div>
 </details>
 </div>

 {/* Content Editor */}
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Article Content *
 </label>
 <AdvancedNewsEditor
 value={formData.content}
 onChange={handleEditorChange}
 onImageUpload={handleImageUpload}
 showWordTarget={true}
 wordTarget={800}
 autoSave={true}
 />
 <div className="flex items-center justify-between mt-2 text-xs text-[rgb(var(--muted-foreground))]">
 <span>HTML length: {formData.content.length}</span>
 <span>Words: {plainTextCount}</span>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
 {error}
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-[rgb(var(--border))]/50">
 <div className="flex items-center space-x-3">
 <button
 type="button"
 onClick={() => handleSubmit('draft')}
 disabled={saving}
 className="px-6 py-3 bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] rounded-xl hover:bg-[rgb(var(--card))] transition-colors duration-300 font-medium disabled:opacity-50"
 >
 {saving ?'Saving...' :'Save as Draft'}
 </button>
 <button
 type="button"
 onClick={() => handleSubmit('scheduled')}
 disabled={!formData.publishDate || saving}
 className="px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ?'Scheduling...' :'Schedule'}
 </button>
 </div>
 <button
 onClick={() => handleSubmit('published')}
 disabled={!formData.title || !formData.content || !formData.categoryId || saving}
 className="px-8 py-3 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ?'Processing...' : (isEditing ?'Update & Publish' :'Publish Article')}
 </button>
 </div>
 </div>
 );

 const renderPreview = (tall: boolean) => (
 <div className={`space-y-4 ${tall ?'' :''}`}>
 <div className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center">
 <span className="mr-2">👁️</span>
 Live Preview
 {previewUpdating && (
 <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full animate-pulse">
 Updating...
 </span>
 )}
 </div>
 <div 
 className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 shadow-sm ${tall ?'h-[80vh] overflow-y-auto scroll-smooth' :''}`}
 >
 <ArticlePreview
 title={formData.title}
 summary={formData.summary}
 content={debouncedContent}
 author="Admin"
 category={categories.find(cat => cat.id === formData.categoryId)?.name ||''}
 tags={formData.tags}
 imageUrl={formData.imageUrl}
 publishDate={formData.publishDate}
 seoTitle={formData.seoTitle}
 seoDescription={formData.seoDescription}
 />
 </div>
 </div>
 );

 return (
 <div className="p-6 max-w-6xl mx-auto">

 <div className="bg-[rgb(var(--card))] rounded-xl shadow-sm p-8 border border-[rgb(var(--border))]/50 text-[rgb(var(--foreground))] transition-colors">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
 {isEditing ?'Edit Article' :'Create New Article'}
 </h1>
 <p className="text-[rgb(var(--muted-foreground))] mt-2">
 {isEditing ?'Update your article content and settings' :'Write and publish engaging content for your audience'}
 </p>
 {loading && (
 <div className="flex items-center mt-2 text-[rgb(var(--primary))]">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
 Loading article...
 </div>
 )}
 {/* Auto-save Status */}
 {!isEditing && (
 <div className="flex items-center mt-2 text-sm">
 {autoSaveStatus ==='saving' && (
 <>
 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
 <span className="text-[rgb(var(--primary))]">Saving draft...</span>
 </>
 )}
 {autoSaveStatus ==='saved' && (
 <>
 <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
 <span className="text-green-600">Draft saved</span>
 </>
 )}
 {autoSaveStatus ==='unsaved' && (
 <>
 <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
 <span className="text-orange-600">Unsaved changes</span>
 </>
 )}
 </div>
 )}
 </div>
 <div className="flex items-center space-x-3">
 {/* View Mode Toggle */}
 <div className="flex items-center bg-[rgb(var(--muted))]/10 rounded-xl p-1 transition-colors">
 <button
 onClick={() => setViewMode('edit')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 viewMode ==='edit'
 ?'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
 }`}
 >
 Edit
 </button>
 <button
 onClick={() => setViewMode('split')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 viewMode ==='split'
 ?'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
 }`}
 title="Split view - content editor and live preview side-by-side with debounced updates"
 >
 Split
 </button>
 <button
 onClick={() => setViewMode('preview')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 viewMode ==='preview'
 ?'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
 }`}
 >
 Preview
 </button>
 </div>
 </div>
 </div>

 {/* Content Area */}
 <div className="space-y-8">
 {viewMode ==='split' && (
 <div className="space-y-8">
 {/* Metadata Section at Top */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-[rgb(var(--muted))]/10 rounded-xl transition-colors">
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Category *
 </label>
 <select
 value={formData.categoryId}
 onChange={(e) => handleInputChange('categoryId', e.target.value)}
 disabled={categoriesLoading}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 >
 <option value="">Select category...</option>
 {categories.map(cat => (
 <option key={cat.id} value={cat.id}>
 {cat.name} {!cat.isActive &&'(Inactive)'}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Summary *
 </label>
 <textarea
 value={formData.summary}
 onChange={(e) => handleInputChange('summary', e.target.value)}
 placeholder="Brief summary of the article..."
 rows={3}
 maxLength={300}
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] resize-none"
 />
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{formData.summary.length}/300 characters</p>
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Featured Image
 </label>
 <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
 <input
 type="url"
 value={formData.imageUrl}
 onChange={(e) => {
 handleInputChange('imageUrl', e.target.value);
 setEditorSourceUrl(e.target.value);
 setEditorSourceName('remote-image');
 }}
 placeholder="https://example.com/image.jpg"
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 <label className="inline-flex items-center justify-center px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))]/10 cursor-pointer">
 <input
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) {
 startEditingLocalFile(file);
 }
 }}
 />
 {imageUploading ? 'Uploading…' : 'Choose file'}
 </label>
 </div>
 {imageUploadError && <p className="mt-1 text-xs text-red-500">{imageUploadError}</p>}
 <div className="mt-2">
 <button
 type="button"
 onClick={openProEditorInNewTab}
 className="h-8 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 px-3 text-xs text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20"
 >
 Open Pro Image Editor (New Tab)
 </button>
 </div>
 <div className="mt-2 rounded-md border border-[rgb(var(--border))]/40 p-2 space-y-2">
 <div className="flex flex-wrap items-center gap-2">
 <select value={cropMode} onChange={(e) => setCropMode(e.target.value as CropMode)} className="h-8 rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
 <option value="none">No crop</option>
 <option value="auto">Auto-crop</option>
 <option value="manual">Manual crop</option>
 </select>
 <select value={canvasPlacement} onChange={(e) => setCanvasPlacement(e.target.value as CanvasPlacement)} className="h-8 rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
 <option value="featured">Featured</option>
 <option value="card">Card</option>
 <option value="list">List</option>
 <option value="thumb">Thumb</option>
 <option value="newsThumb">News thumb</option>
 <option value="hero">Hero</option>
 <option value="banner">Banner</option>
 <option value="story">Story</option>
 <option value="portraitCard">Portrait card</option>
 </select>
 <button type="button" onClick={applyAutoSuggestion} className="h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs hover:bg-[rgb(var(--border))]/10">Auto suggest</button>
 <button type="button" onClick={uploadEditedCanvas} disabled={!editorReady || imageUploading} className="h-8 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 px-2 text-xs text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20 disabled:opacity-50">Apply & Upload</button>
 </div>
 <div className="grid gap-2 sm:grid-cols-2">
 <label className="inline-flex items-center gap-2 text-xs text-[rgb(var(--foreground))]">
 <input type="checkbox" checked={repeatPattern} onChange={(e) => setRepeatPattern(e.target.checked)} className="h-3.5 w-3.5" />
 Repeat pattern
 </label>
 <select value={repeatDirection} onChange={(e) => setRepeatDirection(e.target.value as RepeatDirection)} disabled={!repeatPattern} className="h-8 rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs disabled:opacity-50">
 <option value="both">Both</option>
 <option value="x">Horizontal</option>
 <option value="y">Vertical</option>
 </select>
 </div>
 {formData.imageUrl && <div>{renderSingleCanvasPreview()}</div>}
 </div>
 <div className="mt-3">
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Publish Date
 </label>
 <input
 type="datetime-local"
 value={formData.publishDate}
 onChange={(e) => handleInputChange('publishDate', e.target.value)}
 className="w-full px-4 py-2 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 </div>
 </div>
 <div className="flex flex-col justify-start space-y-4">
 <label className="flex items-center space-x-3 cursor-pointer">
 <input
 type="checkbox"
 checked={formData.featured}
 onChange={(e) => handleInputChange('featured', e.target.checked)}
 className="w-5 h-5 text-[rgb(var(--primary))] border-2 border-[rgb(var(--border))]/50 rounded focus:ring-[rgb(var(--primary))]"
 />
 <span className="text-sm font-semibold text-[rgb(var(--foreground))]">
 Featured Article
 </span>
 </label>
 <div className="text-xs text-[rgb(var(--muted-foreground))] bg-[rgb(var(--card))] p-3 rounded-lg">
 <strong>Shortcuts:</strong><br/>
 Ctrl+S (Save)<br/>
 Ctrl+Enter (Publish)<br/>
 Ctrl+Shift+S (Split)
 </div>
 </div>
 </div>

 {/* Title Section - Side by Side */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Article Title *
 </label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => handleInputChange('title', e.target.value)}
 placeholder="Enter a compelling article title..."
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Title Preview
 </label>
 <div className="p-4 bg-[rgb(var(--muted))]/10 rounded-xl border border-[rgb(var(--border))]/50 min-h-[3.25rem] flex items-center transition-colors">
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
 {formData.title ||'Your title will appear here...'}
 </h1>
 </div>
 </div>
 </div>

 {/* Content Section - Side by Side */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="space-y-3">
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Article Content *
 </label>
 <div className="border border-[rgb(var(--border))]/30 rounded-xl overflow-hidden">
 <AdvancedNewsEditor
 value={formData.content}
 onChange={handleEditorChange}
 onImageUpload={handleImageUpload}
 showWordTarget={true}
 wordTarget={800}
 autoSave={true}
 />
 </div>
 <div className="flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))] px-2">
 <span>HTML: {formData.content.length} chars</span>
 <span>Words: {plainTextCount}</span>
 </div>
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between mb-2">
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))]">
 Live Preview
 </label>
 <div className="flex items-center gap-2">
 {previewUpdating && (
 <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full animate-pulse">
 Syncing...
 </span>
 )}
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 Real-time
 </span>
 </div>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 min-h-[320px] max-h-[600px] overflow-y-auto shadow-sm transition-colors">
 <div className="prose dark:prose-invert prose-lg max-w-none
 prose-headings:text-[rgb(var(--foreground))] prose-headings:font-bold prose-headings:leading-tight
 prose-h1:text-4xl prose-h1:mt-10 prose-h1:mb-6
 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
 prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-h4:font-semibold
 prose-h5:text-base prose-h5:mt-4 prose-h5:mb-2 prose-h5:font-semibold
 prose-h6:text-sm prose-h6:mt-3 prose-h6:mb-1 prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide
 prose-p:text-[rgb(var(--foreground))] prose-p:leading-relaxed prose-p:text-lg prose-p:mb-4
 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
 prose-li:text-[rgb(var(--foreground))] prose-li:text-lg prose-li:mb-1 prose-li:leading-relaxed
 prose-a:text-[rgb(var(--primary))] prose-a:underline hover:prose-a:no-underline
 prose-blockquote:border-l-4 prose-blockquote:border-[rgb(var(--primary))] prose-blockquote:bg-[rgb(var(--primary))]/5
 prose-blockquote:text-[rgb(var(--primary))] prose-blockquote:not-italic prose-blockquote:pl-6 prose-blockquote:py-4
 prose-strong:text-[rgb(var(--foreground))] prose-strong:font-bold
 prose-em:text-[rgb(var(--foreground))] prose-em:italic
 prose-code:text-[rgb(var(--foreground))] prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
 prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
 prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-sm prose-img:my-6
 prose-hr:border-[rgb(var(--border))] prose-hr:my-8
 prose-table:border-collapse prose-table:border prose-table:border-[rgb(var(--border))] prose-table:my-6
 prose-th:border prose-th:border-[rgb(var(--border))] prose-th:bg-muted prose-th:p-3 prose-th:text-[rgb(var(--foreground))] prose-th:font-semibold
 prose-td:border prose-td:border-[rgb(var(--border))] prose-td:p-3 prose-td:text-[rgb(var(--foreground))]
 selection:bg-[rgb(var(--primary))]/10
 text-[rgb(var(--foreground))]">
 {debouncedContent ? (
 <div 
 className="article-preview-content text-[rgb(var(--foreground))] leading-relaxed"
 dangerouslySetInnerHTML={{ __html: debouncedContent }}
 />
 ) : (
 <div className="text-[rgb(var(--muted-foreground))] italic text-center py-12">
 Content preview will appear here as you write...
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-[rgb(var(--border))]/50">
 <div className="flex items-center space-x-3">
 <button
 type="button"
 onClick={() => handleSubmit('draft')}
 disabled={saving}
 className="px-6 py-3 bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] rounded-xl hover:bg-[rgb(var(--card))] transition-colors duration-300 font-medium disabled:opacity-50"
 >
 {saving ?'Saving...' :'Save as Draft'}
 </button>
 <button
 type="button"
 onClick={() => handleSubmit('scheduled')}
 disabled={!formData.publishDate || saving}
 className="px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ?'Scheduling...' :'Schedule'}
 </button>
 </div>
 <button
 onClick={() => handleSubmit('published')}
 disabled={!formData.title || !formData.content || !formData.categoryId || saving}
 className="px-8 py-3 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ?'Processing...' : (isEditing ?'Update & Publish' :'Publish Article')}
 </button>
 </div>
 </div>
 )}
 
 {viewMode ==='edit' && renderArticleForm()}
 
 {viewMode ==='preview' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-[rgb(var(--foreground))] flex items-center">
 <span className="mr-2">👁️</span> Full Article Preview
 </h2>
 <button
 onClick={() => setViewMode('edit')}
 className="px-4 py-2 rounded-lg bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card))] transition-colors text-sm"
 >
 ← Back to Edit
 </button>
 </div>
 {renderPreview(false)}
 </div>
 )}
 </div>
 </div>
 </div>
);
};

export default NewArticle;



