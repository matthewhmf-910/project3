/* The details: on a fine pointer, one preview card follows the cursor with a
 * little lag and leans into its speed; moving between rows rolls a vertical
 * strip of images to the hovered row. Touch devices keep the inline thumbnails
 * and run none of this. */
(function () {
  const section = document.querySelector(".details");
  const list = section && section.querySelector(".features");
  if (!list) return;
  const rows = Array.from(list.querySelectorAll(".feature"));
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const GAP = 36; // clear of the line under the cursor

  let card, strip, moveX, moveY, lean, active = -1, inside = false, lastX = 0, lastT = 0;

  // built on the first hover: by then the standalone build has filled in the image sources
  function build() {
    card = document.createElement("div");
    card.className = "feature-preview";
    card.setAttribute("aria-hidden", "true");
    strip = document.createElement("div");
    strip.className = "feature-preview__strip";
    rows.forEach((row, i) => {
      const item = document.createElement("div");
      item.className = "feature-preview__item";
      item.dataset.tone = row.dataset.tone || "ivory";
      item.style.top = i * 100 + "%";
      const im = document.createElement("img");
      im.src = row.querySelector(".feature__img").src;
      im.alt = "";
      item.appendChild(im);
      strip.appendChild(item);
    });
    card.appendChild(strip);
    document.body.appendChild(card);

    const d = XY.reducedMotion ? 0 : 0.55;
    moveX = gsap.quickTo(card, "x", { duration: d, ease: "power3.out" });
    moveY = gsap.quickTo(card, "y", { duration: d, ease: "power3.out" });
    lean = gsap.quickTo(card, "rotation", { duration: 0.6, ease: "power3.out" });
  }

  // centred on the cursor and above it, so the hovered row stays readable; below it only when
  // there is no room above; always inside the viewport
  function place(x, y, now) {
    const w = card.offsetWidth, h = card.offsetHeight;
    const px = Math.min(Math.max(x - w / 2, 12), window.innerWidth - w - 12);
    const py = y - GAP - h >= 12 ? y - GAP - h : Math.min(y + GAP, window.innerHeight - h - 12);
    if (now) { gsap.set(card, { x: px, y: py }); moveX(px, px); moveY(py, py); }
    else { moveX(px); moveY(py); }
  }

  function show(i) {
    if (i === active) return;
    const first = active < 0;
    active = i;
    gsap.to(strip, { yPercent: -100 * i, duration: first || XY.reducedMotion ? 0 : 0.5, ease: "power3.inOut", overwrite: true });
  }

  function onEnter(e) {
    if (!card) build();
    inside = true;
    lastX = e.clientX; lastT = e.timeStamp;
    place(e.clientX, e.clientY, true);
    gsap.to(card, { autoAlpha: 1, scale: 1, duration: XY.reducedMotion ? 0.15 : 0.35, ease: "power3.out", overwrite: "auto", startAt: { scale: XY.reducedMotion ? 1 : 0.7 } });
  }

  function onMove(e) {
    if (!inside) return;
    place(e.clientX, e.clientY, false);
    if (!XY.reducedMotion) {
      const v = (e.clientX - lastX) / Math.max(e.timeStamp - lastT, 8); // px per ms
      lean(gsap.utils.clamp(-8, 8, v * 6));
      lastX = e.clientX; lastT = e.timeStamp;
    }
  }

  function onLeave() {
    inside = false;
    active = -1;
    gsap.to(card, { autoAlpha: 0, scale: XY.reducedMotion ? 1 : 0.8, rotation: 0, duration: 0.25, ease: "power2.in", overwrite: "auto" });
  }

  const handlers = rows.map((row, i) => () => show(i));
  function enable() {
    section.classList.add("has-preview");
    list.addEventListener("pointerenter", onEnter);
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    rows.forEach((row, i) => row.addEventListener("pointerenter", handlers[i]));
  }
  function disable() {
    section.classList.remove("has-preview");
    list.removeEventListener("pointerenter", onEnter);
    list.removeEventListener("pointermove", onMove);
    list.removeEventListener("pointerleave", onLeave);
    rows.forEach((row, i) => row.removeEventListener("pointerenter", handlers[i]));
    if (card) onLeave();
  }

  if (fine.matches) enable();
  fine.addEventListener("change", (e) => (e.matches ? enable() : disable()));
})();
