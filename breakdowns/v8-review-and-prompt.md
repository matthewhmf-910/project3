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

## v8 prompt (ready to paste)

```
STYLE: Photoreal cinematic 35mm music-video fast-forward hyperlapse filmed from a camera bolted OUTSIDE on the front of the bonnet of ONE vintage 1960s lowrider painted solid mint-green #4FBF8F, the same mint car and the same mint bonnet in every frame, racing about 10x real speed from neon night through a tunnel, under a concrete freeway overpass with a hard left turn, then sweeping into a precise stop at a kiosk in bright day; every frame soft with long shutter-drag motion streaks and ghost trails, nothing crisp except the hood ornament and the far vanishing point; teal-and-red neon night grade, deep amber sodium downtown, grey tunnel, warm hazy dawn, hard concrete shadow under the overpass, clean bright day, cool blue shade at the end; crushed night blacks, highlights never clipped, fine film grain, soft neon halation.

TECH: 1080x1920, 9:16 vertical, 24 fps, 6.0 seconds, one continuous hood-camera POV, 10 beats; no windscreen, no wipers, no dashboard, no cowl vent and no cabin ever visible; only one car exists (the camera car), no other lowrider and no exterior shots; no text overlays, no titles, no UI.

LOCKED FRAME (all beats, % of the vertical frame from top-left): glossy mint bonnet fills the bottom 22% with its curved crest at y78%; a small chrome V-shaped crest hood ornament on a short stalk at x50%, y70-80%, 6% of frame width, always sharp; two torpedo-shaped chrome headlamp pods cropped at the bottom corners (x0-14% and x86-100%, y85-100%); the bonnet stays mint and only its reflections change with the light.

TIMELINE:
0.00-0.45s pushing forward through a 1960s Googie diner lot at night: low diner at x0-55%, y30-55%, with one red neon roofline tube #E0302A and a warm yellow wall #C9B44A; tall pole sign at x55-85%, y10-35%, showing one word "original" in big red neon script on a pale sage panel; blurred crowd and parked red classic cars at y50-72%; red neon reflections on the mint bonnet; exposure 20% with a neon bloom flash at 0.37s.
0.45-0.85s the one calm moment: nearly still from 0.52 to 0.80s, crisp, a slight drift past the parked cars and people; exposure 23%.
0.85-1.30s violent acceleration and a hard left whip; the diner explodes into horizontal red-and-yellow light streaks across the top 35% of frame; total blur.
1.30-1.90s a dark boulevard rushing past, cool blue-green at exposure 11%, bending gently right into deep amber sodium downtown at exposure 15%; vanishing point sliding from x50% to x58%, y48%; double yellow line #C99A2A from lower left; streetlamps streaking.
1.90-2.40s strip-lit parking floors whipping past on the left at x0-35%, y15-45%; a bright arched tunnel portal straight ahead at x40-60%, y40-50%, rushing at the lens; cool neutral, exposure 18%.
2.40-3.00s inside a grey concrete tunnel #6E6A60, exposure 30%; a line of ceiling lights streaking into the centre; strong radial zoom blur; from 2.80 to 3.00s the tunnel lights fade as a ghost dissolve into a hazy dawn road (not a hard cut).
3.00-3.60s warm hazy dawn industrial road, exposure 55%, sky #BBBDB2 to #E8D8B0; horizon at y48%; pylons and poles smearing past; low sun glint on the horizon; a huge grey concrete freeway overpass ahead spanning y30-42%, growing fast.
3.60-4.40s THE LEFT TURN UNDER THE OVERPASS: the car dives into deep concrete shadow (exposure 15-20%) and the road curves HARD LEFT beneath the deck; the thick square columns sweep from the left edge of frame to the right edge one after another, the whole world swinging left-to-right through about 80 degrees, the horizon tilting 6 degrees with body roll, the columns smearing into vertical grey streaks; bright daylight slots flicker between them.
4.40-4.80s bursting out from under the overpass into bright day, exposure 62%, sky #E4E3D3 not clipped; white zebra crosswalk flashing under the bonnet; palms and utility poles; the car begins a right turn.
4.80-6.00s THE SWEEP, THE STOP AND THE BOUNCE: from 4.80 to 5.40s one strong fast sweep from left to right, panning across more than a full frame width of busy street (shopfronts, palm trunks, poles, parked cars, pedestrians, colourful signs) streaming right-to-left in heavy horizontal blur; from 5.40 to 5.70s the sweep brakes hard with a smooth ease-out and no overshoot onto a freestanding blue-and-white walk-up kiosk standing alone straight ahead in the middle of the frame, the car pointing directly at its service window; at 5.70s a full stop; from 5.70 to 5.90s one clearly visible lowrider hydraulic bounce, the whole frame dropping 5% and springing back; from 5.90 to 6.00s dead still and perfectly sharp.

KIOSK (final frame): freestanding boxy walk-up magazine-and-snack kiosk centred at x10-90%, y12-70%; royal-blue lower band #2456A0 at y52-70%; blue awning on top; cream window frames; glass packed with colourful magazines; service window centred at x50%, y35-52%; two people at the window; orange bollards at the left; nothing between the kiosk and the bonnet.

SOUND: 95 BPM West-Coast soul groove (round bass, talkbox, Rhodes, vinyl crackle) over V8 idle from 0.00s; neon buzz at 0.37s; rev, whoosh and beat drop at 0.85s; doppler swishes from 1.30s; tunnel roar and reverb at 2.40s; airy riser on the dissolve at 2.80s; deep concrete boom and echoing V8 under the overpass at 3.60s, with a tyre squeal through the left turn; bright impact at 4.40s; rising whoosh and street-noise rush through the sweep from 4.80s; sharp tyre chirp at the stop at 5.70s; hydraulic "pssh-thunk" on the bounce at 5.75s; music rings out to 6.00s.

FINAL FRAME at 6.00s: car fully stopped, dead still and completely sharp, seen from the outside hood camera with no glass; the freestanding blue-and-white kiosk centred straight ahead with its service window at x50%; two customers at the window; orange bollards at the left; cool blue shade at exposure 38%; glossy mint #4FBF8F bonnet across the bottom 22% with its crest at y78%; chrome V ornament at x50%, y70-80%, pointing straight at the window; chrome headlamp pods in both bottom corners; level horizon; fine grain.
```
