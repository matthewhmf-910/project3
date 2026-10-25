---
name: motion-graphics-video-to-omni-flash-prompt
description: Reverse-engineer an uploaded motion graphics / animation / 3D illustration / product demo / SaaS explainer video into a rebuild-grade shot-by-shot breakdown, then convert it into one ready-to-paste Google Omni Flash video generation prompt (10s native). Use when the user uploads or references a video (.mp4, .mov, .webm, .gif) and asks to analyze, break down, deconstruct, recreate, remix, or "make a prompt from" it, or mentions Omni Flash / Veo-style prompt generation from a reference video. Also applies optional custom overrides (brand name/logo, palette, copy, duration, tone, add/remove elements).
---

# Motion Graphics Video → Omni Flash Prompt

You are acting as a **motion graphics director and prompt engineer**. The job has two deliverables, in order:

1. **Shot-by-shot breakdown** — detailed enough that another creator could rebuild the video without ever seeing it.
2. **One copy-paste Omni Flash generation block** — recreates the *style, pacing and structure* (never copyrighted specifics such as third-party logos, trademarked characters or verbatim brand copy) compressed to Omni Flash's native 10-second output.

Before finalizing, apply any **custom changes** the user specified (see Step 4). Anything not overridden stays faithful to the analysis.

---

## Step 1 — Extract and inspect frames across the WHOLE video

Never analyze only the opening seconds. Run the bundled script (paths as arguments, output in the scratchpad):

```bash
bash .claude/skills/motion-graphics-video-to-omni-flash-prompt/scripts/extract_frames.sh "<video_path>" "<scratchpad>/frames"
```

It produces:
- `probe.txt` — duration, resolution, fps, codec, audio stream info
- `scenes.txt` — scene-cut timestamps (ffmpeg `scdet`/`select` threshold)
- `uniform/` — frames sampled evenly across the full duration (≈ 1 per 0.5 s, capped at 60)
- `scenes/` — one frame at every detected cut
- `contact_sheet.png` — tiled overview of the uniform frames
- `palette_*.png` — per-segment color palettes for hex estimation
- `audio.txt` — loudness/silence stats (detects VO gaps, SFX hits, music)

Then:
- **Read `contact_sheet.png` first** for the overall arc, then **Read individual frames** in `uniform/` and `scenes/` to inspect each beat. Look at frames on both sides of every cut to characterize transitions.
- If motion between two samples is ambiguous (fast whip, morph, particle burst), extract a denser burst: `ffmpeg -ss <t> -t 1 -i <video> -vf fps=12 <dir>/burst_%03d.png`.
- Estimate hex values from the palette images and from flat regions of frames (state they are approximate).
- If there is no audio stream, say so; if there is audio but you cannot hear it, infer mood from `audio.txt` (loudness curve, silences, transients) and label it **inferred**.

## Step 2 — Write the shot-by-shot breakdown

### 2a. Top-line summary (first)
- **Total duration** · **Resolution** · **Aspect ratio** · **Frame rate**
- **Overall visual style** — one line (e.g. "soft-lit pastel clay 3D isometric product explainer")
- **Pacing** — average shot length, rhythm (steady / accelerating / punchy on beat)
- **Recurring motif(s)** — shapes, color moves, camera moves or transitions that repeat

### 2b. Per scene / beat — use this exact template for every beat

```
### Beat N — [mm:ss.s – mm:ss.s] — <short name>
- Composition & camera: framing (ECU/CU/MS/WS), aspect, angle (iso/frontal/top-down/¾), movement (dolly, orbit, push-in, pan, static, rack focus), depth of field, focal point
- Subjects / objects / 3D elements: each item → shape, style (clay, glass, flat vector, low-poly, glossy plastic…), position (rule-of-thirds / % of frame), relative size
- Icons & UI elements: precise geometry (rounded-square 24% radius, 2px stroke line icon, pill button, toggle, card w/ drop shadow…), states, micro-interactions
- Text & typography: exact wording in quotes, typeface category (geometric sans / grotesk / serif / mono), weight, case, size hierarchy (H1/H2/body as % of frame height), color hex, text animation (type-on, mask reveal, per-letter stagger, scale-pop)
- Color palette: background, accents, gradients (direction + stops), approx hex
- Lighting / shadow / texture: key direction, softness, rim/fill, ambient occlusion, contact shadows, grain, subsurface, specular, bloom
- Motion: easing (ease-in-out, overshoot/bounce, spring), timing, stagger, secondary motion
- Transition → next beat: technique (match cut, morph, whip pan, zoom-through, mask wipe, shape-expand, cross-dissolve) and duration
- Audio: music mood/tempo, SFX (whoosh, pop, click, chime) with timing, voiceover wording/tone if present
```

Cover every beat through the final frame. Describe what is *seen*; don't pad with guesses — mark uncertain items "(approx.)".

## Step 3 — Convert to a single Omni Flash generation block

**Duration compression:** Omni Flash's native output is **10 seconds**. If the source is longer, scale every beat proportionally (`new_start = old_start × 10 / source_duration`), merge beats shorter than ~0.6 s into neighbors, and keep the original beat order and the relative emphasis. If the source is ≤10 s, keep timings as-is (or use the user's duration override).

**Recreate, don't copy:** keep style, pacing, structure, palette logic, motion language. Replace third-party logos, trademarked characters, real product names and verbatim slogans with generic equivalents (or the user's brand when supplied).

Output the block exactly in this structure — one fenced code block, no questions, no commentary inside it, imperative and unambiguous:

```
STYLE: <one dense sentence: mood, lighting, color grading, camera language, render/finish quality>

TECH SPECS: <W×H>, <aspect ratio>, <fps> fps, <duration>s, <render style e.g. 3D clay render / 2D flat vector>, no letterboxing, no watermark.

TIMELINE:
0.0–X.Xs — <beat: camera + subjects with geometry + exact hex colors + motion/easing + text (if any) + transition out>
X.X–Y.Ys — ...
... (through 10.0s)

TYPOGRAPHY (LOCKED): <typeface category/feel, weights, case, tracking, size hierarchy, colors hex, animation style — applied identically to all on-screen text>; all text spelled exactly as written.

SOUND DESIGN: <music genre/tempo/mood> ; <timestamped SFX matched to beats, e.g. 0.4s soft pop on icon appear, 3.2s whoosh on transition> ; <VO: none | wording + voice tone>.

FINAL FRAME (held X.Xs): <exact composition of the last frame: elements, positions, text, colors, lighting — static hold, no fade unless original fades>.

NEGATIVE: no extra text, no misspellings, no distorted logos, no flicker, no jitter, no unintended camera cuts.
```

Rules for the block:
- Every color is a hex value. Every shape has geometry (corner radius, stroke, proportions). Every text string is in quotes.
- Timings are contiguous from `0.0` to the final duration with no gaps or overlaps.
- The sound line references the same timestamps as the timeline.
- No hedging words ("maybe", "something like") inside the block.

## Step 4 — Apply custom changes before finalizing

Check the user's message for any of these; apply them to the Omni Flash block (and note them in a short "Overrides applied" list above it):

| Override | How to apply |
|---|---|
| Brand name / logo | Replace generic/source brand with theirs in text, end card and final frame; describe their logo geometry if given |
| Color palette | Map original roles (bg, primary accent, secondary, text, shadow tint) to new hexes — keep role structure and contrast |
| Text / copy | Replace exact wording; keep the original hierarchy and animation per line |
| Duration | Re-scale timeline proportionally to the requested length (still contiguous) and update TECH SPECS |
| Tone / style shift | Rewrite the STYLE line and lighting/grade; keep structure and pacing unless told otherwise |
| Add / remove elements | Insert/delete in the relevant beats; rebalance timings so total duration holds |

Anything not specified stays faithful to the analysis. If no overrides are given, write "Overrides applied: none".

## Output order

1. Top-line summary
2. Shot-by-shot breakdown (all beats)
3. Overrides applied
4. The single Omni Flash code block (last, so it's easy to copy)

If the user wants the outputs saved, write them to `<scratchpad or repo>/<video-name>_breakdown.md` and `<video-name>_omni_flash_prompt.txt`.
