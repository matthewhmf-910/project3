# THE LAST CUP

A 10-second cinematic short, generated entirely in code: every model, material, texture, light, camera move,
note and sound effect. 1080 × 1920, 30 fps, −14 LUFS.

> At the end of a quiet omakase evening, an old itamae pours the last cup of tea for his final guest — and inside
> it, the whole night glows once more before it is gone. 一期一会.

| Deliverable | Where |
|---|---|
| Film | `the-last-cup.mp4` (H.264 + AAC, 1080×1920, 30 fps) · `poster.jpg` |
| Interactive WebGL preview | `dist-preview/index.html` (one self-contained file: film player with chapters + free-camera set explorer) |
| Visual QA report | `QA_REPORT.md` (+ `qa/` contact sheets, action strips, luma graph, palette, Playwright screenshots, `report.json`) |
| Story & shot design | `TREATMENT.md` |
| Credits & licences | `CREDITS` |

## Build

```sh
npm ci
sh build.sh                 # export timeline → score → master audio → render 300 frames → grade/mux → preview → QA
```

Individual steps:

```sh
npm run studio                                   # Remotion Studio (scrub the film interactively)
node scripts/stills.mjs 0.5 4.2 7.3 9.9          # review stills → qa/stills
node scripts/render.mjs --concurrency 3          # frames → out/video.mp4 (silent)
python3 audio/mix.py && sh scripts/master.sh     # score + foley, −14 LUFS, grain, mux → the-last-cup.mp4
npm run preview:dev                              # live interactive preview (Vite)
python3 scripts/qa.py && node scripts/qa-preview.mjs
```

No GPU is needed: WebGL renders through SwiftShader (`REMOTION_GL=swangle`, about 3–4 s a frame on 4 CPU cores).
On a machine with a GPU set `REMOTION_GL=angle`. Set `REMOTION_BROWSER` to a Chrome / headless-shell binary
if Remotion cannot find one.

## How it is built

```
src/timeline.ts ── single source of truth (sections on a 72 BPM grid, cue events, world anchors)
   ├─► picture: Remotion <Composition> → <ThreeCanvas> (R3F) → Scene(t)  — every pose is a pure function of t
   │      scene/poses.ts     cup, kyusu, tea level, flow — shared by meshes, IK hands, stream and camera
   │      scene/camera.ts    three takes (pour+offer+dive / memory / rise+pull-out), Hermite splines, rack focus
   │      scene/Chef.tsx     sculptural itamae: two-bone IK arms, brows/smile/head tracks, ojigi with follow-through
   │      scene/Cup.tsx      lathe yunomi, celadon glaze, ripple-normal tea shader, tapered pour, steam shader
   │      scene/Memory.tsx   the evening inside the tea: instanced rice, marbled otoro, chawanmushi, sashimi
   │      scene/Set.tsx      hinoki counter, washi pendant, slatted wall, furin with tanzaku follow-through
   │      lib/textures.ts    every texture drawn from seeded noise (hinoki, celadon, washi, clay, fish, 一期一会)
   │      post: DepthOfField (focus target per shot) · Bloom · ChromaticAberration · AgX · Vignette
   ├─► sound: audio/mix.py reads audio/timeline.json — koto (Karplus–Strong), furin (inharmonic glass partials),
   │          pour/drips/clay/cloth/ceramic/bubbles foley, room tone, underwater bus, a real silence before the chime
   └─► master: ffmpeg grain + two-pass loudnorm −14 LUFS + mux; Playwright + ffmpeg QA
```
