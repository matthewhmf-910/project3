# Handoff Spec: 夏野豆行 (Xiaoye Coffee) — Product Reel & Landing Page Pipeline

**Project Name:** 夏野豆行 — The Lemon Finds Its Way (Pale Brown Cold Brew Coffee)
**Target Platform:** Web (Desktop & Mobile 9:16)
**Tech Stack:** HTML5 / CSS3 (3D Transforms & Variable Layering) / GSAP / JavaScript
**Primary Goal:** Transform static high-res product assets into an interactive 2.5D / 3D Exploded View showcasing craft coffee aesthetics.

---

## 1. Asset Structure & File Mapping

Make sure the following raw 4K transparent PNGs and JPEG files are placed in the root directory:

| Filename | Layer Type | Description |
| :--- | :--- | :--- |
| `11_BACKGROUND_IVORY.png` | Background Layer | Tactile cream paper texture (`#F4EFE6`)[span_0](start_span)[span_0](end_span) |
| `07_SHAPE_SAGE.png` | Geometric Layer | Sage green vector block (`#7A8666`)[span_1](start_span)[span_1](end_span) |
| `08_SHAPE_TERRACOTTA.png` | Geometric Layer | Warm terracotta graphic shape (`#A3481E`)[span_2](start_span)[span_2](end_span) |
| `03_WOOD_COASTER.png` | Component (Base) | Handcrafted wooden coaster[span_3](start_span)[span_3](end_span) |
| `02_SPOON.png` | Component (Mid) | Metallic coffee spoon[span_4](start_span)[span_4](end_span) |
| `01_CUP_LEMON.png` | Component (Hero) | Cold brew glass with foam layer and dried lemon slice[span_5](start_span)[span_5](end_span) |
| `04_TYPE_COOLEST.png` | Typography Layer | Charcoal display title (`#2C2318`)[span_6](start_span)[span_6](end_span) |
| `05_TYPE_COFFEE.png` | Typography Layer | Terracotta secondary title (`#A3481E`)[span_7](start_span)[span_7](end_span) |
| `06_STAMP.png` | Identity Badge | "夏野豆行 · DAILY RITUAL" circular brand stamp[span_8](start_span)[span_8](end_span) |
| `1000355615.png` | Storefront Image | Real-world timber shopfront authority frame[span_9](start_span)[span_9](end_span)[span_10](start_span)[span_10](end_span) |

---

## 2. Brand Identity & Design Tokens

```css
:root {
  --color-charcoal: #2C2318;
  --color-terracotta: #A3481E;
  --color-sage: #7A8666;
  --color-ivory: #F4EFE6;
  --color-white: #FFFFFF;
  
  --font-serif: "Playfair Display", "Noto Serif TC", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  --contrast-ratio: 24.5:1; /* High legibility compliance */
}