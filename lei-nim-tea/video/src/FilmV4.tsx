import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FilmFinish, FilmStrip, FullBleed, LightLeak, sans } from "./FilmStrip";
import { FontFaces, VerticalCutReveal } from "./kit";

// Reference-matched cut: film-strip intro with one line of type → light leak →
// full-bleed photos, fast handheld rhythm, no type → film-strip outro.

const SHOTS: { src: string; from: number; to: number; pos?: string; zoom?: [number, number]; origin?: string }[] = [
  { src: "01_entrance_neon_island.jpg", from: 90, to: 150, pos: "30% 50%" },
  { src: "08_puerh_cakes_incense_shelf.jpg", from: 150, to: 200, pos: "40% 20%" },
  { src: "09_tea_bricks_tins_teaware.jpg", from: 200, to: 250 },
  { src: "10_spiral_staircase.jpg", from: 250, to: 310, pos: "60% 40%" },
  { src: "02_matcha_sift.jpg", from: 310, to: 375, pos: "50% 60%" },
  { src: "03_HERO_tea_pour_fish_rice.jpg", from: 375, to: 480, pos: "40% 55%", zoom: [1.0, 1.1] },
  { src: "04_soy_chicken_bao_salad.jpg", from: 480, to: 535, pos: "50% 65%" },
  { src: "13_full_table_set.jpg", from: 535, to: 590, pos: "50% 60%" },
  { src: "11_layered_tea_latte_coaster.jpg", from: 590, to: 645, pos: "45% 60%" },
  { src: "06_dining_room_shelves.jpg", from: 645, to: 700 },
  { src: "07_cocktail_flower_counter.jpg", from: 700, to: 760, pos: "55% 55%" },
  // zoomed from bottom-left so the street signage on the right never enters frame
  { src: "12_cocktail_night_street.jpg", from: 760, to: 815, zoom: [1.3, 1.34], origin: "0% 100%" },
];

const Title: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingLeft: 40, opacity: o }}>
      {children}
    </AbsoluteFill>
  );
};

export const FilmV4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      <FontFaces />

      {f < 96 && (
        <FilmStrip from={0} images={["10_spiral_staircase.jpg", "06_dining_room_shelves.jpg", "01_entrance_neon_island.jpg", "13_full_table_set.jpg", "09_tea_bricks_tins_teaware.jpg"]}>
          <Title at={10}>
            <div style={{ ...sans, fontSize: 104, lineHeight: 1.02 }}>
              <VerticalCutReveal at={10} splitBy="words" staggerDuration={0.06} staggerFrom="first">Make a</VerticalCutReveal>
              <VerticalCutReveal at={14} splitBy="words" staggerDuration={0.06} staggerFrom="first">Pause</VerticalCutReveal>
            </div>
          </Title>
        </FilmStrip>
      )}

      {SHOTS.map((s) => (
        <FullBleed key={s.src} {...s} />
      ))}

      {f >= 812 && (
        <FilmStrip from={812} images={["07_cocktail_flower_counter.jpg", "03_HERO_tea_pour_fish_rice.jpg", "11_layered_tea_latte_coaster.jpg", "02_matcha_sift.jpg"]} speed={22}>
          <Title at={826}>
            <div style={{ ...sans, fontFamily: "Noto Sans TC", fontWeight: 700, fontSize: 92, letterSpacing: "0.12em", lineHeight: 1.1 }}>
              <VerticalCutReveal at={826} staggerDuration={0.05} staggerFrom="center">離念・茶蒔</VerticalCutReveal>
            </div>
            <div style={{ ...sans, fontSize: 40, fontWeight: 700, marginTop: 18, letterSpacing: "0.02em" }}>
              <VerticalCutReveal at={840} splitBy="words" staggerDuration={0.05} staggerFrom="first">Make a Pause · Sheung Wan</VerticalCutReveal>
            </div>
          </Title>
        </FilmStrip>
      )}

      <LightLeak at={92} />
      <LightLeak at={700} len={18} />
      <LightLeak at={812} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
