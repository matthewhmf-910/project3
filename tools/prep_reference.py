#!/usr/bin/env python3
"""
prep_reference.py — 把一張角色圖整成 Omni 1.1 reference image 的規格。

檢查並修正四件事（規格見 docs/asset_attachment_list.md §5）：
  1. 有沒有 alpha（沒去背的直接擋下，不幫你亂摳）
  2. 短邊 ≥ 1024（不足就 Lanczos 放大）
  3. 主體佔畫幅 60–80%（太滿會被 crop 截肢，太空會浪費解析度）
  4. 輸出 PNG 無損

用法：
  python3 tools/prep_reference.py check  <img> [img ...]      只報告，不寫檔
  python3 tools/prep_reference.py prep   <img> --out <out.png>
"""

import argparse
import os
import sys

import numpy as np
from PIL import Image

MIN_SHORT_EDGE = 1024
COVERAGE_LO, COVERAGE_HI = 0.60, 0.80


def subject_bbox(im):
    """用 alpha 找主體 bbox；沒有 alpha 就回 None。"""
    if im.mode != "RGBA":
        return None
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 8)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def report(path):
    im = Image.open(path)
    w, h = im.size
    short = min(w, h)
    has_alpha = im.mode == "RGBA"
    bb = subject_bbox(im) if has_alpha else None

    print(f"\n{os.path.basename(path)}")
    print(f"  尺寸        {w}x{h}   短邊 {short}")

    ok = True
    if not has_alpha:
        print(f"  去背        ✗ 無 alpha（mode={im.mode}）— 必須先去背才能當 reference")
        ok = False
    else:
        print(f"  去背        ✓ RGBA")

    if short < MIN_SHORT_EDGE:
        print(f"  解析度      ✗ 短邊 {short} < {MIN_SHORT_EDGE}，需放大 {MIN_SHORT_EDGE/short:.2f}x")
        ok = False
    else:
        print(f"  解析度      ✓")

    if bb:
        bw, bh = bb[2] - bb[0], bb[3] - bb[1]
        cov = max(bw / w, bh / h)
        flag = "✓" if COVERAGE_LO <= cov <= COVERAGE_HI else "✗"
        if flag == "✗":
            ok = False
        print(f"  主體佔比    {flag} {cov*100:.0f}%（目標 {COVERAGE_LO*100:.0f}–{COVERAGE_HI*100:.0f}%）"
              f"  bbox {bw}x{bh}")
        # 畫布大小可以靠補白達標，但細節只看主體原生像素——分開報，免得報喜不報憂
        detail = max(bw, bh)
        dflag = "✓" if detail >= MIN_SHORT_EDGE * 0.85 else "△"
        print(f"  主體原生    {dflag} 長邊 {detail}px"
              + ("" if dflag == "✓" else "  — 補白不會增加細節，材質可能偏軟"))
        pad = min(bb[0], bb[1], w - bb[2], h - bb[3])
        print(f"  最小留白    {pad}px" + ("" if pad > 0 else "  ✗ 主體貼邊，會被截斷"))
        if pad == 0:
            ok = False

    print(f"  判定        {'可直接附上' if ok else '需先 prep'}")
    return ok


def prep(path, out, coverage=0.72):
    im = Image.open(path)
    if im.mode != "RGBA":
        sys.exit(f"{path} 沒有 alpha。先去背，本工具不代摳圖。")
    bb = subject_bbox(im)
    if bb is None:
        sys.exit(f"{path} 的 alpha 全空。")

    sub = im.crop(bb)
    bw, bh = sub.size

    # 目標畫布：主體長邊佔 coverage，短邊 ≥ MIN_SHORT_EDGE
    canvas_long = max(int(round(max(bw, bh) / coverage)), MIN_SHORT_EDGE)
    scale = (canvas_long * coverage) / max(bw, bh)
    nw, nh = max(1, int(round(bw * scale))), max(1, int(round(bh * scale)))
    sub = sub.resize((nw, nh), Image.LANCZOS)

    side = max(canvas_long, MIN_SHORT_EDGE)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(sub, ((side - nw) // 2, (side - nh) // 2), sub)
    canvas.save(out, "PNG")

    cov = max(nw, nh) / side
    print(f"{os.path.basename(path)} → {out}")
    print(f"  {side}x{side} RGBA，主體佔比 {cov*100:.0f}%，"
          f"四邊留白 ≥{min((side-nw)//2,(side-nh)//2)}px")


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("check", help="只報告規格，不寫檔")
    c.add_argument("images", nargs="+")

    q = sub.add_parser("prep", help="放大＋置中＋留白，輸出合規 PNG")
    q.add_argument("image")
    q.add_argument("--out", required=True)
    q.add_argument("--coverage", type=float, default=0.72)

    a = p.parse_args()
    if a.cmd == "check":
        allok = all([report(i) for i in a.images])   # 不可短路，每張都要報告
        print()
        sys.exit(0 if allok else 1)
    prep(a.image, a.out, a.coverage)


if __name__ == "__main__":
    main()
