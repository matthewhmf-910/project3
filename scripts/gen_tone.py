"""Generate a simple WAV (sine tone with fade in/out) using numpy.

Usage: python3 scripts/gen_tone.py public/tone.wav --freq 440 --seconds 3
"""
import argparse
import wave

import numpy as np


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("out")
    parser.add_argument("--freq", type=float, default=440.0)
    parser.add_argument("--seconds", type=float, default=3.0)
    parser.add_argument("--rate", type=int, default=48000)
    parser.add_argument("--volume", type=float, default=0.3)
    args = parser.parse_args()

    t = np.arange(int(args.seconds * args.rate)) / args.rate
    signal = np.sin(2 * np.pi * args.freq * t) * args.volume
    fade = min(len(t) // 10, args.rate // 10)
    envelope = np.ones_like(t)
    envelope[:fade] = np.linspace(0, 1, fade)
    envelope[-fade:] = np.linspace(1, 0, fade)
    pcm = (signal * envelope * 32767).astype(np.int16)

    with wave.open(args.out, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(args.rate)
        f.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
