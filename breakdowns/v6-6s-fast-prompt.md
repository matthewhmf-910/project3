# v6: 6-second prompt with the reference's fast-forward feel

## Fair comparison
All clips were sampled at the reference's 14.29 fps and the same 1.83:1 crop, 128×72 greyscale.

| Clip | Mean motion | Median | % near-still frames | Mean sharpness |
|---|---|---|---|---|
| Reference GIF | 17.8 | 16.9 | 10.3 % | **6.38** |
| v1 render | 16.7 | 11.4 | 23.9 % | 9.49 |
| v3 render | 20.4 | 18.1 | 9.2 % | **12.83** |

Findings:
- The reference reads as fast-forward because of heavy shutter-drag and frame-blend blur. Its sharpness is half that of the renders. Cut rate alone does not create the effect.
- v1 was slow because 24 % of its frames were near-still (diner and sunrise holds). Its average motion was not much lower than the reference.
- v5 carried slow verbs ("creeps at walking pace", "slow crawl"). It also described the whole 0.52–1.04 s beat as a hold, when only 0.61–0.99 s is near-still (source 0.49–0.80 s). v6 fixes both.

## Prompt (ready to paste)

```
STYLE: Photoreal cinematic 35mm music-video fast-forward hood-cam hyperlapse of one vintage 1960s lowrider blasting across Los Angeles from neon night through a tunnel into hazy dawn and bright day at about 15x real speed, rigid bonnet-mounted wide 24mm camera locked to the car, streets rushing at the lens like fast-forward, heavy 360-degree shutter-drag motion blur and frame-blended ghost trails smearing everything except the hood ornament and the centre vanishing point, hidden cuts inside whip-blurs, light flashes and ghost dissolves, teal-and-red neon night grade, deep sodium amber downtown, neutral grey tunnel, warm hazy dawn, clean bright day, final cool blue shade, crushed night blacks, highlights never clipped, fine film grain, neon halation.

TECH: 1920x1080, 16:9, 24 fps, 6.0 seconds, one continuous POV, 12 beats; constant fast-forward motion for the whole clip except one 0.4-second near-still moment at 0.61-0.99s; only one car exists (the camera car), no other lowrider and no exterior shots; no text overlays, no titles, no UI.

LOCKED FRAME (all beats, % of frame from top-left): glossy curved bonnet crest at y80%; chrome V-crest hood ornament on a short stalk at x50%, y68-80%, 4% of frame width, always sharp; torpedo-shaped chrome headlamp pods cropped at x0-15% and x85-100%, y82-100%; bonnet colour follows the light: #171B16, red neon reflection #632C26, night #0B1F18, tunnel #4C614C, dawn #7D8D78, day #8BC4A3, shade #58B78E.

TIMELINE:
0.00-0.52s pushing fast through a Googie diner lot at night with a slight left yaw: building at x0-45% with a red neon roofline #E0302A sloping from y38% to y55%, yellow wall #C9B44A, canopy downlights; pole sign at x52-73%, y0-55%, with a red neon circular logo, red script "original" and white bold rounded caps "DOUBLE CHEESE BURGER", mirrored in the bonnet; blurred crowd and red-and-pink classic cars at y55-80%; exposure 20% with a neon bloom flash to 28% at 0.43s.
0.52-1.04s hidden jump cut closer in; the only calm moment, almost still from 0.61 to 0.99s; sign at x50-73%, y0-38%; parked lowriders and people at y45-65%; crisp; exposure 23%.
1.04-1.61s violent acceleration and a left whip onto the street; the diner explodes into horizontal red-and-yellow light streaks across the top 30% of frame; total blur by 1.6s; exposure 22% to 16%.
1.61-2.31s black residential boulevard rushing past, exposure 10-13%, cool blue-green, fully smeared except the vanishing point at x50%, y55%; sodium lamp flare at x23%, y27%; hidden micro-cut at 1.91s.
2.31-2.66s deep amber sodium downtown (the warmest beat), exposure 13-16%; vanishing point at x60%, y55%; lamps streaking at y35-45%; double yellow line #C99A2A from lower left.
2.66-3.27s strip-lit parking floors whipping past at x0-35%, y5-50%; a bright arched tunnel portal at x45-55%, y50-58% rushing toward the lens; exposure 15-21%; cool neutral.
3.27-3.70s inside a grey concrete tunnel #6E6A60, exposure 28-31%; ceiling lights streaking from x40%, y5% into the vanishing point at x50%, y50%; strongest radial zoom blur with ghost trails.
3.70-4.14s the tunnel lights ghost-dissolve over the open dawn road; exposure 36% to 40%; the bonnet dims for a moment at 3.95s.
4.14-4.92s hazy warm dawn industrial road flying past, exposure 53-59%, sky #BBBDB2 to #E8D8B0; horizon at y50%; pylons and poles smeared into ghost streaks at the edges; skyline silhouette at x65-85%, y45-50%, with a low sun glint; the bonnet turns seafoam.
4.92-5.35s flash cut to bright day, exposure 61-65%, sky #E4E3D3 not clipped; horizon at y63%; white zebra crosswalk at y65-75% flashing under the nose; pole at x12%; the car starts a fast right turn.
5.35-5.70s hard whip-pan right; everything smears horizontally as a blue-and-white walk-up magazine stand swings in; exposure 60% to 40%; the grade cools.
5.70-6.00s the speed ramp brakes the motion as the stand fills x0-100%, y0-75%: royal-blue band #2456A0 at y55-75%, cream window frames, magazine-packed glass, two people at the window, orange bollards at x0-10%; still rolling right; blur resolving to sharp; cool shade; exposure 37%.

SOUND: 95 BPM West-Coast soul groove (round bass, talkbox, Rhodes, vinyl crackle) over V8 idle from 0.00s; neon buzz at 0.43s; rev, whoosh and beat drop at 1.04s; wind roar at 1.61s; doppler swish at 2.31s; tunnel reverb swell at 3.27s; airy riser at 3.70s; impact hit at 4.92s; whoosh at 5.35s; engine eases to idle at 5.70s; music to the end.

FINAL FRAME at 6.00s: cool-shaded blue-and-white magazine stand filling the top 75% of frame, blue band at y55-75%, two customers at the window, orange bollards at the far left, sharp with a faint right-edge smear; mint bonnet #58B78E across the bottom 20% with the crest at y80%; chrome V ornament at x50%, y68-80%; chrome headlamp pods in both lower corners; exposure 37%; fine grain.
```
