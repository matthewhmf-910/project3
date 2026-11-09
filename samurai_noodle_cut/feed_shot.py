"""Build the 20-frame hand-off shot at native 720x1280:
the right panel's chopsticks lift the soba out of the bowl, glide over and hang it on the
samurai's broken-sword chopsticks, then pull back out of frame, leaving the noodles on his sword.
Usage: feed_shot.py <plate_dir (V2 frames)> <bundle_dir (keyed RGBA)> <out_dir>"""
import sys, os
from PIL import Image, ImageDraw

plate_dir, bund_dir, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
plates = sorted(os.listdir(plate_dir))
bunds = sorted(os.listdir(bund_dir))

ORIG = (470, 440)          # bundle top-left as it sits in V3
TARGET = (400, 470)        # puts the noodle loop on the samurai's upper sword-chopstick near its tip (540,540)
# Right-panel chopsticks (bundle-crop coords) past the noodle loop -> this part pulls away.
STICKS_POLY = [(148, 52), (250, 20), (250, 88), (148, 104)]
WITHDRAW_DIR = (0.92, -0.39)   # along the chopsticks' own axis, up and to the right
N = 20

def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)

def split(b):
    m = Image.new("L", b.size, 0)
    ImageDraw.Draw(m).polygon(STICKS_POLY, fill=255)
    sticks = Image.new("RGBA", b.size, (0, 0, 0, 0))
    sticks.paste(b, (0, 0), Image.composite(b.getchannel("A"), Image.new("L", b.size, 0), m))
    noodles = b.copy()
    a = noodles.getchannel("A")
    noodles.putalpha(Image.composite(Image.new("L", b.size, 0), a, m))
    return sticks, noodles

def lerp(p, q, u):
    return (p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u)

HIGH = (470, 330)
for i in range(N):
    plate = Image.open(os.path.join(plate_dir, plates[min(i // 2, len(plates) - 1)])).convert("RGBA")
    sticks, noodles = split(Image.open(os.path.join(bund_dir, bunds[i % len(bunds)])))
    w = 0.0                                                  # chopsticks withdraw distance
    if i <= 3:                                               # lift out of the bowl
        pos = lerp((ORIG[0], ORIG[1] + 40), HIGH, ease(i / 3))
    elif i <= 10:                                            # glide down onto the sword tip
        pos = lerp(HIGH, (TARGET[0], TARGET[1] + 10), ease((i - 3) / 7))
    elif i == 11:                                            # settle (tiny bounce)
        pos = (TARGET[0], TARGET[1] - 4)
    else:
        pos = TARGET
        w = 320 * ease((i - 12) / 4)                         # f12-16 chopsticks pull out of frame
    sway = 3 if i in (13, 15) else (-2 if i in (14, 16) else 0)
    npos = (int(round(pos[0])), int(round(pos[1] + (sway if i >= 12 else 0))))
    spos = (int(round(pos[0] + WITHDRAW_DIR[0] * w)), int(round(pos[1] + WITHDRAW_DIR[1] * w)))
    plate.alpha_composite(noodles, npos)
    if w < 320:
        plate.alpha_composite(sticks, spos)
    plate.convert("RGB").save(os.path.join(out, f"{i:03d}.png"))
