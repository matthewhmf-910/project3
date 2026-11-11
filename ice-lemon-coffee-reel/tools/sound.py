"""Procedural soundtrack for the 15 s reel: lo-fi groove at 96 BPM + Foley synced to the animation.
Every cut in index.html sits on the 0.625 s beat grid, and the event times below mirror the JS timeline.
usage: python3 tools/sound.py out.wav
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
BEAT = 0.625
GRID0 = 0.625          # bar grid: bars start at 0.625 + 4k beats -> 3.125, 5.625, 8.125, 10.625, 13.125


def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i]
    a = np.clip(pan, -1, 1)
    L[i:i + len(sig)] += sig * gain * np.cos((a + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * gain * np.sin((a + 1) * np.pi / 4)


def add_st(l, r, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: l, r, i = l[-i:], r[-i:], 0
    n = min(len(l), N - i)
    L[i:i + n] += l[:n] * gain; R[i:i + n] += r[:n] * gain


def fftf(x, lo=0, hi=SR / 2, slope=1.0):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo > 0: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** (2 * slope))
    if hi < SR / 2: m *= 1 / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(X * m, len(x))


def sweep(x, f_lo, f_hi, q=1.0, chunk=1024):
    """time-varying band-pass via overlapped FFT chunks. f_lo/f_hi: arrays (per chunk centre) or callables of progress."""
    out = np.zeros(len(x) + chunk); win = np.hanning(chunk); hop = chunk // 2
    nch = max(1, (len(x) - chunk) // hop + 1)
    for k in range(nch + 1):
        s = k * hop; seg = x[s:s + chunk]
        if len(seg) < chunk: seg = np.pad(seg, (0, chunk - len(seg)))
        p = k / max(1, nch)
        lo, hi = f_lo(p), f_hi(p)
        X = np.fft.rfft(seg * win); f = np.fft.rfftfreq(chunk, 1 / SR)
        m = (1 / (1 + (lo / np.maximum(f, 1)) ** (2 * q))) * (1 / (1 + (f / hi) ** (2 * q)))
        out[s:s + chunk] += np.fft.irfft(X * m, chunk)
    return out[:len(x)]


def env(n, a=0.005, d=0.3, curve=1.0):
    t = tt(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d) ** curve
    return e


def noise(n): return rng.standard_normal(n)


# ---------------------------------------------------------------- instruments
def ep_note(m, dur, vel=1.0):
    n = int(SR * (dur + 1.2)); t = tt(n); f = mtof(m)
    det = 1 + 0.0015 * rng.standard_normal()
    s = (np.sin(2 * np.pi * f * det * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t + 0.3) * np.exp(-t * 3)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 6) + 0.25 * np.sin(2 * np.pi * 7.1 * f * t) * np.exp(-t * 40))
    e = np.minimum(1, t / 0.006) * np.exp(-t / 1.4)
    rel = np.clip((dur + 0.25 - t) / 0.25, 0, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.6 * t)
    return s * e * rel * trem * vel * 0.12


def chord(ms, t0, dur, vel=1.0, strum=0.012, gain=1.0):
    for i, m in enumerate(ms):
        add(ep_note(m, dur, vel), t0 + i * strum, gain, pan=-0.35 + 0.7 * i / max(1, len(ms) - 1))


def bass(m, t0, dur, vel=1.0):
    n = int(SR * (dur + .2)); t = tt(n); f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    s = np.tanh(1.6 * s) * np.minimum(1, t / .01) * np.clip((dur - t) / .08 + 1, 0, 1) * np.exp(-t / 1.6)
    add(s * 0.3 * vel, t0)


def kick(t0, g=1.0):
    n = int(SR * .5); t = tt(n); f = 45 + 95 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .22) + 0.4 * noise(n) * np.exp(-t / .004)
    add(np.tanh(s * 1.5) * 0.55 * g, t0)


def snare(t0, g=1.0):
    n = int(SR * .4); t = tt(n)
    s = fftf(noise(n), 900, 6000) * np.exp(-t / .12) * 0.9 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / .06) * 0.6
    add(fftf(s, 0, 5200) * 0.28 * g, t0, pan=.08)


def hat(t0, g=1.0, open_=False):
    n = int(SR * (.35 if open_ else .07)); t = tt(n)
    s = fftf(noise(n), 6500) * np.exp(-t / (.12 if open_ else .022))
    add(s * 0.09 * g, t0, pan=.3)


def clink(t0, g=1.0, pitch=1.0, pan=0.0):
    n = int(SR * .9); t = tt(n)
    fr = np.array([2093, 3411, 5274, 7902, 4400]) * pitch * (1 + 0.02 * rng.standard_normal(5))
    dc = np.array([.32, .22, .14, .08, .18])
    s = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / d) * a for f, d, a in zip(fr, dc, [1, .7, .5, .3, .4]))
    s += fftf(noise(n), 3000) * np.exp(-t / .003) * 1.5
    add(s * 0.09 * g, t0, pan=pan)


def whoosh(t0, dur, g=1.0, up=True, pan=0.0):
    n = int(SR * dur); p = np.linspace(0, 1, n)
    x = noise(n)
    lo = (lambda q: 300 + 2500 * q) if up else (lambda q: 2800 - 2400 * q)
    s = sweep(x, lo, lambda q: lo(q) * 3.5, q=1.2) * np.sin(np.pi * p) ** 1.5
    add(s * 0.35 * g, t0, pan=pan)


def pour(t0, dur, lo, hi, g=1.0, bubble=30, pan=0.0):
    n = int(SR * dur); t = tt(n)
    x = fftf(noise(n), lo, hi)
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * bubble * t + 3 * np.sin(2 * np.pi * 3.1 * t)))
    blips = np.zeros(n)
    for _ in range(int(dur * bubble * .6)):
        i = rng.integers(0, max(1, n - 3000)); f = rng.uniform(lo * 1.2, hi * .7); m = int(SR * .025)
        blips[i:i + m] += np.sin(2 * np.pi * np.linspace(f, f * 1.6, m) * tt(m)) * np.exp(-tt(m) / .008)
    e = np.minimum(1, t / .08) * np.clip((dur - t) / .15, 0, 1)
    add((x * am * .5 + blips * .25) * e * 0.4 * g, t0, pan=pan)


def scooter(tc, direction, g=1.0, base=95):
    dur = 2.6; n = int(SR * dur); t = tt(n) - dur / 2
    v = 12.0; d0 = 4.0
    dist = np.sqrt(d0 ** 2 + (v * t) ** 2)
    rad = -v * v * t / dist                      # radial velocity → doppler
    f = base * (1 + 0.04 * np.sin(2 * np.pi * 7 * tt(n))) * 343 / (343 - rad * 1.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sign(np.sin(ph)) * .3 + np.sin(ph * 2) * .4 + np.sin(ph * 3) * .2) + fftf(noise(n), 400, 3000) * .25
    s = fftf(s, 60, 2200) / dist ** 1.2 * 6
    pan = np.clip(direction * v * t / 6, -1, 1)
    add_st(s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4), tc - dur / 2, 0.22 * g)


# ---------------------------------------------------------------- intro: street (0 → 3.125)
amb = fftf(noise(int(SR * 3.4)), 40, 500) * 0.06 + fftf(noise(int(SR * 3.4)), 800, 4000) * 0.008
amb *= np.minimum(1, tt(len(amb)) / .3) * np.clip((3.4 - tt(len(amb))) / .3, 0, 1)
add(amb, 0)
for (tc, dr, g, b) in [(1.27, 1, .9, 92), (1.92, 1, 1.3, 105), (2.15, -1, .7, 88), (2.26, -1, .6, 98)]:
    scooter(tc, dr, g, b)
for k in range(9):                                # birds
    t0 = 0.4 + k * 0.23 + rng.random() * .1; n = int(SR * .09); f0 = rng.uniform(3200, 4600)
    add(np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f0 * 1.35, n)) / SR) * np.sin(np.pi * np.linspace(0, 1, n)) * .03, t0, pan=-.6 + rng.random() * .4)
# rolling shutter going up: rattle of slats + motor
sh_t0, sh_t1 = 0.3, 1.45
n = int(SR * (sh_t1 - sh_t0)); t = tt(n)
rat = np.zeros(n)
pos = 0
while pos < n:
    m = int(SR * .02)
    rat[pos:pos + m] += fftf(noise(m), 1500, 7000) * np.exp(-tt(m) / .004)
    pos += int(SR * (0.045 + 0.02 * rng.random()))
motor = np.sin(2 * np.pi * 110 * t) * .3 + np.sin(2 * np.pi * 220 * t) * .1
add((rat * .5 + motor * .15) * np.minimum(1, t / .05) * np.clip(((sh_t1 - sh_t0) - t) / .1, 0, 1) * .5, sh_t0, pan=.1)
add(fftf(noise(int(SR * .3)), 200, 2500) * np.exp(-tt(int(SR * .3)) / .05) * .25, sh_t1)   # clunk at top
# filtered pad under the street
pad_n = int(SR * 3.3); pt = tt(pad_n)
pad = sum(np.sin(2 * np.pi * mtof(m) * pt + i) for i, m in enumerate([53, 57, 60, 64, 67]))
pad = fftf(pad, 0, 700) * np.minimum(1, pt / 1.2) * 0.035
add(pad, 0)
# fly-in riser + impact on the cut into the café
whoosh(2.25, 0.9, 1.4, up=True)
n = int(SR * .9); t = tt(n)
add(np.sin(2 * np.pi * (40 + 60 * np.exp(-t * 12)) * t) * np.exp(-t / .35) * .5, 3.125)

# ---------------------------------------------------------------- music (3.125 → 15)
PROG = [  # (bar start, bass midi, chord voicing)
    (3.125, 41, [57, 60, 64, 67]),   # Fmaj9
    (5.625, 40, [55, 59, 62, 64]),   # Em7
    (8.125, 38, [53, 57, 60, 64]),   # Dm9
    (10.625, 43, [60, 62, 65, 69]),  # G9sus
    (13.125, 36, [52, 59, 62, 64, 67]),  # Cmaj9 — resolves as COOLEST lands
]
for b0, bm, ch in PROG:
    final = b0 > 13
    chord(ch, b0, 1.4 if not final else 1.9, 1.0, gain=.75)
    # warm pad bed so energy never drops between hits
    pn = int(SR * (2.5 if not final else 1.9)); pt2 = tt(pn)
    pd = sum(np.sin(2 * np.pi * mtof(m) * pt2 * (1 + .002 * j)) for j, m in enumerate(ch + [c + 12 for c in ch[:2]]))
    pd = fftf(pd, 0, 1400) * np.minimum(1, pt2 / .35) * np.clip(((pn / SR) - pt2) / .4, 0, 1) * .022
    add(pd, b0, pan=-.15); add(pd, b0 + .01, pan=.15)
    if not final:
        chord(ch, b0 + 1.5 * BEAT, .35, .55)
        chord([c + 12 for c in ch[1:3]], b0 + 3 * BEAT, .25, .35)
    bass(bm, b0, .9 if not final else 1.8)
    if not final:
        bass(bm, b0 + 2.5 * BEAT, .3, .8); bass(bm + 12, b0 + 3.5 * BEAT, .15, .6)
# drums: groove 3.125 → 12.28 (break for the transition), hit on 13.125
k = 0
while True:
    tb = 3.125 + k * BEAT
    if tb >= 12.25: break
    bb = k % 4
    if bb in (0, 2): kick(tb)
    if bb == 1 and k % 8 == 5: kick(tb + .75 * BEAT, .6)
    if bb in (1, 3): snare(tb)
    hat(tb, .9); hat(tb + 0.58 * BEAT, .5)
    k += 1
kick(13.125, 1.2)
n = int(SR * 2.0); t = tt(n)
add(fftf(noise(n), 4000) * np.exp(-t / .7) * .1, 13.125, pan=.2)          # soft crash
for i in range(6): hat(13.125 + (i + 1) * BEAT, .55 - i * .08)
# vinyl crackle + hiss across the whole film
cr = np.zeros(N); idx = rng.integers(0, N, 900); cr[idx] = rng.standard_normal(900) * .25
cr = fftf(cr, 1500) + fftf(noise(N), 3000, 9000) * .004
L += cr * .5; R += cr * .5

# ---------------------------------------------------------------- foley
ICE = [3.4375, 3.75, 3.906, 4.0625, 4.219, 4.375]
for i, t0 in enumerate(ICE):
    clink(t0, 1.1 - i * .07, pitch=1 + .06 * (i % 3), pan=-.2 + .08 * i)
    whoosh(t0 - .22, .2, .15, up=False)
add(np.sin(2 * np.pi * 130 * tt(int(SR * .2))) * np.exp(-tt(int(SR * .2)) / .05) * .25, ICE[0])
# knife: swish, slice, juicy burst, slow-mo drop
whoosh(4.92, .24, 1.0, up=True, pan=.4)
n = int(SR * .5); t = tt(n)
add(fftf(noise(n), 2500, 9000) * np.exp(-t / .06) * .5 + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / .25) * .12, 5.16)
add(fftf(noise(int(SR * .6)), 300, 2500) * np.exp(-tt(int(SR * .6)) / .12) * .35, 5.18, pan=-.1)
n = int(SR * 1.0); t = tt(n)
add(np.sin(2 * np.pi * (60 * np.exp(-t * 1.5) + 30) * t) * np.exp(-t / .5) * .35, 5.16)
whoosh(6.08, .34, 1.1, up=True, pan=-.3)           # whip to glass
clink(6.52, .8, pitch=.8)                          # lemon wheel drops in
pour(6.42, .9, 500, 4000, 1.0, bubble=34, pan=.15)  # juice
fz = fftf(noise(int(SR * 1.2)), 5000) * .02 * np.minimum(1, tt(int(SR * 1.2)) / .3)
add(fz * np.exp(-tt(len(fz)) / .9), 6.65, pan=.2)    # fizz
whoosh(7.3, .48, 1.2, up=False)                    # lemon iris
# espresso machine: click, pump hum, trickle
add(fftf(noise(int(SR * .05)), 1000) * np.exp(-tt(int(SR * .05)) / .006) * .4, 7.56)
n = int(SR * 1.15); t = tt(n)
hum = (np.sin(2 * np.pi * 50 * t) + .5 * np.sin(2 * np.pi * 100 * t) + .25 * np.sin(2 * np.pi * 150 * t)) * np.minimum(1, t / .1) * np.clip((1.15 - t) / .1, 0, 1)
add(fftf(hum, 0, 600) * .12, 7.58, pan=-.1)
pour(7.76, .9, 900, 3500, .45, bubble=20, pan=0)
whoosh(8.6, .3, 1.0, up=False)                     # whip down
pour(8.88, 1.04, 300, 2500, .9, bubble=24, pan=-.05)  # espresso into glass
n = int(SR * 1.5); t = tt(n)
add(np.sin(2 * np.pi * 70 * t) * np.exp(-t / .6) * .15 * np.minimum(1, t / .2), 9.0)  # bloom rumble
pour(10.12, .93, 150, 1500, .9, bubble=12, pan=.1)  # cold foam (thicker, lower)
n = int(SR * .3); t = tt(n)
add(np.sin(2 * np.pi * np.cumsum(260 * np.exp(-t * 9) + 110) / SR) * np.exp(-t / .07) * .25, 11.52)  # garnish plop
whoosh(11.55, .45, .35, up=False, pan=.3)          # spoon slide
clink(12.04, .9, pitch=1.25, pan=.3)               # spoon "ting"
# the ripple transition → resolution
n = int(SR * .85); t = tt(n)
rev = fftf(noise(n), 2000) * (t / .85) ** 3 * .25
add(rev, 13.125 - .85)
whoosh(12.28, .7, 1.3, up=True)
for i in range(7):                                  # COOLEST letters land
    tl = 12.82 + i * .045 + .22
    n = int(SR * .12); t = tt(n)
    add(np.sin(2 * np.pi * (90 + 40 * np.exp(-t * 30)) * t) * np.exp(-t / .04) * .12, tl)
for i, m in enumerate([84, 88, 91, 95]):            # shine sweep shimmer
    n = int(SR * 1.2); t = tt(n)
    add(np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t / .5) * np.minimum(1, t / .01) * .05, 14.0 + i * .09, pan=-.4 + .27 * i)

# ---------------------------------------------------------------- reverb + master
def reverb(x, secs=1.6, mix=.22):
    n = int(SR * secs); ir = rng.standard_normal(n) * np.exp(-tt(n) / (secs / 5)); ir = fftf(ir, 200, 7000); ir /= np.sqrt(np.sum(ir ** 2))
    m = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]
    return x + wet * mix

L = reverb(L); R = reverb(R)
fade = np.clip((DUR - tt(N)) / .6, 0, 1) ** 1.5
L *= fade; R *= fade
mx = np.max(np.abs(np.concatenate([L, R]))) + 1e-9
L = np.tanh(L / mx * 1.3) / np.tanh(1.3) * .89; R = np.tanh(R / mx * 1.3) / np.tanh(1.3) * .89
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('wrote', sys.argv[1] if len(sys.argv) > 1 else 'audio.wav')
