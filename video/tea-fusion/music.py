"""Original 10 s music bed + SFX at 132 BPM, synced to the beat grid in story.md.

Usage: python3 -I music.py out/music.wav
Act 1 (day, 0–6.38 s): bright plucked pentatonic, half-time kick, shaker.
Act 2 (night, 6.5 s on): lower plucks, bass, warm pad, four-on-the-floor kick.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 10.0
BEAT = 60 / 132
B0 = 0.10
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rs = np.random.default_rng(7)


def beat(k):
    return B0 + k * BEAT


def put(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    L[i:i + n] += sig[:n] * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + n] += sig[:n] * gain * np.sqrt(0.5 * (1 + pan))


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def lowpass(x, width):
    k = np.ones(width) / width
    return np.convolve(x, k, mode='same')


def pluck(midi, dur=0.9, bright=0.5):
    """Karplus-Strong string, a guzheng-ish pluck."""
    f = hz(midi)
    period = int(SR / f)
    buf = rs.uniform(-1, 1, period)
    buf = lowpass(buf, max(1, int(3 * (1 - bright)) + 1))
    out = np.empty(int(dur * SR))
    decay = 0.996
    for i in range(len(out)):
        j = i % period
        nxt = buf[(j + 1) % period]
        out[i] = buf[j]
        buf[j] = decay * 0.5 * (buf[j] + nxt)
    env = np.minimum(1, np.arange(len(out)) / 40)
    return out * env * np.exp(-np.arange(len(out)) / (SR * dur * 0.45))


def kick(gain=1.0):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * gain


def noise_burst(dur, decay, smooth=1):
    n = int(dur * SR)
    x = rs.normal(0, 1, n)
    if smooth > 1:
        x = lowpass(x, smooth)
    x = x - lowpass(x, 6)  # crude high-pass
    return x * np.exp(-np.arange(n) / (SR * decay))


def tone(f, dur, decay, partials=((1, 1.0),)):
    t = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in partials)
    return s * np.exp(-t / decay) * np.minimum(1, t * 400)


def swell(t0, t1, rising=True, gain=0.35):
    n = int((t1 - t0) * SR)
    x = rs.normal(0, 1, n)
    out = np.zeros(n)
    # crossfade three filtered bands to fake a sweeping filter
    bands = [lowpass(x, w) for w in (40, 12, 3)]
    p = np.linspace(0, 1, n) if rising else np.linspace(1, 0, n)
    w0 = np.clip(1 - 2 * p, 0, 1)
    w2 = np.clip(2 * p - 1, 0, 1)
    w1 = 1 - w0 - w2
    out = bands[0] * w0 * 3 + bands[1] * w1 * 1.6 + bands[2] * w2 * 0.8
    env = p ** 2 if rising else (1 - np.linspace(0, 1, n)) ** 2
    put(out * env, t0, 0, gain)


# --- D major pentatonic plucks ---
day = [74, 78, 81, 83, 86, 83, 81, 78]           # D5 F#5 A5 B5 D6 ...
night = [62, 66, 69, 71, 69, 66, 64, 66]         # lower, warmer
for i in range(int((DUR - B0) / (BEAT / 2))):
    t = B0 + i * BEAT / 2
    if t > 9.3:
        break
    if t < 6.38:
        if t < beat(1) and i % 2:
            continue
        note = day[i % 8] if (i // 8) % 2 == 0 else day[(i + 3) % 8]
        put(pluck(note, 0.7, 0.8), t, pan=(-.4 if i % 2 else .3), gain=0.22)
    elif t >= 6.46:
        if i % 2 == 0 or i % 8 == 3:
            put(pluck(night[i % 8], 1.0, 0.4), t, pan=(-.3 if i % 2 else .35), gain=0.24)

# --- drums ---
for k in range(22):
    t = beat(k)
    if t > 9.25:
        break
    if t < 6.38:
        if k % 4 in (0, 2):
            put(kick(), t, 0, 0.5)
    elif t >= 6.46:
        put(kick(), t, 0, 0.6)
        if k % 2 == 1:
            put(noise_burst(0.18, 0.04, 2), t, 0.1, 0.18)  # soft clap
for i in range(int(9.2 / (BEAT / 4))):
    t = B0 + i * BEAT / 4
    put(noise_burst(0.05, 0.012), t, 0.5 if i % 2 else -0.5, 0.05 if i % 4 else 0.08)  # shaker

# --- bass + pad in act 2 ---
roots = [38, 35, 31, 33]  # D2 B1 G1 A1, one per bar
for b in range(3):
    t = beat(14 + 4 * b)
    if t > 9.3:
        break
    d = min(4 * BEAT, 9.6 - t)
    s = tone(hz(roots[b]), d, 1.2, ((1, 1), (2, .35), (3, .12)))
    put(np.tanh(s * 1.5), t, 0, 0.22)
t0 = 6.46
pad = sum(tone(hz(m), 3.4, 3.0, ((1, 1), (2, .2))) for m in (50, 57, 62, 66, 71))
pad *= np.minimum(1, np.arange(len(pad)) / (SR * 0.6))
put(lowpass(pad, 6), t0, 0, 0.05)

# --- SFX on story beats ---
for tp in (beat(2), beat(3), beat(4)):                     # matcha puffs
    put(lowpass(noise_burst(0.3, 0.09), 8), tp, 0.2, 0.5)
for tp in (beat(7), beat(8), beat(9)):                     # whisk swish into each clean ring
    put(lowpass(noise_burst(0.25, 0.08), 3), tp - 0.18, -0.2, 0.18)
for tp in (2.60, 4.65, 6.33):                              # card flicks
    put(noise_burst(0.03, 0.006), tp, -0.6, 0.25)
swell(4.45, 4.62, True, 0.25)                              # whip
swell(4.62, 4.85, False, 0.2)
swell(5.9, 6.46, True, 0.35)                               # iris riser into the night
put(tone(55, 0.6, 0.25) * 0.9, 6.46, 0, 0.5)               # night downbeat boom
put(tone(1250, 0.4, 0.12, ((1, 1), (2.4, .3))), beat(15), -0.3, 0.12)   # flower plink
put(kick(1.2), beat(16), 0, 0.6)                           # leaf stamp thump
put(lowpass(noise_burst(0.4, 0.15), 4), beat(16), 0, 0.2)
swell(8.0, 8.74, True, 0.3)                                # push-in riser
chime = tone(hz(86), 2.2, 0.9, ((1, 1), (2.76, .4), (5.4, .2))) + tone(hz(93), 2.2, 0.8, ((1, .5),))
put(chime, beat(19), 0.1, 0.22)                            # hero lands
put(tone(hz(38), 1.5, 0.6), beat(19), 0, 0.3)

# --- master ---
fade = np.ones(N)
fs = int(9.4 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(2.2 * L / peak), np.tanh(2.2 * R / peak)  # soft limit to sit near the reference's loudness
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.89, R / peak * 0.89
data = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print('wrote', sys.argv[1])
