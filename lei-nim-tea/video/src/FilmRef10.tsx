import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish, FullBleed } from "./FilmStrip";
import { FontFaces } from "./kit";

// 10-second cut that follows the reference clip shot-for-shot:
//   0.00–1.46s  static 3-frame film strip, footage moving inside each frame,
//               "Make a / Pause" on the centre frame, red wash builds before the cut
//   1.46s →     hard cut to full-bleed handheld shots, ~1.15s each, no type.
// Reference measured at 720×1280 / 24fps; geometry below is ×1.5, timing converted to 30fps.

const CUT = 44; // 1.46s
const CLIP = "assets/clips/clip01_tea_pour_strainer_1080.mp4";

// Strip geometry (static — the strip itself never moves in the reference)
const FX = 46; // measured 31 ×1.5
const FW = 999; // measured 666 ×1.5
const FH = 637; // measured 425 ×1.5
const R = 30;
const FRAMES_Y = [-10, 639, 1288]; // 12px gaps (measured 8 ×1.5)

const StripFrame: React.FC<{ y: number; src: string; pos: string; pan: [number, number]; blur: number }> = ({ y, src, pos, pan, blur }) => {
  const f = useCurrentFrame();
  const dx = interpolate(f, [0, CUT], pan);
  const id = `pb${y}`;
  return (
    <div style={{ position: "absolute", left: FX, top: y, width: FW, height: FH, borderRadius: R, overflow: "hidden", background: "#111" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <Img
        src={staticFile(`assets/${src}`)}
        style={{
          position: "absolute",
          left: -120,
          top: 0,
          width: FW + 240,
          height: FH,
          objectFit: "cover",
          objectPosition: pos,
          transform: `translateX(${dx}px) scale(1.12)`,
          filter: `url(#${id}) saturate(.55) brightness(.82)`, // measured sat .19, mean L 64
        }}
      />
      <div style={{ position: "absolute", inset: 0, borderRadius: R, boxShadow: "inset 0 0 36px rgba(0,0,0,.55)" }} />
    </div>
  );
};

const Notch: React.FC<{ cy: number }> = ({ cy }) => (
  <div
    style={{
      position: "absolute",
      left: -14,
      top: cy - 110,
      width: 66,
      height: 220,
      borderRadius: 14,
      background: "#000",
      border: "2px solid rgba(206,96,48,.85)",
    }}
  />
);

const Strip: React.FC = () => {
  const f = useCurrentFrame();
  // red wash that builds over the last ~10 frames before the cut (reference: R channel climbs 1.2s→1.46s)
  const wash = interpolate(f, [CUT - 12, CUT - 1], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOn = f >= 4 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <Notch cy={-30} />
      <Notch cy={958} />
      <Notch cy={1930} />
      <StripFrame y={FRAMES_Y[0]} src="10_spiral_staircase.jpg" pos="50% 35%" pan={[70, -150]} blur={5} />
      <StripFrame y={FRAMES_Y[1]} src="01_entrance_neon_island.jpg" pos="20% 55%" pan={[-60, 110]} blur={4} />
      <div style={{ position: "absolute", left: FX, top: FRAMES_Y[2], width: FW, height: FH, borderRadius: R, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(CLIP)} muted startFrom={20} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 62%", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: R, boxShadow: "inset 0 0 36px rgba(0,0,0,.55)" }} />
      </div>

      <AbsoluteFill style={{ background: "rgb(26,30,36)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingLeft: 2, opacity: textOn }}>
        <div
          style={{
            fontFamily: "Nunito Sans",
            fontWeight: 800,
            fontSize: 145, // cap height 68 ×1.5 ÷ 0.705
            lineHeight: 0.95, // line pitch 92 ×1.5 ÷ 145
            letterSpacing: "-0.015em",
            color: "#fff",
            textAlign: "center",
            textShadow: "0 2px 16px rgba(0,0,0,.25)",
            transform: "translate(-24px, -6px)", // block sits 16px left of frame centre
          }}
        >
          Make a
          <br />
          Pause
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "rgb(200,40,20)", mixBlendMode: "screen", opacity: wash }} />
    </AbsoluteFill>
  );
};

// Full-bleed run after the cut — ~35 frames (1.16s) per shot, matching the reference rhythm.
const SHOTS: { src: string; from: number; to: number; pos?: string; zoom?: [number, number] }[] = [
  { src: "01_entrance_neon_island.jpg", from: CUT, to: 80, pos: "22% 50%", zoom: [1.1, 1.14] },
  { src: "03_HERO_tea_pour_fish_rice.jpg", from: 125, to: 165, pos: "42% 55%", zoom: [1.04, 1.1] },
  { src: "04_soy_chicken_bao_salad.jpg", from: 165, to: 195, pos: "50% 65%", zoom: [1.1, 1.14] },
  { src: "13_full_table_set.jpg", from: 195, to: 225, pos: "50% 62%", zoom: [1.08, 1.12] },
  { src: "07_cocktail_flower_counter.jpg", from: 225, to: 260, pos: "55% 55%", zoom: [1.08, 1.13] },
  { src: "11_layered_tea_latte_coaster.jpg", from: 260, to: 300, pos: "45% 62%", zoom: [1.06, 1.12] },
];

export const FilmRef10: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontFaces />
      {f < CUT ? <Strip /> : SHOTS.map((s) => <FullBleed key={s.src} {...s} />)}
      {/* real footage: tea poured through the strainer (80–125) */}
      <Sequence from={80} durationInFrames={45}>
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(CLIP)} muted startFrom={60} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};
