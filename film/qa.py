"""Measured quality bar for a render: python3 film/qa.py dist/film

Reports exact duration / size / fps, frozen stretches, safe-zone collisions,
text contrast and brand-colour match. Exit code 1 if a hard limit fails.
"""
import json
import os
import re
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image

out = sys.argv[1]
fail = []

# 1. exact duration, size, frame rate
info = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-i", os.path.join(out, "reel.mp4")], capture_output=True, text=True).stderr
dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
seconds = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
size = re.search(r", (\d{3,5})x(\d{3,5})", info)
fps = re.search(r"([\d.]+) fps", info)
print(f"duration {seconds:.3f}s  size {size[1]}x{size[2]}  fps {fps[1]}")
if abs(seconds - 10) > 0.034 or size[0] != ", 1080x1920" or float(fps[1]) != 30:
    fail.append("format")

# 2. frozen frames: consecutive-frame difference on a downscaled luma copy
frames_dir = os.path.join(out, "frames")
files = sorted(os.listdir(frames_dir))
lum = [np.asarray(Image.open(os.path.join(frames_dir, f)).convert("L").resize((270, 480)), np.float32) for f in files]
diff = np.array([np.abs(a - b).mean() for a, b in zip(lum, lum[1:])])
still = diff < 0.15  # below visible change
runs, start = [], None
for i, s in enumerate(list(still) + [False]):
    if s and start is None:
        start = i
    elif not s and start is not None:
        runs.append((start, i)); start = None
frozen = sum(b - a for a, b in runs) / 30
long_runs = [(a / 30, b / 30) for a, b in runs if (b - a) / 30 > 0.5]
print(f"frozen total {frozen:.2f}s (limit <{seconds / 30:.2f}s)  stills >0.5s: {long_runs or 'none'}")
if frozen >= seconds / 30 or long_runs:
    fail.append("frozen")

# 2b. flash frames: one frame unlike both neighbours while the neighbours agree
# (catches layers dropped by a capture race, a bad sub-sample, or a pop)
pair = np.array([np.abs(a - b).mean() for a, b in zip(lum, lum[2:])])  # n-1 vs n+1
flashes = [i + 1 for i in range(len(pair)) if diff[i] > 6 and diff[i + 1] > 6 and pair[i] < 0.35 * min(diff[i], diff[i + 1])]
print("flash frames:", [f"#{n} ({n / 30:.2f}s)" for n in flashes] or "none")
if flashes:
    fail.append("flash frames")

# 2c. picture sync: each hit's motion event sits within one frame of film/timing.json.
# The event frame is the largest change in a +-4-frame window (contact / impact).
timing = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "timing.json")))
for k in ("catch", "strike", "splash", "stamp"):
    n0 = round(timing["hits"][k]["t"] * 30)
    lo, hi = max(1, n0 - 4), min(len(diff) - 1, n0 + 4)
    peak = lo + int(np.argmax(diff[lo - 1:hi])) # diff[i] is change from frame i to i+1
    off = peak - n0
    print(f"picture sync {k:7s}: event frame #{peak} vs beat frame #{n0} ({off:+d} frames)")
    if abs(off) > 1:
        fail.append("picture sync " + k)

# 3. safe zones (9:16 platform UI): top 11.5%, bottom 20%, right 13% of the lower half
rects = json.load(open(os.path.join(out, "rects.json")))["rects"]
def unsafe(r):
    return r["y"] < 221 or r["y"] + r["h"] > 1536 or (r["x"] + r["w"] > 940 and r["y"] + r["h"] > 960) or r["x"] < 0 or r["x"] + r["w"] > 1080
hits = {}
for n, rs in rects.items():
    for r in rs:
        if r["label"].startswith("brand:"):
            continue
        if r["x"] + r["w"] <= 0 or r["x"] >= 1080 or r["y"] + r["h"] <= 0 or r["y"] >= 1920:
            continue  # entirely off screen: not in any UI zone
        if unsafe(r):
            hits.setdefault(r["label"].split(" ")[0], []).append(int(n))
for label, ns in sorted(hits.items()):
    print(f"safe-zone: {label} outside on {len(ns)} frames ({min(ns) / 30:.2f}-{max(ns) / 30:.2f}s)")
# end card = from 9.4 s, once everything has arrived; action = the lemon and the wheel at any time.
# Letters mid-action are allowed to be cropped by close framing, so they are reported, not failed.
endcard = {k: [n for n in v if n >= 282] for k, v in hits.items() if k.startswith(("copy", "stamp", "letter"))}
endcard = {k: v for k, v in endcard.items() if v}
action = {k: v for k, v in hits.items() if k.startswith("action")}
if endcard:
    fail.append("safe-zone on end card")
if action:
    fail.append("safe-zone on key action")
print("end card (9.4-10s) inside safe area:", "no " + str(sorted(endcard)) if endcard else "yes")
print("key action (lemon, wheel) inside safe area:", "no " + str(sorted(action)) if action else "yes")

# 4. contrast of end-card text on its actual background
def lin(c):
    c = c / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def L(rgb):
    r, g, b = lin(np.array(rgb, np.float64))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
last = np.asarray(Image.open(os.path.join(frames_dir, files[-1])).convert("RGB"), np.float64)
kicker = [r for r in rects[str(len(files) - 1)] if "kicker" in r["label"]]
if kicker:
    k = kicker[0]
    patch = last[int(k["y"]):int(k["y"] + k["h"]), int(k["x"]):int(k["x"] + k["w"])].reshape(-1, 3)
    bg = np.median(patch[patch.sum(1) > np.percentile(patch.sum(1), 60)], 0)
    terracotta = (0xA3, 0x48, 0x1E)
    ratio = (max(L(bg), L(terracotta)) + 0.05) / (min(L(bg), L(terracotta)) + 0.05)
    print(f"contrast kicker #A3481E on {tuple(int(x) for x in bg)}: {ratio:.2f}:1 (need >=4.5)")
    if ratio < 4.5:
        fail.append("contrast")

# 5. brand colours in the last frame: median of token-like pixels (median, so the
# wood and foam that share hues with terracotta do not drag the reading)
px = last.reshape(-1, 3)
tr = [r for r in rects[str(len(files) - 1)] if r["label"] == "brand:terracotta"]
if tr:  # terracotta: read only inside its own shape's box
    t = tr[0]
    box = last[max(0, int(t["y"])):int(t["y"] + t["h"]), max(0, int(t["x"])):int(t["x"] + t["w"])].reshape(-1, 3)
for name, tok, src in [("sage #7A8666", (0x7A, 0x86, 0x66), px), ("terracotta #A3481E", (0xA3, 0x48, 0x1E), box if tr else px),
                       ("ivory #F4EFE6", (0xF4, 0xEF, 0xE6), px)]:
    d = np.sqrt(((src - tok) ** 2).sum(1))
    near = src[d < 40]
    med = np.median(near, 0) if len(near) else None
    off = np.sqrt(((med - tok) ** 2).sum()) if med is not None else 999
    print(f"brand {name}: median {tuple(int(x) for x in med)} off by {off:.1f} RGB ({len(near)} px)")
    if off > 12:
        fail.append("brand " + name)

print("RESULT:", "PASS" if not fail else "FAIL " + ", ".join(fail))
sys.exit(1 if fail else 0)
