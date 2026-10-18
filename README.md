# 夏野豆行 · Coolest Coffee: exploded landing page

Interactive landing page built from `HANDOFF.md`, using raw HTML, CSS and JS with GSAP 3.13 + ScrollTrigger (vendored in `vendor/`, so it also works offline).

```
python3 -m http.server 8000   # then open http://localhost:8000
```

## What's on the page

| Section | Interaction |
| --- | --- |
| **Layers** (hero) | The poster is rebuilt from 10 transparent layers inside a `perspective: 1200px` viewport. Hovering tilts the camera and lifts the stack on Z. Scrolling pins the hero and runs *Poster lock → Separate → Orbit → Reassemble*, with a callout on each layer showing its file and Z depth. The **Separate layers** button does the same for touch, keyboard and reduced-motion users. Below 720px wide it switches to a 9:16 layout. |
| **The reel** | A 10 s, 9:16 GSAP timeline that follows the storyboard: 01 Roll, 02 Catch, 03 Feed, 04 Cut, 05 Fall, 06 Hero. It autoplays when it scrolls into view and has play/pause, a scrubber with beat ticks, and buttons to jump to each beat. The C/O/O/L letters are windows onto the single `04_TYPE_COOLEST.png`. |
| **The window** | The storefront photo (`1000355615.png`) starts as a greyscale "ghost plate" and fills in with colour from the pavement up as you scroll, on a tiltable 3D card. |

## Standalone file

`python3 tools/build_standalone.py` writes `dist/xiaoye-coffee-standalone.html` (~3.3 MB). It is one file with every asset, GSAP and the scripts inlined, so it opens by double-click with no server and works offline. Only the Google Fonts stylesheet is external; offline, the page falls back to system fonts.

## Structure

```
index.html
css/styles.css        brand tokens (HANDOFF section 2) + layout
js/stage.js           shared 3D stage: viewport > rig (camera) > canvas (scale3d fit) > layers
js/hero.js            layer config (Z depth / drift per layer), hover + scroll timeline
js/reel.js            the 10 s storyboard timeline + player UI
js/window.js          storefront reveal, footer stamp
assets/manifest.js    generated: where each layer sits on the 1536x1326 poster canvas
assets/*.png          layer set named per HANDOFF section 1
assets/_source/       approved artwork the layers were derived from
tools/build_assets.py reproducible asset pipeline
```

## About the assets

The 4K transparent PNGs listed in the handoff were not supplied, so `tools/build_assets.py` derives them from the approved poster and props sheet:

- **01 cup, 02 spoon, 03 coaster** are segmented from the poster (rembg ISNet + SAM point prompts). The clear glass rim is rebuilt as reflections only, and the part of the coaster hidden under the glass is filled in so the exploded view never shows a hole.
- **04 / 05 type** are colour-keyed from the poster and recoloured to the exact `--color-charcoal` / `--color-terracotta` tokens. The script also records each COOLEST letter's bounds for the reel.
- **06 stamp, 07 sage, 08 terracotta, 11 ivory paper** are generated. The stamp reads 夏野豆行 · DAILY RITUAL, as the handoff specifies.
- **12_LEMON.png** (extra) is the whole lemon from props panel A, used in the reel.

To use the real 4K exports, drop them over the files with the same names. Layers are placed by `assets/manifest.js`, so any file whose framing changes needs its `x/y/w/h` updated there. Re-running the script needs `pip install rembg opencv-python-headless pillow numpy scipy`; it downloads about 550 MB of models on first run.

## Accessibility

- Poster text ("Slow brew", the quote, "Daily ritual") is live HTML text, not baked into the images.
- Each scene has a text description.
- Reel controls are real buttons and a range input.
- `prefers-reduced-motion` disables pinning, tilt and autoplay; the reel then shows its final frame.
