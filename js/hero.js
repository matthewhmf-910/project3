/* Hero: the poster as ten Z-separated layers.
 * Hover tilts the camera and lifts the stack slightly; scroll (pinned) runs
 * Poster lock -> Separate -> Orbit -> Reassemble. */
(function () {
  const { M, el, img, place, rect } = XY;
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const viewport = canvas.closest(".viewport");

  const LAND = { w: M.canvas.w, h: M.canvas.h }; // 1536 x 1326 poster
  const PORT = { w: 1536, h: 2731 };              // 9:16 at the same width

  /* Portrait (mobile 9:16): product + shapes scale 1.5x around the cup,
     type block re-centred above it. */
  const cup = rect("01_CUP_LEMON.png");
  const coolest = rect("04_TYPE_COOLEST.png");
  const product = (r) => ({ x: 278 + (r.x - cup.x) * 1.5, y: 1250 + (r.y - cup.y) * 1.5, w: r.w * 1.5, h: r.h * 1.5 });
  const typeBlock = (r) => {
    const s = 1080 / coolest.w;
    return { x: 228 + (r.x - coolest.x) * s, y: 400 + (r.y - coolest.y) * s, w: r.w * s, h: r.h * s };
  };
  const full = (c) => ({ x: 0, y: 0, w: c.w, h: c.h });
  const shadowRect = { x: 600, y: 1086, w: 520, h: 120 }; // under the glass, on the coaster

  /* z = travel at full separation (canvas px); dx/dy = lateral drift.
     Order is the poster's paint order, back to front. */
  const LAYERS = [
    { id: "ivory", file: "11_BACKGROUND_IVORY.png", tile: true, z: -300, tag: ["11", "Ivory paper"], t: [0.035, 0.31],
      land: full(LAND), port: full(PORT) },
    { id: "sage", file: "07_SHAPE_SAGE.png", z: -210, dx: -30, tag: ["07", "Sage block"], t: [0.74, 0.34] },
    { id: "terra", file: "08_SHAPE_TERRACOTTA.png", z: -170, dx: 40, dy: 20, tag: ["08", "Terracotta block"], t: [0.42, 0.3] },
    { id: "copy", copy: true, z: -110, land: full(LAND), port: full(PORT) },
    { id: "coffee", file: "05_TYPE_COFFEE.png", z: -20, dy: -10, tag: ["05", "Type · COFFEE"], t: [0.76, 0.05], type: true },
    { id: "coolest", file: "04_TYPE_COOLEST.png", z: 50, dy: -40, tag: ["04", "Type · COOLEST"], t: [0.0, 0.18], type: true },
    { id: "coaster", file: "03_WOOD_COASTER.png", z: 70, dy: 70, tag: ["03", "Wood coaster"], t: [0.0, 0.66] },
    { id: "shadow", shadow: true, z: 72, dy: 70, land: shadowRect, port: product(shadowRect) },
    { id: "cup", file: "01_CUP_LEMON.png", z: 180, dy: -40, tag: ["01", "Cup + lemon · hero"], t: [0.8, 0.06] },
    { id: "spoon", file: "02_SPOON.png", z: 260, dx: 40, dy: 60, tag: ["02", "Spoon"], t: [0.04, 1.12] },
    { id: "stamp", file: "06_STAMP.png", z: 330, dx: -10, dy: -10, tag: ["06", "Stamp"], t: [-0.05, 0.5], tox: "-100%",
      port: { x: 1196, y: 70, w: 270, h: 272 } },
  ];

  for (const L of LAYERS) {
    if (L.file && !L.land) L.land = rect(L.file);
    if (!L.port) L.port = L.type ? typeBlock(L.land) : product(L.land);
    L.dx = L.dx || 0;
    L.dy = L.dy || 0;
  }

  /* ---- build DOM */
  LAYERS.forEach((L, i) => {
    const node = el("div", "layer", canvas);
    node.dataset.layer = L.id;
    L.base = i * 0.6; // never coplanar: avoids z-fighting when the rig rotates
    if (L.tile) node.classList.add("layer--tile");
    else if (L.file) img(L.file, node);
    if (L.shadow) node.classList.add("shadow");
    if (L.copy) XY.posterCopy(node);
    if (L.tag) {
      const t = el("span", "tag", node, `${L.tag[0]} · ${L.tag[1]}<small>z ${L.z > 0 ? "+" : ""}${L.z}px · ${L.file}</small>`);
      t.style.setProperty("--tx", L.t[0] * 100 + "%");
      t.style.setProperty("--ty", L.t[1] * 100 + "%");
      if (L.tox) t.style.setProperty("--tox", L.tox);
    }
    L.node = node;
  });

  const stage = XY.createStage(viewport, LAND.w, LAND.h);
  const scroll = stage.cam;         // camera + separation driven by the scroll timeline
  scroll.e = 0;
  const toggle = { e: 0 };          // the "Separate layers" button (touch / keyboard / reduced motion)
  const depthOut = document.getElementById("heroDepth");
  const phases = [...document.querySelectorAll("#heroPhases li")];
  const maxZ = Math.max(...LAYERS.map((l) => l.z)) - Math.min(...LAYERS.map((l) => l.z));
  let depthBoost = 1;
  const last = {};
  // write a style only when it changes; every write invalidates the canvas subtree
  function setVar(node, name, value) {
    if (last[name] === value) return;
    last[name] = value;
    node.style.setProperty(name, value);
  }

  function render() {
    const e = Math.min(1.2, scroll.e + stage.hover.lift + toggle.e);
    const ez = e * depthBoost;
    for (const L of LAYERS) {
      L.node.style.transform = `translate3d(${L.dx * e}px, ${L.dy * e}px, ${L.base + L.z * ez}px)`;
    }
    setVar(canvas, "--labels", Math.max(0, Math.min(1, (e - 0.45) / 0.35)).toFixed(2));
    setVar(canvas, "--shadow", Math.min(1, e * 1.6).toFixed(2));
    stage.renderCam();
    const depth = String(Math.round(maxZ * ez));
    if (depthOut.value !== depth) depthOut.value = depth;
  }

  /* ---- layout: landscape poster, or 9:16 on narrow / tall screens */
  let portrait = null;
  function layout() {
    const vw = XY.viewW(), vh = XY.viewH();
    const nowPortrait = vw < 720 || vw / vh < 0.8;
    if (nowPortrait !== portrait) {
      portrait = nowPortrait;
      const dim = portrait ? PORT : LAND;
      stage.w = dim.w;
      stage.h = dim.h;
      canvas.classList.toggle("is-portrait", portrait);
      for (const L of LAYERS) place(L.node, portrait ? L.port : L.land);
    }
    const hud = portrait ? 120 : 132;
    stage.fit(Math.min(vw - 32, 1180), vh - 64 - hud);
    // keep perceived depth similar on small screens, where scale3d shrinks Z too
    depthBoost = Math.min(2.2, Math.max(1, 0.55 / stage.k));
    render();
  }
  layout();
  XY.onResize(() => {
    layout();
    ScrollTrigger.refresh();
  });

  XY.addTilt(stage, { max: 9, lift: 0.22, onUpdate: render });

  /* ---- button: explicit separate / assemble */
  const btn = document.getElementById("heroToggle");
  btn.addEventListener("click", () => {
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Assemble poster" : "Separate layers";
    gsap.to(toggle, { e: on ? 1 : 0, duration: XY.reducedMotion ? 0 : 1.1, ease: "power3.inOut", onUpdate: render });
    if (!XY.reducedMotion) {
      gsap.to(stage.offset, { rx: on ? 14 : 0, ry: on ? -24 : 0, s: on ? 0.84 : 1, duration: 1.1, ease: "power3.inOut", onUpdate: render });
    }
  });

  function setPhase(i) {
    phases.forEach((li, j) => li.classList.toggle("is-active", i === j));
  }

  if (XY.reducedMotion) {
    document.getElementById("heroHint").textContent = "Use the button to separate the ten layers.";
    return;
  }

  /* ---- scroll: pinned for 2.4 viewports, scrubbed */
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onUpdate: render,
    scrollTrigger: {
      trigger: viewport.closest(".hero"),
      pin: viewport.closest(".hero__pin"),
      start: "top top",
      end: "+=240%",
      scrub: 0.9,
      onUpdate: (self) => {
        const p = self.progress;
        setPhase(p < 0.12 ? 0 : p < 0.46 ? 1 : p < 0.76 ? 2 : 3);
      },
    },
  });
  tl.to({}, { duration: 0.12 })                                                         // poster lock
    .to(scroll, { e: 1, rx: 20, ry: -30, s: 0.8, duration: 0.34 })                      // separate
    .to(scroll, { rx: 9, ry: 24, duration: 0.3, ease: "sine.inOut" })                    // orbit
    .to(scroll, { e: 0, rx: 0, ry: 0, s: 1, duration: 0.24 });                          // reassemble

  // created after the pin so its range includes the pin spacing (ScrollTrigger refreshes in creation order)
  XY.cullOffscreen(stage, viewport.closest(".hero"));
})();
