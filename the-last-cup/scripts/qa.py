"""Visual QA of the finished film. python scripts/qa.py [the-last-cup.mp4]
Writes qa/report.json, qa/contact.jpg, qa/strip_*.jpg, qa/luma.png, qa/palette.png.
"""
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
FILM = sys.argv[1] if len(sys.argv) > 1 else "the-last-cup.mp4"
os.makedirs("qa", exist_ok=True)
R = {"file": FILM}


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)


# ---- format
p = json.loads(sh(f"ffprobe -v error -show_streams -show_format -of json {FILM}").stdout)
v = next(s for s in p["streams"] if s["codec_type"] == "video")
a = next((s for s in p["streams"] if s["codec_type"] == "audio"), None)
R["format"] = {
    "width": v["width"], "height": v["height"], "fps": v["r_frame_rate"], "frames": int(v.get("nb_frames", 0)),
    "duration_s": round(float(p["format"]["duration"]), 3), "video_codec": v["codec_name"], "pix_fmt": v["pix_fmt"],
    "audio": a and {"codec": a["codec_name"], "rate": a["sample_rate"], "channels": a["channels"]},
    "size_mb": round(int(p["format"]["size"]) / 1e6, 2),
}

# ---- frames to numpy (small, for stats)
W, H = 108, 192
raw = subprocess.run(f"ffmpeg -v error -i {FILM} -vf scale={W}:{H} -f rawvideo -pix_fmt rgb24 -", shell=True, capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
luma = (0.2126 * fr[..., 0] + 0.7152 * fr[..., 1] + 0.0722 * fr[..., 2])
mean = luma.mean((1, 2))
clip_hi = (luma > 250).mean((1, 2))
clip_lo = (luma < 6).mean((1, 2))
diff = np.abs(np.diff(fr, axis=0)).mean((1, 2, 3))
fps = 30
cuts = [round((i + 1) / fps, 3) for i in np.where(diff > max(18, np.median(diff) * 6))[0]]
R["luma"] = {
    "mean_min": round(float(mean.min()), 1), "mean_max": round(float(mean.max()), 1),
    "frames_over_25pct_clipped_white": [round(i / fps, 2) for i in np.where(clip_hi > 0.25)[0]],
    "frames_over_40pct_crushed_black": [round(i / fps, 2) for i in np.where(clip_lo > 0.4)[0]],
    "detected_cuts_s": cuts,
    "frozen_runs": int(((diff < 0.05)).sum()),
    "nan_or_blank_frames": int((fr.reshape(len(fr), -1).std(1) < 1.0).sum()),
}

# ---- ffmpeg detectors
_bd = sh(f"ffmpeg -v info -i {FILM} -vf blackdetect=d=0.05:pix_th=0.06 -an -f null -"); bd = _bd.stdout + _bd.stderr
R["blackdetect"] = re.findall(r"black_start:[\d.]+ black_end:[\d.]+", bd)
_lo = sh(f"ffmpeg -nostats -i {FILM} -af ebur128=peak=true -f null -"); lo = _lo.stdout + _lo.stderr
summ = lo[lo.rfind("Summary:"):]
I = re.search(r"I:\s+(-?[\d.]+) LUFS", summ)
LRA = re.search(r"LRA:\s+([\d.]+) LU", summ)
TP = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ)
R["loudness"] = {"integrated_lufs": float(I.group(1)) if I else None, "lra_lu": float(LRA.group(1)) if LRA else None, "true_peak_dbtp": float(TP.group(1)) if TP else None, "target_lufs": -14}

# ---- luma graph with section markers
tl = json.load(open("audio/timeline.json"))
G = Image.new("RGB", (900, 220), (18, 14, 10))
d = ImageDraw.Draw(G)
for k, t in tl["sec"].items():
    if k in ("pour", "end"):
        continue
    x = int(t / 10 * 900)
    d.line([(x, 0), (x, 220)], fill=(70, 55, 40))
    d.text((x + 2, 4), k, fill=(150, 130, 100))
pts = [(int(i / len(mean) * 900), int(210 - mean[i] / 255 * 190)) for i in range(len(mean))]
d.line(pts, fill=(200, 220, 190), width=2)
for c in cuts:
    x = int(c / 10 * 900)
    d.line([(x, 160), (x, 220)], fill=(220, 80, 60), width=2)
G.save("qa/luma.png")

# ---- contact sheet (every 0.5 s) and action strips (0.2 s)
def grab(t, w=216):
    out = subprocess.run(f"ffmpeg -v error -ss {t:.3f} -i {FILM} -frames:v 1 -vf scale={w}:-1 -f image2pipe -vcodec png -", shell=True, capture_output=True).stdout
    from io import BytesIO
    return Image.open(BytesIO(out)).convert("RGB")


def sheet(times, cols, path, w=216):
    ims = [grab(t, w) for t in times]
    h = ims[0].height
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w, rows * (h + 20)), (14, 10, 8))
    dd = ImageDraw.Draw(S)
    for i, (t, im) in enumerate(zip(times, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 20)
        S.paste(im, (x, y))
        dd.text((x + 5, y + h + 4), f"{t:.2f}s", fill=(230, 220, 200))
    S.save(path, quality=88)


sheet([i * 0.5 for i in range(20)], 10, "qa/contact.jpg")
sheet([round(1.4 + i * 0.2, 2) for i in range(10)], 10, "qa/strip_pour_end.jpg", 160)
sheet([round(2.8 + i * 0.2, 2) for i in range(10)], 10, "qa/strip_grasp_offer.jpg", 160)
sheet([round(8.0 + i * 0.2, 2) for i in range(10)], 10, "qa/strip_bow.jpg", 160)

# ---- palette vs the original editorial poster (stunning.png): mean ΔE of dominant colours
def lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def kmeans(px, k=6, it=12, seed=0):
    r = np.random.default_rng(seed)
    C = px[r.choice(len(px), k, replace=False)]
    for _ in range(it):
        lab_ = ((px[:, None] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([px[lab_ == j].mean(0) if (lab_ == j).any() else C[j] for j in range(k)])
    w = np.bincount(lab_, minlength=k) / len(px)
    o = np.argsort(-w)
    return C[o], w[o]


poster_path = os.path.join(os.path.dirname(ROOT), "stunning.png")
if os.path.exists(poster_path):
    ref = np.asarray(Image.open(poster_path).convert("RGB").resize((120, 150)), np.float32).reshape(-1, 3)
    film_px = fr[::6].reshape(-1, 3)
    film_px = film_px[np.random.default_rng(1).choice(len(film_px), 20000, replace=False)]
    Cr, wr = kmeans(ref)
    Cf, wf = kmeans(film_px)
    Lr, Lf = lab(Cr), lab(Cf)
    nearest = np.sqrt(((Lf[:, None] - Lr[None]) ** 2).sum(-1)).min(1)
    R["palette"] = {
        "poster_dominant": ["#%02x%02x%02x" % tuple(int(x) for x in c) for c in Cr],
        "film_dominant": ["#%02x%02x%02x" % tuple(int(x) for x in c) for c in Cf],
        "film_weights": [round(float(x), 3) for x in wf],
        "mean_deltaE_to_nearest_poster_colour": round(float((nearest * wf).sum()), 1),
    }
    P = Image.new("RGB", (600, 120), (14, 10, 8))
    dp = ImageDraw.Draw(P)
    for i, c in enumerate(Cr):
        dp.rectangle([i * 100, 0, i * 100 + 98, 56], fill=tuple(int(x) for x in c))
    for i, c in enumerate(Cf):
        dp.rectangle([i * 100, 62, i * 100 + 98, 118], fill=tuple(int(x) for x in c))
    P.save("qa/palette.png")

json.dump(R, open("qa/report.json", "w"), indent=1)
print(json.dumps(R, indent=1))
