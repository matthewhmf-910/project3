import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FilmFinish } from "./FilmStrip";
import { FontFaces } from "./kit";

// Style boards for "I make samples, you pick". One still each, built from the client's own photos.
// Placeholder copy is marked; nothing here is a fact about the shop beyond its name and district.

// Source photos are 1536×2048; covered into 1080×1920 → scale .9375, x offset −180.
const S = 1920 / 2048;
const X0 = (1080 - 1536 * S) / 2;
const Plate: React.FC<{ src: string; zoom?: number; origin?: string; filter?: string }> = ({ src, zoom = 1, origin = "50% 50%", filter }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: origin }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: X0, top: 0, width: 1536 * S, height: 1920, filter }} />
  </AbsoluteFill>
);

/** C — cinematic: full-bleed still, thin letterbox, one subtitle line, nothing else. */
export const StyleCinema: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <FontFaces />
    <Plate src="assets/13_full_table_set.jpg" zoom={1.08} origin="50% 60%" filter="saturate(.8) contrast(1.06) brightness(.92)" />
    {/* teal shadows / warm highlights */}
    <AbsoluteFill style={{ background: "rgb(0,40,50)", mixBlendMode: "soft-light", opacity: 0.55 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#000" }} />
    <div style={{ position: "absolute", left: 72, top: 186, fontFamily: "Inter Tight", fontWeight: 500, fontSize: 22, letterSpacing: "0.24em", color: "rgba(255,255,255,.75)" }}>
      SHEUNG WAN
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 300, textAlign: "center", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
      <div style={{ fontFamily: "Noto Sans TC", fontWeight: 500, fontSize: 48, letterSpacing: "0.08em" }}>停一停，飲杯茶。</div>
      <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 38, marginTop: 10, opacity: 0.9 }}>Make a pause.</div>
    </div>
    <FilmFinish />
  </AbsoluteFill>
);

/** D — magazine cover: masthead behind the cut-out glass, cover lines around it. */
export const StyleCover: React.FC = () => {
  const zoom = 1.3;
  const origin = "48% 74%";
  const ink = "#F6EFE4";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontFaces />
      <Plate src="assets/11_layered_tea_latte_coaster.jpg" zoom={zoom} origin={origin} filter="brightness(.78) saturate(.85)" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: "Cormorant", fontWeight: 600, fontSize: 360, lineHeight: 1, letterSpacing: "-0.02em", color: ink }}>
        PAUSE
      </div>
      <Plate src="assets/cutouts/11_latte.png" zoom={zoom} origin={origin} filter="brightness(.95)" />

      <div style={{ position: "absolute", left: 72, right: 72, top: 230, display: "flex", justifyContent: "space-between", fontFamily: "Inter Tight", fontWeight: 600, fontSize: 22, letterSpacing: "0.22em", color: ink }}>
        <span>ISSUE 01</span>
        <span>SHEUNG WAN · HK</span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 272, height: 2, background: ink, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 72, top: 300, fontFamily: "Noto Sans TC", fontWeight: 700, fontSize: 44, letterSpacing: "0.18em", color: ink }}>離念・茶蒔</div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", color: ink, fontFamily: "Noto Sans TC" }}>
        <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: "0.06em" }}>茶，不止一杯。</div>
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontSize: 34, marginTop: 6 }}>Tea, beyond the cup.</div>
      </div>
      <div style={{ position: "absolute", right: 72, top: 300, color: ink, textAlign: "right", fontFamily: "Inter Tight", fontWeight: 600, fontSize: 20, letterSpacing: "0.16em", lineHeight: 1.7 }}>
        TAKEAWAY · G/F<br />RESTAURANT · 1/F<br />TEA COCKTAIL
      </div>
      <FilmFinish />
    </AbsoluteFill>
  );
};
