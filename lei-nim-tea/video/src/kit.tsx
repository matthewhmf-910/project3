import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const C = {
  paper: "#F1EADF",
  ink: "#3A302A",
  mute: "#9A8B7D",
  rule: "rgba(58,48,42,.22)",
  tea: "#A8814A",
};

export const ease = Easing.bezier(0.22, 0.8, 0.2, 1);

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face { font-family: "Noto Serif TC"; src: url(${staticFile("fonts/NotoSerifTC-VF.ttf")}); font-weight: 200 900; }
    @font-face { font-family: "Cormorant"; src: url(${staticFile("fonts/CormorantGaramond-VF.ttf")}); font-weight: 300 700; }
    @font-face { font-family: "Cormorant"; src: url(${staticFile("fonts/CormorantGaramond-Italic-VF.ttf")}); font-weight: 300 700; font-style: italic; }
  `}</style>
);

export const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(0,0,0,.03) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  </AbsoluteFill>
);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress between frames a and b, eased. */
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

/** Photo inside a window: slow push-in, fade/blur in, optional exit. */
export const Photo: React.FC<{
  src: string;
  from: number;
  to: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pos?: string;
  zoom?: [number, number];
  drift?: [number, number];
  reveal?: "fade" | "wipeUp" | "wipeLeft" | "iris";
  fadeOut?: boolean;
  origin?: string;
}> = ({ src, from, to, x, y, w, h, pos = "50% 50%", zoom = [1.04, 1.12], drift = [0, 0], reveal = "fade", fadeOut = true, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to + 1) return null;
  const inP = prog(f, from, from + 24);
  const outP = fadeOut ? prog(f, to - 18, to) : 0;
  const t = interpolate(f, [from, to], [0, 1], clamp);
  const s = interpolate(t, [0, 1], zoom);
  const dx = interpolate(t, [0, 1], [0, drift[0]]);
  const dy = interpolate(t, [0, 1], [0, drift[1]]);

  let clip = "none";
  let opacity = 1;
  if (reveal === "wipeUp") clip = `inset(${(1 - inP) * 100}% 0 0 0)`;
  else if (reveal === "wipeLeft") clip = `inset(0 0 0 ${(1 - inP) * 100}%)`;
  else if (reveal === "iris") clip = `circle(${inP * 75}% at 50% 50%)`;
  else opacity = inP;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: "hidden",
        clipPath: clip,
        opacity: opacity * (1 - outP),
      }}
    >
      <Img
        src={staticFile(`assets/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          transform: `translate(${dx}px, ${dy}px) scale(${s})`,
          transformOrigin: origin,
          filter: `blur(${(1 - inP) * 6}px)`,
        }}
      />
    </div>
  );
};

/** Text that surfaces one character at a time: blur→sharp, rising, like steam settling. */
export const Breathe: React.FC<{
  text: string;
  at: number;
  out?: number;
  stagger?: number;
  vertical?: boolean;
  style?: React.CSSProperties;
}> = ({ text, at, out, stagger = 5, vertical = false, style }) => {
  const f = useCurrentFrame();
  const chars = Array.from(text);
  const outP = out !== undefined ? prog(f, out, out + 20) : 0;
  return (
    <div style={{ writingMode: vertical ? "vertical-rl" : undefined, whiteSpace: "pre", ...style }}>
      {chars.map((ch, i) => {
        const p = prog(f, at + i * stagger, at + i * stagger + 26);
        const shift = (1 - p) * 14;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p * (1 - outP),
              filter: `blur(${(1 - p) * 8 + outP * 6}px)`,
              transform: vertical ? `translateY(${-shift}px)` : `translateY(${shift}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Hairline that draws itself. */
export const Rule: React.FC<{ at: number; x: number; y: number; w: number; out?: number; vertical?: boolean; color?: string }> = ({
  at, x, y, w, out, vertical = false, color = C.rule,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 30);
  const o = out !== undefined ? 1 - prog(f, out, out + 18) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: vertical ? 1 : w * p,
        height: vertical ? w * p : 1,
        background: color,
        opacity: o,
      }}
    />
  );
};

export const zh: React.CSSProperties = { fontFamily: "Noto Serif TC", fontWeight: 300, color: C.ink };
export const en: React.CSSProperties = { fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 300, color: C.ink };
export const meta: React.CSSProperties = {
  fontFamily: "Cormorant",
  fontWeight: 500,
  fontSize: 17,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: C.mute,
};

/**
 * Frame-accurate port of the shadcn/fancy "VerticalCutReveal": every unit sits in its own
 * clipping box and springs up from below. Same knobs as the React component
 * (splitBy, staggerDuration in seconds, staggerFrom, spring damping/stiffness).
 */
export const VerticalCutReveal: React.FC<{
  children: string;
  at: number;
  out?: number;
  splitBy?: "characters" | "words";
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  damping?: number;
  stiffness?: number;
  vertical?: boolean;
  style?: React.CSSProperties;
}> = ({
  children, at, out, splitBy = "characters", staggerDuration = 0.04, staggerFrom = "center",
  damping = 20, stiffness = 300, vertical = false, style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const units = splitBy === "words" ? children.split(/(\s+)/) : Array.from(children);
  const n = units.length;
  const order = (i: number) =>
    staggerFrom === "first" ? i : staggerFrom === "last" ? n - 1 - i : Math.abs(i - (n - 1) / 2);
  const config = { damping, stiffness, mass: 1 };
  return (
    <div style={{ writingMode: vertical ? "vertical-rl" : undefined, whiteSpace: "pre", ...style }}>
      {units.map((u, i) => {
        const delay = Math.round(order(i) * staggerDuration * fps);
        const pIn = spring({ frame: f - at - delay, fps, config });
        const pOut = out !== undefined ? spring({ frame: f - out - delay, fps, config }) : 0;
        const y = (1 - pIn) * 100 - pOut * 100;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <span style={{ display: "inline-block", transform: `translateY(${y}%)` }}>{u}</span>
          </span>
        );
      })}
    </div>
  );
};

/**
 * Hairline grid background with softly pulsing translucent blocks.
 * Cell = 1/8 of the hero window width, so the hero image spans exactly 8 cells.
 */
export const GridPulse: React.FC<{ cell?: number; originX?: number; originY?: number }> = ({
  cell = 111, originX = 96, originY = 330,
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const x0 = originX % cell;
  const y0 = originY % cell;
  const cols = Math.ceil((width - x0) / cell);
  const rows = Math.ceil((height - y0) / cell);
  // deterministic hash → which cells carry a block, and their phase
  const h = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const r = h(i, j);
      if (r > 0.22) continue;
      const period = 4 + r * 10; // 4–6 s breathing
      const phase = h(j, i) * Math.PI * 2;
      const a = 0.5 + 0.5 * Math.sin((f / fps) * ((Math.PI * 2) / period) + phase);
      blocks.push(
        <div
          key={`${i}-${j}`}
          style={{
            position: "absolute",
            left: x0 + i * cell + 1,
            top: y0 + j * cell + 1,
            width: cell - 1,
            height: cell - 1,
            background: r < 0.07 ? "rgba(168,129,74,1)" : "rgba(255,255,255,1)",
            opacity: (r < 0.07 ? 0.07 : 0.55) * a,
          }}
        />,
      );
    }
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(58,48,42,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(58,48,42,.07) 1px, transparent 1px)",
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: `${x0}px ${y0}px`,
        }}
      />
      {blocks}
    </AbsoluteFill>
  );
};

/** Full-bleed variant: white hairline grid + frosted glass blocks floating over the photo. */
export const GlassGrid: React.FC<{ cell?: number; originX?: number; originY?: number }> = ({
  cell = 135, originX = 0, originY = 0,
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const h = (i: number, j: number) => {
    const s = Math.sin(i * 91.7 + j * 271.3) * 43758.5453;
    return s - Math.floor(s);
  };
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const r = h(i, j);
      if (r > 0.1) continue;
      const period = 4 + r * 20;
      const a = 0.5 + 0.5 * Math.sin((f / fps) * ((Math.PI * 2) / period) + h(j, i) * Math.PI * 2);
      blocks.push(
        <div
          key={`${i}-${j}`}
          style={{
            position: "absolute",
            left: originX + i * cell + 1,
            top: originY + j * cell + 1,
            width: cell - 1,
            height: cell - 1,
            background: "rgba(255,255,255,.10)",
            backdropFilter: "blur(10px)",
            opacity: a,
          }}
        />,
      );
    }
  }
  return (
    <AbsoluteFill>
      {blocks}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px)",
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: `${originX}px ${originY}px`,
        }}
      />
    </AbsoluteFill>
  );
};
