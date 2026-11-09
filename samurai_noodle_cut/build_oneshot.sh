#!/usr/bin/env bash
# 3.0s one-take "wuxia" version (72 frames @24fps, 1080x1920):
# sword points at the bowl -> slashed -> broken tip becomes chopsticks
# -> right-panel chopsticks lift soba and hang it on the samurai's broken-sword chopsticks
# -> right chopsticks pull away -> samurai eats.
# Usage: build_oneshot.sh <V1.mp4> <V2.mp4> <V3.mp4> <out_dir>
set -euo pipefail
V1=$1; V2=$2; V3=$3; OUT=$4
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
FONT=/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf

python3 "$HERE/slash_overlay.py" "$TMP/slash_%02d.png"
python3 "$HERE/sfx_oneshot.py" "$OUT/samurai_oneshot_sfx_stem.wav"

# Hand-off shot: key V3's chopsticks+noodle bundle, fly it onto the sword-chopsticks in a V2 plate.
mkdir -p "$TMP/v3raw" "$TMP/plate"
ffmpeg -v error -y -i "$V3" -frames:v 14 "$TMP/v3raw/%03d.png"
ffmpeg -v error -y -i "$V2" -vf "select='between(n,96,105)'" -vsync 0 "$TMP/plate/%03d.png"
python3 "$HERE/noodle_bundle.py" "$TMP/v3raw" "$TMP/bund"
python3 "$HERE/feed_shot.py" "$TMP/plate" "$TMP/bund" "$TMP/feed"

# Shot list (source @24fps -> global frames):
#  A   V1 f56-69        1x   sword lowered onto the bowl, slow push-in        -> f0-13   (slash streak f12-16)
#  B1a V2 f0-7          1x   HIT: tip pieces fly off, shocked face            -> f14-21  (flash f14-15, shake f14-20)
#  B1b V2 f8-63         ~11x shock hold, speed ramp                          -> f22-27
#  B2  V2 f76-94        2x   broken tip straightens into chopsticks           -> f28-37
#  D   hand-off shot    --   right chopsticks lift soba, hang it on the       -> f38-57
#                            sword-chopsticks (lands f49), pull away (f50-54)
#  C   V3 f0-16         1x   samurai eats (3f dissolve in)                    -> f55-71
UP="scale=1080:1920:flags=lanczos,setsar=1"
ffmpeg -v error -y -i "$V1" -i "$V2" -i "$V3" -i "$OUT/samurai_oneshot_sfx_stem.wav" \
  -framerate 24 -start_number 0 -i "$TMP/slash_%02d.png" \
  -framerate 24 -start_number 0 -i "$TMP/feed/%03d.png" -filter_complex "
[0:v]trim=start_frame=56:end_frame=70,setpts=PTS-STARTPTS,$UP,
 scale=w='trunc(1080*(1+0.002*n)/2)*2':h='trunc(1920*(1+0.002*n)/2)*2':eval=frame:flags=lanczos,crop=1080:1920[A];
[1:v]split=3[v2a][v2b][v2c];
[v2a]trim=start_frame=0:end_frame=8,setpts=PTS-STARTPTS,$UP[B1a];
[v2b]trim=start_frame=8:end_frame=70,setpts=PTS-STARTPTS,select='not(mod(n\,11))',setpts=N/24/TB,$UP[B1b];
[v2c]trim=start_frame=76:end_frame=96,setpts=PTS-STARTPTS,select='not(mod(n\,2))',setpts=N/24/TB,$UP[B2];
[5:v]$UP,setpts=N/24/TB[D];
[A][B1a][B1b][B2][D]concat=n=5:v=1:a=0,fps=24,settb=1/24,format=yuv420p[AB];
[2:v]trim=start_frame=0:end_frame=17,setpts=PTS-STARTPTS,$UP,
 scale=w='trunc(1080*(1+0.0015*n)/2)*2':h='trunc(1920*(1+0.0015*n)/2)*2':eval=frame:flags=lanczos,crop=1080:1920,fps=24,settb=1/24,format=yuv420p[C];
[AB][C]xfade=transition=fade:duration=0.125:offset=2.291667[ABC];
[4:v]setpts=PTS+12/24/TB,format=rgba[sl];
[ABC][sl]overlay=0:0:eof_action=pass[S1];
[S1]drawbox=x=0:y=0:w=iw:h=ih:color=white@0.75:t=fill:enable='eq(n,14)',
 drawbox=x=0:y=0:w=iw:h=ih:color=white@0.30:t=fill:enable='eq(n,15)',
 scale=1124:1998:flags=lanczos,
 crop=1080:1920:x='22+if(between(n,14,20),20*sin(n*2.3)*(21-n)/7,0)':y='39+if(between(n,14,20),14*cos(n*3.1)*(21-n)/7,0)',
 drawtext=fontfile=$FONT:text='TASTE':fontsize='170*min(1,0.55+max(0,t-2.5)*6)':fontcolor=0xE3241B:borderw=9:bordercolor=white:x=64:y=h-170-th:enable='gte(t,2.5)',
 format=yuv420p[v]" \
  -map "[v]" -map 3:a -frames:v 72 -c:v libx264 -preset slow -crf 15 -r 24 -c:a aac -b:a 256k -t 3 -movflags +faststart \
  "$OUT/samurai_oneshot_3s_1080x1920.mp4"
rm -rf "$TMP"
