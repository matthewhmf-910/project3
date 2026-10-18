"""Turn a single still photo into a cinematic 2.5D camera-move video.

Pipeline:
  1. Build an approximate depth map (far wall -> near table edge, plus the
     yellow model cranes/excavator lifted off the background by colour).
  2. For every frame, a virtual camera (pan / tilt / push-in / lateral orbit)
     re-samples the photo with depth-dependent offsets -> parallax.
  3. Light grading on top: drifting soft light, depth haze, mild depth of
     field, vignette, film grain, dissolves between shots.

Usage:  python3 make_cinematic.py source.jpg out.mp4
"""
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageFilter, ImageOps

OUT_W, OUT_H, FPS = 1080, 1920, 30

# ---------------------------------------------------------------- shots ---
# Each key: (cx, cy, zoom, parallax_x, parallax_y, dolly, focus_depth, dof)
# cx/cy are normalised image coordinates of the frame centre.
SHOTS = [
    # 1. Establishing: slow push-in with a lateral orbit across the scene.
    dict(start=0.0, end=6.6, keys=[
        (0.50, 0.52, 1.07, -0.010, 0.000, 0.00, 0.45, 0.00),
        (0.47, 0.56, 1.32, 0.010, -0.002, 0.10, 0.50, 0.15)]),
    # 2. Tilt up the tower crane, from its base to the boom tip.
    dict(start=5.8, end=12.2, keys=[
        (0.29, 0.63, 2.00, 0.006, 0.004, 0.04, 0.55, 0.35),
        (0.41, 0.33, 1.85, -0.006, -0.004, 0.10, 0.50, 0.30)]),
    # 3. Low glide across the table: excavator -> crawler crane.
    dict(start=11.4, end=17.4, keys=[
        (0.45, 0.67, 2.05, -0.008, 0.000, 0.04, 0.60, 0.30),
        (0.70, 0.60, 1.80, 0.008, 0.000, 0.10, 0.50, 0.30)]),
    # 4. Pull back from the studio sign to reveal the full scene.
    dict(start=16.6, end=23.0, keys=[
        (0.64, 0.38, 1.75, 0.006, 0.000, 0.10, 0.10, 0.20),
        (0.50, 0.50, 1.06, -0.006, 0.000, 0.00, 0.45, 0.00)]),
]
DURATION = SHOTS[-1]["end"]
N_FRAMES = int(round(DURATION * FPS))


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * t * (t * (6 * t - 15) + 10)  # smootherstep


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------- resources ---
def build_resources(path):
    img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    levels = []
    for w in (1440, img.width):  # mip levels: wide shots / close-ups
        h = round(w * img.height / img.width)
        lv = img.resize((w, h), Image.LANCZOS)
        soft = lv.filter(ImageFilter.GaussianBlur(radius=w / 360))
        levels.append((np.asarray(lv, np.float32) / 255,
                       np.asarray(soft, np.float32) / 255))

    # Depth map at a small working size (0 = far, 1 = near).
    dw, dh = 720, round(720 * img.height / img.width)
    small = img.resize((dw, dh), Image.BILINEAR)
    hsv = np.asarray(small.convert("HSV"), np.float32)
    hue, sat, val = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    yellow = ((hue > 14) & (hue < 38) & (sat > 80) & (val > 70)).astype(np.uint8) * 255
    mask = Image.fromarray(yellow).filter(ImageFilter.MaxFilter(9))
    mask = np.asarray(mask.filter(ImageFilter.GaussianBlur(6)), np.float32) / 255

    yy, xx = np.mgrid[0:dh, 0:dw].astype(np.float32)
    yn, xn = yy / dh, xx / dw
    # Table top recedes toward the wall; its front edge slants down-left.
    table = smoothstep(0.60, 0.80, yn + 0.04 * (0.5 - xn))
    objects = mask * (0.45 + 0.20 * smoothstep(0.55, 0.75, yn))
    depth = np.maximum(table, objects)
    depth = Image.fromarray((depth * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
    depth = np.asarray(depth, np.float32)[..., None] / 255
    return levels, depth


def sample(img, x, y):
    """Bilinear sample img (H,W,C) at normalised coords x, y."""
    h, w = img.shape[:2]
    px = np.clip(x * w - 0.5, 0, w - 1.001)
    py = np.clip(y * h - 0.5, 0, h - 1.001)
    x0, y0 = px.astype(np.int32), py.astype(np.int32)
    fx, fy = (px - x0)[..., None], (py - y0)[..., None]
    a = img[y0, x0]
    b = img[y0, x0 + 1]
    c = img[y0 + 1, x0]
    d = img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


# -------------------------------------------------------------- render ---
U, V = np.meshgrid((np.arange(OUT_W, dtype=np.float32) + 0.5) / OUT_W - 0.5,
                   (np.arange(OUT_H, dtype=np.float32) + 0.5) / OUT_H - 0.5)
VIGNETTE = (1 - 0.32 * smoothstep(0.25, 0.85, np.sqrt((U * 1.1) ** 2 + (V * 0.9) ** 2) * 1.3))[..., None]

RES = None


def init(path):
    global RES
    RES = build_resources(path)


def render_shot(shot, t):
    levels, depth = RES
    k = ease((t - shot["start"]) / (shot["end"] - shot["start"]))
    a, b = shot["keys"]
    cx, cy, zoom, px, py, dolly, focus, dof = [p + (q - p) * k for p, q in zip(a, b)]

    # Keep the window (plus parallax headroom) inside the photo.
    half = 0.5 / zoom + 0.014
    cx = min(max(cx, half), 1 - half)
    cy = min(max(cy, half), 1 - half)

    # First pass: depth under each output pixel, then depth-aware warp.
    d = sample(depth, cx + U / zoom, cy + V / zoom)
    d2 = d[..., 0]
    z_eff = zoom * (1 + dolly * d2)  # near things grow faster on a push-in
    sx = cx + U / z_eff + (d2 - 0.3) * px
    sy = cy + V / z_eff + (d2 - 0.3) * py

    sharp, soft = levels[1] if zoom > 1.5 else levels[0]
    col = sample(sharp, sx, sy)
    if dof > 0:
        w = np.clip(np.abs(d - focus) * 2.2, 0, 1) * dof
        col = col * (1 - w) + sample(soft, sx, sy) * w
    # Atmospheric haze on the far wall.
    haze = (1 - smoothstep(0.0, 0.35, d)) * 0.07
    col = col * (1 - haze) + np.array([0.72, 0.82, 0.92], np.float32) * haze
    return col


def render_frame(i):
    t = i / FPS
    active = [s for s in SHOTS if s["start"] <= t <= s["end"]]
    if len(active) == 2:
        s1, s2 = active
        m = ease((t - s2["start"]) / (s1["end"] - s2["start"]))
        col = render_shot(s1, t) * (1 - m) + render_shot(s2, t) * m
        col = col + 0.06 * np.sin(np.pi * m)  # soft bloom through the dissolve
    else:
        col = render_shot(active[0], t)

    # Drifting soft key light + gentle exposure breathing.
    ang = 0.6
    band = U * np.cos(ang) + V * np.sin(ang)
    pos = -0.9 + 1.8 * ((t / 9.0) % 1.0)
    light = np.exp(-((band - pos) ** 2) / 0.06)[..., None]
    col = col + light * 0.07 * np.array([1.0, 0.92, 0.78], np.float32)
    col = col * (1 + 0.025 * np.sin(t * 0.9))

    # Grade: gentle S-curve, warm highlights / cool shadows, vignette.
    col = np.clip(col, 0, 1)
    col = col + 0.35 * col * (1 - col) * (2 * col - 1)
    lum = col.mean(axis=2, keepdims=True)
    col = col + (lum - 0.5) * np.array([0.03, 0.0, -0.03], np.float32)
    col = col * VIGNETTE

    # Film grain.
    rng = np.random.default_rng(i)
    col = col + rng.normal(0, 0.012, (OUT_H, OUT_W, 1)).astype(np.float32)

    # Fade in / out.
    fade = min(ease(t / 1.0), ease((DURATION - t) / 1.2))
    col = col * fade
    return (np.clip(col, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes()


def main():
    src, out = sys.argv[1], sys.argv[2]
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    with Pool(initializer=init, initargs=(src,)) as pool:
        for n, frame in enumerate(pool.imap(render_frame, range(N_FRAMES), chunksize=4)):
            ff.stdin.write(frame)
            if n % 60 == 0:
                print(f"frame {n}/{N_FRAMES}", flush=True)
    ff.stdin.close()
    ff.wait()


if __name__ == "__main__":
    main()
