/* Reel: "The lemon finds its way", a 10 s, 9:16 GSAP timeline.
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
(function () {
  const { M, el, img, place, rect } = XY;
  const canvas = document.getElementById("reelCanvas");
  if (!canvas) return;
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
  const TYPE = { x: 380, y: 330, w: 1080 };
  const ts = TYPE.w / cool.w;
  TYPE.h = cool.h * ts;
  const typeRect = (r) => ({ x: TYPE.x + (r.x - cool.x) * ts, y: TYPE.y + (r.y - cool.y) * ts, w: r.w * ts, h: r.h * ts });
  const TYPE_HOME = { x: 228 - TYPE.x, y: 400 - TYPE.y }; // where the hero layout keeps the type block

  const LEMON = { w: 200, h: 135 };
  const RAMP = { x: -129, y: 362, angle: 36, length: 520, stop: 196 };
  const ux = Math.cos((RAMP.angle * Math.PI) / 180), uy = Math.sin((RAMP.angle * Math.PI) / 180);
  // centre of a lemon resting on the ramp's top face, d px along it
  const onRamp = (d) => ({ x: RAMP.x + d * ux + uy * LEMON.h / 2, y: RAMP.y + d * uy - ux * LEMON.h / 2 });

  /* ---------------------------------------------------------------- scene */
  const stage = XY.createStage(viewport, W, H);
  canvas.classList.add("is-portrait");

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

  layer("layer--tile", { x: -240, y: -240, w: W + 480, h: H + 480 }, -160);
  pngLayer("07_SHAPE_SAGE.png", product(rect("07_SHAPE_SAGE.png")), -110);
  pngLayer("08_SHAPE_TERRACOTTA.png", product(rect("08_SHAPE_TERRACOTTA.png")), -90);
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

  const stamp = pngLayer("06_STAMP.png", { x: 1196, y: 70, w: 270, h: 272 }, 40);

  /* ---------------------------------------------------------------- timeline */
  const cam = stage.cam;
  const tl = gsap.timeline({ paused: true, onUpdate: tick, onComplete: ended, defaults: { ease: "power2.inOut" } });

  // initial state lives in the timeline (fromTo / set at 0) so seeking backwards always restores it
  tl.set(copy, { opacity: 0, y: 30 }, 0)
    .set(stamp, { opacity: 0, scale: 0.7, rotation: -40 }, 0)
    .set(typeGroup, { x: 0, y: 0 }, 0)
    .set(rampGroup, { x: 0, opacity: 1 }, 0)
    .set(lemonA.img, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
    .set(lemonA.querySelector(".lemon__cut"), { opacity: 0 }, 0)
    .set(lemonA, { opacity: 1, z: 36 }, 0)
    .set(wheel, { opacity: 0, rotationX: 0, rotationY: 84, rotation: 0, scale: 1 }, 0)
    .fromTo(cam, { rx: 6, ry: -7, x: 0 }, { rx: 3, ry: 5, duration: 8.8, ease: "sine.inOut" }, 0);

  // 01 ROLL ---------------------------------------------------------------
  const rollEnd = onRamp(RAMP.length - LEMON.w / 2 - 10);
  tl.fromTo(lemonA, { ...onRamp(RAMP.stop + 70), rotation: RAMP.angle },
      { ...rollEnd, rotation: RAMP.angle + 360, duration: 1.2, ease: "power2.in" }, 0)
    .fromTo(lemonB, { rotation: RAMP.angle }, { rotation: RAMP.angle + 8, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.15)
    // C swings into a cradle under the end of the ramp
    .fromTo(C, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      { x: 470 - C.center.x, y: 735 - C.center.y, rotation: -90, duration: 0.55, ease: "back.out(1.4)" }, 0.65);

  // 02 CATCH --------------------------------------------------------------
  const bowl = { x: 470, y: 690 };
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
  tl.to(Lb, { y: -330, rotation: -8, duration: 0.6, ease: "power3.out" }, 4.2)
    .to([E, S, T], { x: 36, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 4.25)
    .to(lemonA, { x: cutTip.x, y: cutTip.y, duration: 0.5, ease: "power2.out" }, 4.7)
    .to(Lb, { y: -385, rotation: -15, duration: 0.65, ease: "sine.inOut" }, 5.2)          // wind-up
    .to(Lb, { y: -12, rotation: 0, duration: 0.2, ease: "power4.in" }, 5.85)               // one stroke
    .set(lemonA.img, { clipPath: "inset(0% 22.5% 0% 0%)" }, 6.05)
    .set(lemonA.querySelector(".lemon__cut"), { opacity: 1 }, 6.05)
    .set(wheel, { opacity: 1, x: cutTip.x + 68, y: cutTip.y }, 6.05)
    .fromTo(typeGroup, { y: 0 }, { y: 7, duration: 0.06, yoyo: true, repeat: 1, ease: "none", immediateRender: false }, 6.05)
    .to(Lb, { y: -290, rotation: 5, duration: 0.45, ease: "back.out(2)" }, 6.08)          // blade rebounds, stays up
    .to(lemonA, { x: "-=16", duration: 0.3, ease: "power2.out" }, 6.08)
    .to(wheel, { x: "+=60", y: "+=46", rotationY: 38, rotation: 18, duration: 1.3, ease: "sine.inOut" }, 6.1);

  // 05 FALL ---------------------------------------------------------------
  tl.to(wheel, { x: LAND.x, duration: 0.95, ease: "power1.inOut" }, 7.4)
    .to(wheel, { y: LAND.y, duration: 0.95, ease: "power2.in" }, 7.4)
    .to(wheel, { rotationX: 64, rotationY: 0, rotation: 200, scale: 1.6, duration: 0.95, ease: "power1.in" }, 7.4)
    .to(wheel, { y: LAND.y - 16, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, 8.35)
    .fromTo(ripple, { opacity: 0.9, scale: 0.2 }, { opacity: 0, scale: 1.5, duration: 0.8, ease: "power2.out", immediateRender: false }, 8.35);
  drops.forEach((d, i) => {
    const a = -Math.PI * (0.15 + (0.7 * i) / (drops.length - 1));
    const r = 90 + (i % 3) * 45;
    tl.fromTo(d, { x: LAND.x, y: LAND.y, opacity: 1, scale: 1 },
        { x: LAND.x + Math.cos(a) * r, y: LAND.y + Math.sin(a) * r * 1.2, duration: 0.25, ease: "power2.out", immediateRender: false }, 8.35)
      .to(d, { y: "+=70", opacity: 0, scale: 0.5, duration: 0.3, ease: "power2.in" }, 8.6);
  });

  // 06 HERO ---------------------------------------------------------------
  tl.to(cam, { rx: 0, ry: 0, duration: 1.2, ease: "power2.inOut" }, 8.8)
    .to([O1, O2], { rotationY: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 8.8)
    .to(lemonA, { y: "+=300", z: -180, opacity: 0, duration: 0.55, ease: "power2.in" }, 8.8)
    .to(rampGroup, { x: -900, opacity: 0, duration: 0.7, ease: "power2.in" }, 8.8)
    .to(C, { x: 0, duration: 0.45 }, 8.85)
    .to(Lb, { y: 0, rotation: 0, duration: 0.55, ease: "power3.inOut" }, 8.95)
    .to([E, S, T], { x: 0, duration: 0.45, stagger: 0.05 }, 9.0)
    .to(typeGroup, { x: TYPE_HOME.x, y: TYPE_HOME.y, duration: 0.8, ease: "power3.inOut" }, 9.05)
    .to(stamp, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.6)" }, 9.3)
    .to(copy, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 9.4)
    .to({}, { duration: DURATION - tl.duration() > 0 ? DURATION - tl.duration() : 0 });

  /* ---------------------------------------------------------------- player UI */
  const player = viewport.closest(".reel__player");
  const playBtn = document.getElementById("reelPlay");
  const scrub = document.getElementById("reelScrub");
  const fill = document.getElementById("reelFill");
  const timeOut = document.getElementById("reelTime");
  const ticks = document.getElementById("reelTicks");
  const beatList = document.getElementById("reelBeats");

  BEATS.forEach((b, i) => {
    if (i) el("i", "", ticks).style.left = (b.t[0] / DURATION) * 100 + "%";
    const li = el("li", "", beatList);
    const btn = el("button", "", li,
      `<span class="beat__no">0${i + 1}</span><span class="beat__name">${b.name}</span>` +
      `<span class="beat__time">${b.t[0].toFixed(1)}–${b.t[1].toFixed(1)}s</span>` +
      `<span class="beat__desc">${b.desc}</span><span class="beat__bar"></span>`);
    btn.type = "button";
    btn.setAttribute("aria-label", `Play from beat ${i + 1}, ${b.name}, ${b.t[0]} seconds`);
    btn.addEventListener("click", () => {
      tl.seek(b.t[0]);
      play();
    });
    b.li = li;
  });

  function tick() {
    const t = tl.time();
    const p = t / DURATION;
    stage.renderCam();
    if (!scrubbing) scrub.value = Math.round(p * 1000);
    scrub.setAttribute("aria-valuetext", t.toFixed(1) + " seconds");
    fill.style.setProperty("--p", p.toFixed(4));
    timeOut.value = t.toFixed(1) + "s";
    BEATS.forEach((b) => {
      const local = Math.max(0, Math.min(1, (t - b.t[0]) / (b.t[1] - b.t[0])));
      const active = t >= b.t[0] && (t < b.t[1] || (b.t[1] === DURATION && t >= DURATION));
      b.li.classList.toggle("is-active", active);
      b.li.style.setProperty("--p", local.toFixed(3));
    });
  }

  function setState(state) {
    player.classList.toggle("is-playing", state === "playing");
    player.classList.toggle("is-ended", state === "ended");
    playBtn.setAttribute("aria-label", state === "playing" ? "Pause reel" : state === "ended" ? "Replay reel" : "Play reel");
  }
  function play() {
    if (tl.progress() >= 1) tl.seek(0);
    tl.play();
    setState("playing");
  }
  function pause() {
    tl.pause();
    setState(tl.progress() >= 1 ? "ended" : "paused");
  }
  function ended() {
    setState("ended");
  }

  playBtn.addEventListener("click", () => (tl.isActive() ? pause() : play()));

  let scrubbing = false;
  scrub.addEventListener("input", () => {
    scrubbing = true;
    tl.pause();
    tl.progress(scrub.value / 1000);
    setState(tl.progress() >= 1 ? "ended" : "paused");
    scrubbing = false;
  });

  /* ---------------------------------------------------------------- layout + autoplay */
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxH = Math.min(vh * 0.78, 760);
    const maxW = vw < 880 ? Math.min(vw - 32, 430) : 430;
    stage.fit(maxW, maxH);
    stage.renderCam();
  }
  layout();
  XY.onResize(layout);
  XY.addTilt(stage, { max: 6 });

  XY.reelTimeline = tl;
  tl.progress(0).pause();
  tick();

  if (XY.reducedMotion) {
    // show the finished frame; the reel only runs on request
    tl.progress(1).pause();
    setState("ended");
    tick();
    return;
  }

  ScrollTrigger.create({
    trigger: viewport,
    start: "top 75%",
    end: "bottom 15%",
    onEnter: play,
    onEnterBack: play,
    onLeave: pause,
    onLeaveBack: pause,
  });
})();
