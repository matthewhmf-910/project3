"""Synthesize the SFX stem for the 26-frame (1.0833s) samurai clip.
Cut boundaries @24fps: C1 0-8f (0.000-0.333), C2 8-16f (0.333-0.667), C3 16-26f (0.667-1.083)."""
import sys, wave
import numpy as np

SR = 48000
DUR = 26 / 24
t_all = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t_all)
rng = np.random.default_rng(7)

def place(sig, at, gain=1.0):
    i = int(at * SR)
    n = min(len(sig), len(out) - i)
    out[i:i + n] += sig[:n] * gain

def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(t / max(attack, 1e-4), 1.0) * np.exp(-t / decay)

C2, C3 = 8 / 24, 16 / 24

# CUT 2 — paper CLICK on the hard cut (bright, very short noise burst, highpassed by differencing)
n = int(0.03 * SR)
click = np.diff(rng.standard_normal(n + 1)) * env(n, 0.0005, 0.004)
place(click, C2, 0.55)
# cute POP (fast downward pitch sweep sine)
n = int(0.09 * SR)
t = np.arange(n) / SR
f = 900 * np.exp(-t * 30) + 260
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.025)
place(pop, C2 + 0.04, 0.7)
# nod tick (small woodblock-ish tick) — lands after the 0.2s "beat pause" point
n = int(0.05 * SR)
t = np.arange(n) / SR
tick = (np.sin(2 * np.pi * 1800 * t) + 0.5 * np.sin(2 * np.pi * 2700 * t)) * env(n, 0.0005, 0.008)
place(tick, C2 + 0.20, 0.45)

# CUT 3 — slurp (band-limited noise with rising sweep)
n = int(0.32 * SR)
t = np.arange(n) / SR
noise = rng.standard_normal(n)
fc = 300 + 2200 * (t / t[-1]) ** 1.5
ph = 2 * np.pi * np.cumsum(fc) / SR
slurp = noise * (0.5 + 0.5 * np.sin(ph)) * np.sin(np.pi * t / t[-1]) ** 0.7
slurp = np.convolve(slurp, np.ones(12) / 12, mode="same")  # soften
place(slurp, C3 + 0.01, 0.6)
# chime (bell partials, rings to the end)
n = int(0.42 * SR)
t = np.arange(n) / SR
chime = sum(a * np.sin(2 * np.pi * fr * t) for fr, a in [(1568, 1), (2352, .5), (3136, .3), (4180, .15)])
place(chime * env(n, 0.003, 0.18), C3 + 0.12, 0.25)

# short fade-out on the last 20ms so the cut into the master doesn't click
fo = int(0.02 * SR)
out[-fo:] *= np.linspace(1, 0, fo)
out = out / np.max(np.abs(out)) * 0.85
pcm = (out * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print("wrote", sys.argv[1], len(out) / SR, "s")
