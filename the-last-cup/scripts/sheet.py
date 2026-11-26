"""Tile review stills into a contact sheet with timecodes: python scripts/sheet.py <dir> <out.jpg> [cols] [width]"""
import sys, glob, os
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 300
files = sorted(glob.glob(os.path.join(src, "f*.jpg")))
ims = [Image.open(f).convert("RGB") for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 22)), (18, 14, 10))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
    fr = int(os.path.basename(f)[1:4])
    d.text((x + 6, y + th + 4), f"f{fr:03d}  {fr/30:.2f}s", fill=(230, 220, 200))
sheet.save(out, quality=90)
print(out, sheet.size)
