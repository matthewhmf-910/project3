"""Render the 5-frame sword-slash light streak (1080x1920 RGBA PNGs).
The streak cuts down from top-right across the blade at ~(780,870), where V1's blade sits on its last frame."""
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
P0, P1 = (985, 440), (600, 1270)          # slash start (top-right) -> end (lower-left)
# (length fraction, core alpha, core width, glow alpha)
FRAMES = [(0.45, 230, 10, 120), (1.0, 255, 14, 170), (1.0, 255, 18, 200), (1.0, 140, 9, 90), (1.0, 50, 4, 30)]

for i, (frac, a, wd, ga) in enumerate(FRAMES):
    end = (P0[0] + (P1[0] - P0[0]) * frac, P0[1] + (P1[1] - P0[1]) * frac)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).line([P0, end], fill=(255, 240, 210, ga), width=wd * 5)
    glow = glow.filter(ImageFilter.GaussianBlur(22))
    core = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(core)
    d.line([P0, end], fill=(255, 255, 255, a), width=wd)
    core = core.filter(ImageFilter.GaussianBlur(1.5))
    Image.alpha_composite(glow, core).save(sys.argv[1] % i)
