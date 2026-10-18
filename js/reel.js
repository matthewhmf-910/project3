/* Page player for the reel: controls, beat list, autoplay in view. */
(function () {
  const { el } = XY;
  const canvas = document.getElementById("reelCanvas");
  if (!canvas) return;
  const viewport = canvas.closest(".viewport");
  const { stage, tl, DURATION, BEATS } = XY.buildReel(canvas);
  tl.eventCallback("onUpdate", tick);
  tl.eventCallback("onComplete", ended);

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
    const vw = XY.viewW(), vh = XY.viewH();
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

  XY.cullOffscreen(stage);
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
