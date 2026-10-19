#!/usr/bin/env bash
# After render.mjs: mux audio, build storyboard, run checks. Writes out/verify_log.txt.
set -euo pipefail
cd "$(dirname "$0")"
python3 audio.py out/soundbed.wav
for f in 16x9 9x16 1x1; do
  ffmpeg -y -loglevel error -i out/silent_$f.mp4 -i out/soundbed.wav \
    -af "loudnorm=I=-18:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest \
    -movflags +faststart out/corner_lemon_$f.mp4
done

# Storyboard: one frame per beat from the 9:16 master.
S=out/_sb; mkdir -p $S
i=0; for t in 2.0 5.8 9.0 10.6 13.8 16.5 19.5; do
  ffmpeg -y -loglevel error -ss $t -i out/corner_lemon_9x16.mp4 -frames:v 1 -vf scale=360:-1 $S/$i.png; i=$((i+1)); done
ffmpeg -y -loglevel error -i $S/0.png -i $S/1.png -i $S/2.png -i $S/3.png -i $S/4.png -i $S/5.png -i $S/6.png \
  -filter_complex "hstack=7,pad=iw+40:ih+40:20:20:color=0xefe7da" out/storyboard.png
rm -rf $S

{
  for f in 16x9 9x16 1x1; do
    echo "== corner_lemon_$f.mp4"
    ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -show_entries format=duration -of compact out/corner_lemon_$f.mp4
    echo -n "black frames: "; ffmpeg -i out/corner_lemon_$f.mp4 -vf blackdetect=d=0.1:pix_th=0.08 -an -f null - 2>&1 | grep -c black_start || true
    ffmpeg -i out/corner_lemon_$f.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' '
  done
} > out/verify_log.txt
cat out/verify_log.txt
