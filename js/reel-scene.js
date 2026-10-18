/* Reel scene + timeline: "The lemon finds its way", 10 s, 9:16.
 * Shared by the page player (js/reel.js) and the frame renderer (film/).
 *
 *
 *   01 ROLL   0.0-1.2  A rolls down; B/C remain behind the stop.
 *   02 CATCH  1.2-2.4  C turns upward and physically supports A.
 *   03 FEED   2.4-3.9  C pushes the same whole lemon through OO.
 *   04 CUT    3.9-5.45 Only original L cuts. One stroke, one wheel.
 *   05 FALL   5.45-7.1 Separate wheel lands while the word re-forms.
 *   06 HERO   7.1-10   Settles into the original poster identity (no hard reset).
 *
 * Canvas is 1536 x 2731 design px. Letters are windows onto the single
 * 04_TYPE_COOLEST.png using the letter bounds measured by build_assets.py.
 */
XY.buildReel = function (canvas) {
  const { M, el, img, place, rect } = XY;
  const viewport = canvas.closest(".viewport");
  const W = 1536, H = 2731, DURATION = 10;

  const BEATS = [
    // re-timed after critic round 1: the cut was stalling, so its slack went to FALL and HERO
    { name: "Roll", t: [0, 1.2], desc: "A rolls down. B and C stay behind the stop." },
    { name: "Catch", t: [1.2, 2.4], desc: "C turns upward and physically supports A." },
    { name: "Feed", t: [2.4, 3.9], desc: "C pushes the same whole lemon through the OO." },
    { name: "Cut", t: [3.9, 5.45], desc: "Only the original L cuts. One stroke, one wheel." },
    { name: "Fall", t: [5.45, 7.1], desc: "The wheel lands in the glass while the word re-forms." },
    { name: "Hero", t: [7.1, 10], desc: "Everything settles back into the poster, with one fresh wheel added." },
  ];

  /* ---------------------------------------------------------------- geometry */
  const cup = rect("01_CUP_LEMON.png");
  const cool = rect("04_TYPE_COOLEST.png");
  // product group sits so the coaster edge the poster cropped lands on the frame's bottom edge
  const PY = H - (M.canvas.h - cup.y) * 1.5;
  const product = (r) => ({ x: 278 + (r.x - cup.x) * 1.5, y: PY + (r.y - cup.y) * 1.5, w: r.w * 1.5, h: r.h * 1.5 });
  // The set-piece sits low enough that the L's lift never enters the top 9:16
  // platform-UI band (top 11.5% = 314 canvas px); see SAFE in film/render.js.
  const DY = 200;
  const TYPE = { x: 380, y: 330 + DY, w: 1080 };
  const ts = TYPE.w / cool.w;
  TYPE.h = cool.h * ts;
  const typeRect = (r) => ({ x: TYPE.x + (r.x - cool.x) * ts, y: TYPE.y + (r.y - cool.y) * ts, w: r.w * ts, h: r.h * ts });
  const TYPE_HOME = { x: 228 - TYPE.x, y: 700 - TYPE.y }; // end-card position of the type block (glass rim overlaps COFFEE, as on the poster)

  const LEMON = { w: 250, h: 169 }; // 1.25x after critic round 1: readable at phone size
  // anchored at its lower end, which feeds the C; steep enough that the waiting lemons are in frame
  // long enough that A really rolls (~200 px). Waiting lemons enter from the frame edge, as in reference panel 01.
  const RAMP = { endX: 372, endY: 668 + DY, angle: 60, length: 900, stop: 416 }; // runs on past the frame edge
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
  // a window onto 04_TYPE_COOLEST.png covering canvas rect r
  function glyph(parent, r, cls) {
    const n = layer(cls || "letter", r, 0, parent);
    const im = img("04_TYPE_COOLEST.png", n);
    im.style.width = TYPE.w + "px";
    im.style.height = TYPE.h + "px";
    im.style.left = TYPE.x - r.x + "px";
    im.style.top = TYPE.y - r.y + "px";
    return n;
  }
  const letters = M.coolestLetters.map(([a, b, t, btm], i) => {
    const r = { x: TYPE.x + a * TYPE.w, y: TYPE.y + t * TYPE.h, w: (b - a) * TYPE.w, h: (btm - t) * TYPE.h };
    let n;
    if (i === 1 || i === 2) {
      // O = ring: two half-glyphs on one carrier. When the carrier turns on Y the left half
      // swings toward camera and the right half away, so the lemon visibly passes *inside*.
      n = layer("ring", r, 0, typeGroup);
      const half = r.w / 2;
      const seam = 1.5; // halves overlap so the closed ring has no hairline
      const front = glyph(n, { x: 0, y: 0, w: half + seam, h: r.h }, "letter");
      const back = glyph(n, { x: half - seam, y: 0, w: half + seam, h: r.h }, "letter");
      [front, back].forEach((g, j) => {
        const im = g.firstChild;
        im.style.left = TYPE.x - r.x - j * (half - seam) + "px";
        im.style.top = TYPE.y - r.y + "px";
      });
      gsap.set(front, { z: 1 });
      gsap.set(back, { z: -1 });
    } else {
      n = glyph(typeGroup, r);
    }
    n.center = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    return n;
  });
  const [C, O1, O2, Lb, E, S, T] = letters;

  // ramp with lemons B and C behind the stop
  const rampGroup = layer("group", null, 30);
  const wall = layer("ramp__wall", null, -30, rampGroup); // back wall: reads as a channel, lemons sit in it
  const ramp = layer("ramp", null, 0, rampGroup);
  ramp.innerHTML = '<i class="ramp__lip"></i><i class="ramp__top"></i><i class="ramp__face"></i><i class="ramp__stop" style="left:' + RAMP.stop + 'px"></i>';
  gsap.set(ramp, { x: RAMP.x, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 0", width: RAMP.length + 40 });
  gsap.set(wall, { x: RAMP.x + ux * 0 + uy * 0, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 100%", yPercent: -100, width: RAMP.length + 40, z: -30 });
  const lip = layer("ramp__front", null, 0, rampGroup); // front wall of the trough, in front of every lemon
  gsap.set(lip, { x: RAMP.x, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 0", width: RAMP.length + 40, z: 8 });

  function lemon(parent, z) {
    const n = layer("lemon", null, z, parent);
    const im = img("12_LEMON.png", n);
    el("span", "lemon__cut", n);
    gsap.set(n, { xPercent: -50, yPercent: -50, width: LEMON.w, height: LEMON.h });
    n.img = im;
    return n;
  }
  const lemonB = lemon(rampGroup, 4);
  const lemonC = lemon(rampGroup, 3);
  const lemonA = lemon(canvas, 2);
  const putOnRamp = (n, d, spin) => gsap.set(n, { ...onRamp(d), rotation: RAMP.angle + (spin || 0) });
  putOnRamp(lemonC, RAMP.stop - 20 - LEMON.w * 1.1); // queued behind B, further back in depth
  gsap.set(lemonC, { z: 3, scale: 0.94 });
  putOnRamp(lemonB, RAMP.stop - 20 - LEMON.w / 2);
  putOnRamp(lemonA, RAMP.stop + 20 + LEMON.w / 2);

  // the fresh wheel + splash
  const wheel = layer("wheel", null, 60);
  // organic wheel: 10 irregular wedge segments with their own shading, pith web, uneven rind
  const seg = (i) => {
    const a0 = (i / 10) * Math.PI * 2 + 0.14 + Math.sin(i * 2.3) * 0.03, a1 = ((i + 1) / 10) * Math.PI * 2 + 0.06 + Math.sin(i * 1.7) * 0.03;
    const r0 = 7, r1 = 39.5 - (i % 3) * 0.8, p = (r, a) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
    return `<path d="M${p(r0, a0 + 0.08)} L${p(r1, a0 + 0.035)} A${r1} ${r1} 0 0 1 ${p(r1, a1 - 0.035)} L${p(r0, a1 - 0.08)} Z" fill="url(#seg)"/>`;
  };
  wheel.innerHTML =
    '<svg viewBox="0 0 100 100" aria-hidden="true"><defs>' +
    '<radialGradient id="seg" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse" fx="50" fy="50"><stop offset="0" stop-color="#fff2b0"/><stop offset=".55" stop-color="#f6d14a"/><stop offset=".8" stop-color="#eebf2a"/></radialGradient>' +
    '<radialGradient id="rind" cx="48%" cy="46%" r="52%"><stop offset=".86" stop-color="#f0c11c"/><stop offset=".95" stop-color="#d39a0e"/><stop offset="1" stop-color="#94640a"/></radialGradient>' +
    '<radialGradient id="pith" cx="50%" cy="50%" r="50%"><stop offset=".2" stop-color="#f7ecc4"/><stop offset="1" stop-color="#efe0a8"/></radialGradient>' +
    '<linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<filter id="cells" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>' +
    '<feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.62  0 0 0 0.75 -0.2"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>' +
    '<ellipse cx="50" cy="50" rx="49.6" ry="49" fill="url(#rind)"/><circle cx="50" cy="50" r="44.5" fill="url(#pith)"/>' +
    '<g>' + Array.from({ length: 10 }, (_, i) => seg(i)).join("") + '</g>' +
    '<g filter="url(#cells)">' + Array.from({ length: 10 }, (_, i) => seg(i)).join("") + '</g>' +
    '<circle cx="50" cy="50" r="5" fill="#f5e7b6"/>' +
    '<ellipse cx="38" cy="42" rx="2" ry="3.4" fill="#fffbe6" transform="rotate(30 38 42)"/><ellipse cx="61" cy="58" rx="2" ry="3.4" fill="#fffbe6" transform="rotate(-20 61 58)"/>' +
    '<circle cx="50" cy="50" r="44" fill="url(#gloss)"/></svg>';
  gsap.set(wheel, { xPercent: -50, yPercent: -50, width: 150, height: 150 });

  const LAND = { x: 545, y: PY + 245 }; // in the foam against the dried slice, well inside the rim
  const shadow = layer("wheel-shadow", null, 59);
  gsap.set(shadow, { xPercent: -50, yPercent: -50, x: LAND.x + 10, y: LAND.y + 34 });
  const drops = Array.from({ length: 10 }, () => {
    const d = layer("drop", null, 62);
    gsap.set(d, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y });
    return d;
  });
  const flash = layer("flash", null, 66);
  const slit = layer("slit", null, 67); // the bright slice line on the contact frame
  gsap.set(slit, { xPercent: -50, yPercent: -50, rotation: -8 });
  gsap.set(flash, { xPercent: -50, yPercent: -50 });
  const juice = Array.from({ length: 4 }, () => {
    const d = layer("drop drop--juice", null, 64);
    gsap.set(d, { xPercent: -50, yPercent: -50 });
    return d;
  });
  const ripple = layer("ripple", null, 58);
  gsap.set(ripple, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y + 24 });
  const ripple2 = layer("ripple ripple--inner", null, 58);
  gsap.set(ripple2, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y + 24 });

  const stamp = pngLayer("06_STAMP.png", { x: 96, y: 425, w: 400, h: 402 }, 40); // ~280 px on screen; below the top UI band, above the C

  /* ---------------------------------------------------------------- timeline */
  const cam = stage.cam;
  const cut = lemonA.querySelector(".lemon__cut");
  const tl = gsap.timeline({ paused: true, onUpdate: () => stage.renderCam(), defaults: { ease: "power2.inOut" } });

  // initial state lives in the timeline (set at 0) so seeking backwards always restores it
  tl.set(copy, { autoAlpha: 0, y: 30 }, 0)
    .set(stamp, { autoAlpha: 0, scale: 0.7, rotation: -40 }, 0)
    .set(typeGroup, { x: 0, y: 0 }, 0)
    .set(rampGroup, { x: 0, autoAlpha: 1 }, 0)
    .set(lemonA.img, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
    .set(cut, { autoAlpha: 0 }, 0)
    .set(lemonA, { autoAlpha: 1, z: 2 }, 0)
    .set(wheel, { autoAlpha: 0, rotationX: 0, rotationY: 60, rotation: 0, scale: 1 }, 0)
    .set(shadow, { autoAlpha: 0, scale: 0.4 }, 0)
    .set(stage.offset, { s: 1 }, 0)
    .fromTo(cam, { rx: 6, ry: -7, x: 0 }, { rx: 3, ry: 5, duration: 7.6, ease: "sine.inOut" }, 0);

  // 01 ROLL 0-1.2 ----------------------------------------------------------
  // frame one is the settled poster; A rocks against the stop, then lets go
  const rollStart = onRamp(RAMP.stop + 20 + LEMON.w / 2);
  // the C tips 40 degrees so its mouth faces up-right under the ramp's end: still readable as a C
  const mouth = [Math.cos((-22 * Math.PI) / 180), Math.sin((-22 * Math.PI) / 180)];
  const rollEnd = onRamp(RAMP.length - LEMON.w / 2 - 10);
  // A drops off the ramp's end into the C's mouth; the C's centre sits behind the mouth
  const bowlPt = { x: rollEnd.x + 125, y: rollEnd.y + 95 };
  const CUP = { x: bowlPt.x - mouth[0] * 55, y: bowlPt.y - mouth[1] * 55 };
  tl.fromTo(lemonA, { ...rollStart, rotation: RAMP.angle }, { rotation: RAMP.angle - 6, duration: 0.14, ease: "sine.out" }, 0)
    .to(lemonA, { ...rollEnd, rotation: RAMP.angle + 360, duration: 0.95, ease: "power2.in" }, 0.2)
    .fromTo(lemonB, { rotation: RAMP.angle }, { rotation: RAMP.angle + 8, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.3)
    // C swings into a cradle under the end of the ramp, eased in and out
    .fromTo(C, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      { x: CUP.x - C.center.x, y: CUP.y - C.center.y, rotation: -22, duration: 0.6, ease: "back.inOut(1.2)" }, 0.55);

  // 02 CATCH 1.2-2.4 -------------------------------------------------------
  const bowl = { x: bowlPt.x, y: bowlPt.y }; // sitting in the C's mouth
  tl.to(lemonA, { z: 26, duration: 0.15, ease: "none" }, 1.15) // behind the C's strokes: held, not covering
    .to(lemonA, { x: bowl.x, duration: 0.42, ease: "power1.out" }, 1.15)
    .to(lemonA, { y: bowl.y, rotation: 360, duration: 0.42, ease: "power2.in" }, 1.15)
    .to(C, { scaleY: 0.9, scaleX: 1.06, duration: 0.09, ease: "power2.out" }, 1.57)
    .to(C, { scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }, 1.66)
    .to(lemonA, { y: bowl.y - 26, duration: 0.17, ease: "power2.out", yoyo: true, repeat: 1 }, 1.58)
    .to([C, lemonA], { y: "-=34", duration: 0.45, ease: "sine.inOut" }, 1.95);

  // 03 FEED 2.4-3.9 --------------------------------------------------------
  // the C turns back upright *carrying* the lemon (no pose swap), then pushes it through the O's,
  // which stop at 55 degrees so their openings stay visible
  const axisY = (x) => O1.center.y + ((x - O1.center.x) * (O2.center.y - O1.center.y)) / (O2.center.x - O1.center.x);
  tl.to(C, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "sine.inOut" }, 2.4)
    .to(lemonA, { x: 540, y: axisY(540), rotation: 352, z: 30, duration: 0.6, ease: "sine.inOut" }, 2.4)
    .to([O1, O2], { rotationY: 40, duration: 0.45, stagger: 0.1, ease: "back.out(1.6)" }, 2.45)
    .to(C, { x: 12, duration: 0.4, ease: "power2.out" }, 2.95) // a nudge: the C never touches the first O
    .to(lemonA, { x: 760, y: axisY(760), duration: 0.95, ease: "power2.inOut" }, 2.95)
    .to(C, { x: 4, duration: 0.5, ease: "sine.inOut" }, 3.35);

  // 04 CUT 3.9-6.0 ---------------------------------------------------------
  const tip = { x: 835, y: axisY(835) };          // lemon tip ends at x 960, across the L's stem
  const cutX = tip.x + LEMON.w / 2 - LEMON.w * 0.225;
  const HIT = 4.85;
  tl.to(lemonA, { x: tip.x, y: tip.y, duration: 0.35, ease: "power2.inOut" }, 3.9)       // the tip slides under the L first
    .to([E, S, T], { x: 36, duration: 0.4, stagger: 0.05, ease: "power2.out" }, 4.0)
    .to(Lb, { y: -300, rotation: -8, duration: 0.3, ease: "power3.out" }, 4.2)          // quick lift
    .to(Lb, { y: -310, rotation: -17, duration: 0.2, ease: "sine.out" }, 4.5)          // anticipation: tilt back
    .to(Lb, { rotation: -15.8, duration: 0.03, yoyo: true, repeat: 1, ease: "sine.inOut" }, 4.64)
    .to(Lb, { y: -14, rotation: 2, duration: 0.15, ease: "power4.in" }, HIT - 0.15)     // one stroke
    .set(lemonA.img, { clipPath: "inset(0% 22.5% 0% 0%)" }, HIT)
    .set(cut, { autoAlpha: 1 }, HIT)
    .set(wheel, { autoAlpha: 1, x: cutX + 12, y: tip.y, rotationY: 60 }, HIT)
    .set(flash, { x: cutX, y: tip.y }, HIT)
    .fromTo(slit, { autoAlpha: 1, scaleY: 1 }, { autoAlpha: 0, scaleY: 1.3, duration: 0.1, ease: "power1.out", immediateRender: false }, HIT)
    .set(slit, { x: cutX, y: tip.y }, HIT)
    .fromTo(cam, { x: 0 }, { x: 12, duration: 0.033, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, HIT)
    .fromTo(flash, { autoAlpha: 0.9, scale: 0.4 }, { autoAlpha: 0, scale: 1.3, duration: 0.12, ease: "power2.out", immediateRender: false }, HIT)
    .to(Lb, { y: -280, rotation: 5, duration: 0.45, ease: "back.out(2)" }, HIT + 0.067)  // contact holds 2 frames, then rebounds
    .to(wheel, { x: "+=70", y: "+=22", rotationY: 8, rotation: 14, duration: 0.38, ease: "power2.out" }, HIT + 0.02) // peels face-on
    .to(lemonA, { x: "-=18", duration: 0.25, ease: "power2.out" }, HIT + 0.02)
    .to(rampGroup, { x: -900, duration: 0.6, ease: "power2.in" }, 5.3)   // off-camera during the close-up, so it never re-enters
    // the stub rolls back out through the rings (visible, unhurried), then the word re-forms
    .to(lemonA, { x: -260, y: axisY(-260), rotation: "-=300", duration: 1.0, ease: "power1.in" }, 5.3)
    .to([O1, O2], { rotationY: 0, duration: 0.45, stagger: 0.08, ease: "back.out(1.4)" }, 5.75)
    .to(C, { x: 0, duration: 0.4 }, 5.8)
    .to(Lb, { y: 0, rotation: 0, duration: 0.5, ease: "power3.inOut" }, 5.85)
    .to([E, S, T], { x: 0, duration: 0.4, stagger: 0.05 }, 5.95);
  juice.forEach((d, i) => {
    const a = -Math.PI * (0.25 + 0.5 * (i / (juice.length - 1)));
    tl.fromTo(d, { x: cutX + 6, y: tip.y, autoAlpha: 1, scale: 1 },
        { x: cutX + 6 + Math.cos(a) * 70 + 30, y: tip.y + Math.sin(a) * 60, duration: 0.22, ease: "power2.out", immediateRender: false }, HIT)
      .to(d, { y: "+=110", autoAlpha: 0, scale: 0.6, duration: 0.3, ease: "power2.in" }, HIT + 0.22);
  });

  // 05 FALL 6.0-7.6 --------------------------------------------------------
  const FALL = 5.45, SPLASH = 6.5;
  tl.to(wheel, { x: LAND.x, duration: SPLASH - FALL, ease: "sine.inOut" }, FALL)
    .to(wheel, { y: LAND.y, duration: SPLASH - FALL, ease: "power2.in" }, FALL)
    .to(wheel, { rotationX: 20, rotationY: 0, rotation: 200, scale: 1.5, duration: SPLASH - FALL, ease: "power1.in" }, FALL)
    .to(wheel, { y: LAND.y - 14, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, SPLASH)
    .fromTo(wheel.firstChild, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 45% 0%)", duration: 0.3, ease: "power2.out", immediateRender: false }, SPLASH) // sinks into the foam
    .to(shadow, { autoAlpha: 0.7, scale: 1, duration: 0.25, ease: "power2.out" }, SPLASH - 0.1)
    .fromTo(ripple, { autoAlpha: 0.95, scale: 0.5 }, { autoAlpha: 0, scale: 1.6, duration: 0.85, ease: "power2.out", immediateRender: false }, SPLASH)
    .fromTo(ripple2, { autoAlpha: 0.8, scale: 0.4 }, { autoAlpha: 0, scale: 1.1, duration: 0.8, ease: "power2.out", immediateRender: false }, SPLASH + 0.1)
    .fromTo(cam, { x: 0 }, { x: -7, duration: 0.033, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, SPLASH); // impact
  drops.forEach((d, i) => {
    const a = -Math.PI * (0.12 + (0.76 * i) / (drops.length - 1)); // symmetric crown out of the surface
    const r = 120 + ((i * 37) % 3) * 50;
    const size = 0.7 + (i % 4) * 0.2;
    // a crown: drops leave stretched along their path, round off at the top, then fall
    // drops start at the wheel's rim on the contact frame, so the splash is visible immediately
    const sx = LAND.x + Math.cos(a) * 80, sy = LAND.y + 30 + Math.sin(a) * 20;
    tl.fromTo(d, { x: sx, y: sy, autoAlpha: 1, scaleX: size * 0.7, scaleY: size * 1.6, rotation: (a * 180) / Math.PI + 90 },
        { x: sx + Math.cos(a) * r * 0.8, y: sy + Math.sin(a) * r, scaleX: size, scaleY: size, duration: 0.4, ease: "power1.out", immediateRender: false }, SPLASH)
      .to(d, { y: "+=80", autoAlpha: 0, scaleX: size * 0.6, scaleY: size * 1.2, duration: 0.3, ease: "power2.in" }, SPLASH + 0.4);
  });

  // 06 HERO 7.1-10 ---------------------------------------------------------
  tl.to(cam, { rx: 0, ry: 0, duration: 1.1, ease: "sine.inOut" }, 7.10)
    .to(typeGroup, { x: TYPE_HOME.x, y: TYPE_HOME.y, duration: 0.75, ease: "power3.inOut" }, 7.35)
    .to(stamp, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.6)" }, 7.75)
    .to(copy, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 7.85)       // end card readable from 8.4 s
    .to(wheel, { rotation: "+=16", duration: 2.4, ease: "sine.inOut" }, 7.10)
    .to(stage.offset, { s: 1.03, duration: 1.4, ease: "sine.inOut" }, 8.10);         // the hold keeps breathing to the last frame
  if (tl.duration() < DURATION) tl.to({}, { duration: DURATION - tl.duration() });

  /* Camera: one continuous spline through framing keys, so it never stops,
     jumps or starts at full speed between beats (critic round 1). Cubic
     Hermite with finite-difference tangents gives continuous velocity;
     zero tangents at the ends ease in and out of the poster.
     key: [time, focus x, focus y, zoom] in canvas px. Crops land in letter gaps. */
  const KEYS = [
    [0.0, W / 2, H / 2, 1.0],
    [0.35, 740, 1330, 1.03],      // frame one: the whole poster, already breathing
    [1.25, 400, 1000, 1.3],       // ROLL: follow the lemon; frame reads "COOL"
    [2.1, 360, 930, 1.6],         // CATCH: medium on ramp + C
    [3.3, 668, 880, 1.6],         // FEED: track the OO; right edge in the E|S gap
    [4.4, 990, 850, 1.75],        // CUT approach; left edge in the C|O gap
    [HIT, 930, 800, 2.0],         // the stroke, close
    [5.35, 900, 850, 1.85],
    [6.0, 700, 1250, 1.2],        // FALL: pull out ahead of the wheel (word re-forming in frame)...
    [6.45, 620, LAND.y - 260, 1.1], // ...arriving as it lands
    [6.95, 600, LAND.y - 220, 1.16], // and pushing in through the impact (no stall)
    [7.4, 640, LAND.y - 300, 1.06],
    [8.2, W / 2, H / 2, 1.0],     // HERO: the full poster
    [DURATION, W / 2, H / 2, 1.0],
  ];
  const tangents = KEYS.map((k, i) => (i === 0 || i === KEYS.length - 1) ? [0, 0, 0] :
    [1, 2, 3].map((c) => (KEYS[i + 1][c] - KEYS[i - 1][c]) / (KEYS[i + 1][0] - KEYS[i - 1][0])));
  function camAt(t) {
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
    const [t0] = KEYS[i], [t1] = KEYS[i + 1], h = t1 - t0;
    const u = Math.max(0, Math.min(1, (t - t0) / h));
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return [1, 2, 3].map((c, j) => h00 * KEYS[i][c] + h10 * h * tangents[i][j] + h01 * KEYS[i + 1][c] + h11 * h * tangents[i + 1][j]);
  }
  const clock = { t: 0 };
  tl.fromTo(clock, { t: 0 }, {
    t: DURATION, duration: DURATION, ease: "none", // a clock, not a motion: the spline does the easing
    onUpdate: () => {
      [cam.fx, cam.fy, cam.s] = camAt(clock.t);
    },
  }, 0);

  // render the t=0 state now: seeking 0 -> 0 later would not apply the initial .set()s
  tl.progress(1, true).progress(0, true);
  stage.renderCam();
  return { stage, tl, DURATION, BEATS, parts: { lemonA, wheel, terracotta, hit: HIT } };
};


