# Coolest Coffee — Iced Lemon Coffee (15 s motion reel)

A 15-second, low-angle motion piece showing how an iced lemon coffee is made at a corner café on a Taiwanese street. It ends on an animated version of the original *Coolest Coffee* poster.

**Watch:** `ice-lemon-coffee-reel.mp4` (1920×1080, 30 fps, H.264 + AAC stereo)

Everything is procedural: no stock footage, images, or samples. The picture is a deterministic `renderAt(t)` on an HTML canvas. The sound is synthesized in NumPy.

## Shot list (cuts land on a 96 BPM beat grid, 0.625 s)

| Time | Shot | Motion-design notes |
|---|---|---|
| 0.00–3.13 | **Street corner, Taiwan.** A worm's-eye dolly toward a chamfered corner building: vertical signboards (冰檸檬咖啡, 牙科診所, 早餐…), iron window grilles, AC units, balcony undersides, tangled power lines, a 慢 road marking, and passing and parked scooters. The rolling shutter rises. | A real 3D camera (yaw, pitch, roll, near-plane clipping) with three-point low-angle perspective. Sign textures are mapped as perspective-subdivided affine quads. The shop window is a live **portal**: the café shot renders through the glass and fills the frame as the camera flies in. |
| 3.13–5.00 | **01 ICE 冰塊.** Six cubes drop into the tumbler. | Camera at counter height. Impacts fall on 16th notes, each with a micro-shake and glints. Condensation forms on the glass. |
| 5.00–6.25 | **02 LEMON 檸檬.** A knife-slash wipe splits the frame. A graphic slow-motion lemon cut follows, with a Pingtung marquee band. | Wheels fly out on exponential slow-motion curves with 3D flips. Juice droplets are oriented along their velocity. |
| 6.25–7.50 | Whip pan back to the glass. The lemon wheel drops in and juice pours from a jigger. Soda bubbles rise. | |
| 7.50–8.75 | **03 ESPRESSO 濃縮咖啡.** A lemon-wheel iris (the segments are windows) opens on a looking-up view of the group head. The 9-bar gauge springs, a tiger-striped double shot pours, and the data readout counts up. | |
| 8.75–10.0 | Whip down. Espresso blooms through the lemon soda like ink in water. | Plumes render to a half-res buffer and are blurred, then multiplied in. The colour change runs top-down. |
| 10.0–12.3 | **04 COLD FOAM 奶蓋.** A steel pitcher pours the cream cap. A dried-lemon wheel drops and the spoon slides in. | |
| 12.3–15.0 | **Poster reveal.** Ripple rings (terracotta → sage → paper) wipe to the end card. The camera cranes up from low angle to the poster's ¾ hero view, showing the lemon wheel resting on the foam. COOLEST / COFFEE, the rotating badge, and the vertical tagline animate in. | The music resolves to Cmaj9 as COOLEST lands. |

Finish: 6–10 sub-frame accumulation motion blur (180° shutter, 360° on transitions), animated film grain, vignette, a golden-hour grade on the street, and a HUD with step progress and timecode.

## Rebuild

```bash
npm i @fontsource/anton @fontsource/cormorant-garamond @fontsource/work-sans \
      @fontsource/space-mono @fontsource/noto-sans-tc @fontsource/noto-serif-tc   # anywhere
node tools/build-fonts.mjs <that>/node_modules     # subsets only the glyphs the piece uses -> fonts/
node tools/render.mjs video out_silent.mp4          # Playwright + ffmpeg, frame-accurate
python3 tools/sound.py audio.wav                    # NumPy soundtrack
ffmpeg -i out_silent.mp4 -i audio.wav -c:v copy -c:a aac -b:a 256k -shortest ice-lemon-coffee-reel.mp4
```

Open `index.html` in a browser to watch it play live in real time (single-sample, no motion blur).
`node tools/render.mjs stills <dir> 1.8,4.6,14.9 1` renders individual frames.

Fonts: Anton, Cormorant Garamond, Work Sans, Space Mono, Noto Sans TC, and Noto Serif TC (all SIL OFL 1.1, via @fontsource).
