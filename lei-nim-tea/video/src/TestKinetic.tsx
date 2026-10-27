import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmFinish } from "./FilmStrip";
import { FontFaces } from "./kit";

// 5-second style test: kinetic poster type around a cut-out subject.
// Layer order: photo → big type (behind) → cut-out glass → front type → editorial UI.

const RED = "#D9262B";
const W = 1080;
const H = 1920;
// Source 1536×2048 covered into 1080×1920 → scale .9375, x offset −180.
const SRC_SCALE = H / 2048;
const SRC_X = (W - 1536 * SRC_SCALE) / 2;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Camera shared by photo and cut-out so they stay registered. */
const useCam = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 150], [1.04, 1.13]);
  const y = interpolate(f, [0, 150], [0, -30]);
  return { transform: `translateY(${y}px) scale(${s})`, transformOrigin: "55% 60%" };
};

const Plate: React.FC<{ src: string; dim?: number }> = ({ src, dim = 0 }) => (
  <AbsoluteFill style={useCam()}>
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", left: SRC_X, top: 0, width: 1536 * SRC_SCALE, height: H, filter: dim ? `brightness(${1 - dim})` : undefined }}
    />
  </AbsoluteFill>
);

/** A word that springs in along x or y, with motion blur matching its speed. */
const Fly: React.FC<{
  id: string;
  text: string;
  at: number;
  out?: number;
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  size: number;
  color?: string;
  rotate?: number;
  parallax?: number;
  style?: React.CSSProperties;
}> = ({ id, text, at, out = 999, x, y, dx = 0, dy = 0, size, color = "#fff", rotate = 0, parallax = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cfg = { damping: 18, stiffness: 140, mass: 0.9 };
  const pos = (fr: number) => {
    const pin = spring({ frame: fr - at, fps, config: cfg });
    const pout = spring({ frame: fr - out, fps, config: { damping: 30, stiffness: 220 } });
    return {
      x: x + dx * (1 - pin) - dx * 1.6 * pout + parallax * fr,
      y: y + dy * (1 - pin) - dy * 1.6 * pout,
      o: Math.min(1, pin * 3) * (1 - pout),
    };
  };
  const p = pos(f);
  const prev = pos(f - 1);
  const bx = Math.min(40, Math.abs(p.x - prev.x) * 0.6);
  const by = Math.min(40, Math.abs(p.y - prev.y) * 0.6);
  if (p.o <= 0.001) return null;
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={`mb-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={`${bx} ${by}`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          opacity: p.o,
          fontFamily: "Inter Tight",
          fontWeight: 900,
          fontSize: size,
          lineHeight: 0.9,
          letterSpacing: "-0.045em",
          color,
          whiteSpace: "nowrap",
          transform: `rotate(${rotate}deg)`,
          filter: bx + by > 0.3 ? `url(#mb-${id})` : undefined,
          ...style,
        }}
      >
        {text}
      </div>
    </>
  );
};

const mono: React.CSSProperties = { fontFamily: "Inter Tight", fontWeight: 500, fontSize: 22, color: "#fff", letterSpacing: "0.02em" };

/** Small boxed label with a leader line that draws itself to a target point. */
const Callout: React.FC<{ at: number; x: number; y: number; lx?: number; tx: number; ty: number; label: string; sub?: string }> = ({
  at, x, y, lx = 0, tx, ty, label, sub,
}) => {
  const f = useCurrentFrame();
  const box = interpolate(f, [at, at + 8], [0, 1], clamp);
  const line = interpolate(f, [at + 6, at + 20], [0, 1], clamp);
  const len = Math.hypot(tx - x - lx, ty - y - (lx ? 34 : 0));
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={x + lx} y1={lx ? y + 34 : y} x2={tx} y2={ty} stroke="#fff" strokeWidth={1.5} strokeDasharray={len} strokeDashoffset={len * (1 - line)} />
        <circle cx={tx} cy={ty} r={5 * line} fill="#fff" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y - 40,
          padding: "6px 10px",
          border: "1.5px solid #fff",
          clipPath: `inset(0 ${(1 - box) * 100}% 0 0)`,
          ...mono,
        }}
      >
        {label}
        {sub && <div style={{ fontSize: 15, opacity: 0.8, marginTop: 2 }}>{sub}</div>}
      </div>
    </>
  );
};

export const TestKinetic: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <FontFaces />
      <Plate src="assets/07_cocktail_flower_counter.jpg" dim={0.12} />

      {/* behind the glass */}
      <Fly id="pause" text="Pause" at={16} out={128} x={20} y={650} dy={420} size={380} color={RED} parallax={-0.25} />

      <Plate src="assets/cutouts/07_glass.png" />

      {/* in front of the glass */}
      <Fly id="make" text="Make" at={4} out={124} x={60} y={330} dx={-900} size={250} parallax={0.4} />
      <Fly id="a" text="a" at={10} out={126} x={720} y={430} dx={700} size={190} color={RED} rotate={-4} parallax={0.6} />
      <Fly id="slow" text="slow" at={46} out={120} x={70} y={1330} dy={260} size={150} parallax={-0.5} style={{ fontStyle: "italic" }} />
      <Fly id="sip" text="sip." at={54} out={122} x={560} y={1450} dx={500} size={150} color={RED} parallax={0.3} />

      {/* editorial UI */}
      <Callout at={66} x={800} y={660} lx={70} tx={780} ty={880} label="TEA COCKTAIL" sub="1/F · Lei Nim" />
      <Callout at={78} x={70} y={1666} lx={190} tx={690} ty={1700} label="離念・茶蒔" sub="Sheung Wan, HK" />

      <div style={{ position: "absolute", right: 60, bottom: 60, ...mono, opacity: interpolate(f, [60, 70], [0, 0.9], clamp) }}>[03/12]</div>
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 900,
          ...mono,
          fontSize: 18,
          transform: "rotate(-90deg)",
          transformOrigin: "left top",
          opacity: interpolate(f, [60, 70], [0, 0.8], clamp),
        }}
      >
        Make a Pause — Official Visit
      </div>

      <FilmFinish />
    </AbsoluteFill>
  );
};
