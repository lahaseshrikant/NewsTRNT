# Image Editor - Quick Reference

## Launch & Basic Flow
```
Article Form
    ↓
[Open Pro Image Editor] button
    ↓
    |--- Load image (click "Open Image")
    |--- Edit with tabs (Layout, Crop, Effects, etc.)
    |--- View status: Canvas size + viewport zoom %
    |--- Use keyboard shortcuts for quick edits
    ↓
[Apply & Upload] button
    ↓
Image syncs back to article form automatically
```

---

## Tab Navigation
```
┌─────────────────────────────────────────────────────┐
│ 📐 Layout │ ✂️ Crop │ 🎨 Effects │ 📝 Overlay │  ...  │
└─────────────────────────────────────────────────────┘
     ▼
  [Controls & Sliders]
```

---

## Main Canvas Area (60% width on desktop)
```
┌────────────────────────────────────────┐
│                                        │
│   Canvas Preview (scaled via viewport) │
│                                        │
│   [Crop handles if in crop mode]       │
│                                        │
│   Status: 800×400px | Zoom: 100%       │
│   Space+Drag to pan | Space+Scroll zoom │
└────────────────────────────────────────┘
```

---

## Control Panel (40% width on desktop)
```
Left Side: Canvas

Right Side (Fixed):
┌─────────────────────────────────┐
│ [Layout] [Crop] [Effect] ...     │  ← Tabs
├─────────────────────────────────┤
│                                 │
│ [Slider Controls Area]          │
│                                 │
│  Brightness: ■════════ [100]    │
│  Contrast: ■════════ [100]      │
│  ...                            │
│                                 │
│ [Buttons]                       │
│ [Apply & Upload] [Download]     │
│                                 │
└─────────────────────────────────┘
```

---

## Keyboard Cheat Sheet
```
╔════════════════════════════════════════════════════════╗
║           IMAGE EDITOR KEYBOARD SHORTCUTS              ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  📍 NAVIGATION                                         ║
║     Space + Drag      Pan canvas (grab cursor)        ║
║     Space + Scroll    Zoom image IN/OUT              ║
║                                                        ║
║  📊 EDITING                                            ║
║     Ctrl+Z            Undo last action                ║
║     Ctrl+Y            Redo last action                ║
║     R / Shift+R       Rotate ±5 degrees              ║
║     0                 Reset all transforms             ║
║                                                        ║
║  👁️  VIEW                                              ║
║     F                 Toggle rule of thirds            ║
║     C                 Toggle comparison mode           ║
║     Ctrl++            Zoom viewport in (50-200%)       ║
║     Ctrl+-            Zoom viewport out                ║
║     H                 Show keyboard help               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## Common Workflows

### 📷 Crop to Instagram Story (9:16)
1. Crop tab → Aspect: "9:16"
2. Drag corners to frame subject
3. Export tab → Upload

### 🌅 Brighten Underexposed Photo
1. Effects tab → Brightness: +20 to +40
2. Contrast: +10 to +20 (prevent flat look)
3. Effects tab → Shadows: +15 (lift dark areas)

### 📰 Professional Article Image
1. Layout → Crop mode OFF
2. Effects → Saturation: -10 (slightly desaturate)
3. Overlay → Add watermark or text
4. Tools → Save as "Article" preset
5. Export & Upload

### ♻️ Batch Same Style
1. Load saved preset (Tools tab)
2. Layout → Just adjust crop for each image
3. Export & Upload (repeat)

---

## Slider Ranges at a Glance
```
Effects:
├─ Brightness:    40% ──────── 100% ──────── 200%
├─ Contrast:      40% ──────── 100% ──────── 200%
├─ Saturation:    0% ──────── 100% ──────── 220% (super saturated)
├─ Blur:          0px ──────── 7.5px ──────── 15px
├─ Hue:          -180° ──────── 0° ──────── +180°
├─ Grayscale:     0% ──────── 50% ──────── 100% (full B&W)
├─ Sepia:         0% ──────── 50% ──────── 100%
└─ Vignette:      0% (none) ──────── 50% ──────── 100% (dark edges)

ADVANCED:
├─ Temperature:  -50 (cool) ──── 0 ──── +50 (warm)
├─ Tint:         -50 (magenta) ──── 0 ──── +50 (green)
├─ Shadows:      -50 ──────── 0 ──────── +50
├─ Midtones:     -50 ──────── 0 ──────── +50
└─ Highlights:   -50 ──────── 0 ──────── +50

CROP:
├─ X Position:    0% to 100%
├─ Y Position:    0% to 100%
├─ Width:         6% to 100%
└─ Height:        6% to 100%
```

---

## File Size Reference (Expected Output)
```
Format   Quality   File Size      Best For
─────────────────────────────────────────────
WebP     85%       ~45-60 KB      Web (recommended)
JPEG     90%       ~50-75 KB      Universal
PNG      N/A       ~150-300 KB    Transparency needed
```

---

## Status Bar Info
```
Left side:  Canvas: 800×400px | Viewport Zoom: 100%
Center:     [Shortcut hints]
Right:      [Undo/Redo indicators]
```

---

## Icon Legend
```
📐 Layout    = Canvas size, positioning, flipping
✂️ Crop       = Cutting, aspect ratios, framing
🎨 Effects   = Filters, colors, tone
📝 Overlay   = Text, watermarks
⚙️ Advanced  = Color grading, presets
🛠️ Tools     = History, presets, guides, zoom
📤 Export    = Format, quality, upload/download
```

---

## Tips & Tricks
1. **Hold Space to Pan**: Click on canvas, hold space, drag to move around
2. **Undo Everything**: Press `0` to reset transforms, or click history step
3. **Compare**: Press `C` to see before/after
4. **Guides**: Press `F` for composition grid (rule of thirds)
5. **Quick Presets**: Advanced tab has B&W, Sepia, Vivid, Pop Color
6. **Save Your Style**: Tools tab → save custom preset
7. **Batch Editing**: Load same preset for consistent look across images
8. **Fine Tuning**: Viewport zoom to 150% for detail work
9. **Check Export**: Export tab shows final dimensions & format
10. **Mobile**: Works on tablet with touch (pinch to zoom)

---

## Troubleshooting
```
Q: Canvas too big/small?
A: Use Ctrl++ or Ctrl+- to zoom viewport (left side slider)

Q: Forgot keyboard shortcuts?
A: Press H for help panel, or see this cheat sheet

Q: Want to undo multiple steps?
A: Click the previous action in Tools → History list

Q: Don't have a watermark image?
A: Skip overlay tab, or upload a PNG with transparency

Q: How do I save my edits?
A: Click [Apply & Upload] to save to article
   OR [Download] to save locally

Q: Image not visible?
A: Check crop isn't covering it. Go to Crop tab → "Off"
```

---

Made with ❤️ for professional content creators
