/* Shared 3D stage helpers.
 *
 * Every scene is   .viewport (perspective: 1200px)
 *                    > .rig     camera: rotateX / rotateY / scale (scroll + hover)
 *                      > .canvas fixed design pixels, scale3d(k) to fit the viewport
 *                        > .layer  absolutely placed PNGs, translated on Z
 *
 * Layer placement comes from assets/manifest.js (poster canvas 1536 x 1326),
 * so replacing a PNG with a higher-resolution export of the same framing needs
 * no code change.
 */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const XY = (window.XY = {});
  XY.M = window.ASSET_MANIFEST;
  XY.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  XY.finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // the standalone build (tools/build_standalone.py) inlines assets into window.ASSET_DATA
  XY.asset = (file) => (window.ASSET_DATA && window.ASSET_DATA[file]) || "assets/" + file;
  XY.rect = (file) => XY.M.layers[file];
  /* Size scenes from clientWidth, never innerWidth: on phones innerWidth grows
     with any horizontal overflow, which fed back into the stage size and
     snowballed the page to ~2.5x the screen width. */
  XY.viewW = () => document.documentElement.clientWidth;
  XY.viewH = () => window.innerHeight;

  XY.place = function (el, r) {
    el.style.left = r.x + "px";
    el.style.top = r.y + "px";
    el.style.width = r.w + "px";
    el.style.height = r.h + "px";
  };

  XY.el = function (tag, cls, parent, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    if (parent) parent.appendChild(el);
    return el;
  };

  XY.img = function (file, parent) {
    const img = XY.el("img", "", parent);
    img.src = XY.asset(file);
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    return img;
  };

  /* Poster small print, kept as live text (positions in canvas px, see .copy in CSS). */
  XY.posterCopy = function (node) {
    node.classList.add("copy");
    node.innerHTML =
      '<p class="copy__kicker">Slow brew<br>Good mood</p>' +
      '<p class="copy__quote"><span>The best preparation</span><span>for tomorrow is doing</span><span>your best today..</span></p>' +
      '<i class="copy__rule"></i>' +
      '<p class="copy__ritual">Daily<br>Ritual</p><i class="copy__ritual-rule"></i>';
    return node;
  };

  XY.createStage = function (viewport, w, h) {
    const stage = {
      viewport,
      rig: viewport.querySelector(".rig"),
      canvas: viewport.querySelector(".canvas"),
      w, h, k: 1,
      cam: { rx: 0, ry: 0, s: 1, x: 0, y: 0 },
      hover: { rx: 0, ry: 0, lift: 0 },
      offset: { rx: 0, ry: 0, s: 1 }, // a third, independent camera input (e.g. a button)
    };

    stage.fit = function (maxW, maxH) {
      const k = Math.max(0.05, Math.min(maxW / stage.w, maxH / stage.h));
      stage.k = k;
      viewport.style.width = stage.w * k + "px";
      viewport.style.height = stage.h * k + "px";
      const c = stage.canvas;
      c.style.width = stage.w + "px";
      c.style.height = stage.h + "px";
      // scale3d (not scale) so Z distances shrink with the artwork
      c.style.transform = `scale3d(${k}, ${k}, ${k})`;
      c.style.setProperty("--ik", (1 / k).toFixed(4));
    };

    stage.renderCam = function () {
      const c = stage.cam, hv = stage.hover, o = stage.offset;
      stage.rig.style.transform =
        `translate3d(${c.x}px, ${c.y}px, 0) rotateX(${c.rx + hv.rx + o.rx}deg) rotateY(${c.ry + hv.ry + o.ry}deg) scale(${c.s * o.s})`;
    };

    return stage;
  };

  /* Hide a scene's 3D layers while it is fully off screen so the compositor
     stops carrying them (big win on phones). */
  XY.cullOffscreen = function (stage, trigger) {
    ScrollTrigger.create({
      trigger: trigger || stage.viewport,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (stage.rig.style.visibility = self.isActive ? "" : "hidden"),
    });
  };

  /* Pointer tilt + Z "lift" on hover. Eased with quickTo so it never fights
     the scroll timeline: both write into separate objects, renderCam sums them. */
  XY.addTilt = function (stage, opts) {
    const { max = 8, lift = 0, onUpdate = stage.renderCam } = opts || {};
    if (!XY.finePointer || XY.reducedMotion) return;
    const tw = { duration: 0.9, ease: "power3.out", onUpdate };
    const qx = gsap.quickTo(stage.hover, "rx", tw);
    const qy = gsap.quickTo(stage.hover, "ry", tw);
    const ql = gsap.quickTo(stage.hover, "lift", { duration: 1.2, ease: "power3.out", onUpdate });
    const zone = stage.viewport.closest("[data-tilt-zone]") || stage.viewport;

    zone.addEventListener("pointermove", (e) => {
      const r = stage.viewport.getBoundingClientRect();
      const px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
      const py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
      qy(px * max * 2);
      qx(-py * max * 1.5);
      ql(lift);
    });
    zone.addEventListener("pointerleave", () => {
      qx(0);
      qy(0);
      ql(0);
    });
  };

  /* Phones fire "resize" every time the URL bar shows or hides while scrolling.
     Re-fitting + ScrollTrigger.refresh() on those made pinned sections jump,
     so on touch devices only a width change (rotation) triggers a re-layout. */
  XY.onResize = function (fn) {
    let raf = 0, lastW = XY.viewW();
    window.addEventListener("resize", () => {
      if (!XY.finePointer && XY.viewW() === lastW) return;
      lastW = XY.viewW();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fn);
    });
  };
})();
