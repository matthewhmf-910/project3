import React from "react";
import { AbsoluteFill } from "remotion";
import { C, en, FontFaces, GridPulse, meta, Paper, Photo, Rule, VerticalCutReveal, zh } from "./kit";

const Abs: React.FC<{ x?: number; y: number; right?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, right, children, style,
}) => <div style={{ position: "absolute", left: x, right, top: y, ...style }}>{children}</div>;

// SEG 1 · 0–300 · 上環，慢一拍。
const Seg1: React.FC = () => (
  <>
    <Photo src="01_entrance_neon_island.jpg" from={0} to={110} x={216} y={360} w={648} h={900} pos="30% 50%" zoom={[1.02, 1.12]} />
    <Photo src="08_puerh_cakes_incense_shelf.jpg" from={100} to={180} x={216} y={360} w={648} h={900} pos="40% 15%" reveal="wipeUp" drift={[0, -20]} />
    <Photo src="10_spiral_staircase.jpg" from={170} to={240} x={216} y={360} w={648} h={900} pos="60% 40%" reveal="wipeLeft" drift={[0, 30]} />
    <Photo src="09_tea_bricks_tins_teaware.jpg" from={230} to={312} x={216} y={360} w={648} h={900} pos="25% 55%" zoom={[1.05, 1.35]} origin="30% 55%" />

    <Abs x={96} y={250}><VerticalCutReveal at={8} out={280} style={meta} staggerDuration={0.02}>SHEUNG WAN · HONG KONG</VerticalCutReveal></Abs>
    <Abs right={96} y={250}><VerticalCutReveal at={14} out={280} style={meta} staggerDuration={0.02}>01 / 03</VerticalCutReveal></Abs>

    <Abs x={96} y={360}>
      <VerticalCutReveal at={30} out={272} vertical style={{ ...zh, fontSize: 44, lineHeight: 1.9, letterSpacing: "0.36em" }} staggerDuration={0.08}>上環，慢一拍。</VerticalCutReveal>
    </Abs>

    <Rule at={80} x={216} y={1320} w={648} out={276} />
    <Abs x={216} y={1348}><VerticalCutReveal at={110} out={272} style={{ ...en, fontSize: 34 }} staggerDuration={0.02}>Sheung Wan, one beat slower.</VerticalCutReveal></Abs>
  </>
);

// SEG 2 · 300–600 · 一壺茶，倒進飯裡。 (hero)
const Seg2: React.FC = () => (
  <>
    <Photo src="02_matcha_sift.jpg" from={300} to={372} x={96} y={330} w={888} h={1000} pos="50% 60%" reveal="iris" />
    <Photo src="03_HERO_tea_pour_fish_rice.jpg" from={362} to={505} x={96} y={330} w={888} h={1000} pos="40% 60%" zoom={[1.0, 1.08]} reveal="wipeUp" />
    <Photo src="04_soy_chicken_bao_salad.jpg" from={495} to={555} x={96} y={330} w={888} h={1000} pos="50% 65%" reveal="wipeLeft" />
    <Photo src="11_layered_tea_latte_coaster.jpg" from={548} to={610} x={96} y={330} w={888} h={1000} pos="45% 55%" zoom={[1.0, 1.15]} />

    <Abs x={96} y={250}><VerticalCutReveal at={300} out={580} style={meta} staggerDuration={0.02}>TEA AT THE TABLE</VerticalCutReveal></Abs>
    <Abs right={96} y={250}><VerticalCutReveal at={306} out={580} style={meta} staggerDuration={0.02}>02 / 03</VerticalCutReveal></Abs>

    <Abs x={96} y={1380}>
      <VerticalCutReveal at={390} out={574} style={{ ...zh, fontSize: 46, letterSpacing: "0.28em" }} staggerDuration={0.08}>一壺茶，倒進飯裡。</VerticalCutReveal>
    </Abs>
    <Abs x={96} y={1462}><VerticalCutReveal at={445} out={574} style={{ ...en, fontSize: 34 }} staggerDuration={0.02}>Tea, poured slowly into rice.</VerticalCutReveal></Abs>
  </>
);

// SEG 3 · 600–900 · 停一停 / end card
const Seg3: React.FC = () => (
  <>
    <Photo src="07_cocktail_flower_counter.jpg" from={600} to={720} x={300} y={330} w={480} h={640} pos="55% 55%" reveal="iris" />
    {/* zoomed from bottom-left so the street signage in the top-right never enters frame */}
    <Photo src="12_cocktail_night_street.jpg" from={708} to={900} x={300} y={330} w={480} h={640} zoom={[1.4, 1.45]} origin="12% 100%" fadeOut={false} />

    <Abs x={96} y={250}><VerticalCutReveal at={600} style={meta} staggerDuration={0.02}>BY NIGHT</VerticalCutReveal></Abs>
    <Abs right={96} y={250}><VerticalCutReveal at={606} style={meta} staggerDuration={0.02}>03 / 03</VerticalCutReveal></Abs>

    <Abs x={0} right={0} y={1060} style={{ textAlign: "center" }}>
      <VerticalCutReveal at={760} style={{ ...zh, fontSize: 46, letterSpacing: "0.5em", paddingLeft: "0.5em" }} staggerDuration={0.08}>停一停</VerticalCutReveal>
    </Abs>
    <Abs x={0} right={0} y={1140} style={{ textAlign: "center" }}>
      <VerticalCutReveal at={800} style={{ ...en, fontSize: 40 }} staggerDuration={0.02}>have a pause.</VerticalCutReveal>
    </Abs>
    <Rule at={830} x={420} y={1260} w={240} />
    <Abs x={0} right={0} y={1310} style={{ textAlign: "center" }}>
      <VerticalCutReveal at={845} style={{ ...zh, fontWeight: 400, fontSize: 40, letterSpacing: "0.42em", paddingLeft: "0.42em" }} staggerDuration={0.08}>離念・茶蒔</VerticalCutReveal>
    </Abs>
    <Abs x={0} right={0} y={1382} style={{ textAlign: "center" }}>
      <VerticalCutReveal at={862} style={meta} staggerDuration={0.02}>SHEUNG WAN · HONG KONG</VerticalCutReveal>
    </Abs>
  </>
);

export const Film: React.FC = () => (
  <AbsoluteFill style={{ color: C.ink }}>
    <FontFaces />
    <Paper />
    <GridPulse />
    <Seg1 />
    <Seg2 />
    <Seg3 />
  </AbsoluteFill>
);
