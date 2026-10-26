// Flip-book engine driven by frame-accurate measurements (analysis/flip_spec.json).
// Stage is authored in source pixels (360x640 @30fps) and drawn on a <canvas>; render(R, f)
// is a pure function of the (fractional) source frame f.
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
  // start/dur in (fractional) frames, fitted per flip to the measured edge positions
  // (analysis/fit_result.json); F1 is the slower cover peel.
  const FLIPS = [
    { s: 0, d: 9.5, cover: true },
    { s: 24.25, d: 8.5 }, { s: 43.5, d: 7.75 }, { s: 59.5, d: 7 }, { s: 72.5, d: 6.75 },
    { s: 83.5, d: 5.75 }, { s: 92.75, d: 5.5 }, { s: 100.75, d: 4.75 }, { s: 107.5, d: 4.25 },
  ];
  const GHOST = { s: 129, cut: 131 };
  const END_FRAME = 130;
  const STRIPS = 96;

  // Paper-curl model: a fold line travels from the page bottom up to the hinge while the flap
  // beyond it rotates about the fold; once the fold reaches the hinge the whole sheet finishes
  // the turn. The right edge leads by `lead` (fraction of the flip). Fitted against the source.
  // Projection is orthographic (the fit preferred no perspective), so each strip is a 2D slice.
  const P = Object.assign({
    curl: 0.5,      // fraction of the flip spent moving the fold line to the hinge
    curlAngle: 90,  // flap angle (deg) when the fold reaches the hinge
    lead: 0.1,      // right-edge lead over the left edge, as a fraction of the flip
    shift: 0,       // global timing offset in frames
    gamma: 2,       // fold-line easing exponent (fold accelerates toward the hinge)
    angPow: 0.25,   // flap angle rises fast at first: ang = curlAngle * c^angPow
    coverLead: 0.25,
    hingeShade: true, // draw the measured hinge shading (off for textures that already contain it)
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

  const load = (src) => new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  });

  async function build(canvas, pages) {
    const spreads = await Promise.all(pages.spreads.map(async (s) => ({ upper: await load(s.upper), lower: await load(s.lower) })));
    return { canvas, ctx: canvas.getContext('2d'), spreads, logo: await load(pages.logo), scale: 1 };
  }

  // Size the canvas backing store for a CSS scale factor (stage px -> CSS px).
  function resize(R, cssScale) {
    const dpr = window.devicePixelRatio || 1;
    R.scale = cssScale * dpr;
    R.canvas.width = Math.round(G.w * R.scale);
    R.canvas.height = Math.round(G.h * R.scale);
    R.canvas.style.width = `${G.w * cssScale}px`;
    R.canvas.style.height = `${G.h * cssScale}px`;
  }

  function drawPage(ctx, img, x, y, w, h, shadow) {
    ctx.save();
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,.10)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2; }
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    if (img) ctx.drawImage(img, x, y, w, h);
  }

  function drawLogo(R) {
    const { ctx } = R, { cx, cy } = G.logo;
    if (R.logo) { ctx.drawImage(R.logo, cx - 60, cy - 18, 120, 37); return; }
    // Generic mark: a circle split into four pastel quadrants + wordmark.
    const r = 8, mx = cx - 36;
    ['#F2D98A', '#F2B8B0', '#A8C3A0', '#B9CFE3'].forEach((c, i) => {
      ctx.beginPath(); ctx.moveTo(mx, cy); ctx.arc(mx, cy, r, (i - 1) * Math.PI / 2, i * Math.PI / 2); ctx.closePath();
      ctx.fillStyle = c; ctx.fill();
    });
    ctx.fillStyle = '#181916';
    ctx.font = '700 15px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('SiteMap', mx + 14, cy + 1);
  }

  function hingeShade(ctx, hasUpper) {
    if (!P.hingeShade) return;
    // Measured: upper page darkens over its last 24px (lum 250 -> 215); the lower page starts at
    // lum 215 and recovers to white over 88px, falling off fast near the hinge.
    let g;
    if (hasUpper) {
      g = ctx.createLinearGradient(0, G.hingeY - 24, 0, G.hingeY);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
      ctx.fillStyle = g; ctx.fillRect(G.pageX, G.hingeY - 24, G.pageW, 24);
    }
    g = ctx.createLinearGradient(0, G.lowerY, 0, G.lowerY + 88);
    g.addColorStop(0, 'rgba(0,0,0,.12)'); g.addColorStop(0.25, 'rgba(0,0,0,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(G.pageX, G.lowerY, G.pageW, 88);
  }

  function render(R, f) {
    const { ctx, spreads } = R;
    const tex = (k, which) => (spreads[k] ? spreads[k][which] : null);
    ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    ctx.fillStyle = G.bg; ctx.fillRect(0, 0, G.w, G.h);
    ctx.fillStyle = '#E9E9E9'; ctx.fillRect(G.pageX, 111, G.pageW, 2);

    const { k, flip } = stateAt(f);
    const settledUpper = flip ? flip.i : k, settledLower = flip ? flip.i + 1 : k;
    const up = tex(settledUpper, 'upper');
    if (up) drawPage(ctx, up, G.pageX, G.upperY, G.pageW, G.upperH, false);
    drawPage(ctx, tex(settledLower, 'lower'), G.pageX, G.lowerY, G.pageW, G.lowerH, true);
    hingeShade(ctx, !!up);

    if (flip) {
      const { i, F, u } = flip;
      if (F.cover) {
        // Cover only: the empty upper slot darkens as the sheet approaches (measured lum 246 -> 197).
        ctx.fillStyle = `rgba(0,0,0,${(0.2 * clamp(u / 0.7, 0, 1)).toFixed(3)})`;
        ctx.fillRect(G.pageX, G.upperY, G.pageW, G.upperH);
      }
      const front = tex(i, 'lower'), back = tex(i + 1, 'upper');
      const lead = F.cover ? P.coverLead : P.lead;
      const sw = G.pageW / STRIPS, top = G.hingeY + 1, H = G.lowerH;
      const fk = front ? front.naturalHeight / G.lowerH : 1, fx = front ? front.naturalWidth / G.pageW : 1;
      const bk = back ? back.naturalHeight / G.upperH : 1, bx = back ? back.naturalWidth / G.pageW : 1;
      for (let j = 0; j < STRIPS; j++) {
        const x = (j + 0.5) / STRIPS;
        const { fold, ang } = pose(u * (1 + lead) - lead * (1 - x));
        const dx = G.pageX + j * sw, L = H - fold, c = Math.cos(ang * Math.PI / 180), s = Math.sin(ang * Math.PI / 180);
        const w = sw + 0.5;
        // Flat part between hinge and fold (front face, unrotated).
        if (fold > 0 && front) ctx.drawImage(front, j * sw * fx, 0, sw * fx, fold * fk, dx, top, w, fold);
        else if (fold > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(dx, top, w, fold); }
        if (L <= 0.01) continue;
        if (c >= 0) {
          // Flap still facing the viewer: front face foreshortened below the fold.
          const h = L * c;
          if (front) ctx.drawImage(front, j * sw * fx, fold * fk, sw * fx, L * fk, dx, top + fold, w, h);
          ctx.fillStyle = `rgba(0,0,0,${(0.10 * s).toFixed(3)})`; ctx.fillRect(dx, top + fold, w, h);
        } else {
          // Flap past vertical: back face (next upper page) above the fold. Paper at lower-local y
          // lands on upper-local row (upperH - y), so rows run top-to-bottom without mirroring.
          const h = -L * c, r0 = Math.max(0, G.upperH - fold - L), r1 = G.upperH - fold;
          if (back) ctx.drawImage(back, j * sw * bx, r0 * bk, sw * bx, (r1 - r0) * bk, dx, top + fold - h, w, h);
          else { ctx.fillStyle = '#fff'; ctx.fillRect(dx, top + fold - h, w, h); }
          ctx.fillStyle = `rgba(0,0,0,${(0.05 * s).toFixed(3)})`; ctx.fillRect(dx, top + fold - h, w, h);
        }
      }
    }
    drawLogo(R);
    const g = f >= GHOST.s ? clamp((f - GHOST.s + 1) / (GHOST.cut - GHOST.s), 0, 1) : 0;
    if (g > 0) { ctx.fillStyle = `rgba(0,0,0,${(0.12 * g).toFixed(3)})`; ctx.fillRect(0, 0, G.w, G.h); }
  }

  window.Flipbook = { FPS, G, FLIPS, END_FRAME, P, build, resize, render, stateAt };
})();
