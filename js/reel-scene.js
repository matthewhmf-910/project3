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
    // re-timed after critic round 1: the cut was stalling, so its slack went to FALL and HERO
    { name: "Roll", t: [0, 1.2], desc: "A rolls down. B and C stay behind the stop." },
    { name: "Catch", t: [1.2, 2.4], desc: "C turns upward and physically supports A." },
    { name: "Feed", t: [2.4, 3.9], desc: "C pushes the same whole lemon through the OO." },
    { name: "Cut", t: [3.9, 6.0], desc: "Only the original L cuts. One stroke, one wheel." },
    { name: "Fall", t: [6.0, 7.6], desc: "The wheel lands in the glass. The blade stays above the rim." },
    { name: "Hero", t: [7.6, 10], desc: "Everything settles back into the poster, with one fresh wheel added." },
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
  const RAMP = { endX: 372, endY: 668 + DY, angle: 48, length: 680, stop: 196 };
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
      const front = glyph(n, { x: 0, y: 0, w: half, h: r.h }, "letter");
      const back = glyph(n, { x: half, y: 0, w: half, h: r.h }, "letter");
      [front, back].forEach((g, j) => {
        const im = g.firstChild;
        im.style.left = TYPE.x - r.x - j * half + "px";
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
  const ramp = layer("ramp", null, 0, rampGroup);
  ramp.innerHTML = '<i class="ramp__lip"></i><i class="ramp__top"></i><i class="ramp__face"></i><i class="ramp__stop" style="left:' + RAMP.stop + 'px"></i>';
  gsap.set(ramp, { x: RAMP.x, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 0", width: RAMP.length + 40 });
  const lip = layer("ramp__front", null, 0, rampGroup); // front wall of the trough, in front of every lemon
  gsap.set(lip, { x: RAMP.x, y: RAMP.y, rotation: RAMP.angle, transformOrigin: "0 0", width: RAMP.length + 40, z: 48 });

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
  const lemonA = lemon(canvas, 36);
  const putOnRamp = (n, d, spin) => gsap.set(n, { ...onRamp(d), rotation: RAMP.angle + (spin || 0) });
  putOnRamp(lemonC, RAMP.stop - 20 - LEMON.w * 1.1); // queued behind B, further back in depth
  gsap.set(lemonC, { z: -20, scale: 0.94 });
  putOnRamp(lemonB, RAMP.stop - 20 - LEMON.w / 2);
  putOnRamp(lemonA, RAMP.stop + 20 + LEMON.w / 2);

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

  const LAND = { x: 560, y: PY + 290 }; // fully on the foam, left of the dried slice
  const shadow = layer("wheel-shadow", null, 59);
  gsap.set(shadow, { xPercent: -50, yPercent: -50, x: LAND.x + 10, y: LAND.y + 34 });
  const drops = Array.from({ length: 10 }, () => {
    const d = layer("drop", null, 62);
    gsap.set(d, { xPercent: -50, yPercent: -50, x: LAND.x, y: LAND.y });
    return d;
  });
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
    .set(lemonA, { autoAlpha: 1, z: 36 }, 0)
    .set(wheel, { autoAlpha: 0, rotationX: 0, rotationY: 60, rotation: 0, scale: 1 }, 0)
    .set(shadow, { autoAlpha: 0, scale: 0.4 }, 0)
    .set(stage.offset, { s: 1 }, 0)
    .fromTo(cam, { rx: 6, ry: -7, x: 0 }, { rx: 3, ry: 5, duration: 7.6, ease: "sine.inOut" }, 0);

  // 01 ROLL 0-1.2 ----------------------------------------------------------
  // frame one is the settled poster; A rocks against the stop, then lets go
  const rollStart = onRamp(RAMP.stop + 20 + LEMON.w / 2);
  // the C tips 40 degrees so its mouth faces up-right under the ramp's end: still readable as a C
  const mouth = [Math.cos((-40 * Math.PI) / 180), Math.sin((-40 * Math.PI) / 180)];
  const rollEnd = onRamp(RAMP.length - LEMON.w / 2 - 10);
  // A drops off the ramp's end into the C's mouth; the C's centre sits behind the mouth
  const bowlPt = { x: rollEnd.x + 125, y: rollEnd.y + 95 };
  const CUP = { x: bowlPt.x - mouth[0] * 55, y: bowlPt.y - mouth[1] * 55 };
  tl.fromTo(lemonA, { ...rollStart, rotation: RAMP.angle }, { rotation: RAMP.angle - 6, duration: 0.14, ease: "sine.out" }, 0)
    .to(lemonA, { ...rollEnd, rotation: RAMP.angle + 360, duration: 0.95, ease: "power2.in" }, 0.2)
    .fromTo(lemonB, { rotation: RAMP.angle }, { rotation: RAMP.angle + 8, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.3)
    // C swings into a cradle under the end of the ramp, eased in and out
    .fromTo(C, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      { x: CUP.x - C.center.x, y: CUP.y - C.center.y, rotation: -40, duration: 0.6, ease: "back.inOut(1.2)" }, 0.55);

  // 02 CATCH 1.2-2.4 -------------------------------------------------------
  const bowl = { x: bowlPt.x, y: bowlPt.y }; // sitting in the C's mouth
  tl.to(lemonA, { x: bowl.x, duration: 0.42, ease: "power1.out" }, 1.15)
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
    .to([O1, O2], { rotationY: 55, duration: 0.45, stagger: 0.1, ease: "back.out(1.6)" }, 2.45)
    .to(C, { x: 56, duration: 0.4, ease: "power2.out" }, 2.95)
    .to(lemonA, { x: 760, y: axisY(760), duration: 0.95, ease: "power2.inOut" }, 2.95)
    .to(C, { x: 30, duration: 0.5, ease: "sine.inOut" }, 3.35);

  // 04 CUT 3.9-6.0 ---------------------------------------------------------
  const tip = { x: 835, y: axisY(835) };          // lemon tip ends at x 960, across the L's stem
  const cutX = tip.x + LEMON.w / 2 - LEMON.w * 0.225;
  const HIT = 5.27;
  tl.to(Lb, { y: -300, rotation: -8, duration: 0.45, ease: "power3.out" }, 3.9)
    .to([E, S, T], { x: 36, duration: 0.45, stagger: 0.05, ease: "power2.out" }, 3.95)
    .to(lemonA, { x: tip.x, y: tip.y, duration: 0.4, ease: "power2.inOut" }, 4.25)
    .to(Lb, { y: -308, rotation: -17, duration: 0.42, ease: "sine.inOut" }, 4.6)        // wind-up: creep back
    .to(Lb, { rotation: -15.5, duration: 0.05, yoyo: true, repeat: 3, ease: "sine.inOut" }, 4.94) // tremble at the top
    .to(Lb, { y: -14, rotation: 2, duration: 0.15, ease: "power4.in" }, HIT - 0.15)     // one stroke
    .set(lemonA.img, { clipPath: "inset(0% 22.5% 0% 0%)" }, HIT)
    .set(cut, { autoAlpha: 1 }, HIT)
    .set(wheel, { autoAlpha: 1, x: cutX + 12, y: tip.y, rotationY: 60 }, HIT)
    .fromTo(cam, { x: 0 }, { x: 12, duration: 0.033, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, HIT)
    .to(Lb, { y: -280, rotation: 5, duration: 0.45, ease: "back.out(2)" }, HIT + 0.03)  // blade rebounds and stays up
    .to(wheel, { x: "+=70", y: "+=22", rotationY: 8, rotation: 14, duration: 0.38, ease: "power2.out" }, HIT + 0.02) // peels face-on
    .to(lemonA, { x: "-=18", duration: 0.25, ease: "power2.out" }, HIT + 0.02)
    .to(rampGroup, { x: -900, duration: 0.6, ease: "power2.in" }, 5.5);   // off-camera during the close-up, so it never re-enters
  juice.forEach((d, i) => {
    const a = -Math.PI * (0.25 + 0.5 * (i / (juice.length - 1)));
    tl.fromTo(d, { x: cutX + 6, y: tip.y, autoAlpha: 1, scale: 1 },
        { x: cutX + 6 + Math.cos(a) * 70 + 30, y: tip.y + Math.sin(a) * 60, duration: 0.22, ease: "power2.out", immediateRender: false }, HIT)
      .to(d, { y: "+=110", autoAlpha: 0, scale: 0.6, duration: 0.3, ease: "power2.in" }, HIT + 0.22);
  });

  // 05 FALL 6.0-7.6 --------------------------------------------------------
  const SPLASH = 7.05;
  tl.to(wheel, { x: LAND.x, duration: SPLASH - 6.0, ease: "sine.inOut" }, 6.0)
    .to(wheel, { y: LAND.y, duration: SPLASH - 6.0, ease: "power2.in" }, 6.0)
    .to(wheel, { rotationX: 64, rotationY: 0, rotation: 200, scale: 2.0, duration: SPLASH - 6.0, ease: "power1.in" }, 6.0)
    .to(wheel, { y: LAND.y - 18, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, SPLASH)
    .to(shadow, { autoAlpha: 0.7, scale: 1, duration: 0.25, ease: "power2.out" }, SPLASH - 0.1)
    .fromTo(ripple, { autoAlpha: 0.95, scale: 0.2 }, { autoAlpha: 0, scale: 1.6, duration: 0.85, ease: "power2.out", immediateRender: false }, SPLASH)
    .fromTo(ripple2, { autoAlpha: 0.8, scale: 0.15 }, { autoAlpha: 0, scale: 1.1, duration: 0.8, ease: "power2.out", immediateRender: false }, SPLASH + 0.12);
  drops.forEach((d, i) => {
    const a = -Math.PI * (0.15 + (0.7 * i) / (drops.length - 1));
    const r = 120 + ((i * 37) % 3) * 50;
    const size = 0.7 + (i % 4) * 0.2;
    // a crown: drops leave stretched along their path, round off at the top, then fall
    tl.fromTo(d, { x: LAND.x, y: LAND.y, autoAlpha: 1, scaleX: size * 0.7, scaleY: size * 1.6, rotation: (a * 180) / Math.PI + 90 },
        { x: LAND.x + Math.cos(a) * r, y: LAND.y + Math.sin(a) * r * 1.3, scaleX: size, scaleY: size, duration: 0.26, ease: "power2.out", immediateRender: false }, SPLASH)
      .to(d, { y: "+=90", autoAlpha: 0, scaleX: size * 0.6, scaleY: size * 1.2, duration: 0.32, ease: "power2.in" }, SPLASH + 0.26);
  });

  // 06 HERO 7.6-10 ---------------------------------------------------------
  tl.to(cam, { rx: 0, ry: 0, duration: 1.1, ease: "sine.inOut" }, 7.6)
    .to([O1, O2], { rotationY: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 7.6)
    .to(lemonA, { x: -300, y: axisY(-300), rotation: "-=200", duration: 0.7, ease: "power2.in" }, 7.55) // the stub rolls back out the way it came
    .to(C, { x: 0, duration: 0.45 }, 7.65)
    .to(Lb, { y: 0, rotation: 0, duration: 0.55, ease: "power3.inOut" }, 7.7)
    .to([E, S, T], { x: 0, duration: 0.45, stagger: 0.05 }, 7.75)
    .to(typeGroup, { x: TYPE_HOME.x, y: TYPE_HOME.y, duration: 0.75, ease: "power3.inOut" }, 7.85)
    .to(stamp, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.6)" }, 8.25)
    .to(copy, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 8.35)       // end card readable from 8.9 s
    .to(wheel, { rotation: "+=16", duration: 2.4, ease: "sine.inOut" }, 7.6)
    .to(stage.offset, { s: 1.03, duration: 1.4, ease: "sine.inOut" }, 8.6);         // the hold keeps breathing to the last frame
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
    [4.6, 990, 850, 1.75],        // CUT approach; left edge in the C|O gap
    [HIT, 930, 800, 2.0],         // the stroke, close
    [5.9, 900, 860, 1.9],
    [6.55, 720, 1250, 1.35],      // FALL: tilt down with the wheel...
    [SPLASH, 600, LAND.y - 100, 1.12], // ...wide enough that the type stays whole above the splash
    [7.6, 620, LAND.y - 150, 1.1],
    [8.7, W / 2, H / 2, 1.0],     // HERO: the full poster
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
  const smooth = (e0, e1, x) => { const u = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };
  const smoothBump = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const clock = { t: 0 };
  tl.fromTo(clock, { t: 0 }, {
    t: DURATION, duration: DURATION, ease: "none", // a clock, not a motion: the spline does the easing
    onUpdate: () => {
      [cam.fx, cam.fy, cam.s] = camAt(clock.t);
      // during the fall, lock vertically onto the wheel (smooth in/out) so it stays sharp
      const w = smoothBump(clock.t, 5.95, 6.25, SPLASH - 0.05, SPLASH + 0.35);
      if (w > 0) cam.fy += w * (gsap.getProperty(wheel, "y") + 120 - cam.fy);
    },
  }, 0);

  // render the t=0 state now: seeking 0 -> 0 later would not apply the initial .set()s
  tl.progress(1, true).progress(0, true);
  stage.renderCam();
  return { stage, tl, DURATION, BEATS, parts: { lemonA, wheel, terracotta } };
};


