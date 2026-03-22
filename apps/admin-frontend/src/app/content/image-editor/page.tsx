"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import adminAuth from '@/lib/auth/admin-auth';
import { showToast } from '@/lib/utils/toast';

type PlacementPreset = 'featured' | 'hero' | 'card' | 'list' | 'thumb' | 'newsThumb' | 'banner' | 'story' | 'portrait';
type FitMode = 'cover' | 'contain' | 'fill';
type RepeatDirection = 'both' | 'x' | 'y';
type ExportFormat = 'webp' | 'jpeg' | 'png';
type Tab = 'layout' | 'crop' | 'effects' | 'overlay' | 'export' | 'advanced' | 'tools';
type RatioPreset = 'free' | '1x1' | '4x3' | '3x2' | '16x9' | '2x1' | '9x16' | '4x5' | '3x4' | '21x9';

const EDITOR_RESULT_KEY = 'newstrnt-pro-image-editor-result';

const PRESETS: Record<PlacementPreset, { label: string; width: number; height: number; fit: FitMode }> = {
  featured: { label: 'Featured', width: 800, height: 400, fit: 'cover' },
  hero: { label: 'Hero', width: 1200, height: 675, fit: 'cover' },
  card: { label: 'Card', width: 400, height: 192, fit: 'cover' },
  list: { label: 'List', width: 160, height: 112, fit: 'cover' },
  thumb: { label: 'Compact Thumb', width: 128, height: 80, fit: 'cover' },
  newsThumb: { label: 'News Thumb', width: 96, height: 96, fit: 'cover' },
  banner: { label: 'Banner', width: 1440, height: 480, fit: 'cover' },
  story: { label: 'Story', width: 720, height: 1280, fit: 'cover' },
  portrait: { label: 'Portrait', width: 600, height: 800, fit: 'cover' },
};

const parseRatio = (ratio: RatioPreset): number | null => {
  if (ratio === 'free') return null;
  const [w, h] = ratio.split('x').map(Number);
  if (!w || !h) return null;
  return w / h;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

interface EditorState {
  zoom: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  panX: number;
  panY: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  grayscale: number;
  sepia: number;
  vignette: number;
  shadowsBlack: number;
  midtones: number;
  highlights: number;
  temperate: number;
  tint: number;
}

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

const ProImageEditorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialImage = searchParams.get('imageUrl') || '';

  const [tab, setTab] = useState<Tab>('layout');
  const [sourceUrl, setSourceUrl] = useState(initialImage);
  const [sourceImageSrc, setSourceImageSrc] = useState(initialImage);
  const [sourceName, setSourceName] = useState('image');
  const [ready, setReady] = useState(false);

  // Canvas setup
  const [preset, setPreset] = useState<PlacementPreset>('featured');
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [background, setBackground] = useState<'auto' | 'light' | 'dark'>('auto');
  const [repeatPattern, setRepeatPattern] = useState(false);
  const [repeatDirection, setRepeatDirection] = useState<RepeatDirection>('both');

  // Viewport zoom (display size) - separate from image zoom
  const [viewportZoom, setViewportZoom] = useState(1);

  // Image transforms
  const [zoom, setZoom] = useState(1);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Basic effects
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blurPx, setBlurPx] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [vignette, setVignette] = useState(0);

  // Advanced color controls
  const [temperate, setTemperate] = useState(0);
  const [tint, setTint] = useState(0);
  const [shadowsBlack, setShadowsBlack] = useState(0);
  const [midtones, setMidtones] = useState(0);
  const [highlights, setHighlights] = useState(0);

  // Crop
  const [ratioPreset, setRatioPreset] = useState<RatioPreset>('free');
  const [cropRect, setCropRect] = useState({ x: 0.08, y: 0.08, w: 0.84, h: 0.84 });
  const [cropMode, setCropMode] = useState<'manual' | 'off'>('manual');
  const [cropDragMode, setCropDragMode] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number; rect: { x: number; y: number; w: number; h: number } } | null>(null);
  const [panDragStart, setPanDragStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Text overlay
  const [textEnabled, setTextEnabled] = useState(false);
  const [textValue, setTextValue] = useState('NewsTRNT');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(44);
  const [textOpacity, setTextOpacity] = useState(90);
  const [textX, setTextX] = useState(6);
  const [textY, setTextY] = useState(92);
  const [textBg, setTextBg] = useState(false);
  const [textFontFamily, setTextFontFamily] = useState('Arial');
  const [textBold, setTextBold] = useState(true);
  const [textShadow, setTextShadow] = useState(false);

  // Watermark
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(65);
  const [watermarkScale, setWatermarkScale] = useState(18);
  const [watermarkX, setWatermarkX] = useState(96);
  const [watermarkY, setWatermarkY] = useState(94);

  // Export
  const [format, setFormat] = useState<ExportFormat>('webp');
  const [quality, setQuality] = useState(92);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showGuides, setShowGuides] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // History
  type HistoryEntry = { state: EditorState; label: string };
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Presets
  const [savedPresets, setSavedPresets] = useState<Map<string, EditorState>>(new Map());
  const [presetName, setPresetName] = useState('');

  // Refs
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const watermarkImageRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const watermarkObjectUrlRef = useRef<string | null>(null);

  const activePreset = useMemo(() => PRESETS[preset], [preset]);

  // State management
  const getCurrentState = useCallback((): EditorState => ({
    zoom, rotation: rotationDeg, flipX, flipY, panX, panY,
    brightness, contrast, saturation, blur: blurPx, hue: hueRotate,
    grayscale, sepia, vignette, shadowsBlack, midtones, highlights,
    temperate, tint,
  }), [zoom, rotationDeg, flipX, flipY, panX, panY, brightness, contrast, saturation, blurPx, hueRotate, grayscale, sepia, vignette, shadowsBlack, midtones, highlights, temperate, tint]);

  const restoreState = useCallback((state: EditorState) => {
    setZoom(state.zoom);
    setRotationDeg(state.rotation);
    setFlipX(state.flipX);
    setFlipY(state.flipY);
    setPanX(state.panX);
    setPanY(state.panY);
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setBlurPx(state.blur);
    setHueRotate(state.hue);
    setGrayscale(state.grayscale);
    setSepia(state.sepia);
    setVignette(state.vignette);
    setShadowsBlack(state.shadowsBlack);
    setMidtones(state.midtones);
    setHighlights(state.highlights);
    setTemperate(state.temperate);
    setTint(state.tint);
  }, []);

  const addToHistory = useCallback((label: string) => {
    const newState = getCurrentState();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ state: newState, label });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, getCurrentState]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      restoreState(history[newIndex].state);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, restoreState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      restoreState(history[newIndex].state);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, restoreState]);

  const resetAll = useCallback(() => {
    restoreState({
      zoom: 1, rotation: 0, flipX: false, flipY: false, panX: 0, panY: 0,
      brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0,
      grayscale: 0, sepia: 0, vignette: 0, shadowsBlack: 0,
      midtones: 0, highlights: 0, temperate: 0, tint: 0,
    });
    addToHistory('Reset all');
  }, [restoreState, addToHistory]);

  const savePreset = useCallback(() => {
    if (!presetName.trim()) {
      showToast('Enter a preset name', 'error');
      return;
    }
    const newPresets = new Map(savedPresets);
    newPresets.set(presetName, getCurrentState());
    setSavedPresets(newPresets);
    showToast(`Preset "${presetName}" saved`, 'success');
    setPresetName('');
  }, [presetName, savedPresets, getCurrentState]);

  const loadPreset = useCallback((name: string) => {
    const loadedPreset = savedPresets.get(name);
    if (loadedPreset) {
      restoreState(loadedPreset);
      addToHistory(`Loaded: ${name}`);
    }
  }, [savedPresets, restoreState, addToHistory]);

  // Image loading
  useEffect(() => {
    setFitMode(PRESETS[preset].fit);
  }, [preset]);

  useEffect(() => {
    const resolveRemoteImage = async () => {
      if (!sourceUrl) {
        setSourceImageSrc('');
        return;
      }

      const isAbsolute = /^https?:\/\//i.test(sourceUrl);
      const isSameOrigin = (() => {
        try {
          const parsed = new URL(sourceUrl);
          return parsed.origin === window.location.origin;
        } catch {
          return false;
        }
      })();

      if (!isAbsolute || isSameOrigin) {
        setSourceImageSrc(sourceUrl);
        return;
      }

      try {
        setReady(false);
        const proxyUrl = `/api/upload/proxy?url=${encodeURIComponent(sourceUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Proxy fetch failed ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();

        const objectUrl = URL.createObjectURL(blob);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objectUrl;
        setSourceImageSrc(objectUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load selected image in editor.';
        setSourceImageSrc('');
        setReady(false);
        setError(message);
      }
    };

    resolveRemoteImage();
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceImageSrc) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      sourceImageRef.current = image;
      setReady(true);
    };
    image.onerror = () => {
      setReady(false);
      setError('Could not load selected image in editor.');
    };
    image.src = sourceImageSrc;
  }, [sourceImageSrc]);

  useEffect(() => {
    if (!watermarkUrl) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      watermarkImageRef.current = image;
    };
    image.src = watermarkUrl;
  }, [watermarkUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (watermarkObjectUrlRef.current) URL.revokeObjectURL(watermarkObjectUrlRef.current);
    };
  }, []);

  // Crop dragging
  const beginCropDrag = (mode: Exclude<'move' | 'nw' | 'ne' | 'sw' | 'se' | null, null>, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const wrap = canvasWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setCropDragMode(mode);
    setCropDragStart({ x: px, y: py, rect: { ...cropRect } });
  };

  const applyCropDrag = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (cropMode !== 'manual' || !cropDragMode || !cropDragStart) return;
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const dx = px - cropDragStart.x;
    const dy = py - cropDragStart.y;

    const minSize = 0.06;
    const next = { ...cropDragStart.rect };

    if (cropDragMode === 'move') {
      next.x = clamp(cropDragStart.rect.x + dx, 0, 1 - next.w);
      next.y = clamp(cropDragStart.rect.y + dy, 0, 1 - next.h);
    } else {
      if (cropDragMode.includes('n')) {
        const newY = clamp(cropDragStart.rect.y + dy, 0, cropDragStart.rect.y + cropDragStart.rect.h - minSize);
        next.h = cropDragStart.rect.h + (cropDragStart.rect.y - newY);
        next.y = newY;
      }
      if (cropDragMode.includes('s')) {
        next.h = clamp(cropDragStart.rect.h + dy, minSize, 1 - cropDragStart.rect.y);
      }
      if (cropDragMode.includes('w')) {
        const newX = clamp(cropDragStart.rect.x + dx, 0, cropDragStart.rect.x + cropDragStart.rect.w - minSize);
        next.w = cropDragStart.rect.w + (cropDragStart.rect.x - newX);
        next.x = newX;
      }
      if (cropDragMode.includes('e')) {
        next.w = clamp(cropDragStart.rect.w + dx, minSize, 1 - cropDragStart.rect.x);
      }

      const lockedAspect = parseRatio(ratioPreset);
      if (lockedAspect) {
        if (next.w / next.h > lockedAspect) {
          next.w = next.h * lockedAspect;
        } else {
          next.h = next.w / lockedAspect;
        }
        next.w = Math.min(next.w, 1 - next.x);
        next.h = Math.min(next.h, 1 - next.y);
      }
    }

    setCropRect(next);
  }, [cropDragMode, cropDragStart, cropMode, ratioPreset]);

  const stopDrag = () => {
    setCropDragMode(null);
    setCropDragStart(null);
    setPanDragStart(null);
    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.cursor = 'default';
    }
  };

  const beginPanDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!spacePressed) return;
    event.preventDefault();
    setPanDragStart({ x: event.clientX, y: event.clientY, panX, panY });
    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.cursor = 'grabbing';
    }
  };

  const applyPanDrag = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!panDragStart) return;
    const dx = event.clientX - panDragStart.x;
    const dy = event.clientY - panDragStart.y;
    setPanX(panDragStart.panX + dx);
    setPanY(panDragStart.panY + dy);
  }, [panDragStart]);

  const handleWheel = (event: WheelEvent) => {
    if (!spacePressed) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.04 : 0.04;
    setZoom((current) => clamp(Number((current + delta).toFixed(2)), 1, 4));
  };

  useEffect(() => {
    const canvasWrap = canvasWrapRef.current;
    if (!canvasWrap) return;

    canvasWrap.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasWrap.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, spacePressed]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !spacePressed) {
        event.preventDefault();
        setSpacePressed(true);
        if (canvasWrapRef.current) {
          canvasWrapRef.current.style.cursor = 'grab';
        }
      }

      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        redo();
      }

      if ((event.key === 'r' || event.key === 'R') && event.target === document.body) {
        setRotationDeg((current) => current + (event.shiftKey ? -5 : 5));
        addToHistory(`Rotate ${event.shiftKey ? '-' : '+'}5°`);
      }

      if (event.key === '0' && event.target === document.body) {
        resetAll();
      }

      if ((event.key === 'h' || event.key === 'H') && event.target === document.body) {
        event.preventDefault();
        setHelpOpen((v) => !v);
      }

      if ((event.key === 'f' || event.key === 'F') && event.target === document.body) {
        event.preventDefault();
        setShowGuides((v) => !v);
      }

      if ((event.key === 'c' || event.key === 'C') && event.target === document.body) {
        event.preventDefault();
        setShowComparison((v) => !v);
      }

      if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        setViewportZoom((v) => clamp(v + 0.1, 0.5, 2));
      }
      if (event.ctrlKey && event.key === '-') {
        event.preventDefault();
        setViewportZoom((v) => clamp(v - 0.1, 0.5, 2));
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setSpacePressed(false);
        if (canvasWrapRef.current) {
          canvasWrapRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [undo, redo, resetAll, addToHistory, spacePressed]);

  // Canvas rendering
  const renderStyledImage = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const img = sourceImageRef.current;
    if (!img) return;

    const sx = clamp(Math.round(cropRect.x * img.naturalWidth), 0, img.naturalWidth - 1);
    const sy = clamp(Math.round(cropRect.y * img.naturalHeight), 0, img.naturalHeight - 1);
    const sw = clamp(Math.round(cropRect.w * img.naturalWidth), 1, img.naturalWidth - sx);
    const sh = clamp(Math.round(cropRect.h * img.naturalHeight), 1, img.naturalHeight - sy);

    const sourceAspect = sw / sh;
    const targetAspect = width / height;
    let drawW = width;
    let drawH = height;

    if (fitMode === 'contain') {
      if (sourceAspect > targetAspect) {
        drawH = drawW / sourceAspect;
      } else {
        drawW = drawH * sourceAspect;
      }
    } else if (fitMode === 'cover') {
      if (sourceAspect > targetAspect) {
        drawW = drawH * sourceAspect;
      } else {
        drawH = drawW / sourceAspect;
      }
    }

    ctx.save();

    const filterParts = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blurPx}px)`,
      `hue-rotate(${hueRotate}deg)`,
      `grayscale(${grayscale}%)`,
      `sepia(${sepia}%)`,
    ];

    ctx.filter = filterParts.join(' ');
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.scale((flipX ? -1 : 1) * zoom, (flipY ? -1 : 1) * zoom);
    ctx.drawImage(img, sx, sy, sw, sh, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
    ctx.restore();
  }, [blurPx, brightness, contrast, cropRect.h, cropRect.w, cropRect.x, cropRect.y, fitMode, flipX, flipY, grayscale, hueRotate, panX, panY, rotationDeg, saturation, sepia, zoom]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageRef.current) return;

    canvas.width = activePreset.width;
    canvas.height = activePreset.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = background === 'dark' ? 'rgb(22,24,29)' : background === 'light' ? 'rgb(245,245,245)' : 'rgb(120,120,120)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (repeatPattern) {
      const tile = document.createElement('canvas');
      tile.width = 280;
      tile.height = 280;
      const tctx = tile.getContext('2d');
      if (tctx) {
        tctx.fillStyle = bg;
        tctx.fillRect(0, 0, tile.width, tile.height);
        renderStyledImage(tctx, tile.width, tile.height);
        const repetition = repeatDirection === 'x' ? 'repeat-x' : repeatDirection === 'y' ? 'repeat-y' : 'repeat';
        const pattern = ctx.createPattern(tile, repetition);
        if (pattern) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    }

    renderStyledImage(ctx, canvas.width, canvas.height);

    // Text overlay
    if (textEnabled && textValue.trim()) {
      ctx.save();
      ctx.globalAlpha = clamp(textOpacity / 100, 0, 1);
      const size = clamp(textSize, 12, 200);
      const fontStyle = textBold ? 'bold' : 'normal';
      ctx.font = `${fontStyle} ${size}px ${textFontFamily}, Arial, sans-serif`;
      const px = (textX / 100) * canvas.width;
      const py = (textY / 100) * canvas.height;
      const metrics = ctx.measureText(textValue);

      if (textBg) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(px - 10, py - size, metrics.width + 20, size + 12);
      }

      if (textShadow) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(textValue, px + 2, py + 2);
      }

      ctx.fillStyle = textColor;
      ctx.fillText(textValue, px, py);
      ctx.restore();
    }

    // Watermark
    if (watermarkEnabled && watermarkImageRef.current) {
      const wm = watermarkImageRef.current;
      const maxW = (watermarkScale / 100) * canvas.width;
      const ratio = wm.naturalWidth / wm.naturalHeight;
      const wmW = maxW;
      const wmH = wmW / ratio;
      const px = (watermarkX / 100) * canvas.width - wmW;
      const py = (watermarkY / 100) * canvas.height - wmH;
      ctx.save();
      ctx.globalAlpha = clamp(watermarkOpacity / 100, 0, 1);
      ctx.drawImage(wm, px, py, wmW, wmH);
      ctx.restore();
    }

    // Vignette
    if (vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.2,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.7,
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.88, vignette / 100)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Grid guides
    if (showGuides) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 3) * i, 0);
        ctx.lineTo((canvas.width / 3) * i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 3) * i);
        ctx.lineTo(canvas.width, (canvas.height / 3) * i);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [activePreset.height, activePreset.width, background, renderStyledImage, repeatDirection, repeatPattern, textBg, textColor, textEnabled, textOpacity, textSize, textValue, textX, textY, vignette, watermarkEnabled, watermarkOpacity, watermarkScale, watermarkX, watermarkY, textFontFamily, textBold, textShadow, showGuides]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // File operations
  const openLocalImage = (file: File) => {
    setError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSourceUrl(objectUrl);
    setSourceName(file.name || 'image');
    setReady(false);
  };

  const openWatermark = (file: File) => {
    if (watermarkObjectUrlRef.current) URL.revokeObjectURL(watermarkObjectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    watermarkObjectUrlRef.current = objectUrl;
    setWatermarkUrl(objectUrl);
    setWatermarkEnabled(true);
  };

  const applyAndUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setUploading(true);
    setError(null);
    try {
      const mime = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
      const qualityValue = format === 'png' ? undefined : quality / 100;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, qualityValue));
      if (!blob) throw new Error('Unable to create export image from canvas.');

      const file = new File([blob], `edited-${sourceName.replace(/\.[^/.]+$/, '') || 'image'}.${format}`, { type: mime });
      const body = new FormData();
      body.append('image', file);

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        headers: {
          ...adminAuth.getAuthHeaders(),
        },
        body,
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      const payload = {
        url: result.url,
        timestamp: Date.now(),
      };

      localStorage.setItem(EDITOR_RESULT_KEY, JSON.stringify(payload));
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: EDITOR_RESULT_KEY, payload }, window.location.origin);
      }

      showToast('Edited image uploaded and sent back to article editor.', 'success');
      setSourceUrl(result.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const downloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const mime = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
      const qualityValue = format === 'png' ? undefined : quality / 100;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, qualityValue));
      if (!blob) throw new Error('Could not create image');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${sourceName.replace(/\.[^/.]+$/, '') || 'image'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Download failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))] p-3">
          <div>
            <h1 className="text-lg font-semibold">Pro Image Editor</h1>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Press <kbd className="rounded bg-[rgb(var(--border))]/40 px-1">Space</kbd> to pan, <kbd className="rounded bg-[rgb(var(--border))]/40 px-1">H</kbd> for help, <kbd className="rounded bg-[rgb(var(--border))]/40 px-1">Ctrl+Z</kbd> to undo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs hover:bg-[rgb(var(--border))]/10">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) openLocalImage(file);
                }}
              />
              Open Image
            </label>
            <button
              onClick={applyAndUpload}
              disabled={!ready || uploading}
              className="h-8 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 px-3 text-xs text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Apply & Upload'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

        {/* Main canvas grid */}
        <div className="grid gap-4 xl:grid-cols-[1fr_410px]">
          {/* Canvas area */}
          <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))] p-3">
            <div
              ref={canvasWrapRef}
              className="relative mx-auto rounded-lg border border-[rgb(var(--border))]/40 overflow-hidden bg-[rgb(var(--card))]"
              style={{
                aspectRatio: `${activePreset.width} / ${activePreset.height}`,
                maxWidth: '100%',
                height: 'auto',
                transform: `scale(${viewportZoom})`,
                transformOrigin: 'top center',
              }}
              onMouseDown={beginPanDrag}
              onMouseMove={(e) => {
                applyPanDrag(e);
                applyCropDrag(e);
              }}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              tabIndex={0}
            >
              <canvas ref={canvasRef} className="h-full w-full block" />

              {/* Crop overlay */}
              {cropMode === 'manual' && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/20" />
                  <div
                    className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                    style={{
                      left: `${cropRect.x * 100}%`,
                      top: `${cropRect.y * 100}%`,
                      width: `${cropRect.w * 100}%`,
                      height: `${cropRect.h * 100}%`,
                    }}
                  >
                    <div className="pointer-events-none absolute left-1/3 top-0 h-full w-px bg-white/60" />
                    <div className="pointer-events-none absolute left-2/3 top-0 h-full w-px bg-white/60" />
                    <div className="pointer-events-none absolute top-1/3 left-0 h-px w-full bg-white/60" />
                    <div className="pointer-events-none absolute top-2/3 left-0 h-px w-full bg-white/60" />
                    <div className="absolute inset-0 cursor-move" onMouseDown={(e) => beginCropDrag('move', e)} />
                    <button type="button" className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-white cursor-nwse-resize" onMouseDown={(e) => beginCropDrag('nw', e)} />
                    <button type="button" className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-white cursor-nesw-resize" onMouseDown={(e) => beginCropDrag('ne', e)} />
                    <button type="button" className="absolute -left-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white cursor-nesw-resize" onMouseDown={(e) => beginCropDrag('sw', e)} />
                    <button type="button" className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white cursor-nwse-resize" onMouseDown={(e) => beginCropDrag('se', e)} />
                  </div>
                </>
              )}
            </div>

            {/* Canvas info */}
            <div className="mt-3 text-[11px] text-[rgb(var(--muted-foreground))] space-y-1">
              <p><strong>Canvas:</strong> {activePreset.width}×{activePreset.height}px | <strong>Viewport Zoom:</strong> {(viewportZoom * 100).toFixed(0)}%</p>
              <p><strong>Shortcuts:</strong> <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Space</kbd>+Drag=Pan | <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Space</kbd>+Wheel=Zoom | <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">R</kbd>=Rotate | <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">0</kbd>=Reset</p>
            </div>
          </div>

          {/* Panel */}
          <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))] p-3 h-fit">
            {/* Tabs */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(['layout', 'crop', 'effects', 'overlay', 'advanced', 'tools', 'export'] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`h-7 rounded-md border px-2 text-xs capitalize font-medium ${
                    tab === item
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                      : 'border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--border))]/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Content scrollable */}
            <div className="max-h-[75vh] space-y-2.5 overflow-y-auto pr-1.5">
              {tab === 'layout' && (
                <>
                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Preset
                    <select value={preset} onChange={(e) => setPreset(e.target.value as PlacementPreset)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      {Object.entries(PRESETS).map(([key, value]) => (
                        <option key={key} value={key}>{value.label} ({value.width}×{value.height})</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Fit mode
                    <select value={fitMode} onChange={(e) => setFitMode(e.target.value as FitMode)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      <option value="cover">Cover (crop)</option>
                      <option value="contain">Contain (letterbox)</option>
                      <option value="fill">Fill (stretch)</option>
                    </select>
                  </label>

                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Background
                    <select value={background} onChange={(e) => setBackground(e.target.value as 'auto' | 'light' | 'dark')} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      <option value="auto">Auto (gray)</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="repeatCheck"
                        checked={repeatPattern}
                        onChange={(e) => setRepeatPattern(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="repeatCheck" className="text-xs cursor-pointer">Tile pattern</label>
                    </div>
                    {repeatPattern && (
                      <select value={repeatDirection} onChange={(e) => setRepeatDirection(e.target.value as RepeatDirection)} className="h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                        <option value="both">Both directions</option>
                        <option value="x">Horizontal only</option>
                        <option value="y">Vertical only</option>
                      </select>
                    )}
                  </div>

                  <SliderWithNumber label="Zoom" value={zoom} min={1} max={4} step={0.01} suffix="x" onChange={setZoom} />
                  <SliderWithNumber label="Rotate" value={rotationDeg} min={-180} max={180} step={1} suffix="°" onChange={setRotationDeg} />
                  <SliderWithNumber label="Pan X" value={panX} min={-600} max={600} step={1} suffix="px" onChange={setPanX} />
                  <SliderWithNumber label="Pan Y" value={panY} min={-600} max={600} step={1} suffix="px" onChange={setPanY} />

                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => { setFlipX((v) => !v); addToHistory('Flip horizontal'); }} className="flex-1 h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs hover:bg-[rgb(var(--border))]/10">Flip H</button>
                    <button type="button" onClick={() => { setFlipY((v) => !v); addToHistory('Flip vertical'); }} className="flex-1 h-8 rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs hover:bg-[rgb(var(--border))]/10">Flip V</button>
                  </div>

                  <button type="button" onClick={resetAll} className="w-full h-8 rounded-md border border-orange-500/40 bg-orange-500/10 text-xs text-orange-500 hover:bg-orange-500/20">Reset transforms</button>
                </>
              )}

              {tab === 'crop' && (
                <>
                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Mode
                    <select value={cropMode} onChange={(e) => setCropMode(e.target.value as 'manual' | 'off')} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      <option value="manual">Manual (drag corners)</option>
                      <option value="off">Disabled</option>
                    </select>
                  </label>

                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Aspect ratio lock
                    <select value={ratioPreset} onChange={(e) => setRatioPreset(e.target.value as RatioPreset)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      <option value="free">Free (any)</option>
                      <option value="1x1">Square (1:1)</option>
                      <option value="4x3">Standard (4:3)</option>
                      <option value="3x2">35mm (3:2)</option>
                      <option value="16x9">Widescreen (16:9)</option>
                      <option value="2x1">Cinema (2:1)</option>
                      <option value="9x16">Portrait (9:16)</option>
                      <option value="4x5">Portrait (4:5)</option>
                      <option value="3x4">Phone (3:4)</option>
                      <option value="21x9">Ultra-wide (21:9)</option>
                    </select>
                  </label>

                  <SliderWithNumber label="X" value={cropRect.x * 100} min={0} max={100} step={0.1} suffix="%" onChange={(v) => setCropRect((c) => ({ ...c, x: clamp(v / 100, 0, 1 - c.w) }))} />
                  <SliderWithNumber label="Y" value={cropRect.y * 100} min={0} max={100} step={0.1} suffix="%" onChange={(v) => setCropRect((c) => ({ ...c, y: clamp(v / 100, 0, 1 - c.h) }))} />
                  <SliderWithNumber label="Width" value={cropRect.w * 100} min={6} max={100} step={0.1} suffix="%" onChange={(v) => setCropRect((c) => ({ ...c, w: clamp(v / 100, 0.06, 1 - c.x) }))} />
                  <SliderWithNumber label="Height" value={cropRect.h * 100} min={6} max={100} step={0.1} suffix="%" onChange={(v) => setCropRect((c) => ({ ...c, h: clamp(v / 100, 0.06, 1 - c.y) }))} />
                </>
              )}

              {tab === 'effects' && (
                <>
                  <SliderWithNumber label="Brightness" value={brightness} min={40} max={200} step={1} suffix="%" onChange={setBrightness} />
                  <SliderWithNumber label="Contrast" value={contrast} min={40} max={200} step={1} suffix="%" onChange={setContrast} />
                  <SliderWithNumber label="Saturation" value={saturation} min={0} max={220} step={1} suffix="%" onChange={setSaturation} />
                  <SliderWithNumber label="Blur" value={blurPx} min={0} max={15} step={0.1} suffix="px" onChange={setBlurPx} />
                  <SliderWithNumber label="Hue shift" value={hueRotate} min={-180} max={180} step={1} suffix="°" onChange={setHueRotate} />
                  <SliderWithNumber label="Grayscale" value={grayscale} min={0} max={100} step={1} suffix="%" onChange={setGrayscale} />
                  <SliderWithNumber label="Sepia" value={sepia} min={0} max={100} step={1} suffix="%" onChange={setSepia} />
                  <SliderWithNumber label="Vignette" value={vignette} min={0} max={100} step={1} suffix="%" onChange={setVignette} />
                </>
              )}

              {tab === 'overlay' && (
                <>
                  {/* Text */}
                  <div className="rounded-md border border-[rgb(var(--border))]/40 p-2.5">
                    <label className="inline-flex items-center gap-2 text-xs font-medium mb-2">
                      <input
                        type="checkbox"
                        checked={textEnabled}
                        onChange={(e) => setTextEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Text overlay
                    </label>
                    {textEnabled && (
                      <div className="mt-2 space-y-2">
                        <input
                          value={textValue}
                          onChange={(e) => setTextValue(e.target.value)}
                          className="h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs"
                          placeholder="Your text here"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs">Color
                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="mt-1 h-8 w-full" />
                          </label>
                          <label className="text-xs">Font
                            <select value={textFontFamily} onChange={(e) => setTextFontFamily(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-1 text-xs">
                              <option value="Arial">Arial</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Courier New">Courier</option>
                              <option value="Verdana">Verdana</option>
                              <option value="Times New Roman">Times</option>
                            </select>
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs"><input type="checkbox" checked={textBold} onChange={(e) => setTextBold(e.target.checked)} className="w-3 h-3" /> Bold</label>
                          <label className="inline-flex items-center gap-1.5 text-xs"><input type="checkbox" checked={textShadow} onChange={(e) => setTextShadow(e.target.checked)} className="w-3 h-3" /> Shadow</label>
                          <label className="inline-flex items-center gap-1.5 text-xs"><input type="checkbox" checked={textBg} onChange={(e) => setTextBg(e.target.checked)} className="w-3 h-3" /> BG box</label>
                        </div>

                        <SliderWithNumber label="Size" value={textSize} min={12} max={200} step={1} suffix="px" onChange={setTextSize} />
                        <SliderWithNumber label="Opacity" value={textOpacity} min={0} max={100} step={1} suffix="%" onChange={setTextOpacity} />
                        <SliderWithNumber label="X" value={textX} min={0} max={100} step={1} suffix="%" onChange={setTextX} />
                        <SliderWithNumber label="Y" value={textY} min={0} max={100} step={1} suffix="%" onChange={setTextY} />
                      </div>
                    )}
                  </div>

                  {/* Watermark */}
                  <div className="rounded-md border border-[rgb(var(--border))]/40 p-2.5">
                    <label className="inline-flex items-center gap-2 text-xs font-medium mb-2">
                      <input
                        type="checkbox"
                        checked={watermarkEnabled}
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Watermark image
                    </label>
                    <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-[rgb(var(--border))]/60 px-2 text-xs hover:bg-[rgb(var(--border))]/10">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) openWatermark(file); }} />
                      Upload PNG
                    </label>
                    {watermarkEnabled && watermarkUrl && (
                      <div className="mt-2 space-y-2">
                        <SliderWithNumber label="Scale" value={watermarkScale} min={5} max={60} step={1} suffix="%" onChange={setWatermarkScale} />
                        <SliderWithNumber label="Opacity" value={watermarkOpacity} min={0} max={100} step={1} suffix="%" onChange={setWatermarkOpacity} />
                        <SliderWithNumber label="X" value={watermarkX} min={0} max={100} step={1} suffix="%" onChange={setWatermarkX} />
                        <SliderWithNumber label="Y" value={watermarkY} min={0} max={100} step={1} suffix="%" onChange={setWatermarkY} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'advanced' && (
                <>
                  <SliderWithNumber label="Temperate" value={temperate} min={-50} max={50} step={1} suffix="" onChange={setTemperate} />
                  <SliderWithNumber label="Tint" value={tint} min={-50} max={50} step={1} suffix="" onChange={setTint} />
                  <SliderWithNumber label="Shadows/Blacks" value={shadowsBlack} min={-50} max={50} step={1} suffix="" onChange={setShadowsBlack} />
                  <SliderWithNumber label="Midtones" value={midtones} min={-50} max={50} step={1} suffix="" onChange={setMidtones} />
                  <SliderWithNumber label="Highlights" value={highlights} min={-50} max={50} step={1} suffix="" onChange={setHighlights} />

                  <div className="border-t border-[rgb(var(--border))]/20 pt-2 mt-2">
                    <p className="text-xs font-medium mb-2">Preset adjustments</p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button type="button" onClick={() => { setGrayscale(100); addToHistory('B&W'); }} className="px-2 py-1.5 rounded border border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--border))]/10">B&W</button>
                      <button type="button" onClick={() => { setSepia(60); setSaturation(80); addToHistory('Sepia'); }} className="px-2 py-1.5 rounded border border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--border))]/10">Sepia</button>
                      <button type="button" onClick={() => { setContrast(120); setBrightness(95); addToHistory('Vivid'); }} className="px-2 py-1.5 rounded border border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--border))]/10">Vivid</button>
                      <button type="button" onClick={() => { setSaturation(140); setContrast(110); addToHistory('Pop'); }} className="px-2 py-1.5 rounded border border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--border))]/10">Pop color</button>
                    </div>
                  </div>
                </>
              )}

              {tab === 'tools' && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="guidesChk"
                        checked={showGuides}
                        onChange={(e) => setShowGuides(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="guidesChk" className="text-xs cursor-pointer">Rule of thirds</label>
                    </div>

                    <label className="text-xs">Viewport zoom
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="range"
                          min={0.5}
                          max={2}
                          step={0.1}
                          value={viewportZoom}
                          onChange={(e) => setViewportZoom(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs w-12 text-right">{(viewportZoom * 100).toFixed(0)}%</span>
                      </div>
                    </label>
                  </div>

                  {/* History */}
                  <div className="border-t border-[rgb(var(--border))]/20 pt-2 mt-2">
                    <p className="text-xs font-medium mb-2">History ({historyIndex + 1}/{history.length})</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="flex-1 h-7 rounded-md border border-[rgb(var(--border))]/60 text-xs hover:bg-[rgb(var(--border))]/10 disabled:opacity-40"
                      >
                        ↶ Undo
                      </button>
                      <button
                        type="button"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="flex-1 h-7 rounded-md border border-[rgb(var(--border))]/60 text-xs hover:bg-[rgb(var(--border))]/10 disabled:opacity-40"
                      >
                        ↷ Redo
                      </button>
                    </div>
                    {history.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto text-[10px] space-y-0.5">
                        {history.map((entry, idx) => (
                          <button
                            key={idx}
                            onClick={() => { restoreState(entry.state); setHistoryIndex(idx); }}
                            className={`w-full text-left px-1.5 py-0.5 rounded ${
                              idx === historyIndex
                                ? 'bg-[rgb(var(--primary))]/20 text-[rgb(var(--primary))]'
                                : 'hover:bg-[rgb(var(--border))]/10'
                            }`}
                          >
                            {entry.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Presets */}
                  <div className="border-t border-[rgb(var(--border))]/20 pt-2 mt-2">
                    <p className="text-xs font-medium mb-2">Save editing preset</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Name..."
                        className="flex-1 h-7 rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs"
                      />
                      <button
                        onClick={savePreset}
                        className="px-2 h-7 rounded-md border border-[rgb(var(--border))]/60 text-xs hover:bg-[rgb(var(--border))]/10"
                      >
                        Save
                      </button>
                    </div>
                    {savedPresets.size > 0 && (
                      <div className="mt-2 space-y-1">
                        {Array.from(savedPresets.keys()).map((name) => (
                          <button
                            key={name}
                            onClick={() => loadPreset(name)}
                            className="w-full text-left px-2 py-1.5 text-xs rounded border border-[rgb(var(--border))]/40 hover:bg-[rgb(var(--border))]/10 flex justify-between items-center"
                          >
                            {name}
                            <span className="text-[10px] opacity-60">Load</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'export' && (
                <>
                  <label className="text-xs text-[rgb(var(--muted-foreground))]">Format
                    <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)} className="mt-1 h-8 w-full rounded-md border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))] px-2 text-xs">
                      <option value="webp">WebP (best)</option>
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG (lossless)</option>
                    </select>
                  </label>

                  <SliderWithNumber label="Quality" value={quality} min={40} max={100} step={1} suffix="%" onChange={setQuality} />

                  <div className="text-xs text-[rgb(var(--muted-foreground))] bg-[rgb(var(--border))]/10 p-2 rounded">
                    <p><strong>Size:</strong> {activePreset.width} × {activePreset.height} px</p>
                    <p><strong>Format:</strong> {format.toUpperCase()}</p>
                  </div>

                  <button
                    onClick={applyAndUpload}
                    disabled={!ready || uploading}
                    className="w-full h-9 rounded-md border border-[rgb(var(--primary))]/60 bg-[rgb(var(--primary))]/10 text-sm text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/20 disabled:opacity-50 font-medium"
                  >
                    {uploading ? 'Uploading...' : '⬆ Apply & Upload'}
                  </button>

                  <button
                    onClick={downloadImage}
                    disabled={!ready}
                    className="w-full h-9 rounded-md border border-[rgb(var(--border))]/60 text-sm hover:bg-[rgb(var(--border))]/10 disabled:opacity-50"
                  >
                    ⬇ Download locally
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Help */}
        {helpOpen && (
          <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))] p-4 text-xs space-y-2 text-[rgb(var(--muted-foreground))]">
            <p><strong>Keyboard Shortcuts:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Space</kbd> + Drag: Pan canvas</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Space</kbd> + Scroll: Zoom image</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Ctrl+Z</kbd> / <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Ctrl+Y</kbd>: Undo/Redo</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">R</kbd>: Rotate 5° (Shift+R for -5°)</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">0</kbd>: Reset all transforms</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">F</kbd>: Toggle rule of thirds</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Ctrl++</kbd> / <kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">Ctrl+-</kbd>: Zoom viewport</li>
              <li><kbd className="bg-[rgb(var(--border))]/40 px-1 rounded">H</kbd>: Toggle this help</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProImageEditorPage;
