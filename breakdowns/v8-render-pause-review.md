# V8 render: pause analysis

V8 render: 720×1280, 24 fps, 6.04 s, with a "Dola AI" watermark at the bottom right.

Compared at 14.29 fps:

| Clip | Mean motion | Near-still frames | Sharpness |
|---|---|---|---|
| Reference | 17.8 | 10.3 % | 6.38 |
| V8 | 25.4 | 15.3 % | 8.87 |

Pauses, measured at 24 fps (frame-difference < 4 means frozen):

| # | Time | Duration | Min diff | What happens | Reference equivalent |
|---|---|---|---|---|---|
| P1 | 0.50–0.96 s | 0.46 s | 0.4 | Diner fully frozen, a dead still frame | 0.61–0.99 s near-hold that keeps drifting (diff 2.4–5.9 at 14.3 fps), never frozen |
| P2 | 3.04–3.29 s | 0.25 s | 1.6 | Frozen dawn frame straight after the tunnel flash | none: the reference never stops here |
| P3 | 5.12–5.38 s | 0.26 s | 2.0 | Kiosk already reached at ≈ 5.0 s (target 5.70 s), then a stall | none |
| P4 | 5.58–6.00 s | 0.42 s | 0.0 | Dead freeze to the end | reference still moving at its last frame (diff 16–21) |

Total frozen time is about 1.4 s (23 %). The reference has 0 s fully frozen, and its only calm moment is about 0.3 s.

Other findings:
- **Overpass left turn:** missing again (dx = 0 from 3.6 to 4.4 s); the car drives straight along under the deck. Omni has produced no hood-cam yaw in v3, v7 or V8.
- **Sweep:** compressed into 4.45–5.05 s, and the lock-on finishes at about 5.1 s, which is 0.6 s early. That early arrival is what creates P3 and P4.
- **Car:** consistent mint/teal, camera outside on the hood, chrome pods correct. Fixed.
- **Sharpness:** 8.9 vs 6.4 for the reference. Closer, but still too crisp.
- **Diner sign:** garbled again.
