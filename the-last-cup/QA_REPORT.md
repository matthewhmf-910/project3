# THE LAST CUP — Visual QA report

Final file: `the-last-cup.mp4` · measured by `scripts/qa.py` (ffmpeg/ffprobe + numpy) and `scripts/qa-preview.mjs` (Playwright).
Raw numbers: `qa/report.json`, `qa/preview/report.json`.

## 1. Delivery spec

| Check | Target | Measured | |
|---|---|---|---|
| Resolution | 1080 × 1920 | 1080 × 1920 | ✅ |
| Frame rate | 30 fps | 30/1 | ✅ |
| Duration / frames | 10.0 s / 300 | 10.000 s / 300 | ✅ |
| Video | H.264 yuv420p | H.264 High, yuv420p, faststart, 22.5 MB | ✅ |
| Audio | AAC stereo 48 kHz | AAC stereo 48 kHz | ✅ |
| Integrated loudness | −14 LUFS | −13.7 LUFS | ✅ (±0.3) |
| True peak | ≤ −1 dBTP | −1.0 dBTP | ✅ |
| Loudness range | — | 4.3 LU | ✅ |

## 2. Picture integrity

| Check | Result |
|---|---|
| Black frames (`blackdetect`, 0.05 s, 6 %) | none |
| Blank / NaN frames (σ < 1) | 0 |
| Frozen frames (Δ < 0.05) | 0 |
| Frames > 25 % clipped white | 0 (v1 had a blown exit at 6.8–8.0 s; fixed by dimming the key 62 % in take C and softening the cup-bottom clearcoat) |
| Frames > 40 % crushed black | 0 |
| Mean luma range | 79 – 204 (no section too dark to read) |
| Detected hard cuts | 4.8 s, 5.0 s: the dive through the tea surface (intended). The rise out of the memory at 6.67 s does **not** register as a cut; the bright surface disc matches the bright empty cup, so the object transition reads as continuous. |

Luma over time with section markers: `qa/luma.png`.

## 3. Review loop (DIRECTOR.md §8, §11)

- **Contact sheets**: 5 passes in total (`qa/sheet_v1–v5.jpg`, `sheet_fix*.jpg`), the final one being `qa/contact.jpg` (every 0.5 s).
- **0.2 s strips of key actions**: `qa/strip_pour_end.jpg` (stream detaches, drips), `qa/strip_grasp_offer.jpg`
  (anticipation dip → grasp → lift → settle), `qa/strip_bow.jpg` (rise → bow → hold, head trailing).
- **Audio**: `qa/spectrogram.png` with every cue marker. Koto E4 measured at 330.9 Hz (target 329.6). The silence
  before the chime is −63 dBFS, and the chime is the first sound after it (−24.5 dBFS).

### Problems found and fixed

| Pass | Problem | Diagnosis | Fix |
|---|---|---|---|
| v1 | Whole film muddy olive; glaze unreadable | No front light; AgX compressing a dim key | Key ×2.3, front cream light-former for glaze reflections, env intensity 1.35, warm front fill |
| v1 | Steam read as smoke | Too opaque, too wide | Alpha 0.42 → 0.24, narrower planes, higher threshold |
| v1 | Title wrapped onto two lines over the chef's head | 104 px + tracking > 1080 px | 86 px, `nowrap`; final framing solved numerically (§4) |
| v1 | 7.2 s frame blank pale green | Camera path clipped the cup wall | Rise straight up the cup axis before pulling back |
| v2 | Dive showed the bottom of the cup, not the tea | Dive endpoint below the tea level | Dive ends 0.035 above the surface |
| v2 | Memory: dishes slid in and out; two empty frames | Lateral track faster than staging | Rebuilt as a rising column with rack focus on the beats |
| v2 | Apron straps read as horns; collar as a bow-tie | Tube geometry standing off the body | Removed; a rounded kappogi collar band instead |
| v3 | Final frame: chef filled the width, cup cut off | 9:16 frame is ~56 cm wide at that distance | Chef bows from his station at the back; camera solved for cup 78–86 %, head 30 %, title band clear |
| v4 | Headband floated as a ring | Torus radius > head section at that height | Fitted to the ellipsoid (0.885 × 0.92) |
| v5 | 一期一会 flipped 180° mid-rise | `lookAt` with world-up is unstable near vertical | Up vector blends to −z when looking down; disc rotation corrected |
| v5 | Headless torso frame at 3.5 s | Crane aimed at the chest | Aim raised; face enters at 3.4 s |
| v5 | Mitten hands didn't read as gripping | No fingers | Four two-segment curled fingers |

## 4. Composition checks

- Final frame (9.9 s) measured by projection: cup 78–86 % from top, upright head 30 %, bowed head ~40 %,
  furin at (78 %, 28 %), title band 10–20 % clear of the chef. Subject ≥ ⅓ of frame height at the key moments:
  the cup (0–2.5 s), the chef's face + cup (4.0–4.6 s), 一期一会 (6.9–7.5 s).
- Text never covers the subject: the location tag (0.25–3.2 s) sits top-left over the dark wall; the title arrives
  after the pull-out has cleared the head.
- **Palette vs. the original editorial poster** (`stunning.png`): the weighted mean ΔE from each dominant film colour to the
  nearest poster colour is **11.5**, so they're perceptibly related. The film is a deliberate night
  version of the same palette: celadon / sage, hinoki beige, ivory, umber. Swatches: `qa/palette.png`.

## 5. Interactive preview (Playwright)

`dist-preview/index.html`, one self-contained 2.1 MB file (JS, fonts and score inlined).

| Check | Desktop film | Phone film (390 px) | Desktop explore |
|---|---|---|---|
| Console / page errors | none | none | none |
| WebGL canvas | 1080 × 1920 | 1080 × 1920 | live, orbit drag OK |
| Horizontal overflow | no | no | no |

Screenshots: `qa/preview/*.png`.

## 6. Known limits (left as they are, stated honestly)

- **Title hold.** "THE LAST CUP" is fully readable for ~0.85 s plus a 0.5 s arrival; the house rule asks ≥ 2.3 s
  for 12 letters. A 10 s film can't give it more without cutting the bow. If the cut can grow to 11–12 s, extend the hold first.
- **The chef is stylised**, a sculptural designer-figure with visible joint spheres and simple sleeves, not a
  photoreal human. That is a deliberate choice (procedural humans fall into the uncanny valley), but the arms are the
  least refined element in the film.
- **2.0–2.5 s** pushes in until the cup fills the frame, a deliberately flat, quiet beat before the crane; some viewers will read it as a held pause.
- **Render path.** No GPU in the build container: WebGL ran on SwiftShader at ~3.2 s/frame (≈ 16 min per full
  render). On a GPU machine use `REMOTION_GL=angle`. ffmpeg 6.1 was used (the library recommends 7); loudness was
  verified independently with `ebur128`.
- **Light shafts in the memory sequence** are subtle against the bright amber; they register mainly at 6.3–6.6 s.
- **Remotion licence**: free for individuals and small teams; a company above the threshold needs a licence (see `CREDITS`).
