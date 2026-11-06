# v5: Measured 6-second Omni prompt (faithful to the 4.83 s reference)

Every value was re-measured from the reference GIF (634×347, 69 frames at 70 ms) and scaled ×1.242 to 6.00 s.

## Measurements (source time → 6 s time)

Metrics: luma 0–255; R/B is warm/cool (>1 is warm); sharpness is edge energy (higher is crisper); diff is frame-to-frame motion.

| Beat | Source s | 6 s target | Luma | Sky luma | R/B | Sharp | Diff | Hood RGB |
|---|---|---|---|---|---|---|---|---|
| Diner push-in | 0.00–0.42 | 0.00–0.52 | 51→72 (flash at 0.35) | 45→65 | 1.42–1.60 | 3.6–4.7 | 13–25 | #171B16 → #4A2420 |
| Diner near-hold | 0.49–0.80 | 0.52–1.04 | 58 | 51 | 1.49 | 4.6 | **2–6 (the only slow moment)** | #632C26 (red neon reflection) |
| Speed-ramp whip left | 0.84–1.30 | 1.04–1.61 | 57→41 | 54→84→49 | 1.48→1.19 | 4.3→1.4 | 11–25 | #743029 → #284231 |
| Dark boulevard | 1.33–1.86 | 1.61–2.31 | 26–33 | 18–23 | 0.85–0.97 (cool) | 0.6–0.9 (very blurred) | 4–11 | #0B1F18 |
| Sodium downtown | 1.89–2.14 | 2.31–2.66 | 33–40 | 18–28 | **2.1–2.6 (very warm)** | 1.7–2.4 | 16–21 | #0E1410 / #312416 |
| Parking structure → portal | 2.17–2.59 | 2.66–3.27 | 38–53 | 22–45 | 1.09–1.22 | 1.9–2.3 | 12–27 | #1B4B35 → #141C19 |
| Inside tunnel | 2.66–2.94 | 3.27–3.70 | 72–80 | 67–78 | 1.27–1.31 | 1.3–1.9 | 7–38 | #4C614C |
| Exit blend | 3.01–3.29 | 3.70–4.14 | 92–102 | 76–132 | 1.11–1.20 | 2.2–2.6 | 21–36 | dip to #0D3C25 |
| Dawn industrial road | 3.36–3.92 | 4.14–4.92 | 135–151 | 148–176 | 1.06–1.11 | 1.4–1.8 | 5–22 | #7D8D78 → #7FB596 |
| Day crosswalk | 3.99–4.31 | 4.92–5.35 | 155–166 | 200–215 | 1.06 | 1.5–2.0 | 16–46 (cut at 3.99) | #84C09E → #8BC4A3 |
| Whip-pan right | 4.34–4.55 | 5.35–5.70 | 154→102 | 217→126 | 1.06→0.88 | 2.0→3.0 | 27–36 | #7CBD9B |
| Stand landing | 4.62–4.83 | 5.70–6.00 | 91–97 | 83–109 | **0.82 (cool blue)** | 2.9→3.7 (sharpening) | 16–21 (still moving) | #58B78E |

Fixed geometry, as % of a landscape frame:
- **Ornament:** x 50 %, y 68–80 %, 4 % wide.
- **Bonnet crest:** y 80 % at centre.
- **Headlamp pods:** x 0–15 % and x 85–100 %, y 82–100 %.
- **Vanishing point:** x 50 %, y 50–55 %, except the downtown beat (x 60 %) and the crosswalk (horizon y 63 %).
