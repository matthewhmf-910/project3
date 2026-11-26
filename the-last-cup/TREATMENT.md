# THE LAST CUP — Treatment

10.0 s · 1080 × 1920 · 30 fps · no voice, no subtitles (titles only) · fully code-generated 3D

## Source of the story

The repo's existing material is the prototype: *A Quiet Omakase Evening* (Central / Sheung Wan) — five courses,
a hanging wind chime, 一期一会 *ichigo ichie* ("one time, one meeting"), and the footer line *Grateful for the moment*.
Its emotional storyline is preserved: a quiet, satisfying evening, craftsmanship, gratitude, and the
awareness that this exact moment will never come again. The visuals are rebuilt from scratch in 3D;
nothing from the raster poster is reused.

The palette carries over: pale green (celadon, sage), warm beige / hinoki blond, ivory, cream, with a deep warm
umber night behind the counter so the lamp light reads.

## Three candidate structures

1. **The countdown of courses.** Five dishes, one per two seconds, ending on tea. *Rejected*: a list, no turn,
   and it is exactly the poster's grid restated as time.
2. **Before / after across the counter.** Full cup offered → hard cut → empty cup, chef bows. *Rejected on its own*:
   clean turn, but there is no peak; the ellipsis has nothing inside it.
3. **One pour, one dive, one goodbye (chosen).** The last cup is poured; the chef offers it to *us*; the camera
   falls into the tea, where the whole evening glows once more; we rise out of the cup and it is empty. The
   evening is over. The chef bows. *Chosen* because the cup itself drives every transition (object-driven), the
   turn (full → empty) is felt rather than explained, and the peak — the memory inside the tea — is a move only
   3D can make.

Opening image: a thread of green-gold tea falling into a celadon cup under a single lamp (hook in < 1 s).
Ending: the empty cup, 一期一会 painted at its bottom, the chef's bow, the chime still swinging.
Score shape: plucked koto motif rising, a held silence, one wind-chime strike, a resolving koto chord.

## Logline and arc

At the end of a quiet omakase evening, an old itamae pours the last cup of tea for his final guest — and inside
it, the whole night glows once more before it is gone.

- **Setup** (0–5.0 s): the pour; the chef lifts the cup with both hands and offers it to camera.
- **Turn** (5.0–6.7 s): we fall into the tea — otoro nigiri, chawanmushi, sashimi drift past in amber light.
- **Ending** (6.7–10 s): we rise out of an *empty* cup. 一期一会 at its bottom. The chime rings. The chef bows. Title.

## Benchmark

- **Pixar shorts' prop-driven staging (e.g. the economy of a single-room short)** — learn: one prop carries
  the emotion, staging reads at thumbnail size, anticipation/follow-through on every gesture.
  Don't take: characters, designs, any shot.
- **Premium tea / sake commercials (macro liquid cinematography)** — learn: macro pours with backlight, shallow
  depth of field, warm key with cool rim, slow push-ins, slow-motion liquid. Don't take: brands, logos, packaging.

## Shot list

| # | Time | Framing | Angle | Camera move | Why |
|---|------|---------|-------|-------------|-----|
| 1 | 0.00–2.50 | Macro insert → close | High ¾ on the cup | Slow push-in + 12° arc | Hook: liquid light. Arc reveals the stream's backlight. |
| 1b | 2.50–4.40 | Close → medium (same take) | Eye level | Crane up + pull back, rack focus cup → face → cup | Reveal the person behind the craft; the oner keeps the moment unbroken. |
| 2 | 4.40–5.00 | Close → extreme close | Slightly high | Push *into* the offered cup | Object-driven transition: the tea surface becomes the frame. |
| 3 | 5.00–6.70 | Medium inserts on dishes | Floating | Lateral track + slow roll, falling | The peak: memory. Fastest section; each dish lands on a beat. |
| 4 | 6.70–7.60 | Top-down into empty cup | Overhead | Rise out of the cup (crane up) | The ellipsis: same cup, now empty. A breath of near-silence. |
| 4b | 7.60–10.0 | Medium wide (same take) | Slightly high | Pull back + tilt to the chef | Bow, chime, title. The longest hold: the audience breathes. |

Camera moves used: push-in, arc, crane, pull-back, rack focus, dolly-through, lateral track, roll (≥ 4 ✓).
Signature shot: the dive into the tea surface and the rise out of the empty cup (one continuous logic).

## Beat sheet & cue map (72 BPM, beat = 0.8333 s, 12 beats = 10 s)

| t (s) | Beat | Picture | Sound |
|------|------|---------|-------|
| 0.00 | 0 | Stream already falling; meniscus rippling; lamp glint | Pour (liquid noise), room tone, koto note E4 |
| 0.83 | 1 | Steam begins curling | koto B4 |
| 1.67 | 2 | Level rising, push continues | koto D5 |
| 2.20 | — | Kyusu tilts back, stream thins, last drips 2.30 / 2.45 | Drip plinks |
| 2.50 | 3 | Crane back begins; kyusu set down | Clay thunk on wood |
| 3.33 | 4 | Hands close on the cup (anticipation dip 3.15) | Cloth rustle, ceramic touch |
| 3.60–4.40 | — | Lift + offer; brows rise, smile at 4.0 | koto E5 (on 4.17, beat 5) |
| 4.40 | — | Cup advances toward lens | Swell (reverse-chime) J-cut into dive |
| 5.00 | 6 | Breach the tea surface → amber world; nigiri | Muffled "bloop", koto A4 |
| 5.83 | 7 | Chawanmushi passes | koto B4 |
| 6.67 | 8 | Rise through surface → empty cup from above | **Silence** (room tone only, −30 dB) |
| 7.50 | 9 | 一期一会 sharp; chime visible swinging | **Wind chime strike** (first sound after silence) |
| 8.33 | 10 | Chef bows (ojigi), title fades in | koto chord E–B–E |
| 9.17 | 11 | Bow holds; chime sways | chime tail, room tone |
| 10.0 | 12 | End | — |

Picture locks to `src/timeline.ts`; the score (`audio/mix.py`) reads the same `timeline.json`.

## Sound design

| Section | Ambience | Foley | Music |
|---------|----------|-------|-------|
| Pour (0–2.5) | Quiet room tone, faint distant city | Tea pour, drips | Koto motif, sparse |
| Offer (2.5–5.0) | Room tone | Kyusu thunk, cloth, ceramic touch | Koto, one note per beat |
| Memory (5.0–6.7) | Low-passed "underwater" room | Bloop, soft bubble rises | Koto through reverb, warm |
| Empty cup (6.7–7.5) | Near silence | — | Nothing |
| Goodbye (7.5–10) | Room tone returns | Chime strike + clapper tinkles, cloth (bow) | Koto chord, decay to silence |

Sound transitions: J-cut swell before the dive (4.4 → 5.0); the chime's tail runs over the bow and the title (L-cut).

## Titles

- Main title **THE LAST CUP** — Cormorant Garamond Light, tracked wide, dark olive `#3f4a35` on the light upper
  third of the final shot. Arrives by unblurring + tracking-in (6 px → 0), not a fade-from-black.
- Vertical Japanese line **最後の一杯** — Shippori Mincho, muted ochre, right edge.
- Footer **GRATEFUL FOR THE MOMENT** — Jost, tiny, letter-spaced, with a small red seal square.
- 一期一会 is part of the world (painted in iron-oxide brush on the cup bottom, Yuji Syuku), not an overlay.

Title rules note: DIRECTOR.md asks ≥ 4 s for a title card; in a 10 s film the title holds 1.67 s fully readable
+ 0.6 s arriving. "THE LAST CUP" is 3 words (≈ 12 letters → 12/15 + 1.5 = 2.3 s reading need); it is on screen
from 7.9 s to 10.0 s (2.1 s) plus arrival. Accepted trade-off, logged in the QA report.

## Look rules (this film's own style)

- Realistic materials: glazed stoneware with clearcoat and iron speckle, hinoki with procedural grain,
  fabric with sheen, skin with sheen, glass with transmission, liquid with animated ripple normals.
- One motivated key light (the washi pendant, warm 2700 K), a pale-green cool rim, a low env fill made of
  light-formers. No flat ambient.
- Physical DOF on every shot; bloom only on the lamp, glints and memory motes; AgX tone mapping; vignette;
  grain added in ffmpeg.
- The chef is a stylised sculptural figure (designer-figure proportions, soft clay-like skin), not a
  photoreal human — readable silhouette, closed smiling eyes, expressive brows.
