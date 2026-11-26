#!/bin/sh
# Master: grain in ffmpeg (keeps the render compressible), two-pass loudnorm to -14 LUFS / -1 dBTP, mux, poster.
# sh scripts/master.sh [out/video.mp4] [out/mix.wav]
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
VIDEO=${1:-$HERE/out/video.mp4}
MIX=${2:-$HERE/out/mix.wav}
FINAL=$HERE/the-last-cup.mp4
cd "$HERE"

sh "$HERE/scripts/master-audio.sh" "$MIX"

# grain: temporal, fine, gentle (light scenes); encode for delivery
ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" -i out/mix_norm.wav \
  -filter_complex "[0:v]noise=c0s=5:c0f=t+u:c1s=2:c1f=t+u:c2s=2:c2f=t+u,format=yuv420p[v]" \
  -map "[v]" -map 1:a -r 30 -c:v libx264 -preset slow -crf 17 -tune grain -profile:v high -level 4.2 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$FINAL"

# poster: the final composition (title, bow, the empty cup)
ffmpeg -hide_banner -loglevel error -y -ss 9.9 -i "$FINAL" -frames:v 1 -q:v 2 poster.jpg

echo "final: $FINAL"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of compact "$FINAL"
ffmpeg -hide_banner -nostats -i "$FINAL" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:" | grep -E "I:|LRA:|Peak:"
