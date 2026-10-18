/* Reel scene + timeline: "The lemon finds its way", 10 s, 9:16.
 * Shared by the page player (js/reel.js) and the frame renderer (film/).
 *
 *
 *   01 ROLL   0.0-1.2  A rolls down; B/C remain behind the stop.
 *   02 CATCH  1.2-2.5  C turns upward and physically supports A.
 *   03 FEED   2.5-4.2  C pushes the same whole lemon through OO.
 *   04 CUT    4.2-7.4  Only original L cuts. One stroke, one wheel.
 *   05 FALL   7.4-8.8  Separate wheel lands; blade stays above rim.
 *   06 HERO   8.8-10   Settles into the original poster identity (no hard reset).
 *
 * Canvas is 1536 x 2731 design px. Letters are windows onto the single
 * 04_TYPE_COOLEST.png using the letter bounds measured by build_assets.py.
 */
XY.buildReel = function (canvas) {
  const { M, el, img, place, rect } = XY;
  const viewport = canvas.closest(".viewport");
  const W = 1536, H = 2731, DURATION = 10;

  const BEATS = [
    { name: "Roll", t: [0, 1.2], desc: "A rolls down. B and C stay behind the stop." },
    { name: "Catch", t: [1.2, 2.5], desc: "C turns upward and physically supports A." },
    { name: "Feed", t: [2.5, 4.2], desc: "C pushes the same whole lemon through the OO." },
    { name: "Cut", t: [4.2, 7.4], desc: "Only the original L cuts. One stroke, one wheel." },
    { name: "Fall", t: [7.4, 8.8], desc: "The wheel lands in the glass. The blade stays above the rim." },
    { name: "Hero", t: [8.8, 10], desc: "Everything settles back into the poster, with one fresh wheel added." },
  ];

  /* ---------------------------------------------------------------- geometry */
  const cup = rect("01_CUP_LEMON.png");
  const cool = rect("04_TYPE_COOLEST.png");
  const product = (r) => ({ x: 278 + (r.x - cup.x) * 1.5, y: 1250 + (r.y - cup.y) * 1.5, w: r.w * 1.5, h: r.h * 1.5 });
  // The set-piece sits low enough that the L's lift never enters the top 9:16
  // platform-UI band (top 11.5% = 314 canvas px); see SAFE in film/render.js.
  const DY = 200;
  const TYPE = { x: 380, y: 330 + DY, w: 1080 };
  const ts = TYPE.w / cool.w;
  TYPE.h = cool.h * ts;
  const typeRect = (r) => ({ x: TYPE.x + (r.x - cool.x) * ts, y: TYPE.y + (r.y - cool.y) * ts, w: r.w * ts, h: r.h * ts });
  const TYPE_HOME = { x: 228 - TYPE.x, y: 560 - TYPE.y }; // end-card position of the type block

  const LEMON = { w: 200, h: 135 };
  // anchored at its lower end, which feeds the C; steep enough that the waiting lemons are in frame
  const RAMP = { endX: 292, endY: 668 + DY, angle: 48, length: 520, stop: 196 };
  const ux = Math.cos((RAMP.angle * Math.PI) / 180), uy = Math.sin((RAMP.angle * Math.PI) / 180);
  RAMP.x = RAMP.endX - RAMP.length * ux;
  RAMP.y = RAMP.endY - RAMP.length * uy;
  // centre of a lemon resting on the ramp's top face, d px along it
  const onRamp = (d) => ({ x: RAMP.x + d * ux + uy * LEMON.h / 2, y: RAMP.y + d * uy - ux * LEMON.h / 2 });

  /* ---------------------------------------------------------------- scene */
  const stage = XY.createStage(viewport, W, H);
  canvas.classList.add("is-portrait", "is-reel");

  function layer(cls, r, z, parent) {
    const n = el("div", "layer " + (cls || ""), parent || canvas);
    if (r) place(n, r);
    gsap.set(n, { z });
    return n;
  }
  function pngLayer(file, r, z, parent) {
    const n = layer("", r, z, parent);
    img(file, n);
    return n;
  }

  // paper is the viewport's own (flat) background, not an oversized 3D layer
  pngLayer("07_SHAPE_SAGE.png", product(rect("07_SHAPE_SAGE.png")), -110);
  const terracotta = pngLayer("08_SHAPE_TERRACOTTA.png", product(rect("08_SHAPE_TERRACOTTA.png")), -90);
  const copy = XY.posterCopy(layer("", { x: 0, y: 0, w: W, h: H }, -60));
  pngLayer("03_WOOD_COASTER.png", product(rect("03_WOOD_COASTER.png")), -20);
  pngLayer("01_CUP_LEMON.png", product(cup), 0);
  pngLayer("02_SPOON.png", product(rect("02_SPOON.png")), 14);

  // type block: COFFEE + seven COOLEST letters, moved together in the HERO beat
  const typeGroup = layer("group", null, 30);
  pngLayer("05_TYPE_COFFEE.png", typeRect(rect("05_TYPE_COFFEE.png")), -50, typeGroup);
  const letters = M.coolestLetters.map(([a, b, t, btm]) => {
    const r = { x: TYPE.x + a * TYPE.w, y: TYPE.y + t * TYPE.h, w: (b - a) * TYPE.w, h: (btm - t) * TYPE.h };
    const n = layer("letter", r, 0, typeGroup);
    const im = img("04_TYPE_COOLEST.png", n);
    im.style.width = TYPE.w + "px";
    im.style.height = TYPE.h + "px";
    im.style.left = -a * TYPE.w + "px";
    im.style.top = -t * TYPE.h + "px";
    n.center = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    return n;
  });
  const [C, O1, O2, Lb, E, S, T] = letters;

  // ramp with lemons B and C behind the stop
  const rampGroup = layer("group", null, 30);
  const ramp = layer("ramp", null, 0, rampGroup);
  ramp.innerHTML = '<i class="ramp__lip"></i><i class="ramp__top"></i><i class="ramp__face"></i><i class="ramp__stop" style="left:' + RAMP.stop + 'px"></i>';
  gsap.set(ramp, { x: RAMP.x, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 0", width: RAMP.length + 40 });

  function lemon(parent, z) {
    const n = layer("lemon", null, z, parent);
    const im = img("12_LEMON.png", n);
    el("span", "lemon__cut", n);
    gsap.set(n, { xPercent: -50, yPercent: -50 });
    n.img = im;
    return n;
  }
  const lemonB = lemon(rampGroup, 4);
  const lemonC = lemon(rampGroup, 3);
  const lemonA = lemon(canvas, 36);
  const putOnRamp = (n, d, spin) => gsap.set(n, { ...onRamp(d), rotation: RAMP.angle + (spin || 0) });
  putOnRamp(lemonC, RAMP.stop - 70 - LEMON.w);
  putOnRamp(lemonB, RAMP.stop - 70);
  putOnRamp(lemonA, RAMP.stop + 70);

  // the fresh wheel + splash
  const wheel = layer("wheel", null, 60);
  wheel.innerHTML =
    '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="pulp" cx="50%" cy="50%" r="50%">' +
    '<stop offset="0" stop-color="#fff3b0"/><stop offset=".7" stop-color="#f7d95c"/><stop offset="1" stop-color="#efc53a"/></radialGradient></defs>' +
    '<circle cx="50" cy="50" r="49" fill="#e2b21a"/><circle cx="50" cy="50" r="45.5" fill="#fbf2cf"/>' +
    '<circle cx="50" cy="50" r="41" fill="url(#pulp)"/>' +
    '<g stroke="#fbf2cf" stroke-width="2.2" stroke-linecap="round">' +
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return `<line x1="${50 + 5 * Math.cos(a)}" y1="${50 + 5 * Math.sin(a)}" x2="${50 + 40 * Math.cos(a)}" y2="${50 + 40 * Math.sin(a)}"/>`;
    }).join("") +
    '</g><circle cx="50" cy="50" r="4.5" fill="#fbf2cf"/>' +
    '<ellipse cx="38" cy="42" rx="2" ry="3.4" fill="#fffbe6" transform="rotate(30 38 42)"/><ellipse cx="60" cy="58" rx="2" ry="3.4" fill="#fffbe6" transform="rotate(-20 60 58)"/></svg>';
  gsap.set(wheel, { xPercent: -50, yPercent: -50, width: 150, height: 150 });

  const LAND = { x: 560, y: 1505 };
  const drops = Array.from({ length: 7 }, () => {
    const d = layer("drop", null, 62);
    gsap.set(d, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y });
    return d;
  });
  const ripple = layer("ripple", null, 58);
  gsap.set(ripple, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y + 20, rotationX: 0 });

  const stamp = pngLayer("06_STAMP.png", { x: 96, y: 362, w: 300, h: 302 }, 40); // below the top UI band even after the end push-in

  /* ---------------------------------------------------------------- timeline */
  const cam = stage.cam;
  const tl = gsap.timeline({ paused: true, onUpdate: () => stage.renderCam(), defaults: { ease: "power2.inOut" } });

  // initial state lives in the timeline (fromTo / set at 0) so seeking backwards always restores it
  tl.set(copy, { autoAlpha: 0, y: 30 }, 0)
    .set(stamp, { autoAlpha: 0, scale: 0.7, rotation: -40 }, 0)
    .set(typeGroup, { x: 0, y: 0 }, 0)
    .set(rampGroup, { x: 0, autoAlpha: 1 }, 0)
    .set(lemonA.img, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
    .set(lemonA.querySelector(".lemon__cut"), { autoAlpha: 0 }, 0)
    .set(lemonA, { autoAlpha: 1, z: 36 }, 0)
    .set(wheel, { autoAlpha: 0, rotationX: 0, rotationY: 84, rotation: 0, scale: 1 }, 0)
    .set(cam, { s: 1, fx: W / 2, fy: H / 2 }, 0)
    .fromTo(cam, { rx: 6, ry: -7, x: 0 }, { rx: 3, ry: 5, duration: 8.8, ease: "sine.inOut" }, 0);

  // 01 ROLL ---------------------------------------------------------------
  const rollEnd = onRamp(RAMP.length - LEMON.w / 2 - 10);
  tl.fromTo(lemonA, { ...onRamp(RAMP.stop + 70), rotation: RAMP.angle },
      { ...rollEnd, rotation: RAMP.angle + 360, duration: 1.2, ease: "power1.in" }, 0)
    .fromTo(lemonB, { rotation: RAMP.angle }, { rotation: RAMP.angle + 8, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.15)
    // C swings into a cradle under the end of the ramp
    .fromTo(C, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      { x: 470 - C.center.x, y: 735 + DY - C.center.y, rotation: -90, duration: 0.55, ease: "back.out(1.4)" }, 0.65);

  // 02 CATCH --------------------------------------------------------------
  const bowl = { x: 470, y: 690 + DY };
  tl.to(lemonA, { x: bowl.x, duration: 0.42, ease: "power1.out" }, 1.2)
    .to(lemonA, { y: bowl.y, rotation: 360, duration: 0.42, ease: "power2.in" }, 1.2)
    .to(C, { scaleY: 0.9, scaleX: 1.06, duration: 0.1, ease: "power2.out" }, 1.6)
    .to(C, { scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }, 1.7)
    .to(lemonA, { y: bowl.y - 22, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 1.62)
    .to([C, lemonA], { y: "-=34", duration: 0.5, ease: "power2.inOut" }, 2.0);

  // 03 FEED ---------------------------------------------------------------
  const axisY = (x) => O1.center.y + ((x - O1.center.x) * (O2.center.y - O1.center.y)) / (O2.center.x - O1.center.x);
  tl.to(C, { x: 0, y: 0, rotation: 0, duration: 0.5 }, 2.5)
    .to(lemonA, { x: 530, y: axisY(530), rotation: 352, duration: 0.5 }, 2.5)
    .to([O1, O2], { rotationY: 72, duration: 0.4, stagger: 0.1, ease: "power3.out" }, 2.55)
    .to(C, { x: 56, duration: 0.45, ease: "power2.out" }, 3.0)
    .to(lemonA, { x: 770, y: axisY(770), duration: 1.2, ease: "power2.inOut" }, 3.0)
    .to(C, { x: 30, duration: 0.6, ease: "power1.inOut" }, 3.5);

  // 04 CUT ----------------------------------------------------------------
  const cutTip = { x: 850, y: axisY(850) };
  tl.to(Lb, { y: -300, rotation: -8, duration: 0.6, ease: "power3.out" }, 4.2)
    .to([E, S, T], { x: 36, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 4.25)
    .to(lemonA, { x: cutTip.x, y: cutTip.y, duration: 0.5, ease: "power2.out" }, 4.7)
    .to(Lb, { y: -306, rotation: -17, duration: 0.65, ease: "sine.inOut" }, 5.2)          // wind-up: tilt back, not higher
    .to(Lb, { y: -12, rotation: 0, duration: 0.2, ease: "power4.in" }, 5.85)               // one stroke
    .set(lemonA.img, { clipPath: "inset(0% 22.5% 0% 0%)" }, 6.05)
    .set(lemonA.querySelector(".lemon__cut"), { autoAlpha: 1 }, 6.05)
    .set(wheel, { autoAlpha: 1, x: cutTip.x + 68, y: cutTip.y }, 6.05)
    .fromTo(typeGroup, { y: 0 }, { y: 7, duration: 0.06, yoyo: true, repeat: 1, ease: "none", immediateRender: false }, 6.05)
    .to(Lb, { y: -280, rotation: 5, duration: 0.45, ease: "back.out(2)" }, 6.08)          // blade rebounds, stays up
    .to(lemonA, { x: "-=16", duration: 0.3, ease: "power2.out" }, 6.08)
    .to(wheel, { x: "+=60", y: "+=46", rotationY: 38, rotation: 18, duration: 1.3, ease: "sine.inOut" }, 6.1);

  // 05 FALL ---------------------------------------------------------------
  tl.to(wheel, { x: LAND.x, duration: 0.95, ease: "power1.inOut" }, 7.4)
    .to(wheel, { y: LAND.y, duration: 0.95, ease: "power2.in" }, 7.4)
    .to(wheel, { rotationX: 64, rotationY: 0, rotation: 200, scale: 1.6, duration: 0.95, ease: "power1.in" }, 7.4)
    .to(wheel, { y: LAND.y - 16, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, 8.35)
    .fromTo(ripple, { autoAlpha: 0.9, scale: 0.2 }, { autoAlpha: 0, scale: 1.5, duration: 0.8, ease: "power2.out", immediateRender: false }, 8.35);
  drops.forEach((d, i) => {
    const a = -Math.PI * (0.15 + (0.7 * i) / (drops.length - 1));
    const r = 90 + (i % 3) * 45;
    tl.fromTo(d, { x: LAND.x, y: LAND.y, autoAlpha: 1, scale: 1 },
        { x: LAND.x + Math.cos(a) * r, y: LAND.y + Math.sin(a) * r * 1.2, duration: 0.25, ease: "power2.out", immediateRender: false }, 8.35)
      .to(d, { y: "+=70", autoAlpha: 0, scale: 0.5, duration: 0.3, ease: "power2.in" }, 8.6);
  });

  // 06 HERO ---------------------------------------------------------------
  tl.to(cam, { rx: 0, ry: 0, duration: 1.2, ease: "power2.inOut" }, 8.8)
    .to([O1, O2], { rotationY: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 8.8)
    .to(lemonA, { y: "+=300", z: -180, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 8.8)
    .to(rampGroup, { x: -900, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, 8.8)
    .to(C, { x: 0, duration: 0.45 }, 8.85)
    .to(Lb, { y: 0, rotation: 0, duration: 0.55, ease: "power3.inOut" }, 8.95)
    .to([E, S, T], { x: 0, duration: 0.45, stagger: 0.05 }, 9.0)
    .to(typeGroup, { x: TYPE_HOME.x, y: TYPE_HOME.y, duration: 0.8, ease: "power3.inOut" }, 9.05)
    .to(stamp, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.6)" }, 9.3)
    .to(copy, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 9.4)
    // the hold breathes: slow push-in and the fresh wheel still turning as the film ends
    .to(wheel, { rotation: "+=14", duration: 1.2, ease: "sine.out" }, 8.8)
    .to(stage.offset, { s: 1.03, duration: 0.6, ease: "sine.out" }, 9.4);  // the end hold keeps breathing
  if (tl.duration() < DURATION) tl.to({}, { duration: DURATION - tl.duration() });

  /* Camera. One continuous, motivated move that varies scale with the action:
     wide open -> follow the roll -> medium on the catch -> track the feed ->
     close on the cut -> tilt down with the falling wheel -> pull out to the poster.
     (The 8.8 s push-in above multiplies on top through cam.s at the end.) */
  const shot = (at, dur, fx, fy, s, ease) => tl.to(cam, { fx, fy, s, duration: dur, ease: ease || "power2.inOut" }, at);
  // Frame edges are placed in the gaps between letters so crops read as framing, not accidents:
  // visible half-width = (W / 2) / s; gaps sit at x = 538 (C|O), 1148 (E|S).
  shot(0, 1.35, 400, 950, 1.25, "sine.out");          // ROLL: already travelling on frame one; frame reads "COOL"
  shot(1.15, 1.2, 360, 930, 1.6);                     // CATCH: medium on ramp + C
  shot(2.45, 1.75, 668, 880, 1.6, "sine.inOut");      // FEED: track the OO, right edge in the E|S gap
  shot(4.2, 1.6, 990, 860, 1.7, "power2.out");        // CUT: close on the blade, left edge in the C|O gap
  tl.fromTo(cam, { x: 0 }, { x: 9, duration: 0.05, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, 6.05); // impact
  shot(7.35, 1.4, 592, 1400, 1.4, "power2.inOut");    // FALL: tilt down with the wheel, still settling through the splash
  shot(8.75, 1.0, W / 2, H / 2, 1.0, "power3.inOut"); // HERO: pull out to the full poster

  // render the t=0 state now: seeking 0 -> 0 later would not apply the initial .set()s
  tl.progress(1, true).progress(0, true);
  stage.renderCam();
  return { stage, tl, DURATION, BEATS, parts: { lemonA, wheel, terracotta } };
};


