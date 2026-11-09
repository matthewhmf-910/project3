#!/usr/bin/env bash
# 3.0s one-take "wuxia" version (72 frames @24fps, 1080x1920):
# sword points at the bowl -> slashed -> broken tip becomes chopsticks -> eats noodles.
# Usage: build_oneshot.sh <V1.mp4> <V2.mp4> <V3.mp4> <out_dir>
set -euo pipefail
V1=$1; V2=$2; V3=$3; OUT=$4
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
FONT=/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf

python3 "$HERE/slash_overlay.py" "$TMP/slash_%02d.png"
python3 "$HERE/sfx_oneshot.py" "$OUT/samurai_oneshot_sfx_stem.wav"

# Shot list (source @24fps -> global frames):
#  A   V1 f52-69  1x   sword lowered onto the bowl, slow push-in        -> f0-17   (slash streak f16-20)
#  B1a V2 f0-8    1x   HIT: tip pieces fly off, shocked face            -> f18-26  (flash f18-19, shake f18-24)
#  B1b V2 f9-74   6x   shock hold, speed ramp                           -> f27-37
#  B2  V2 f76-105 2x   broken tip straightens into two chopsticks       -> f38-52
#  C   V3 f0-22   1x   chopsticks lift soba, happy (4f whip-blur xfade) -> f49-71
UP="scale=1080:1920:flags=lanczos,setsar=1"
ffmpeg -v error -y -i "$V1" -i "$V2" -i "$V3" -i "$OUT/samurai_oneshot_sfx_stem.wav" \
  -framerate 24 -start_number 0 -i "$TMP/slash_%02d.png" -filter_complex "
[0:v]trim=start_frame=52:end_frame=70,setpts=PTS-STARTPTS,$UP,
 scale=w='trunc(1080*(1+0.002*n)/2)*2':h='trunc(1920*(1+0.002*n)/2)*2':eval=frame:flags=lanczos,crop=1080:1920[A];
[1:v]split=3[v2a][v2b][v2c];
[v2a]trim=start_frame=0:end_frame=9,setpts=PTS-STARTPTS,$UP[B1a];
[v2b]trim=start_frame=9:end_frame=75,setpts=PTS-STARTPTS,select='not(mod(n\,6))',setpts=N/24/TB,$UP[B1b];
[v2c]trim=start_frame=76:end_frame=106,setpts=PTS-STARTPTS,select='not(mod(n\,2))',setpts=N/24/TB,$UP[B2];
[A][B1a][B1b][B2]concat=n=4:v=1:a=0,fps=24,settb=1/24,format=yuv420p[AB];
[2:v]trim=start_frame=0:end_frame=23,setpts=PTS-STARTPTS,$UP,
 scale=w='trunc(1080*(1+0.0015*n)/2)*2':h='trunc(1920*(1+0.0015*n)/2)*2':eval=frame:flags=lanczos,crop=1080:1920,fps=24,settb=1/24,format=yuv420p[C];
[AB][C]xfade=transition=hblur:duration=0.166667:offset=2.041667[ABC];
[4:v]setpts=PTS+16/24/TB,format=rgba[sl];
[ABC][sl]overlay=0:0:eof_action=pass[S1];
[S1]drawbox=x=0:y=0:w=iw:h=ih:color=white@0.75:t=fill:enable='eq(n,18)',
 drawbox=x=0:y=0:w=iw:h=ih:color=white@0.30:t=fill:enable='eq(n,19)',
 scale=1124:1998:flags=lanczos,
 crop=1080:1920:x='22+if(between(n,18,24),20*sin(n*2.3)*(25-n)/7,0)':y='39+if(between(n,18,24),14*cos(n*3.1)*(25-n)/7,0)',
 drawtext=fontfile=$FONT:text='TASTE':fontsize='170*min(1,0.55+max(0,t-2.3)*6)':fontcolor=0xE3241B:borderw=9:bordercolor=white:x=64:y=h-170-th:enable='gte(t,2.3)',
 format=yuv420p[v]" \
  -map "[v]" -map 3:a -frames:v 72 -c:v libx264 -preset slow -crf 15 -r 24 -c:a aac -b:a 256k -t 3 -movflags +faststart \
  "$OUT/samurai_oneshot_3s_1080x1920.mp4"
rm -rf "$TMP"
