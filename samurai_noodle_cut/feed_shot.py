"""Build the 20-frame continuous right-to-left noodle pass at native 720x1280.
One unbroken move, no stops: the right panel's chopsticks lift the soba out of the bowl, sweep it past
the samurai's broken-sword tip, carry it left across the divider and feed it into his mouth, landing
where V3's first frame has the noodles (V3 dissolves in over the last 3 frames).
The chopsticks+noodles stay one intact cutout: splitting them leaves holes in the noodle loop.
Usage: feed_shot.py <plate_dir (V2 frames)> <bundle_dir (keyed RGBA)> <out_dir>"""
import sys, os
from PIL import Image

plate_dir, bund_dir, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
plates = sorted(os.listdir(plate_dir))
bunds = sorted(os.listdir(bund_dir))

LOOP = (105, 90)                 # noodle loop centre inside the bundle crop
# path of the loop centre (native px) and bundle scale at each key point
KEYS = [((575, 575), 1.00),      # in the bowl
        ((585, 430), 1.00),      # lifted
        ((527, 548), 0.92),      # sweeps past the broken-sword tip (540,540)
        ((370, 470), 0.80),      # over the divider
        ((215, 500), 0.68)]      # at the samurai's mouth (matches V3 frame 0)
ARRIVE = 17                      # frame the noodles reach the mouth (V3 dissolves in f17-19)
N = 20

def smooth(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)

def catmull(p0, p1, p2, p3, t):
    return tuple(0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t
                        + (-a + 3 * b - 3 * c + d) * t ** 3) for a, b, c, d in zip(p0, p1, p2, p3))

def path(u):
    pts = [k[0] for k in KEYS]; sc = [k[1] for k in KEYS]
    seg = min(int(u * 4), 3); t = u * 4 - seg
    P = [pts[max(seg - 1, 0)], pts[seg], pts[seg + 1], pts[min(seg + 2, 4)]]
    return catmull(*P, t), sc[seg] + (sc[seg + 1] - sc[seg]) * t

for i in range(N):
    plate = Image.open(os.path.join(plate_dir, plates[min(i // 2, len(plates) - 1)])).convert("RGBA")
    b = Image.open(os.path.join(bund_dir, bunds[i % len(bunds)]))
    centre, scale = path(smooth(i / ARRIVE) if i < ARRIVE else 1.0)
    b = b.resize((round(b.width * scale), round(b.height * scale)), Image.LANCZOS)
    plate.alpha_composite(b, (round(centre[0] - LOOP[0] * scale), round(centre[1] - LOOP[1] * scale)))
    plate.convert("RGB").save(os.path.join(out, f"{i:03d}.png"))
