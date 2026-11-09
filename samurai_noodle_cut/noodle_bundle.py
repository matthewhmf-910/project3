"""Key the chopsticks + noodle bundle out of V3's right panel (orange backdrop) as RGBA cutouts.
Usage: noodle_bundle.py <frames_dir_in> <frames_dir_out> [debug.png]
Input frames are V3 at native 720x1280. Bundle box (native px): x 470-720, y 440-760 (stops above bowl rim)."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

X0, Y0, X1, Y1 = 470, 440, 720, 696

def key(img):
    a = np.asarray(img.convert("RGB")).astype(np.float32) / 255
    crop = a[Y0:Y1, X0:X1]
    r, g, b = crop[..., 0], crop[..., 1], crop[..., 2]
    mx, mn = crop.max(-1), crop.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    # orange backdrop: strongly saturated with r >> b. Paper noodles/chopsticks: pale, low saturation.
    bg = np.clip((sat - 0.40) / 0.12, 0, 1) * np.clip((r - b - 0.30) / 0.10, 0, 1)
    alpha = 1 - bg
    alpha[:, :2] = 0  # nothing should touch the panel's left edge
    m = Image.fromarray((alpha * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    al = np.asarray(m).astype(np.float32) / 255
    h, w = al.shape
    al *= np.clip(np.arange(h)[:, None] / 1.0 * 0 + (h - 1 - np.arange(h)[:, None]) / 45, 0, 1)  # fade bottom 45px
    al *= np.clip((w - 1 - np.arange(w)[None, :]) / 25, 0, 1)                             # fade cut chopstick ends
    rgba = np.dstack([crop, al]) * 255
    return Image.fromarray(rgba.astype(np.uint8), "RGBA")

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
names = sorted(os.listdir(src))
for nme in names:
    key(Image.open(os.path.join(src, nme))).save(os.path.join(dst, nme))
if len(sys.argv) > 3:
    cut = Image.open(os.path.join(dst, names[0]))
    bgc = Image.new("RGBA", cut.size, (40, 160, 60, 255))
    Image.alpha_composite(bgc, cut).save(sys.argv[3])
