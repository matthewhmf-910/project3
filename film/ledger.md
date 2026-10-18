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
