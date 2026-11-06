# Review of the "V9.mp4" render (generated from the v10 two-act grade prompt)

The upload is 720×1280, 24 fps, 6.00 s. The burned-in "KODAK 2383" text and the two-act grade show it was made from the v10 prompt.

Compared at 14.29 fps:

| Clip | Mean motion | Near-still frames | Sharpness |
|---|---|---|---|
| Reference | 17.8 | 10.3 % | 6.38 |
| This render | 29.3 | 0 % | 11.02 |

Per-frame flaws (24 fps):
1. **Burned-in text.** "KODAK 2383 Print-Film" is printed across the top and "BEST 30%" with a "► 8" marker across the bottom, roughly 0–1.4 s. The model drew film-rebate markings because the prompt named the film stock, and the bottom marker is probably derived from the "exposure %" numbers.
2. **Camera moved behind the windscreen.** Wipers and the cowl vent are visible along the bottom edge throughout. The negative phrasing "no wipers, no cowl vent" primed them.
3. **Frozen sunrise.** 3.25–3.71 s, 0.46 s, min diff 2.5. Straight after the gold flash, the sunrise beat played as a still beauty shot.
4. **No stop and no bounce.** The sweep runs 5.0–6.0 s (dx −1 to −9 px/frame) and is still moving at the last frame (diff 8.4). The kiosk sits at x55–100 %, attached to a shopfront, so it is neither freestanding nor centred.
5. **Grade.** Act 1 reads well: cool magenta/teal (R/B 0.45–0.75, saturation 0.50–0.60), amber downtown (R/B 1.73), the coldest tunnel (R/B 0.45, saturation 0.60). Act 2: the flash peaks at R/B 2.08, but the sunrise falls back to R/B 1.22 at saturation 0.27, so it is warm but hazy and less saturated than the night. The day runs R/B 0.75 at saturation 0.25–0.50.
6. **Too busy and too crisp.** Motion 1.65× the reference, sharpness 1.7×.

What worked:
- The two-act colour contrast.
- The diner sign "original" is legible.
- The overpass now has a curving deck bending left with warm god-rays (R/B 1.4–1.5), which finally reads as a left turn.
- There is a whip at 3.75 s (dx 46).
