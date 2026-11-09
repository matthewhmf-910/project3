"""Build the 14-frame "feed" shot at native 720x1280:
the right panel's chopsticks lift the soba out of the bowl and carry it across the divider
to the open-mouthed samurai on the left.
Usage: feed_shot.py <plate_dir (V2 frames)> <bundle_dir (keyed RGBA)> <out_dir>"""
import sys, os, math
from PIL import Image

plate_dir, bund_dir, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
plates = sorted(os.listdir(plate_dir))
bunds = sorted(os.listdir(bund_dir))
X0, Y0 = 470, 440          # where the bundle sits in V3
N = 14

def ease(u):
    return u * u * (3 - 2 * u)

for i in range(N):
    plate = Image.open(os.path.join(plate_dir, plates[min(i // 2, len(plates) - 1)])).convert("RGBA")
    if i <= 4:                                   # lift out of the bowl
        u = ease(i / 4)
        dx, dy = 0, 40 + (-110 - 40) * u
    else:                                        # carry across the divider, arcing down to the mouth
        u = ease((i - 4) / (N - 1 - 4))
        dx = -360 * u
        dy = -110 + 80 * u - 35 * math.sin(math.pi * u)
    b = Image.open(os.path.join(bund_dir, bunds[i % len(bunds)]))
    plate.alpha_composite(b, (int(round(X0 + dx)), int(round(Y0 + dy))))
    plate.convert("RGB").save(os.path.join(out, f"{i:03d}.png"))
