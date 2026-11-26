#!/bin/sh
# THE LAST CUP — one command from source to finished film.
#   sh build.sh            → the-last-cup.mp4, poster.jpg, dist-preview/index.html, qa/*
# Needs: Node 20+, ffmpeg, Python 3.11+ with numpy, scipy, soundfile, pillow (PY=… to choose the interpreter).
# No GPU? WebGL runs through SwiftShader (REMOTION_GL=swangle, the default). With a GPU: REMOTION_GL=angle.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE"
PY=${PY:-python3}
[ -d node_modules ] || npm ci

node scripts/export-timeline.mjs           # src/timeline.ts → audio/timeline.json (one source of truth)
"$PY" audio/mix.py                         # score + foley → out/mix.wav
sh scripts/master-audio.sh                 # −14 LUFS → public/audio/the-last-cup.m4a
node scripts/render.mjs --concurrency 3    # 300 frames → out/video.mp4
sh scripts/master.sh                       # grain, mux, poster → the-last-cup.mp4, poster.jpg
npx vite build --config preview/vite.config.ts   # interactive preview → dist-preview/index.html
"$PY" scripts/qa.py && node scripts/qa-preview.mjs   # visual QA → qa/
