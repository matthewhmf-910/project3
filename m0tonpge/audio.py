"""Synthesize the 20 s sound bed (no third-party audio, so nothing to license).
Room tone + warm pad + ice clinks, cued from the same timeline as timeline.js."""
import numpy as np, wave, sys

# usage: audio.py out.wav [main|pour]
CUT = sys.argv[2] if len(sys.argv) > 2 else "main"
SR, DUR = 48000, (20.0 if CUT == "main" else 15.5)
n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(7)

def env(a, b, fade_in, fade_out):
    e = np.clip((t - a) / fade_in, 0, 1) * np.clip((b - t) / fade_out, 0, 1)
    return e * ((t >= a) & (t <= b))

# Street room tone: brown noise, low-passed.
room = np.cumsum(rng.standard_normal(n)); room -= np.convolve(room, np.ones(4800) / 4800, 'same')
room /= np.abs(room).max(); room *= 0.05

# Pad: Fmaj9-ish sines, slow swell. Ducks to near-silence at the turn (11.0-12.6 s).
pad = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in
          [(174.61, 1, 0), (220.0, .7, 1), (261.63, .6, 2), (329.63, .45, 3), (392.0, .3, 4)])
pad *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t)  # slow breathe
duck = 1 - 0.85 * (env(11.0, 12.6, 0.4, 0.5) if CUT == "main" else env(8.4, 9.4, 0.3, 0.4))
pad = pad / np.abs(pad).max() * 0.12 * env(0, DUR, 2.0, 1.5) * duck

# Ice clink: a few inharmonic decaying partials.
def clink(at, gain):
    s = np.zeros(n); i = int(at * SR); m = int(1.2 * SR); tt = np.arange(m) / SR
    tone = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2350, 9), (3710, 12), (5230, 16), (6890, 20)])
    s[i:i + m] = tone[: n - i] * gain; return s

if CUT == "main":
    sfx = clink(12.6, 0.18) + clink(12.78, 0.10) + clink(18.3, 0.12)
else:
    # Pour: soft band-passed trickle under the 0.7x pour (5.2-8.4 s), clinks on ice and on the final cup.
    w = rng.standard_normal(n); k = np.ones(12) / 12
    trickle = np.convolve(w, k, 'same') - np.convolve(w, np.ones(60) / 60, 'same')
    trickle *= 0.6 + 0.4 * np.sin(2 * np.pi * 5.3 * t + np.sin(2 * np.pi * 0.7 * t))
    sfx = trickle / np.abs(trickle).max() * 0.22 * env(5.2, 8.5, 0.25, 0.5)
    sfx += clink(3.95, 0.14) + clink(4.1, 0.08) + clink(6.9, 0.07) + clink(11.0, 0.12)
mix = room + pad + sfx
mix /= max(1.0, np.abs(mix).max() / 0.7)
st = np.stack([mix, mix * 0.98], 1)
pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
