# v7 render review and v8 prompt

v7 render: 720×1280 (9:16 again, although the prompt asked for 16:9), 24 fps, 6.00 s.

Fair comparison at 14.29 fps:

| Clip | Mean motion | Near-still frames | Sharpness |
|---|---|---|---|
| Reference | 17.8 | 10.3 % | 6.38 |
| v7 render | 28.3 | 1.2 % | 10.56 |

Per-frame yaw (phase correlation) and stop timing:
- **Overpass 3.9–4.7 s:** dx = 0 on every frame. No left turn happened.
- **Sweep 5.00–5.54 s:** dx −3 to −17 px/frame on a 144 px-wide sample, peaking at 5.29–5.42 s. The sweep is too short and too weak.
- **Stop:** the frame settles at about 5.88 s (target 5.75 s). The bounce is ≤ 2 px, which is invisible.

Flaws:
1. **The car changed.** The bonnet is grey, gold and silver instead of mint, and its colour shifts between beats. The ornament is a thin spike, not the V crest. At 0–1.5 s and 5.7–6.0 s the cowl vent and windscreen are visible, so the camera jumped inside the cabin.
2. **The diner sign is garbled.** It reads like "Colt's", and "original / DOUBLE CHEESE BURGER" is not legible. The 0.5–0.8 s calm moment is missing.
3. **The tunnel exit is a hard cut** (3.0 → 3.25 s), not the ghost dissolve.
4. **No left turn under the overpass.** The car drives straight through. The exposure under the deck is right (luma 26–36).
5. **The ending is off.** The stand is a sidewalk newsstand at x55–100 %, not centred, and the ornament points at newspaper boxes. The stop is late, there is no visible bounce, and the final frame is washed out (47 % vs a 38 % target) and seen through the windscreen.
6. **Too busy and too sharp.** Motion is 1.6× the reference and sharpness is 1.7× the reference.

v8 fixes:
- Name the car first and keep its colour locked.
- Place the camera outside on the hood, with no glass, wipers or cabin.
- Write the prompt for 9:16, because Omni keeps outputting vertical.
- Lower the speed to about 10x and ask for more blur.
- Cut to 10 beats, and give the overpass left turn 0.8 s with its own visual cues.
- Use a freestanding kiosk straight ahead, the stop at 5.70 s and a 5 % visible bounce.
