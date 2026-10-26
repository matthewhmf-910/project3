import sys, glob, numpy as np
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/*.png'))
prev = None
for i, f in enumerate(fs):
    a = np.asarray(Image.open(f).convert('L'), dtype=np.int16)
    if prev is not None:
        d = np.abs(a - prev)
        up, lo, logo = d[112:298].mean(), d[298:487].mean(), d[540:600].mean()
        rows = np.where(d.mean(1) > 4)[0]
        span = f"{rows.min()}-{rows.max()}" if len(rows) else "-"
        print(f"{i:3d} t={i/30:5.3f} up={up:5.2f} lo={lo:5.2f} logo={logo:4.2f} rows={span}")
    prev = a
