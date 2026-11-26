"""Audio QA: spectrogram with cue markers, koto pitch check, silence-gap level. python scripts/audio_qa.py <wav> <out.png>"""
import sys, json
import numpy as np, soundfile as sf
from scipy import signal
from PIL import Image, ImageDraw
wav, outp = sys.argv[1], sys.argv[2]
x, sr = sf.read(wav)
m = x.mean(1) if x.ndim > 1 else x
tl = json.load(open('audio/timeline.json'))
f, t, S = signal.spectrogram(m, sr, nperseg=2048, noverlap=1536)
S = 10 * np.log10(S + 1e-12)
keep = f < 9000
S = S[keep][::-1]
S = np.clip((S - (S.max() - 80)) / 80, 0, 1)
W, H = 1600, 420
img = Image.fromarray((S * 255).astype(np.uint8)).resize((W, H)).convert('RGB')
d = ImageDraw.Draw(img)
for e in tl['events']:
    xx = int(e['t'] / tl['dur'] * W)
    d.line([(xx, 0), (xx, H)], fill=(255, 140, 60), width=1)
    d.text((xx + 2, 4 + (hash(e['type']) % 6) * 12), e['type'], fill=(255, 220, 160))
img.save(outp)
# koto pitch check on the first note (E4 = 329.6 Hz expected)
seg = m[int(0.05 * sr):int(0.6 * sr)]
spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
fr = np.fft.rfftfreq(len(seg), 1 / sr)
band = (fr > 250) & (fr < 420)
print('koto E4 peak Hz:', round(float(fr[band][spec[band].argmax()]), 1))
def rms_db(a, b):
    s = m[int(a * sr):int(b * sr)]
    return round(20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-12), 1)
print('silence gap 6.85-7.45 dBFS:', rms_db(6.85, 7.45), ' chime 7.5-8.0 dBFS:', rms_db(7.5, 8.0), ' pour 0.2-2.0:', rms_db(0.2, 2.0))
