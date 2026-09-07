#!/usr/bin/env python3
"""
motion_match.py — 量測生成片段有沒有還原 previz 的 rig animation。

原理：previz 與成品的主角都是「高飽和紅色球體」，其他東西都不是。
所以用紅色遮罩把主體切出來，逐幀記錄：

  area  : 主體佔畫面的面積比 → 這就是「鏡頭推拉 / 主體遠近」曲線
  cx,cy : 主體重心（0..1 正規化）→ 這就是「主體在畫面中的走位」曲線

previz 的這三條曲線 = 動作真相。成品的曲線要能疊得上去，才叫還原。
模型沒有 rig，所以我們不比骨骼，我們比「主體在畫幅內的運動軌跡」——
這是 rig animation 在 2D 畫面上唯一可驗證的投影。

用法：
  # 1. 先從 previz 抽出基準曲線
  python3 tools/motion_match.py extract previz.mp4 --out ref_full.csv

  # 2. 只取某個 beat 的區段當該鏡基準
  python3 tools/motion_match.py extract previz.mp4 --in 2.85 --out ref_E1.csv --duration 1.15

  # 3. 成品抽曲線
  python3 tools/motion_match.py extract beatE1_take3.mp4 --out gen_E1.csv

  # 4. 比對，出 PASS/FAIL
  python3 tools/motion_match.py compare ref_E1.csv gen_E1.csv --beat E1
"""

import argparse
import csv
import glob
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image


# ---------------------------------------------------------------- ffmpeg

def find_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        pass
    sys.exit("找不到 ffmpeg。安裝：pip install imageio-ffmpeg")


def extract_frames(video, outdir, fps, start=None, duration=None):
    cmd = [find_ffmpeg(), "-hide_banner", "-loglevel", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", video]
    if duration is not None:
        cmd += ["-t", str(duration)]
    cmd += ["-vf", f"fps={fps},scale=320:-1", os.path.join(outdir, "f_%05d.png"), "-y"]
    subprocess.run(cmd, check=True)
    return sorted(glob.glob(os.path.join(outdir, "f_*.png")))


# ---------------------------------------------------------------- 紅色遮罩

def red_mask(rgb):
    """
    切出高飽和紅色主體。

    門檻是刻意收緊的：Macau plate 的赭石／奶油色牆面偏暖但飽和度低，
    達摩的朱紅飽和度高，兩者用 saturation + 紅色主導度就分得開。
    """
    a = rgb.astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(axis=-1)
    mn = a.min(axis=-1)
    sat = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0.0)

    return (
        (r > g + 0.12) &          # 紅比綠明顯高
        (r > b + 0.12) &          # 紅比藍明顯高
        (sat > 0.28) &            # 排除低飽和的暖牆面
        (mx > 0.18)               # 排除暗部雜訊
    )


def frame_metrics(path):
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img)
    h, w = arr.shape[:2]
    m = red_mask(arr)
    n = int(m.sum())
    if n < 24:                                  # 主體不在畫面內
        return dict(area=0.0, cx=float("nan"), cy=float("nan"),
                    bw=0.0, bh=0.0, px=0)
    ys, xs = np.nonzero(m)
    return dict(
        area=n / float(h * w),
        cx=float(xs.mean()) / w,
        cy=float(ys.mean()) / h,
        bw=float(np.ptp(xs) + 1) / w,
        bh=float(np.ptp(ys) + 1) / h,
        px=n,
    )


# ---------------------------------------------------------------- extract

def cmd_extract(args):
    tmp = tempfile.mkdtemp(prefix="mm_")
    try:
        frames = extract_frames(args.video, tmp, args.fps, args.start, args.duration)
        if not frames:
            sys.exit("抽不到幀，檢查 --in / --duration 是否超出片長。")
        rows = []
        for i, f in enumerate(frames):
            m = frame_metrics(f)
            m["t"] = round(i / args.fps, 4)
            m["frame"] = i
            rows.append(m)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    cols = ["frame", "t", "area", "cx", "cy", "bw", "bh", "px"]
    with open(args.out, "w", newline="") as fh:
        wtr = csv.DictWriter(fh, fieldnames=cols)
        wtr.writeheader()
        wtr.writerows(rows)

    visible = [r for r in rows if r["px"] > 0]
    print(f"寫入 {args.out}：{len(rows)} 幀 @ {args.fps}fps，主體可見 {len(visible)} 幀")
    if visible:
        areas = [r["area"] for r in visible]
        print(f"  面積比 min={min(areas):.4f}  max={max(areas):.4f}  "
              f"變化倍數={max(areas)/max(min(areas),1e-6):.2f}x")
    print_sparkline(rows)


def print_sparkline(rows):
    """把 area 曲線畫成一行文字，肉眼即刻看到推拉節奏。"""
    bars = " ▁▂▃▄▅▆▇█"
    areas = [r["area"] for r in rows]
    hi = max(areas) if areas else 0.0
    if hi <= 0:
        print("  area: (主體全程不可見)")
        return
    line = "".join(bars[min(8, int(round(a / hi * 8)))] for a in areas)
    print(f"  area: {line}")


# ---------------------------------------------------------------- compare

# 每個 beat 的容差。scale 用相對誤差，位置用畫幅比例。
# E1 是等距追蹤鏡，主體大小理應不變，所以 scale 容差收得最緊。
TOLERANCE = {
    "A":  dict(scale=0.18, pos=0.08, note="接近，area 應單調上升"),
    "B":  dict(scale=0.22, pos=0.10, note="逼近特寫，area 上升最陡"),
    "C":  dict(scale=0.18, pos=0.08, note="遠離，area 應單調下降"),
    "D":  dict(scale=0.30, pos=0.14, note="越肩極近景，容差放寬，本來就難"),
    "E1": dict(scale=0.10, pos=0.06, note="等距追蹤，area 必須近乎平坦"),
    "E2": dict(scale=0.18, pos=0.08, note="拉遠收尾，area 應單調下降"),
    "":   dict(scale=0.20, pos=0.10, note="預設容差"),
}


def resample(rows, n=100):
    """把曲線正規化到 0..1 時間軸的 n 個取樣點，讓不同長度/幀率可比。"""
    t = np.array([r["t"] for r in rows], dtype=float)
    if len(t) < 2:
        sys.exit("曲線太短，無法比對。")
    t = (t - t[0]) / max(t[-1] - t[0], 1e-9)
    grid = np.linspace(0.0, 1.0, n)
    out = {}
    for k in ("area", "cx", "cy"):
        v = np.array([r[k] for r in rows], dtype=float)
        ok = ~np.isnan(v)
        if ok.sum() < 2:
            out[k] = np.full(n, np.nan)
        else:
            out[k] = np.interp(grid, t[ok], v[ok])
    return out


def load(path):
    with open(path) as fh:
        rows = [{k: (float(v) if v not in ("", "nan") else float("nan"))
                 for k, v in r.items()} for r in csv.DictReader(fh)]
    if not rows:
        sys.exit(f"{path} 沒有資料。")
    return rows


def monotonic_dir(v):
    d = np.diff(v[~np.isnan(v)])
    if len(d) == 0:
        return "flat"
    up, down = (d > 0).mean(), (d < 0).mean()
    if up > 0.75:
        return "rising"
    if down > 0.75:
        return "falling"
    if np.nanstd(v) / max(np.nanmean(v), 1e-6) < 0.08:
        return "flat"
    return "mixed"


def cmd_compare(args):
    ref = resample(load(args.ref))
    gen = resample(load(args.gen))
    tol = TOLERANCE.get(args.beat, TOLERANCE[""])

    print(f"\n=== Beat {args.beat or '(未指定)'} — {tol['note']} ===")
    print(f"ref: {args.ref}")
    print(f"gen: {args.gen}\n")

    results = []

    # 1) 尺度曲線：主體遠近變化是否吻合（相對誤差）
    r, g = ref["area"], gen["area"]
    scale_ok = ~(np.isnan(r) | np.isnan(g)) & (r > 1e-5)
    if scale_ok.sum() >= 10:
        rel = np.abs(g[scale_ok] - r[scale_ok]) / r[scale_ok]
        rmse, worst = float(np.sqrt((rel ** 2).mean())), float(rel.max())
        results.append(("主體尺度曲線 (area)", rmse, tol["scale"],
                        f"最差幀偏離 {worst*100:.0f}%"))
    else:
        results.append(("主體尺度曲線 (area)", float("nan"), tol["scale"],
                        "重疊取樣不足，主體可能被遮罩漏掉"))

    # 2) 走位：主體在畫幅內的位置（絕對誤差，單位=畫幅比例）
    for key, label in (("cx", "水平走位 (cx)"), ("cy", "垂直走位 (cy)")):
        r, g = ref[key], gen[key]
        ok = ~(np.isnan(r) | np.isnan(g))
        if ok.sum() >= 10:
            err = np.abs(g[ok] - r[ok])
            results.append((label, float(np.sqrt((err ** 2).mean())), tol["pos"],
                            f"最大偏移 {err.max()*100:.1f}% 畫幅"))
        else:
            results.append((label, float("nan"), tol["pos"], "取樣不足"))

    # 3) 運動方向：推、拉、還是持平——方向錯了數值再接近也是廢的
    rd, gd = monotonic_dir(ref["area"]), monotonic_dir(gen["area"])
    dir_ok = rd == gd

    width = max(len(n) for n, *_ in results)
    fails = 0
    for name, val, lim, note in results:
        if np.isnan(val):
            status, bad = "SKIP", False
        else:
            bad = val > lim
            status = "FAIL" if bad else "PASS"
        fails += bool(bad)
        v = "  n/a " if np.isnan(val) else f"{val:.4f}"
        print(f"  [{status}] {name:<{width}}  rmse={v}  tol={lim:.2f}   {note}")

    status = "PASS" if dir_ok else "FAIL"
    fails += (not dir_ok)
    print(f"  [{status}] {'運動方向':<{width}}  ref={rd}  gen={gd}")

    print()
    if fails:
        print(f"✗ FAIL — {fails} 項不通過。對照 prompts/omni11_beat_prompts.md 的重 roll 決策表：")
        if not dir_ok:
            print("    · 方向錯 → Camera 段只保留「主體大小與位置變化」，刪掉所有空間描述")
        print("    · 尺度漂 → 該 beat 對半切成兩段，或 motion strength +0.1")
        print("    · 走位偏 → 換更貼該鏡角度的 reference 圖")
        return 1
    print("✓ PASS — 動作軌跡在容差內，可以進剪接。")
    return 0


# ---------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    e = sub.add_parser("extract", help="從影片抽出主體運動曲線")
    e.add_argument("video")
    e.add_argument("--out", required=True, help="輸出 CSV")
    e.add_argument("--fps", type=float, default=30.0)
    e.add_argument("--in", dest="start", type=float, default=None, help="起始秒數")
    e.add_argument("--duration", type=float, default=None, help="取用長度（秒）")
    e.set_defaults(func=cmd_extract)

    c = sub.add_parser("compare", help="比對基準曲線與成品曲線")
    c.add_argument("ref")
    c.add_argument("gen")
    c.add_argument("--beat", default="", help="A / B / C / D / E1 / E2，決定容差")
    c.set_defaults(func=cmd_compare)

    args = p.parse_args()
    sys.exit(args.func(args) or 0)


if __name__ == "__main__":
    main()
