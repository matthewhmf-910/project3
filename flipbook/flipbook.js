// Flip-book engine driven by frame-accurate measurements (analysis/flip_spec.json).
// Stage is authored in source pixels (360x640 @30fps); everything is a pure function of frame f.
(() => {
  const FPS = 30;
  const G = {
    w: 360, h: 640, bg: '#F6F6F6',
    pageX: 14, pageW: 332,
    upperY: 113, upperH: 186,
    lowerY: 300, lowerH: 188,
    hingeY: 299,
    logo: { cx: 180, cy: 573 },
  };
  // [s, e] = first/last motion frame of each flip; the sheet lands at e + 1.
  // start/dur in (fractional) frames, fitted per flip to the measured edge positions
  // (analysis/fit_result.json); F1 is the slower cover peel.
  const FLIPS = [
    { s: 0, d: 9.5, cover: true },
    { s: 24.25, d: 8.5 }, { s: 43.5, d: 7.75 }, { s: 59.5, d: 7 }, { s: 72.5, d: 6.75 },
    { s: 83.5, d: 5.75 }, { s: 92.75, d: 5.5 }, { s: 100.75, d: 4.75 }, { s: 107.5, d: 4.25 },
  ];
  const GHOST = { s: 129, cut: 131 };
  const END_FRAME = 130;
  const STRIPS = 120;

  // Paper-curl model: a fold line travels from the page bottom up to the hinge while the flap
  // beyond it rotates about the fold; once the fold reaches the hinge the whole sheet finishes
  // the turn. The right edge leads by `lead` (fraction of the flip). Fitted against the source.
  const P = Object.assign({
    curl: 0.5,      // fraction of the flip spent moving the fold line to the hinge
    curlAngle: 90,  // flap angle (deg) when the fold reaches the hinge
    lead: 0.1,      // right-edge lead over the left edge, as a fraction of the flip
    shift: 0,       // global timing offset in frames
    gamma: 2,       // fold-line easing exponent (fold accelerates toward the hinge)
    angPow: 0.25,   // flap angle rises fast at first: ang = curlAngle * c^angPow
    coverLead: 0.25,
  }, window.FB_PARAMS || {});

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  function stateAt(f) {
    let k = 0, flip = null;
    FLIPS.forEach((F, i) => {
      const s = F.s + P.shift, e = F.s + F.d + P.shift;
      if (f >= e) k = i + 1;
      else if (f >= s) flip = { i, F, u: (f - s) / (e - s) };
    });
    return { k, flip };
  }

  // Strip pose at local progress p in [0,1]: fold distance from hinge (px) and flap angle (deg).
  function pose(p) {
    p = clamp(p, 0, 1);
    if (p < P.curl) {
      const c = p / P.curl;
      return { fold: G.lowerH * (1 - Math.pow(c, P.gamma)), ang: P.curlAngle * Math.pow(c, P.angPow) };
    }
    const c = (p - P.curl) / (1 - P.curl);
    return { fold: 0, ang: P.curlAngle + (180 - P.curlAngle) * c };
  }

  function build(root, pages) {
    root.innerHTML = '';
    root.style.cssText += `;position:relative;width:${G.w}px;height:${G.h}px;background:${G.bg};overflow:hidden`;
    const el = (css, parent = root) => { const d = document.createElement('div'); d.style.cssText = css; parent.appendChild(d); return d; };
    el(`position:absolute;left:${G.pageX}px;width:${G.pageW}px;top:111px;height:2px;background:#E9E9E9`);
    const slot = (y, h) => el(`position:absolute;left:${G.pageX}px;top:${y}px;width:${G.pageW}px;height:${h}px;background-size:100% 100%`);
    const upper = slot(G.upperY, G.upperH), lower = slot(G.lowerY, G.lowerH);
    lower.style.boxShadow = '0 2px 12px rgba(0,0,0,.09)';
    const upperShade = el(`position:absolute;left:${G.pageX}px;top:${G.upperY}px;width:${G.pageW}px;height:${G.upperH}px;background:#000;opacity:0`);
    const sheet = el(`position:absolute;left:${G.pageX}px;top:${G.hingeY + 1}px;width:${G.pageW}px;height:${G.lowerH}px;perspective:1400px;perspective-origin:50% 0;transform-style:preserve-3d;display:none`);
    const sw = G.pageW / STRIPS, strips = [];
    const face = (parent, i, back) => {
      const d = el(`position:absolute;inset:0;backface-visibility:hidden;background-repeat:no-repeat;${back ? 'transform:rotateX(180deg)' : ''}`, parent);
      const tint = el('position:absolute;inset:0;background:#000;opacity:0', d);
      return { d, tint };
    };
    for (let i = 0; i < STRIPS; i++) {
      const col = el(`position:absolute;left:${i * sw}px;top:0;width:${sw + 0.6}px;height:${G.lowerH}px;transform-style:preserve-3d`, sheet);
      const flat = el('position:absolute;left:0;top:0;width:100%;background-repeat:no-repeat', col);
      const flap = el('position:absolute;left:0;width:100%;transform-origin:50% 0;transform-style:preserve-3d', col);
      strips.push({ i, flat, flap, front: face(flap, i, false), back: face(flap, i, true) });
    }
    el(`position:absolute;left:${G.logo.cx - 60}px;top:${G.logo.cy - 18}px;width:120px;height:37px;background:url(${pages.logo}) center/contain no-repeat`);
    const ghost = el('position:absolute;inset:0;background:rgba(0,0,0,0);pointer-events:none');
    return { upper, lower, upperShade, sheet, strips, ghost, pages, sw };
  }

  function render(R, f) {
    const { pages, sw } = R;
    const img = (k, which) => (pages.spreads[k] && pages.spreads[k][which]) ? `url(${pages.spreads[k][which]})` : 'none';
    const { k, flip } = stateAt(f);
    R.upperShade.style.opacity = 0;
    if (!flip) {
      R.upper.style.backgroundImage = img(k, 'upper');
      R.lower.style.backgroundImage = img(k, 'lower');
      R.sheet.style.display = 'none';
    } else {
      const { i, F, u } = flip;
      R.upper.style.backgroundImage = img(i, 'upper');
      R.lower.style.backgroundImage = img(i + 1, 'lower');
      R.sheet.style.display = 'block';
      const lead = F.cover ? P.coverLead : P.lead;
      const front = img(i, 'lower'), back = img(i + 1, 'upper');
      let maxAng = 0;
      R.strips.forEach((st) => {
        const x = (st.i + 0.5) / R.strips.length;
        // Right edge (x=1) is ahead by `lead`; rescale so the left edge still lands at u=1.
        const { fold, ang } = pose(clamp((u * (1 + lead) - lead * (1 - x)), 0, 1));
        maxAng = Math.max(maxAng, ang);
        const fh = G.lowerH - fold;
        st.flat.style.height = `${fold}px`;
        st.flat.style.backgroundImage = front;
        st.flat.style.backgroundSize = `${G.pageW}px ${G.lowerH}px`;
        st.flat.style.backgroundPosition = `${-st.i * sw}px 0`;
        st.flap.style.top = `${fold}px`;
        st.flap.style.height = `${fh}px`;
        st.flap.style.transform = `rotateX(${ang}deg)`;
        Object.assign(st.front.d.style, { backgroundImage: front, backgroundSize: `${G.pageW}px ${G.lowerH}px`, backgroundPosition: `${-st.i * sw}px ${-fold}px` });
        Object.assign(st.back.d.style, { backgroundImage: back, backgroundSize: `${G.pageW}px ${G.upperH}px`, backgroundPosition: `${-st.i * sw}px ${G.lowerH - G.upperH}px` });
        const s = Math.sin(ang * Math.PI / 180);
        st.front.tint.style.opacity = (0.10 * s).toFixed(3);
        st.back.tint.style.opacity = (0.05 * s).toFixed(3);
      });
      if (F.cover) {
        // Cover only: the empty upper slot darkens as the sheet approaches (measured lum 246 -> 197).
        R.upperShade.style.opacity = (0.2 * clamp(u / 0.7, 0, 1)).toFixed(3);
      }
    }
    const g = f >= GHOST.s ? clamp((f - GHOST.s + 1) / (GHOST.cut - GHOST.s), 0, 1) : 0;
    R.ghost.style.background = `rgba(0,0,0,${(0.12 * g).toFixed(3)})`;
  }

  window.Flipbook = { FPS, G, FLIPS, END_FRAME, P, build, render, stateAt };
})();
