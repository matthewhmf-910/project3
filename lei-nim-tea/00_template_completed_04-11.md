# UNIVERSAL EDITORIAL MOTION DIRECTOR ENGINE — 補完部分（04–11）

> 原 template 去到 03「Design grammar」最後一行（"minimal publication-ins…"）就斷咗。
> 以下由 03 收尾開始補，風格同用字跟返 01–03。**未經你確認之前唔會當正式規則用。**

---

## 03（續）— Design grammar 收尾

- Thin registration marks, subtle dividers, marginal annotations, and minimal publication-inspired details (issue numbers, page folios, coordinates, time stamps) used sparingly as editorial seasoning.
- Grain: fine 35mm-style film grain at low opacity; never heavy, never VHS.
- Maximum two typographic layers on screen at any moment.
- No stickers, emojis, cartoon icons, glitch effects, or template-style social-media graphics.

---

## 04 — SEGMENT TIMING GRAMMAR（每段 10 秒 / 300 frames）

Every segment follows the same rhythmic skeleton so all segments cut together as one film.

| Slot | Frames | Time | Function |
|---|---|---|---|
| S1 Hook | 0–45 | 0.0–1.5s | Strongest image of the beat; motion already in progress (never start static). Continues the motif handed over by the previous segment. |
| S2 Context | 45–105 | 1.5–3.5s | Wider or establishing view; headline enters. |
| S3 Detail | 105–180 | 3.5–6.0s | Macro / texture / gesture; often split-screen or editorial window. |
| S4 Payoff | 180–255 | 6.0–8.5s | Emotional peak of the beat; cursive word appears here. |
| S5 Handoff | 255–300 | 8.5–10.0s | Sets up the motif that the next segment opens on. Last 6 frames reserved for the transition. |

- 4 shots allowed when one shot needs to breathe (merge S3 + S4). 6 shots allowed only for energetic beats (split S3).
- No shot shorter than 18 frames (0.6s) or longer than 90 frames (3.0s).
- Cuts land on music beats. Assume ~96–104 BPM → one beat ≈ 18 frames; place cuts on multiples of 18 where possible.

---

## 05 — TRANSITION CHOREOGRAPHY

Transitions are motivated by **shape, motion, or colour** — never a generic dissolve.

| Type | When to use |
|---|---|
| Shape match cut | Same form in both shots (circle → circle, vertical line → vertical line). |
| Motion carry | Movement direction continues across the cut (a pour falling → next shot continues downward). |
| Editorial panel wipe | A rectangular window slides/expands to become the next full frame. |
| Mask reveal | Next shot revealed through a geometric mask (circle iris, vertical slit). |
| Whip / speed ramp | Only between segments with an energy rise; max one per segment. |
| Light leak / flare | Only for time-of-day shifts (day → night). |

**Segment-to-segment rule:** segment N's S5 must end on a motif that segment N+1's S1 opens on. The audience should not feel where one 10-second file ends and the next begins.

---

## 06 — TYPOGRAPHY MOTION SYSTEM

- **Headline** (bold white sans): mask-reveal upward, 12 frames, ease-out; holds; exits by sliding 40px + fade, 8 frames.
- **Cursive word** (thin handwritten): write-on stroke animation, 20–24 frames; one per segment max.
- **Subtitle** (small uppercase, tracking +200): letters fade in left→right, 1 frame offset per letter.
- **Annotations** (folios, coordinates, labels): appear with a 1px line drawing in first, then text.
- **9:16 safe zones:** keep all text out of top 220px and bottom 380px (platform UI); side margin 72px.
- **Bilingual rule:** Chinese line on top, English line below at ~45% size. Never more than 8 Chinese characters per line.

---

## 07 — CAMERA & MOTION LANGUAGE

- Default move: slow push-in or lateral parallax drift — something is always moving.
- Macro and shallow depth of field for textures (powder, liquid, steam, grain of wood).
- Rack focus to transfer attention between foreground object and background space.
- Speed ramp: real-time → 40% slow motion at the moment of a pour or gesture.
- Handheld only as micro-float; no shaky handheld.
- When animating stills (photo-based edit): Ken Burns ≤ 8% scale change per shot, plus 2.5D parallax where a clean subject separation exists.

---

## 08 — SOUND DESIGN CUES

Each segment lists:
- **Music:** mood + energy level (1–5), consistent track across all segments.
- **SFX (diegetic):** sounds that come from the image (pour, clink, sift, footsteps on metal stairs, city ambience).
- **Accent:** one designed sound per segment synced to the typographic or transition peak (soft whoosh, paper slide, bell).
- Music dips −6 dB under any key SFX moment.

---

## 09 — IDENTITY LOCK & AI-GENERATION SAFETY

- **Image-to-video first:** whenever a supplied photo exists for a shot, use it as the start frame / reference image so dishes, interiors, and products stay real.
- **No generated text in AI video:** AI tools garble Chinese characters and logos. Every AI prompt includes "no text, no letters, no logos generated". All typography, logos, and signage overlays are added in the edit.
- Logos (e.g. coaster logo, neon signage) must come from the original photo only — never redrawn by the model.
- Do not invent dishes, prices, names, or facts not supplied. Unknown details stay as `[placeholder]` until confirmed.
- People: hands only unless a face is supplied and approved.

---

## 10 — OUTPUT FORMAT（每段固定格式）

```
SEGMENT [n] — [Title]                         [start–end in film]
Beat purpose:     one sentence
Emotion:          one word → one word
Source photos:    filenames

SHOT LIST
| Shot | Frames | Visual | Camera / motion | Text overlay | Sound |

AI VIDEO PROMPT (per shot, English)
- Start frame: [filename]
- Prompt: …
- Negative: text, letters, logo distortion, extra fingers, warped tableware, oversaturation, cartoon, flicker

EDIT NOTES
- Typography: …
- Transition out: … (→ hands to Segment n+1 S1)
- Grade: …
```

---

## 11 — QA CHECKLIST（交貨前逐項剔）

- [ ] Every segment exactly 300 frames, 1080×1920, 30fps.
- [ ] Each segment has 4–6 shots; none < 18 frames or > 90 frames.
- [ ] Every segment's S5 hands a motif to the next segment's S1.
- [ ] Hero moment appears once, given the longest hold.
- [ ] No AI-generated text; all overlays editable.
- [ ] All text inside safe zones; ≤ 2 type layers on screen.
- [ ] No invented facts; placeholders flagged.
- [ ] Grade consistent across segments (warm highlights, cool-neutral shadows, natural food colour).
- [ ] Music continuous across segment joins.
