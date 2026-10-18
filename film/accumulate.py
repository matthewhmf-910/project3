"""Average motion-blur sub-samples: sub/f_NNNN_S.png -> frames/f_NNNN.png."""
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image

subs, frames, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
groups = defaultdict(list)
for f in sorted(os.listdir(subs)):
    groups[f.rsplit("_", 1)[0]].append(os.path.join(subs, f))
for key, files in groups.items():
    acc = sum(np.asarray(Image.open(f).convert("RGB"), np.float32) for f in files) / len(files)
    Image.fromarray(np.clip(acc + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(frames, key + ".png"))
