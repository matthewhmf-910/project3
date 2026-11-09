"""SFX stem for the 3.0s one-take version (72 frames @24fps).
Timeline: slash whoosh 0.54s -> hit/snap 0.667s -> 0.2s silence -> chopsticks POP 1.30s + nod tick 1.45s
-> lift whoosh 1.75s -> carry whoosh 1.92s -> slurp 2.20s -> chime 2.45s."""
import sys, wave
import numpy as np

SR = 48000
DUR = 3.0
out = np.zeros(int(SR * DUR))
rng = np.random.default_rng(7)

def place(sig, at, gain=1.0):
    i = int(at * SR); n = min(len(sig), len(out) - i)
    out[i:i + n] += sig[:n] * gain

def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(t / max(attack, 1e-4), 1.0) * np.exp(-t / decay)

def lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")

def whoosh(dur, f0, f1):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    k = np.linspace(f0, f1, n)
    sig = noise - lp(noise, 6)
    sig = sig * (0.4 + 0.6 * np.sin(2 * np.pi * np.cumsum(k) / SR) ** 2)
    return sig * np.sin(np.pi * t / t[-1]) ** 2

HIT = 16 / 24
place(whoosh(0.15, 800, 4000), HIT - 0.13, 0.55)
# HIT: sharp click + inharmonic metal ring + paper snap
n = int(0.03 * SR)
place(np.diff(rng.standard_normal(n + 1)) * env(n, 0.0003, 0.004), HIT, 0.9)
n = int(0.35 * SR); t = np.arange(n) / SR
ring = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(2210, 1), (3470, .6), (5130, .4), (6980, .2)])
place(ring * env(n, 0.0005, 0.06), HIT, 0.35)
n = int(0.06 * SR)
place(lp(rng.standard_normal(n), 3) * env(n, 0.0005, 0.012), HIT + 0.01, 0.6)
# (beat pause after the hit)
# chopsticks POP
n = int(0.09 * SR); t = np.arange(n) / SR
f = 900 * np.exp(-t * 30) + 260
place(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.025), 1.30, 0.7)
# nod tick
n = int(0.05 * SR); t = np.arange(n) / SR
tick = (np.sin(2 * np.pi * 1800 * t) + 0.5 * np.sin(2 * np.pi * 2700 * t)) * env(n, 0.0005, 0.008)
place(tick, 1.45, 0.45)
# noodles lifted out of the bowl, then carried across the divider
place(whoosh(0.18, 600, 1800), 1.75, 0.3)
place(whoosh(0.30, 2200, 700), 1.92, 0.45)
# slurp
n = int(0.4 * SR); t = np.arange(n) / SR
fc = 300 + 2200 * (t / t[-1]) ** 1.5
slurp = rng.standard_normal(n) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(fc) / SR)) * np.sin(np.pi * t / t[-1]) ** 0.7
place(lp(slurp, 12), 2.20, 0.6)
# chime
n = int(0.55 * SR); t = np.arange(n) / SR
chime = sum(a * np.sin(2 * np.pi * fr * t) for fr, a in [(1568, 1), (2352, .5), (3136, .3), (4180, .15)])
place(chime * env(n, 0.003, 0.22), 2.45, 0.25)

fo = int(0.03 * SR); out[-fo:] *= np.linspace(1, 0, fo)
out = out / np.max(np.abs(out)) * 0.85
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
