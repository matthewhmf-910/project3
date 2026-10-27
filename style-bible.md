# Style Bible: ref-01 ("Drawing → Motion graphic" showcase reel)

Source: `public/refs/ref-01.mp4`, used for analysis only and kept out of git.
Specs: 720×1280 (9:16), 24 fps, 17.41 s, stereo AAC with a music bed.

How I measured it: 2 fps contact sheets, scene-change scoring on three regions (full frame,
inner panel, storyboard card), frames pulled around each detected change, spectral-flux
beat tracking on the audio, and pixel sampling for colour. Hex values are estimates from a
compressed H.264 source, so expect ±5 per channel.

---

## 0. Anatomy: a frame within a frame

The video is two layers. Most of its grammar comes from how they relate.

```
┌──────────────── 720 ────────────────┐
│  dark brown radial vignette (static)│
│                  ✳ Opus 5.5  ← header label, top-right of panel
│  Drawing   ┌───────────────┐        │
│ ┌───────┐  │               │        │
│ │sketch │  │  INNER PANEL  │ ~408×720 @ (273,171)
│ │ card  │  │ (the animated │        │
│ │~222×390  │   result)     │        │
│ └Motion_graphic┘           │        │
│            └───────────────┘        │
│    Comment "OPUS" for guide  ← CTA caption, centred under panel
└─────────────────────────────────────┘
```

- **Wrapper:** never moves. Background, header, "Drawing" label, caption and card frame
  are locked for all 17 s.
- **Storyboard card (left, overlapping the panel edge):** a rough black-line sketch of the
  *current* beat. It swaps 3 times. This is "the input".
- **Inner panel (right):** the finished animation. This is "the output".
- The idea it sells: **sketch → result, side by side, kept in sync.**

---

## 1. Pacing

| Metric | Value |
|---|---|
| Length | 17.4 s (418 frames) |
| Hard cuts in the full frame | **0**. The wrapper is one locked shot. |
| Inner panel | **1 continuous "oner"** with 1 lighting/environment transition at 11.42 s |
| Storyboard card states | 4 (swaps at ~4.58, ~8.42, ~11.25 s) |
| Story beats (actions) in panel | 8 |
| Average beat length | ~2.2 s (17.4 / 8) |
| Average storyboard-state length | ~4.35 s |
| Final hero hold | ~2.2 s (15.2 → 17.4) |

### Beat sheet (inner panel)

| t (s) | Beat | Card state |
|---|---|---|
| 0.0–1.0 | Mascot drops in large and close. The camera pulls back to show a grid-paper desk, then a blank sheet slides up from the bottom. | A: mascot ↓, quill, blank page |
| 1.0–4.5 | Mascot "writes" with a quill. Scribble lines appear one at a time (3 lines, ~1 s each). The character darts around with heavy motion blur. | A |
| 4.5–8.0 | The camera tilts up the page. The mascot perches on the top edge and casts a **light-cone beam** down onto the text. Under the beam, scribbles **morph into clean dash bars**, line by line (the "edit pass"). | B: page with lines + arrows |
| 8.0–8.6 | The mascot whips down off the page (smear frame). The page settles, now tidy. | C: folding sketch |
| 8.6–11.0 | The page **folds into an envelope**: the bottom half turns kraft, the side flaps tuck, the top flap swings shut. The mascot rides the flap. | C |
| 11.42 | **Light change:** a circular vignette closes in over ~3 frames, and the stage goes from bright grid paper to a dark olive spotlit table. | D: envelope + seal + emerge |
| 12.0–13.5 | A wax drop falls. The mascot presses down as the **stamp** and a seal forms. | D |
| 14.0–15.2 | The mascot pops *out* of the seal downward. The envelope exits up with motion blur, and the camera **pushes in** about 2.5× to a centred hero. | D |
| 15.2–17.4 | Hero hold: centred, spotlit, with a slight breathing scale. | D |

---

## 2. Music & beat grid

- **Tempo: ~131.5 BPM** (beat = 0.456 s, bar = 1.82 s). Strong autocorrelation; the
  next candidate is the half-time 66 BPM.
- **Downbeat phase:** first beat at **0.15 s**.
- Beat grid (s): 0.15, 0.61, 1.06, 1.52, 1.98, 2.43, 2.89, 3.34, 3.80, 4.26, 4.71, 5.17,
  5.63, 6.08, 6.54, 7.00, 7.45, 7.91, 8.36, 8.82, 9.28, 9.73, 10.19, 10.65, 11.10, 11.56,
  12.01, 12.47, 12.93, 13.38, 13.84, 14.30, 14.75, 15.21, 15.66, 16.12, 16.58, 17.03
- Loudness is flat (−13 to −18 dB RMS per half-second) with dips at ~5.5 s, ~11 s and
  ~14 s that act as breaths before section changes. The bed is light and bouncy, not
  bass-driven.
- **How the picture locks to the music:** structural events sit within about half a beat
  of the grid but are **not frame-snapped**:
  - Card swaps: 4.58 (beat 4.71), 8.42 (beat 8.36), 11.25 (beat 11.10)
  - Light change: 11.42–11.54, finishing on beat 11.56
  - Hero lands at ~15.2, on beat 15.21
  - Sections run roughly **2 bars (3.6 s) each**, so changes fall on bar lines.

---

## 3. Cut grammar

| Type | Used? | How |
|---|---|---|
| Hard cut | No | No hard cuts anywhere |
| Match cut | Yes, conceptually | The sketch card and the panel show the same composition at the same moment, so the match is *spatial* (side by side), not temporal |
| Morph / transform | **Yes, the main device** | Paper → envelope, scribbles → dash bars, wax blob → seal, seal → mascot. Each object *becomes* the next instead of being cut away from. |
| Environment change | Once | Iris-style vignette closing in over ~3 frames, switching the lighting world (light → dark) without cutting |
| Card swaps | 3 | Near-instant replacement (low scene score ~0.06–0.07, 1–2 frames), like turning a storyboard page |
| Camera moves as transitions | Yes | The tilt-up at 4.5 s and the push-in at 14.5 s change framing instead of cutting |

In short, **one continuous world, and transformation stands in for editing.**

---

## 4. Typography

All type is in the static wrapper. Nothing inside the animation is real text.

| Element | Style | Size @720w | Colour | Behaviour |
|---|---|---|---|---|
| Header "Opus 5.5" | Geometric/neo-grotesk sans, **Bold** (SF Pro / Inter-like) | ~22 px | `#FEFEFD` | Static. Preceded by a 12-spoke asterisk glyph in `#E6825E`. |
| Label "Drawing" | Same sans, Bold | ~20 px | `#FFFFFF` | Static, left-aligned above the card |
| Card tag "Motion_graphic" | Tiny sans in a black pill, bottom-left of card | ~8 px | white on black | Static |
| CTA caption | Same sans, **Regular** | ~22 px | `#E3DBD4` | Static. The keyword sits in curly quotes and is coloured `#C8976F` (muted copper). |

- **Entry and exit: none.** Type is present from frame 0 to the last frame. The motion lives
  entirely in the panel, so the labels read as a calm UI frame.
- **Pseudo-text:** handwriting is suggested with loopy scribble glyphs, then "cleaned" into
  rounded dash bars of varying length (3 rows, ragged right). That reads as "text"
  without saying anything.

---

## 5. Colour

### Wrapper (constant)
| Role | Hex |
|---|---|
| Outer vignette, darkest corners | `#0D0702` – `#180D07` |
| Outer mid field | `#352318` – `#3A261D` |
| Outer warm glow (centre/bottom) | `#3E2A1D` – `#432F24` |
| Header and label white | `#FEFEFD` |
| Caption off-white | `#E3DBD4` |
| Accent asterisk (coral) | `#E6825E` |
| Accent keyword (copper) | `#C8976F` |
| Card paper | `#FFFFFC` |

### Panel, Act 1 (light world, 0–11.4 s)
| Role | Hex |
|---|---|
| Grid desk | `#CAC4B6` with faint lighter grid lines |
| Paper sheet | `#FBF9F1` – `#EFEEE5` (warm cream) |
| Ink / mascot linework | `#080200` (near-black, warm) |
| Quill / crown accent | `#B3695F` (dusty terracotta), crown in pale gold-tan |
| Light-cone beam | translucent warm peach, ~`#E8B9A0` at ~40% |

### Panel, Act 2 (dark world, 11.4–17.4 s)
| Role | Hex |
|---|---|
| Stage edges | `#383428` – `#504839` (olive-umber) |
| Spotlit centre | `#80725A` – `#B3AC9F` |
| Envelope kraft | `#C7A17C` |
| Wax seal | `#9B544B` (darker), highlights toward `#C46A62` |

**Palette logic:** warm and desaturated throughout. There are no pure hues and no cool
colours. A single coral/terracotta accent family (asterisk, quill, wax, keyword) ties the
wrapper to the animation. The light→dark switch at 11.4 s is the only big value shift, and
it marks the act break.

---

## 6. Camera

| t (s) | Move | Feel |
|---|---|---|
| 0.0–1.0 | **Pull-back / zoom-out** from a close mascot to a wide desk | Fast start, ease-out landing |
| 1.0–4.5 | Subtle **follow-drift** with the mascot | Small amplitude, keeps the action centred |
| ~4.5 | **Tilt/pan up** the page to frame its top edge | Quick, eased |
| 8.0–8.6 | Small **re-frame down** as the page settles and shrinks | Eased |
| 11.42 | **Vignette iris** (lighting move, not a camera move) | ~3 frames, very fast |
| 14.5–15.2 | **Push-in ~2.5×** to hero | Strong ease-out, lands on beat |
| 15.2–17.4 | Near-static, slight breathe | Hold |

There is no handheld shake, no rotation, no dutch angles. The "camera" is a clean 2D
orthographic camera with eased moves.

---

## 7. Motion feel

- **Characters are springy and objects are eased.** The mascot moves in quick darts with
  overshoot and settle, and gets **heavy directional motion blur / smear frames** on fast
  moves (visible at 4.45 s and 8.3 s). Paper, envelope and camera use smooth ease-in-out
  with no bounce.
- **Squash and anticipation** on impacts: the wax drop and the stamp press.
- **Stagger:** content builds one line at a time, about **0.9–1.0 s per line** while writing
  and **~0.45 s per line (one beat)** during the dash-bar "edit pass". It always runs
  top-to-bottom, left-to-right.
- **Hold frames:** each beat ends with a short hold (~0.3–0.5 s) before the next action, so
  every transformation gets a moment to read.
- **Secondary motion:** the quill trails the mascot, and the crown wobbles.
- **Easing guess:** camera and objects use roughly `cubic-bezier(0.65, 0, 0.35, 1)`. The
  character uses a spring (stiffness ~300, damping ~18) or a back-out ease with ~10%
  overshoot.

---

## 8. Signature moves

1. **Split-screen "sketch → result".** A static storyboard card sits beside the live
   animation and swaps on bar lines, so the viewer sees the plan and the finished result
   at once.
2. **Object becomes object.** No cuts at all. Each prop transforms into the next
   (page → envelope, blob → seal, seal → hero mark), and a mascot drives every change.
3. **Scribble → clean bars "edit pass".** A light cone sweeps down the page, and messy
   handwriting turns into tidy rounded dash bars, one line per beat.
4. **Iris lighting switch.** A ~3-frame circular vignette closes from a bright workspace
   into a dark, spotlit stage, making the act break without a cut.
5. **Emerge-and-push-in finale.** The hero mark pops out of the final object, the old
   object exits with blur, and the camera pushes ~2.5× to a centred hero that lands on a
   beat and holds for ~2 s.

---

## Steal (grammar we'll reuse)

- The **frame-within-frame layout**: a static dark warm wrapper, a large 9:16 inner panel,
  and a small overlapping "input" card with a label above it and a one-line CTA below.
- **Static UI type and moving content.** Labels never animate, which keeps the frame calm
  and lets the panel carry the energy.
- **One continuous shot built from transformations instead of cuts**, with a guide
  character or cursor that "causes" each change.
- An **input card that swaps on bar lines** (~every 2 bars at ~130 BPM) in sync with the
  main panel's sections.
- A **light-world → dark-world act break** using a fast vignette iris on a beat.
- **Messy → clean as a visual metaphor** (scribbles → bars), line-staggered on the beat.
- **Motion split:** springy, smeared character motion against smooth eased object and
  camera motion, with short holds after each beat.
- **Palette discipline:** warm desaturated neutrals, near-black warm ink, and *one* accent
  family repeated in both wrapper and content.
- **Finale structure:** the hero emerges from the last object, the camera pushes in, the
  hero lands on a beat and holds for ~2 s.
- **Tempo template:** ~130 BPM, structural changes within ½ beat of the grid, sections of
  about 2 bars.

## Don't copy

- **Their logo and mascot.** The interlaced-knot mark with a crown is a third-party brand
  mark. Do not use it, trace it, or make lookalikes.
- **Their branding/labels:** the "✳ Opus 5.5" header with the asterisk glyph, the
  "Motion_graphic" tag, and the exact "Comment "OPUS" for guide" CTA wording.
- **Their story content:** the specific quill → letter → envelope → wax-seal narrative,
  and the exact storyboard sketches.
- **Their footage and audio:** no frames, crops or rotoscoped elements from the video, and
  not the music track.
- **Their exact layout coordinates as a pixel clone.** Take the *structure* (wrapper +
  card + panel + caption) and redesign the proportions, type and colours for our own
  content.
