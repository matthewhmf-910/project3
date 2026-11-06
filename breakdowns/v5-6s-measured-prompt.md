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

## Prompt (ready to paste)

```
STYLE: Photoreal cinematic 35mm music-video hood-cam hyperlapse of one vintage 1960s lowrider cruising Los Angeles from neon night through a tunnel into hazy dawn and bright day, rigid bonnet-mounted wide 24mm camera locked to the car with constant forward momentum, speed-ramped frame-blended hyperlapse that smears the frame edges while the centre vanishing point stays readable, hidden cuts disguised inside whip-blurs, light flashes and ghosted dissolves, teal-and-red neon night grade swinging to deep sodium amber downtown, neutral grey tunnel, soft warm hazy dawn, bright clean daylight and a final cool blue shade, crushed blacks at night, highlights rolled off and never clipped to white, fine film grain, gentle neon halation, premium finish.

TECH: 1920x1080, 16:9, 24 fps, 6.0 seconds, 12 beats in one continuous POV, only one car exists (the camera car), no other moving lowrider ever crosses frame, no text overlays, no titles, no UI, no exterior shots of the camera car.

LOCKED FRAME (every beat, as % of frame from top-left): glossy curved bonnet crest at y80% centre, curving down to the corners; chrome V-crest hood ornament on a short stalk at x50%, y68-80%, 4% of frame width, always sharp; two torpedo-shaped chrome headlamp pods partly cropped at x0-15% and x85-100%, y82-100%; bonnet colour tracks the light: #171B16, then neon-red reflection #632C26, night #0B1F18, tunnel #4C614C, dawn #7D8D78, day #8BC4A3, shade #58B78E.

TIMELINE (exposure = average frame brightness):
0.00-0.52s DINER PUSH-IN: camera creeps forward at walking pace with a slight left yaw through a 1960s Googie diner lot at night; low building at x0-45% with one red neon roofline tube #E0302A sloping from y38% at the left edge down to y55% at x45%, warm yellow wall #C9B44A below, a row of round canopy downlights; tall pole sign at x52-73%, y0-55%, with a red neon circular script logo at the top, red neon script "original", and white bold rounded caps "DOUBLE CHEESE BURGER"; silhouetted crowd and parked red-and-pink classic cars at y55-80%; sign text mirrored backwards in the bonnet; exposure 20%, rising to a 28% neon bloom flash at 0.43s; warm grade.
0.52-1.04s DINER NEAR-HOLD: hidden jump cut closer in; the only slow moment, a gentle drift with almost no motion; sign at x50-73%, y0-38%; lowriders at y45-65% with people beside them; red neon reflection glowing on the bonnet; exposure 23%; everything crisp.
1.04-1.61s SPEED RAMP AND WHIP LEFT: the car accelerates hard and yaws left onto the street; the diner smears into horizontal red-and-yellow light streaks across the top 30% of frame; sharpness falls to near zero by 1.6s; exposure sinks from 22% to 16%; grade cools.
1.61-2.31s DARK BOULEVARD: very dark residential road (exposure 10-13%, sky near black #0B0F13), cool blue-green tint, heavy motion blur everywhere except the vanishing point at x50%, y55%; one sodium streetlamp flaring at x23%, y27%; distant tail-lights at the vanishing point; a hidden micro-cut at 1.91s.
2.31-2.66s SODIUM DOWNTOWN: hard shift to deep amber-orange sodium light (the warmest beat), exposure 13-16%; buildings on both sides, lamps at y35-45%; vanishing point shifts right to x60%, y55%; double yellow centre line #C99A2A from lower left.
2.66-3.27s PARKING STRUCTURE TO TUNNEL PORTAL: neutral cool light, exposure 15-21%; horizontal white strip-lit parking floors at x0-35%, y5-50%; dark high-rises behind; a bright arched tunnel portal centred at x45-55%, y50-58%, growing fast; lane stripes converging.
3.27-3.70s INSIDE THE TUNNEL: grey concrete tube #6E6A60, exposure 28-31%; a single line of ceiling lights running from x40%, y5% to the vanishing point at x50%, y50%; yellow centre lines; the strongest radial zoom blur; frame-blended ghosting.
3.70-4.14s EXIT BLEND: the tunnel ceiling lights ghost-dissolve over the open dawn road for 0.4s while exposure climbs from 36% to 40%; the bonnet darkens briefly at 3.95s as the car passes the portal shadow.
4.14-4.92s DAWN INDUSTRIAL ROAD: soft warm hazy morning, exposure 53-59%, sky 58-69% brightness graded from #BBBDB2 at the top to #E8D8B0 at the horizon; horizon at y50%; warehouse at x0-25%, y30-50%; traffic signals at x20-30%, y30%; transmission pylons; downtown skyline silhouette at x65-85%, y45-50%, with a low sun glint on the horizon; ghosted, smeared poles whip past the edges; the bonnet turns seafoam.
4.92-5.35s DAY CROSSWALK: hard cut on a bright flash; clean daylight, exposure 61-65%, sky very bright #E4E3D3 but not clipped; horizon drops to y63% as the nose dips; white zebra crosswalk bars at y65-75%; utility pole at x12%; low apartment block on the right; a blue-and-white walk-up stand small in the distance; the car starts a right turn.
5.35-5.70s WHIP-PAN RIGHT: fast rightward yaw; the scene smears horizontally as a blue-and-white walk-up magazine stand slides in from the right; exposure drops from 60% to 40% as the blue awning fills the frame; grade cools.
5.70-6.00s STAND LANDING: the speed ramps down to a slow crawl that is still drifting right; the stand fills x0-100%, y0-75%: royal-blue lower band #2456A0 at y55-75%, cream window frames, glass front packed with magazines and posters, two people at the window, orange bollards at x0-10%; cool blue shade grade; exposure 36-38%; motion blur resolving to sharp by the last frame.

TYPOGRAPHY (in-scene signage only): red neon brush-script lowercase "original" and circular logo; white bold rounded retro caps, slightly condensed, "DOUBLE CHEESE BURGER"; all lit physically, never overlaid or animated.

SOUND: 0.00s low V8 idle and crowd murmur under a laid-back 95 BPM West-Coast soul groove (deep round bass, talkbox, Rhodes, vinyl crackle); 0.43s neon buzz on the flash; 1.04s rev and whoosh as the beat drops in; 1.61s wind roar; 2.31s doppler swish; 3.27s tunnel reverb swell; 3.70s airy riser on the exit blend; 4.92s bright impact hit on the flash cut; 5.35s whoosh on the whip-pan; 5.70s engine eases to a lopey idle; music sustains through the end.

FINAL FRAME at 6.00s: cool-shaded blue-and-white walk-up magazine stand filling the top 75% of frame, blue band at y55-75%, two customers at the window, orange bollards at the far left, image sharp with only faint motion blur at the right edge; mint bonnet #58B78E across the bottom 20%, crest at y80%; chrome V ornament centred at x50%, y68-80%; torpedo chrome headlamp pods in both lower corners; exposure 37%; fine grain.
```
