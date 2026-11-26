#!/bin/sh
# Audio master: two-pass loudnorm to -14 LUFS / -1 dBTP → out/mix_norm.wav and public/audio/the-last-cup.m4a
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
MIX=${1:-$HERE/out/mix.wav}
cd "$HERE"
mkdir -p public/audio
# pass 1: measure loudness
J=$(ffmpeg -hide_banner -nostats -i "$MIX" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$J" | grep input_i | grep -o '[-0-9.]*')
mtp=$(echo "$J" | grep input_tp | grep -o '[-0-9.]*')
mlra=$(echo "$J" | grep input_lra | grep -o '[-0-9.]*')
mth=$(echo "$J" | grep input_thresh | grep -o '[-0-9.]*')
off=$(echo "$J" | grep target_offset | grep -o '[-0-9.]*')
echo "measured: I=$mi TP=$mtp LRA=$mlra"
# pass 2: linear normalisation to the target, resampled back to 48 kHz, AAC
ffmpeg -hide_banner -loglevel error -y -i "$MIX" \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000" \
  -c:a pcm_s16le out/mix_norm.wav
ffmpeg -hide_banner -loglevel error -y -i out/mix_norm.wav -c:a aac -b:a 192k public/audio/the-last-cup.m4a

