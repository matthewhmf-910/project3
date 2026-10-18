"""Build the layered transparent PNG set named in HANDOFF.md section 1.

The handoff lists 4K transparent PNGs that were never delivered, so this
script derives stand-ins from the approved artwork in assets/_source/:

  poster_hero.png  -> 01 cup, 02 spoon, 03 coaster, 04/05 type (segmented / keyed)
  props_sheet.png  -> 12 whole lemon (props panel A)
  storefront.jpg   -> 1000355615.png
  (generated)      -> 06 stamp, 07 sage, 08 terracotta, 11 ivory paper

Every layer is trimmed to its own bounding box. Placement on the 1536 x 1326
poster canvas is written to assets/manifest.js so the page can re-assemble the
poster exactly. Dropping real 4K PNGs over these files keeps working as long
as each asset keeps the same framing (the page scales by percentage).

Requires: pip install rembg opencv-python-headless pillow numpy scipy
Models (~550 MB, cached in ~/.u2net): isnet-general-use, sam_vit_b_01ec64.
Fonts are downloaded to tools/.cache on first run.

Usage: python3 tools/build_assets.py
"""

import json
import math
import os
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from rembg import new_session, remove
from scipy.ndimage import gaussian_filter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "_source")
OUT = os.path.join(ROOT, "assets")
CACHE = os.path.join(ROOT, "tools", ".cache")

CANVAS_W, CANVAS_H = 1536, 1326  # poster_hero.png, the composition authority

# HANDOFF.md section 2 tokens
CHARCOAL = (0x2C, 0x23, 0x18)
TERRACOTTA = (0xA3, 0x48, 0x1E)
SAGE = (0x7A, 0x86, 0x66)
IVORY = (0xF4, 0xEF, 0xE6)

FONTS = {
    "NotoSerifTC-Bold.otf": "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/SubsetOTF/TC/NotoSerifTC-Bold.otf",
    "Jost.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf",
}

rng = np.random.default_rng(7)
manifest = {"canvas": {"w": CANVAS_W, "h": CANVAS_H}, "layers": {}}


# ---------------------------------------------------------------- helpers

def font(name, size):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        urllib.request.urlretrieve(FONTS[name], path)
    return ImageFont.truetype(path, size)


def largest_component(mask):
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if n <= 1:
        return mask
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return labels == idx


def fill_holes(mask):
    m = mask.astype(np.uint8) * 255
    h, w = m.shape
    flood = m.copy()
    cv2.floodFill(flood, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255)
    return (m | cv2.bitwise_not(flood)) > 0


def hull(mask):
    pts = cv2.findNonZero(mask.astype(np.uint8))
    out = np.zeros(mask.shape, np.uint8)
    cv2.fillConvexPoly(out, cv2.convexHull(pts), 1)
    return out > 0


def feather(mask, px):
    m = mask.astype(np.float32)
    return cv2.GaussianBlur(m, (0, 0), px) if px else m


def grain(shape, strength):
    """Paper tooth: multi-scale noise centred on 1.0."""
    h, w = shape
    n = np.zeros((h, w), np.float32)
    for sigma, amp in ((0.6, 1.0), (2.5, 0.6), (12, 0.5)):
        layer = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), sigma)
        n += amp * layer / (layer.std() + 1e-6)
    return 1.0 + strength * n / 2.1


def save_layer(name, rgb, alpha, origin=(0, 0), scale=1.0, pad=4, colors=0):
    """Trim to alpha bbox, save RGBA, record placement in canvas px.

    colors > 0 palettises flat graphic layers (grain is otherwise incompressible).
    """
    a = np.clip(alpha, 0, 1)
    ys, xs = np.where(a > 0.004)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, a.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, a.shape[1])
    rgba = np.dstack([np.clip(rgb[y0:y1, x0:x1], 0, 255), a[y0:y1, x0:x1] * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    if colors:
        img = img.quantize(colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    img.save(os.path.join(OUT, name), optimize=True)
    ox, oy = origin
    manifest["layers"][name] = {
        "x": round(ox + x0 / scale, 1),
        "y": round(oy + y0 / scale, 1),
        "w": round((x1 - x0) / scale, 1),
        "h": round((y1 - y0) / scale, 1),
    }
    print(f"{name:26s} {x1 - x0}x{y1 - y0}  @ {manifest['layers'][name]}")


def bezier(p0, p1, p2, steps=24):
    return [
        ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
         (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
        for t in np.linspace(0, 1, steps)
    ]


def render_shape(name, points, color, ss=1, tooth=0.05):
    """Rasterise a canvas-space polygon at ss x resolution with print grain."""
    w, h = CANVAS_W * ss, CANVAS_H * ss
    img = Image.new("L", (w * 2, h * 2), 0)  # 2x supersample for clean edges
    ImageDraw.Draw(img).polygon([(x * ss * 2, y * ss * 2) for x, y in points], fill=255)
    alpha = np.asarray(img.resize((w, h), Image.LANCZOS), np.float32) / 255
    rgb = np.ones((h, w, 3), np.float32) * np.array(color, np.float32)
    rgb *= grain((h, w), tooth)[..., None]
    save_layer(name, rgb, alpha, scale=ss, colors=96)


# ---------------------------------------------------------------- sources

poster = Image.open(os.path.join(SRC, "poster_hero.png")).convert("RGB")
P = np.asarray(poster).astype(np.float32)
L = P @ np.array([0.299, 0.587, 0.114], np.float32)

isnet = new_session("isnet-general-use")
sam = new_session("sam")

product_alpha = np.asarray(remove(poster, session=isnet, only_mask=True), np.float32) / 255


def sam_mask(points):
    prompt = [{"type": "point", "data": p[:2], "label": p[2]} for p in points]
    return np.asarray(remove(poster, session=sam, sam_prompt=prompt, only_mask=True)) > 127


cup_raw = sam_mask([[880, 1080, 1], [850, 900, 1], [860, 700, 1], [700, 1230, 0], [460, 1080, 0]])
spoon_raw = sam_mask([[680, 1230, 1], [1150, 1110, 1], [1280, 1055, 1], [460, 1080, 0], [880, 1080, 0], [1260, 1210, 0]])
coaster_raw = sam_mask([[460, 1080, 1], [1260, 1210, 1], [600, 1300, 1], [680, 1230, 0], [880, 1080, 0]])

spoon = largest_component(spoon_raw)

# ---------------------------------------------------------------- 02 spoon
spoon_a = feather(cv2.erode(spoon.astype(np.uint8), np.ones((3, 3))), 0.8)
save_layer("02_SPOON.png", P, spoon_a)

# ---------------------------------------------------------------- 01 cup
# Body = foam, coffee and lemon. The rim ring above the foam is clear glass:
# the poster shows background through it, so we rebuild it as reflections only.
specks = cv2.morphologyEx(cup_raw.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3)))
glass_outline = hull(specks) & ~cv2.dilate(spoon.astype(np.uint8), np.ones((5, 5))).astype(bool)
body = fill_holes(largest_component(cv2.morphologyEx(cup_raw.astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9))) > 0))
body &= glass_outline
glass_zone = glass_outline & ~body

local_bg = cv2.medianBlur(L.astype(np.uint8), 31).astype(np.float32)
contrast = L - local_bg
glass_a = np.clip(0.05 + np.clip(np.abs(contrast) - 9, 0, None) / 30, 0, 0.9)  # ignore paper tooth
highlight = np.array([255, 252, 246], np.float32)
shade = np.array([70, 58, 46], np.float32)
glass_rgb = np.where((contrast > 0)[..., None], highlight, shade) * np.ones_like(P)

cup_rgb = np.where(body[..., None], P, glass_rgb)
cup_a = np.where(body, 1.0, np.where(glass_zone, glass_a, 0.0)).astype(np.float32)
cup_a *= feather(cv2.erode(glass_outline.astype(np.uint8), np.ones((3, 3))), 1.2)
# soften the body edge into the wall using the matting alpha where it is confident
edge = feather(body, 1.0)
cup_a = np.where(body & (edge < 0.98), np.maximum(cup_a * edge, glass_a), cup_a)
save_layer("01_CUP_LEMON.png", cup_rgb, cup_a)

# ---------------------------------------------------------------- 03 coaster
# The cup and spoon hide ~40% of the coaster. Rebuild the hidden wood so the
# exploded view never shows a hole: inpaint structure, then re-add grain
# sampled from the visible wood, then a soft ring where the glass stood.
coaster_vis = largest_component(coaster_raw)
# Only rebuild wood where the cup or spoon actually hid it: the convex hull's
# corners outside the real coaster are background (they showed as a cream sliver).
occluders = cv2.dilate((glass_outline | spoon).astype(np.uint8), np.ones((61, 61))).astype(bool)
coaster_full = fill_holes(coaster_vis | (hull(coaster_vis) & occluders))
missing = coaster_full & ~coaster_vis
# low-frequency light from wood well away from the contact shadow (normalised convolution)
far = coaster_vis & ~cv2.dilate(missing.astype(np.uint8), np.ones((41, 41))).astype(bool)
w = cv2.GaussianBlur(far.astype(np.float32), (0, 0), 45)
filled = cv2.GaussianBlur(P * far[..., None], (0, 0), 45) / np.maximum(w, 1e-4)[..., None]

ys, xs = np.where(coaster_vis & ~cv2.dilate(missing.astype(np.uint8), np.ones((25, 25))).astype(bool))
detail = P - cv2.GaussianBlur(P, (0, 0), 6)
my, mx = np.where(missing)
# tile visible high-frequency wood detail across the hole
tile = np.zeros_like(P)
patch = 48
for by in range(my.min(), my.max() + 1, patch):
    for bx in range(mx.min(), mx.max() + 1, patch):
        for _ in range(40):
            i = rng.integers(0, len(ys))
            sy, sx = ys[i] - patch // 2, xs[i] - patch // 2
            if sy < 0 or sx < 0 or sy + patch > P.shape[0] or sx + patch > P.shape[1]:
                continue
            if coaster_vis[sy:sy + patch, sx:sx + patch].all():
                th = min(patch, P.shape[0] - by)
                tw = min(patch, P.shape[1] - bx)
                tile[by:by + th, bx:bx + tw] = detail[sy:sy + th, sx:sx + tw]
                break
tile = cv2.GaussianBlur(tile, (0, 0), 0.7)
blend = feather(missing, 4)[..., None]
coaster_rgb = P * (1 - blend) + np.clip(filled + tile, 0, 255) * blend
ring = np.zeros(L.shape, np.float32)
cv2.ellipse(ring, (858, 1112), (300, 72), 0, 0, 360, 1.0, -1)
ring = cv2.GaussianBlur(ring, (0, 0), 22) * missing
coaster_rgb *= (1 - 0.18 * ring)[..., None]
coaster_a = np.minimum(feather(coaster_full, 0.9), np.where(missing, 1.0, np.maximum(product_alpha, feather(coaster_vis, 0.8))))
save_layer("03_WOOD_COASTER.png", coaster_rgb, coaster_a)

# ---------------------------------------------------------------- 04/05 type
# Keyed from the poster so the lettering stays the approved artwork, then
# re-coloured to the exact brand tokens.
type_box = (320, 20, 1060, 372)
x0, y0, x1, y1 = type_box
ink = np.clip((172 - L[y0:y1, x0:x1]) / 125, 0, 1) ** 1.1
ink[(P[y0:y1, x0:x1, 0] - P[y0:y1, x0:x1, 1]) > 40] = 0  # drop COFFEE overlap
save_layer("04_TYPE_COOLEST.png", np.ones((y1 - y0, x1 - x0, 3)) * CHARCOAL, ink, origin=(x0, y0))

coffee_box = (330, 300, 1050, 556)
x0, y0, x1, y1 = coffee_box
R, G = P[y0:y1, x0:x1, 0], P[y0:y1, x0:x1, 1]
terr = np.clip((R - G - 26) / 36, 0, 1)
rim = glass_outline[y0:y1, x0:x1] & (terr < 0.75)
terr[rim] = 0  # rim reflections are not ink
n, lab, st, _ = cv2.connectedComponentsWithStats((terr > 0.3).astype(np.uint8), 8)
terr[np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] < 1500])] = 0
# the glass rim crosses under F-F-E: clip everything below the (tilted) baseline
cols = np.where((terr > 0.5).any(0))[0]
lx, rx = cols.min() + 45, cols.max() - 30  # centres of the C and the last E
ly = np.where((terr[:, cols.min():cols.min() + 90] > 0.5).any(1))[0].max()
ry = np.where((terr[:, cols.max() - 60:cols.max()] > 0.5).any(1))[0].max()
yy, xx = np.mgrid[0:terr.shape[0], 0:terr.shape[1]]
terr[yy > ly + (xx - lx) * (ry - ly) / (rx - lx) + 8] = 0
terr = cv2.morphologyEx(terr, cv2.MORPH_CLOSE, np.ones((3, 3)))
save_layer("05_TYPE_COFFEE.png", np.ones((y1 - y0, x1 - x0, 3)) * TERRACOTTA, terr, origin=(x0, y0))

# letter boundaries inside 04_TYPE_COOLEST.png, as fractions of its width, so
# the reel can animate C / O / O / L / E / S / T from the single asset
cool = np.asarray(Image.open(os.path.join(OUT, "04_TYPE_COOLEST.png")))[..., 3] > 60
cols = cool.sum(0)
runs, inside = [], False
for i, c in enumerate(cols):
    if c > 2 and not inside:
        start, inside = i, True
    elif c <= 2 and inside:
        runs.append([start, i])
        inside = False
if inside:
    runs.append([start, len(cols)])
runs = [r for r in runs if r[1] - r[0] > 12]
letters = []
for a, b in runs:
    rows = np.where(cool[:, a:b].any(1))[0]
    letters.append([round(a / cool.shape[1], 4), round(b / cool.shape[1], 4),
                    round(rows.min() / cool.shape[0], 4), round((rows.max() + 1) / cool.shape[0], 4)])
manifest["coolestLetters"] = letters  # [left, right, top, bottom] as fractions of the PNG
print("COOLEST letter runs:", len(runs), runs)

# ---------------------------------------------------------------- 06 stamp
S = 1200
stamp = Image.new("L", (S, S), 0)
d = ImageDraw.Draw(stamp)
cx = cy = S / 2
latin = font("Jost.ttf", 118)
latin.set_variation_by_axes([500])
cjk = font("NotoSerifTC-Bold.otf", 128)
ring_text = list("夏野豆行") + list(" · DAILY RITUAL · ")
widths = [(cjk if ord(ch) > 0x2E80 else latin).getlength(ch) for ch in ring_text]
radius = 418
track = (2 * math.pi * radius - sum(widths)) / len(ring_text)  # close the ring
theta = math.radians(-90) - (widths[0] + track) / radius * 2
for ch, w in zip(ring_text, widths):
    f = cjk if ord(ch) > 0x2E80 else latin
    step = (w + track) / radius
    mid = theta + step / 2
    glyph = Image.new("L", (220, 220), 0)
    ImageDraw.Draw(glyph).text((110, 110), ch, font=f, fill=255, anchor="mm")
    glyph = glyph.rotate(-math.degrees(mid) - 90, resample=Image.BICUBIC)
    gx = cx + radius * math.cos(mid) - 110
    gy = cy + radius * math.sin(mid) - 110
    stamp.paste(255, (int(gx), int(gy)), glyph)
    theta += step
# asterisk mark (poster centre motif)
for k in range(6):
    a = math.radians(k * 30 + 90)
    d.line([(cx - 150 * math.cos(a), cy - 150 * math.sin(a)), (cx + 150 * math.cos(a), cy + 150 * math.sin(a))], fill=255, width=26)
d.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=255)
stamp_a = np.asarray(stamp.filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
stamp_a *= np.clip(grain((S, S), 0.25), 0.55, 1)  # rubber-stamp ink breakup
# placement: same footprint as the poster badge (centre ~1346,150, 230px)
save_layer("06_STAMP.png", np.ones((S, S, 3)) * TERRACOTTA, stamp_a, pad=0)
# same footprint as the poster badge: ~218 px ring centred near (1347, 150)
st = manifest["layers"]["06_STAMP.png"]
st.update(w=218, h=round(218 * st["h"] / st["w"], 1), x=1238, y=41)

# ---------------------------------------------------------------- 07/08 shapes
# Traced from the poster; the parts hidden behind cup/coaster are completed
# along the visible edges.
sage = (
    [(1536, 250), (586, 640)]
    + bezier((586, 640), (300, 760), (272, 900))
    + [(270, 1084), (0, 1150), (0, 1312), (432, 1182)]
    + bezier((432, 1182), (410, 1120), (412, 1032))
    + bezier((412, 1032), (414, 978), (470, 976))
    + [(1192, 976), (1536, 878)]
)
render_shape("07_SHAPE_SAGE.png", sage, SAGE)
terracotta = [(1192, 976), (1536, 878), (1536, 1326), (1392, 1326)]
render_shape("08_SHAPE_TERRACOTTA.png", terracotta, TERRACOTTA)

# ---------------------------------------------------------------- 11 ivory
# A seamless 1024 tile (the page repeats it), so noise is blurred with wrap-around.
BW = BH = 1024
paper = np.ones((BH, BW, 3), np.float32) * np.array(IVORY, np.float32)
tooth = np.zeros((BH, BW), np.float32)
for sigma, amp in ((0.7, 1.0), (3, 0.6), (16, 0.5)):
    layer = gaussian_filter(rng.standard_normal((BH, BW)).astype(np.float32), sigma, mode="wrap")
    tooth += amp * layer / (layer.std() + 1e-6)
paper *= (1.0 + 0.016 * tooth / 2.1)[..., None]
fibres = Image.new("L", (BW, BH), 0)
fd = ImageDraw.Draw(fibres)
for _ in range(700):
    x, y = rng.uniform(0, BW), rng.uniform(0, BH)
    a, ln = rng.uniform(0, math.pi), rng.uniform(10, 46)
    for ox in (-BW, 0, BW):  # draw wrapped copies so fibres cross tile edges
        for oy in (-BH, 0, BH):
            fd.line([(x + ox, y + oy), (x + ox + ln * math.cos(a), y + oy + ln * math.sin(a))], fill=90, width=1)
fib = np.asarray(fibres.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
paper = paper * (1 - 0.06 * fib[..., None])
Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8)).quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(OUT, "11_BACKGROUND_IVORY.png"), optimize=True)
manifest["layers"]["11_BACKGROUND_IVORY.png"] = {"x": 0, "y": 0, "w": CANVAS_W, "h": CANVAS_H}
print("11_BACKGROUND_IVORY.png    generated", BW, BH)

# ---------------------------------------------------------------- 12 lemon (props panel A)
props = Image.open(os.path.join(SRC, "props_sheet.png")).convert("RGB")
crop_box = (40, 90, 300, 290)  # first lemon, lying on its side
lemon_img = props.crop(crop_box)
lemon_a = np.asarray(remove(lemon_img, session=isnet, only_mask=True), np.float32) / 255
lemon_a = lemon_a * largest_component(lemon_a > 0.5).astype(np.float32)
lemon_a = np.maximum(lemon_a, 0) * feather(cv2.dilate((lemon_a > 0.5).astype(np.uint8), np.ones((3, 3))), 0.8)
save_layer("12_LEMON.png", np.asarray(lemon_img, np.float32), lemon_a)
del manifest["layers"]["12_LEMON.png"]  # not part of the poster canvas

# ---------------------------------------------------------------- storefront
Image.open(os.path.join(SRC, "storefront.jpg")).convert("RGB").save(os.path.join(OUT, "1000355615.png"), optimize=True)
print("1000355615.png             converted")

with open(os.path.join(OUT, "manifest.js"), "w") as fh:
    fh.write("// Generated by tools/build_assets.py - layer placement on the 1536x1326 poster canvas.\n")
    fh.write("window.ASSET_MANIFEST = " + json.dumps(manifest, indent=2) + ";\n")
print("wrote assets/manifest.js")
