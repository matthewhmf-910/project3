#!/usr/bin/env bash
# Extract analysis material from a video across its full duration.
# Usage: extract_frames.sh <video_path> <out_dir>
set -euo pipefail

VIDEO="${1:?usage: extract_frames.sh <video_path> <out_dir>}"
OUT="${2:?usage: extract_frames.sh <video_path> <out_dir>}"
mkdir -p "$OUT/uniform" "$OUT/scenes"

# --- Probe -----------------------------------------------------------------
ffprobe -v error -show_entries \
  format=duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames,sample_rate,channels,display_aspect_ratio \
  -of default=noprint_wrappers=1 "$VIDEO" > "$OUT/probe.txt"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO" | head -n1 || true)

# --- Uniform samples: ~2 fps, capped at 60 frames ---------------------------
N=$(awk -v d="$DUR" 'BEGIN{n=int(d*2); if(n<12)n=12; if(n>60)n=60; print n}')
STEP=$(awk -v d="$DUR" -v n="$N" 'BEGIN{printf "%.4f", d/n}')
for i in $(seq 0 $((N-1))); do
  T=$(awk -v s="$STEP" -v i="$i" 'BEGIN{printf "%.3f", s*i + s/2}')
  ffmpeg -v error -y -ss "$T" -i "$VIDEO" -frames:v 1 -vf "scale='min(960,iw)':-2" \
    "$OUT/uniform/$(printf '%03d' "$i")_t${T}s.png"
done
# Always grab the true final frame
ffmpeg -v error -y -sseof -0.1 -i "$VIDEO" -frames:v 1 -update 1 -vf "scale='min(960,iw)':-2" "$OUT/uniform/999_final.png" || true

# --- Scene cuts -------------------------------------------------------------
# Start strict; soft-cut / UI-heavy videos often need a lower threshold.
for TH in 0.25 0.12 0.06; do
  ffmpeg -v info -i "$VIDEO" -vf "select='gt(scene,${TH})',showinfo" -an -f null - 2>&1 \
    | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 > "$OUT/scenes.txt" || true
  [ -s "$OUT/scenes.txt" ] && break
done
echo "# threshold=${TH}" >> "$OUT/probe.txt"
while read -r T; do
  [ -z "$T" ] && continue
  T=$(awk -v t="$T" 'BEGIN{printf "%.3f", t}')
  ffmpeg -v error -y -ss "$T" -i "$VIDEO" -frames:v 1 -vf "scale='min(960,iw)':-2" "$OUT/scenes/cut_${T}s.png"
done < "$OUT/scenes.txt"

# --- Contact sheet ------------------------------------------------------------
COLS=6
ROWS=$(( (N + COLS - 1) / COLS ))
FPS_SHEET=$(awk -v n="$N" -v d="$DUR" 'BEGIN{printf "%.4f", n/d}')
ffmpeg -v error -y -i "$VIDEO" -vf "fps=${FPS_SHEET},scale=320:-2,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.6,tile=${COLS}x${ROWS}" \
  -frames:v 1 "$OUT/contact_sheet.png" 2>/dev/null \
  || ffmpeg -v error -y -i "$VIDEO" -vf "fps=${FPS_SHEET},scale=320:-2,tile=${COLS}x${ROWS}" -frames:v 1 "$OUT/contact_sheet.png"

# --- Palettes per quarter -----------------------------------------------------
for q in 0 1 2 3; do
  S=$(awk -v d="$DUR" -v q="$q" 'BEGIN{printf "%.3f", d*q/4}')
  L=$(awk -v d="$DUR" 'BEGIN{printf "%.3f", d/4}')
  ffmpeg -v error -y -ss "$S" -t "$L" -i "$VIDEO" -vf "palettegen=max_colors=16:stats_mode=full,scale=256:-1:flags=neighbor" \
    -frames:v 1 "$OUT/palette_q$((q+1)).png" || true
done

# --- Audio stats ---------------------------------------------------------------
if [ -n "$HAS_AUDIO" ]; then
  {
    echo "== loudness (ebur128 summary) =="
    ffmpeg -v info -i "$VIDEO" -af ebur128 -f null - 2>&1 | sed -n '/Summary:/,$p'
    echo "== silences (< -40dB, >= 0.3s) =="
    ffmpeg -v info -i "$VIDEO" -af silencedetect=n=-40dB:d=0.3 -f null - 2>&1 | grep -E 'silence_(start|end)' || echo "none"
    echo "== per-0.5s RMS level (dB) =="
    SR=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$VIDEO")
    ffmpeg -v info -i "$VIDEO" -af "asetnsamples=n=$((SR / 2)),astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 \
      | awk -F'pts_time:|RMS_level=' '/pts_time:/{t=$2} /RMS_level=/{printf "%ss %.1f\n", t, $2}' || true
  } > "$OUT/audio.txt"
else
  echo "no audio stream" > "$OUT/audio.txt"
fi

echo "duration=${DUR}s uniform_frames=${N} scene_cuts=$(wc -l < "$OUT/scenes.txt") out=${OUT}"
