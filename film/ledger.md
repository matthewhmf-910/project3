# Ledger

Each round records the measured numbers before and after the fix, so progress is checkable.

## Round 0: first full render (measured QA, `film/qa.py`)
| check | before | after | fix |
| --- | --- | --- | --- |
| frozen total (limit <0.33 s) | 0.53 s | 0.07 s | The lemon rolls and the camera moves from frame 0. The camera keeps moving through the splash. |
| end-card safe area | stamp in top UI band | inside | Stamp lowered (y 300 → 418) and shrunk (300 → 272). |
| terracotta match | "off 13.9" | off 1.0 | The QA was contaminated by wood pixels; it now measures inside the shape only. The asset itself was correct. |
| key action in safe area | not measured | yes | New check for the lemon and the wheel. |
| contrast, kicker text | 5.28:1 | 5.28:1 | n/a |

## Round 1: critic 1 said "one more pass" (7 ranked problems)
| # | critic problem | fix | measured after |
| --- | --- | --- | --- |
| 1 | CUT stalls (1.1 s near-freeze), no visible cut, 60 px lemon | CUT 3.2 s → 2.1 s. Wind-up 0.42 s + tremble. 0.15 s stroke at 5.27 s. Camera on a 2.0× spline on the hit + shake. Lemon 1.25×. Clip + cut face + 4 juice drops. Wheel peels face-on in 0.38 s. | frozen 0.53 s → **0.00 s** |
| 2 | FEED: C pose-swap, O's read as bars | The C turns upright over 0.6 s while carrying the lemon. O's stop at 55° (were 72°). | (see critic 2) |
| 3 | Weak first frame, camera at full speed on frame 1, coaster cut-out floating | Settled poster on frame one; the spline camera eases in from rest. Product group lowered so the coaster's cropped edge sits on the frame edge. Lemons 1.25×. | first-frame camera velocity 0 |
| 4 | FALL blurs everything, no splash, wheel a fleck | Wider, eased tilt. Wheel lands 2.0× on the foam beside the slice. Contact shadow, larger ripple + 7 drops. | key action in safe area: yes |
| 5 | End card readable only from 9.6 s, too small | HERO starts at 7.6 s. End card readable from 8.9 s (1.1 s hold). Stamp 1.2×, kicker 64 px. Push-in runs to the last frame. | end card in safe area: yes; contrast 5.28:1 |
| 6 | Camera jumps at 1.37 s / 4.23 s, no ease-ins | Overlapping shot tweens replaced by one cubic-Hermite spline through framing keys (continuous velocity). | no shot tweens remain |
| 7 | Mask halos / hard polygon edges | **Not fixed.** Needs re-masked or real 4K assets (open issue). | — |
| — | Ghosted letters at 9.0–9.3 s | Motion blur 3 → 5 sub-samples. | — |

## Round 2: critic 2 said "one more pass" (fixed: cut, camera; open: feed, catch, stub, fall, end card, first frame, edges)
| critic problem | fix | measured after |
| --- | --- | --- |
| Feed: O's read as bars, lemon passes in front | Each O split into front/back half-glyphs on one carrier; the lemon rides at ring depth (z 30). Verified on a full-res crop at 3.2 s: O1's front stroke crosses over the lemon. | crop check ✓ |
| Catch: C a flat trough for 1.4 s | The C tips 40° like a cup instead of 90°. | — |
| Stub fades as a ghost | The stub stays in the rings, then rolls back out left as the rings turn back (no fade). | stub off-screen by 8.2 s |
| Ramp re-enters during the fall | The ramp leaves at 5.5 s while the camera is close on the L (off-camera). | — |
| Fall blurs the whole frame | Camera locks vertically onto the wheel during the fall (smooth in/out), so the wheel stays sharp. | — |
| Splash = flat dots | Crown: 10 shaded drops, stretched along their path, plus two ripple rings. | — |
| End card small | Kicker 64 → 88 canvas px (≈44 px caps). Stamp 330 → 400 (≈280 px). | contrast 5.28:1; end card in safe area ✓ |
| Ghosted motion blur | Samples 5 → 9. | — |
| Roll was only 44 px (side effect of the round-1 lemon enlargement) | Ramp 520 → 680 px, so A rolls ~200 px; a front lip makes it a trough. | — |
| Waiting lemons cropped at frame edge | **Kept on purpose.** Reference panel 01 has the queue entering from the frame edge. | — |
| Mask halos / hard coaster edge | **Not fixed.** Needs real 4K assets (open issue). | — |
| QA script | The stub after the cut is labelled a prop, not key action; fully off-screen rects are ignored; ring halves are named. | QA: PASS |

## Rounds 3-14 (detail in the commit messages, `git log -- film js/reel-scene.js`)
| rounds | main problems found | fixes |
| --- | --- | --- |
| 3-5 | Word never re-formed after the cut; motion blur smeared the camera; dirty glass; splash off the contact frame | Letters re-form on clicks; adaptive blur with the camera frozen at the frame centre; cleaned glass; splash timed to contact |
| 6-7 | No score; splash, juice and crown **never visible** (GSAP `fromTo` with `autoAlpha` only in the start vars) | Synthesised score and effects from `timing.json` (one clock for picture and sound); five calls fixed; `film/lint.py` added |
| 8-11 | Strike not the climax on phones; wheel hang; camera handover fights; feed hid the lemon's travel; stamp before the type | Strike chord stab (low crest), deterministic master, QA on the shipped file; steady wide feed; visible C shove on the beat; stamp after the type lands |
| 12-13 | "Tint seam" across the wheel; end card crowding | Seam was the shadow plane (z 59) cutting the tilted wheel (z 60), moved to z 4; end card re-laid out with a collision check; encoded true-peak loop |
| 14 | Splash heard, not seen; C read as "S" ("SOOL"); wheel over the glass rim; roll 8 dB faint; stray click 6.176 s; no duck at the type land; E/S/T no visible settle | Drops thrown clear of the wheel + ring at its base; C tilt 22° to 12° and the lemon tucked behind its strokes; wheel lands on the back half of the slice; roll visible and audible from 0.2 s; flick removed; duck added; per-letter settle |

## Round 15: critic 15 said **ship**
Measured on the shipped file: −14.5 LUFS, true peak −1.9 dBTP, phone −15.6 LUFS; every hit within one frame; strike the loudest 250 ms window; frozen 0.07 s; end card in safe area, no collisions; contrast ≥ 4.7:1. Delivered as `dist/film/coolest-coffee-reel-v8.mp4`.

Polish the critic listed as acceptable for a 10 s social cut (not done; candidates for a v9):
1. 4.3–5.4 s: C of COOLEST/COFFEE cropped at the strike (camera ~80 px right would show the whole word).
2. 5.83–6.2 s: the spent lemon half crosses the re-forming C and leaves frame unresolved.
3. Hero wheel is a flat vector disc with no contact shadow (squash ~0.6 to match the slice; soft shadow).
4. Splash drops read as opaque beads (translucent, stretched along motion).
5. E/S/T settle still ≤ 3 px; roll still under the music on phones at 0.2–0.4 s.

Source-asset-limited / client decisions: AI-looking poster props, no photographed lemon wheel, no CTA, typeset stamp, "concept" label, XIAOYE spelling (see brief.md).
