/* The window: the ghost plate builds up into the real storefront as it
 * scrolls in (pavement first, roof last), on a tiltable 3D card. */
(function () {
  const viewport = document.querySelector(".window__viewport");
  if (viewport) {
    const stage = XY.createStage(viewport, 0, 0);
    XY.addTilt(stage, { max: 7 });

    if (!XY.reducedMotion) {
      gsap.fromTo(viewport.querySelector(".window__real"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: viewport, start: "top 80%", end: "center 40%", scrub: 0.6 },
        });
      gsap.fromTo(viewport.querySelector(".window__stamp"),
        { rotation: -50, opacity: 0, z: 90 },
        { rotation: 0, opacity: 1, z: 90, ease: "none", scrollTrigger: { trigger: viewport, start: "top 70%", end: "center 50%", scrub: 0.6 } });
    }
  }

  const footStamp = document.querySelector(".foot__stamp");
  if (footStamp && !XY.reducedMotion) {
    gsap.to(footStamp, {
      rotation: 120,
      ease: "none",
      scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true },
    });
  }
})();
