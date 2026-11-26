"""THE LAST CUP — score, foley and mix, synthesised from audio/timeline.json (the picture's own cue list).

Layers: room tone (ambience) · foley (pour, drips, clay, cloth, ceramic, bubbles, furin) · koto (Karplus–Strong).
Writes out/mix.wav (48 kHz stereo, float). Loudness is normalised to −14 LUFS in scripts/master.sh.
"""
import json, os
import numpy as np
from scipy import signal
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 48000
TL = json.load(open(os.path.join(HERE, "timeline.json")))
DUR = TL["dur"] + 0.0
N = int(DUR * SR)
rng = np.random.default_rng(1234)


def buf():
    return np.zeros((N, 2))


def add(dst, snd, t, gain=1.0, pan=0.0):
    """mix mono/stereo snd into dst at time t (s), equal-power pan in [-1, 1]"""
    if snd.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        snd = np.stack([snd * l, snd * r], 1)
    i = int(round(t * SR))
    if i >= N:
        return
    j = min(N, i + len(snd))
    if i < 0:
        snd, i = snd[-i:], 0
    dst[i:j] += snd[: j - i] * gain


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x, axis=0)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x, axis=0)


def pink(n):
    w = rng.standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w)


def reverb_ir(seconds=1.8, tone=5000, seed=3):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * np.exp(-t * 6.9 / seconds)[:, None]
    ir = lp(ir, tone)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir**2).sum(0))


def convolve(x, ir):
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)
    return out


# ---------------------------------------------------------------- sources
def koto(midi, vel=0.6, dur=3.2):
    """Karplus–Strong koto: bright pluck, a small downward bend on the attack, silk-string decay."""
    f = 440 * 2 ** ((midi - 69) / 12)
    n = int(dur * SR)
    period = SR / f
    L = int(period)
    burst = rng.uniform(-1, 1, L) * np.hanning(L) ** 0.3
    y = np.zeros(n)
    y[:L] = burst
    damp = 0.996 - 0.0008 * max(0, midi - 60) / 12
    frac = period - L
    for i in range(L + 1, n):
        # fractional delay + 2-tap average (string loss)
        a = y[i - L] * (1 - frac) + y[i - L - 1] * frac
        y[i] = damp * 0.5 * (a + y[i - L])
    # attack bend: koto players press then release (pitch slides ~ +40 cents → 0) — emulate with a resampled head
    head = int(0.09 * SR)
    bend = 2 ** (np.linspace(0.035, 0, head) / 1.0)
    idx = np.cumsum(bend)
    idx = idx[idx < n - 1]
    y[: len(idx)] = np.interp(idx, np.arange(n), y)
    pluck = bp(rng.standard_normal(int(0.012 * SR)), 1800, 7000) * np.linspace(1, 0, int(0.012 * SR))
    y[: len(pluck)] += pluck * 0.25
    # wooden body resonance
    body = bp(y, 180, 900, 1) * 0.35 + y
    body *= np.minimum(1, np.arange(n) / (0.002 * SR))
    body *= np.exp(-np.arange(n) / SR / (dur * 0.55))
    return body / (np.abs(body).max() + 1e-9) * vel


def furin(vel=1.0, dur=3.4, f0=2310.0):
    """glass wind bell: inharmonic partials, each with its own decay, plus a clapper 'chirr' of tiny re-strikes."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    parts = [(1.0, 1.0, 1.6), (2.31, 0.55, 0.9), (2.92, 0.3, 0.7), (4.18, 0.22, 0.45), (5.53, 0.12, 0.3), (0.51, 0.18, 1.2)]
    y = np.zeros(n)
    for ratio, amp, dec in parts:
        fr = f0 * ratio * (1 + 0.0007 * np.sin(2 * np.pi * 5.5 * t))  # slight beating
        y += amp * np.sin(2 * np.pi * np.cumsum(fr) / SR + rng.uniform(0, 6.28)) * np.exp(-t / dec)
    y *= np.minimum(1, t / 0.0015)
    out = y.copy()
    for k, (dt, g) in enumerate([(0.11, 0.35), (0.19, 0.22), (0.31, 0.15), (0.52, 0.1)]):
        i = int(dt * SR)
        out[i:] += y[: n - i] * g
    return out / np.abs(out).max() * vel


def tink(vel=0.3):
    return furin(vel, 1.6, f0=2310 * 1.003)[: int(1.6 * SR)]


def pour(dur=2.25):
    """tea pour: a narrow liquid stream into a filling cup — noisy gurgle whose resonance rises as the cup fills."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    # resonance sweeps up as the air column shortens
    for k, (lo, hi, g) in enumerate([(380, 620, 1.0), (900, 1500, 0.6), (2200, 4200, 0.35)]):
        seg = 2048
        out = np.zeros(n)
        for s in range(0, n, seg):
            c = 1 + 0.9 * (s / n)
            e = min(n, s + seg + 512)
            chunk = bp(noise[s:e], lo * c, hi * c)
            out[s:min(n, s + seg)] += chunk[: min(n, s + seg) - s]
        y += out * g
    # gurgle amplitude modulation
    am = 0.6 + 0.4 * np.abs(signal.sosfilt(signal.butter(2, 18, "lowpass", fs=SR, output="sos"), rng.standard_normal(n))) * 6
    y *= np.clip(am, 0, 1.6)
    # bubbles: small chirped sines
    for _ in range(70):
        b0 = rng.uniform(0, dur - 0.1)
        add_b = bubble(rng.uniform(700, 2400), rng.uniform(0.01, 0.035))
        i = int(b0 * SR)
        y[i:i + len(add_b)] += add_b[: n - i] * rng.uniform(0.2, 0.6)
    fade = np.minimum(1, t / 0.08) * np.clip((dur - t) / 0.18, 0, 1)
    return y / np.abs(y).max() * fade


def bubble(f, d):
    n = int(d * 4 * SR)
    t = np.arange(n) / SR
    fr = f * (1 + 2.2 * t / d)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / d) * np.minimum(1, t / 0.0008)


def thunk(vel=0.8):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    y = 0.9 * np.sin(2 * np.pi * 118 * t) * np.exp(-t / 0.05)
    y += 0.35 * np.sin(2 * np.pi * 236 * t + 1) * np.exp(-t / 0.04)
    y += 0.25 * np.sin(2 * np.pi * 471 * t) * np.exp(-t / 0.03)
    click = bp(rng.standard_normal(n), 1200, 5000) * np.exp(-t / 0.004)
    return (y + click * 0.4) * vel


def ceramic(vel=0.5):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(2140, 1, 0.12), (3390, 0.6, 0.08), (5210, 0.35, 0.05), (7400, 0.15, 0.03)])
    y += bp(rng.standard_normal(n), 2000, 8000) * np.exp(-t / 0.003) * 0.5
    return y * vel


def cloth(dur, vel=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = bp(pink(n), 500, 4500)
    shape = np.sin(np.pi * t / dur) ** 1.5
    y *= shape * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t) ** 2)
    return y / (np.abs(y).max() + 1e-9) * vel


def swell(dur):
    """J-cut into the dive: a breath of air and a reversed shimmer rising to the breach"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    air = bp(pink(n), 300, 6000) * (t / dur) ** 2.2
    shimmer = furin(1, dur, f0=1540)[::-1] * (t / dur) ** 1.5
    y = air / np.abs(air).max() * 0.6 + shimmer * 0.25
    return y


def bloop(vel=0.9):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    fr = 70 + 260 * np.exp(-t / 0.05)
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.22)
    y += lp(rng.standard_normal(n), 900) * np.exp(-t / 0.06) * 0.5
    return y * vel


# ---------------------------------------------------------------- build stems
sec = TL["sec"]
amb, foley, music, wetbus, under = buf(), buf(), buf(), buf(), buf()

# ambience: quiet room tone + far city hush; near-silence in the ellipsis, returns for the goodbye
tt = np.arange(N) / SR
room = np.stack([lp(pink(N), 1800), lp(pink(N), 1800)], 1)
room = room / np.abs(room).max()
city = np.stack([bp(pink(N), 60, 260), bp(pink(N), 60, 260)], 1)
city = city / np.abs(city).max()
lvl = np.ones(N) * 0.05
in_mem = (tt >= sec["dive"]) & (tt < sec["rise"])
sil = (tt >= sec["rise"]) & (tt < sec["chime"])
lvl[sil] = 0.012
lvl = signal.sosfiltfilt(signal.butter(2, 6, "lowpass", fs=SR, output="sos"), lvl)
amb += (room * 0.7 + city * 0.3) * lvl[:, None]

for e in TL["events"]:
    t, ty, v = e["t"], e["type"], e.get("vel", 0.6)
    if ty == "pour":
        add(foley, pour(e["dur"]), t, 0.26, -0.1)
    elif ty == "drip":
        add(foley, bubble(1650, 0.02), t, v * 0.5, -0.1)
        add(foley, bubble(980, 0.03), t + 0.004, v * 0.2, -0.1)
    elif ty == "thunk":
        add(foley, thunk(v), t, 0.7, -0.35)
    elif ty == "cloth":
        add(foley, cloth(e["dur"], v), t - 0.05, 0.35, 0.05)
    elif ty == "touch":
        add(foley, ceramic(v), t, 0.35, 0.0)
    elif ty == "koto":
        k = koto(int(e["note"]), v)
        if e.get("wet"):
            add(under, k, t, 0.55, 0.15)
        else:
            add(music, k, t, 0.62, 0.25 - (int(e["note"]) - 64) * 0.03)
    elif ty == "koto-chord":
        for i, m in enumerate(int(x) for x in e["notes"].split(",")):
            add(music, koto(m, v, 4.0), t + i * 0.055, 0.42, -0.25 + i * 0.17)  # a rolled chord
    elif ty == "swell":
        add(foley, swell(e["dur"]), t, 0.35, 0.0)
    elif ty == "bloop":
        add(under, bloop(v), t, 0.7, 0.0)
    elif ty == "bubbles":
        for _ in range(26):
            add(under, bubble(rng.uniform(350, 1200), rng.uniform(0.015, 0.04)), t + rng.uniform(0, e["dur"]), rng.uniform(0.1, 0.3), rng.uniform(-0.6, 0.6))
    elif ty == "chime":
        add(foley, furin(v), t, 0.42, 0.45)
        add(wetbus, furin(v), t, 0.25, 0.45)
    elif ty == "chime-tink":
        add(foley, tink(v), t, 0.4, 0.5)

# underwater bus: muffled, with a long warm tail
under_ambient = np.stack([lp(pink(N), 500), lp(pink(N), 500)], 1)
under_ambient = under_ambient / np.abs(under_ambient).max() * 0.06
mem_env = signal.sosfiltfilt(signal.butter(2, 10, "lowpass", fs=SR, output="sos"), in_mem.astype(float))
under += under_ambient * mem_env[:, None]
under = lp(under, 1400)
under = under + convolve(under, reverb_ir(2.6, 1800, 7)) * 0.6
# the memory cuts off as we rise into the empty cup (the silence)
cut = 1 - signal.sosfiltfilt(signal.butter(2, 14, "lowpass", fs=SR, output="sos"), (tt >= sec["rise"] - 0.02).astype(float))
under *= np.clip(cut, 0, 1)[:, None]

# music: room reverb; koto tails fade into the silence before the chime, then the chord blooms
room_ir = reverb_ir(1.7, 5200, 3)
music = music + convolve(music, room_ir) * 0.35
gate = np.ones(N)
gate[sil] = 0.0
gate = signal.sosfiltfilt(signal.butter(2, 8, "lowpass", fs=SR, output="sos"), gate)
music *= np.clip(gate, 0, 1)[:, None]
foley = foley + convolve(foley, room_ir) * 0.18 + convolve(wetbus, reverb_ir(3.0, 7000, 9)) * 0.5

mix = amb + foley + music * 0.9 + under
# ease the very end to silence over the last 0.25 s so the film doesn't click off
mix *= np.clip((DUR - tt) / 0.25, 0, 1)[:, None]
mix = hp(mix, 30)
peak = np.abs(mix).max()
mix = mix / peak * 0.7
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
sf.write(os.path.join(ROOT, "out", "mix.wav"), mix.astype(np.float32), SR, subtype="FLOAT")
# stems for the QA report (band energy check)
bands = {}
spec = np.abs(np.fft.rfft(mix.mean(1)))
freqs = np.fft.rfftfreq(N, 1 / SR)
total = (spec**2).sum()
for name, lo, hi in [("20-120", 20, 120), ("120-500", 120, 500), ("500-2k", 500, 2000), ("2k-8k", 2000, 8000), ("8k-20k", 8000, 20000)]:
    m = (freqs >= lo) & (freqs < hi)
    bands[name] = round(10 * np.log10((spec[m] ** 2).sum() / total + 1e-12), 1)
json.dump(bands, open(os.path.join(ROOT, "out", "bands.json"), "w"))
print("out/mix.wav", f"{DUR}s", "band energy dB:", bands)
