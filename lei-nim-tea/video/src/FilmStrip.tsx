import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Look matched to the reference clip: vertical 35mm strip, rounded frames,
// sprocket rebate on the left edge, strip running upward through the gate.

export const STRIP = {
  frameW: 960,
  frameH: 600,
  gap: 26,
  left: 84,
  radius: 22,
};

export const sans: React.CSSProperties = {
  fontFamily: "Nunito Sans",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.01em",
  textShadow: "0 2px 18px rgba(0,0,0,.35)",
};

export const FilmStrip: React.FC<{
  images: string[];
  from: number;
  speed?: number; // px per frame
  children?: React.ReactNode;
}> = ({ images, from, speed = 34, children }) => {
  const f = useCurrentFrame() - from;
  const { height } = useVideoConfig();
  const pitch = STRIP.frameH + STRIP.gap;
  // gate weave: tiny horizontal jitter, like film running through a projector
  const weave = (random(`w${Math.floor(f / 2)}`) - 0.5) * 3;
  // projector pull-down: each frame holds in the gate, then snaps to the next,
  // so the title always sits inside the centre frame. `speed` sets the cycle length.
  const cycle = Math.max(8, Math.round(pitch / speed));
  const pull = 5;
  const step = Math.floor(f / cycle);
  const inPull = interpolate(f % cycle, [cycle - pull, cycle], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const offset = (step + inPull * inPull) * pitch;
  const first = Math.floor(offset / pitch) - 1;
  const count = Math.ceil(height / pitch) + 3;

  const frames: React.ReactNode[] = [];
  for (let k = 0; k < count; k++) {
    const idx = first + k;
    const y = idx * pitch - offset + (height - STRIP.frameH) / 2 - pitch;
    const src = images[((idx % images.length) + images.length) % images.length];
    frames.push(
      <React.Fragment key={idx}>
        <div
          style={{
            position: "absolute",
            left: STRIP.left + weave,
            top: y,
            width: STRIP.frameW,
            height: STRIP.frameH,
            borderRadius: STRIP.radius,
            overflow: "hidden",
            boxShadow: "inset 0 0 40px rgba(0,0,0,.55)",
          }}
        >
          <Img
            src={staticFile(`assets/${src}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(1.2px) saturate(.92)" }}
          />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 50px rgba(0,0,0,.5)", borderRadius: STRIP.radius }} />
        </div>
        {/* sprocket hole on the rebate, one per frame */}
        <div
          style={{
            position: "absolute",
            left: 14 + weave,
            top: y + STRIP.frameH / 2 - 90,
            width: 40,
            height: 180,
            borderRadius: 10,
            background: "#000",
            border: "2px solid rgba(214,92,38,.75)",
            boxShadow: "0 0 14px rgba(214,92,38,.35)",
          }}
        />
      </React.Fragment>,
    );
  }

  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      {frames}
      {children}
    </AbsoluteFill>
  );
};

/** Full-bleed photo with slow push and a hint of handheld drift. */
export const FullBleed: React.FC<{
  src: string;
  from: number;
  to: number;
  pos?: string;
  zoom?: [number, number];
  origin?: string;
}> = ({ src, from, to, pos = "50% 50%", zoom = [1.06, 1.14], origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const t = interpolate(f, [from, to], [0, 1]);
  const s = interpolate(t, [0, 1], zoom);
  const dx = Math.sin(f / 23) * 5 + Math.sin(f / 9.7) * 1.5;
  const dy = Math.cos(f / 29) * 6 + Math.cos(f / 11.3) * 1.5;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`assets/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          transform: `translate(${dx}px, ${dy}px) scale(${s})`,
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

/** Red/orange light-leak burst centred on frame `at`. */
export const LightLeak: React.FC<{ at: number; len?: number }> = ({ at, len = 14 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [at - len / 2, at, at + len / 2], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (a <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: a,
        background:
          "radial-gradient(120% 70% at 20% 30%, rgba(255,70,30,.95), rgba(255,120,40,.55) 40%, rgba(120,10,0,.0) 75%)",
      }}
    />
  );
};

/** Moving film grain + soft vignette over everything. */
export const FilmFinish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 24} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)" }} />
    </AbsoluteFill>
  );
};
