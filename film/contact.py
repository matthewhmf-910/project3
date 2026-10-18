"""Contact sheet of rendered frames: python3 film/contact.py frames_dir out.png [every_n] [cols]"""
import os
import sys

from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
every = int(sys.argv[3]) if len(sys.argv) > 3 else 6
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 10
files = sorted(f for f in os.listdir(src) if f.endswith(".png"))[::every]
tw, th = 216, 384
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 4), rows * (th + 22)), "white")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(src, f)).convert("RGB").resize((tw, th))
    x, y = (i % cols) * (tw + 4), (i // cols) * (th + 22)
    sheet.paste(im, (x, y + 20))
    n = int(f[2:6])
    d.text((x + 2, y + 4), f"{n / 30:.2f}s  #{n}", fill=(0, 0, 0))
sheet.save(out)
print(out, sheet.size, len(files), "frames")
