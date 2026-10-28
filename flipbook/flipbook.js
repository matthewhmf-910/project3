// Flip-book engine driven by frame-accurate measurements (analysis/flip_spec.json).
// Drawn on a <canvas> in stage units; render(R, f) is a pure function of the (fractional) frame f.
// Layouts:
//   spread - the reference composition: 360x640 stage, two stacked pages on a centre hinge,
//            the lower page turns up onto the upper slot (9 flips, measured timing).
//   full   - 16:9 full-bleed: one page fills the stage and turns up over the top edge,
//            revealing the next page (18 flips, the measured cadence resampled).
(() => {
  const FPS = 30;
  const LAYOUTS = {
    spread: {
      w: 360, h: 640, bg: '#F6F6F6', fit: 'contain',
      pageX: 14, pageW: 332,
      upper: { y: 113, h: 186 }, lower: { y: 300, h: 188 },
      hingeY: 299, hairline: true, logo: { cx: 180, cy: 573 },
    },
    full: {
      w: 1600, h: 900, bg: '#FFFFFF', fit: 'cover',
      pageX: 0, pageW: 1600,
      upper: null, lower: { y: 0, h: 900 },
      hingeY: -1, hairline: false, logo: null,
    },
  };
  // Measured timing (frames): flip durations and the holds between them, fitted per flip to the
  // edge positions (analysis/fit_result.json). F1 is the slower cover peel.
  const DUR = [9.5, 8.5, 7.75, 7, 6.75, 5.75, 5.5, 4.75, 4.25];
  const HOLD = [14.75, 10.75, 8.25, 6, 4.25, 3.5, 2.5, 2];
  const FINAL_HOLD = 18.25, GHOST_LEN = 2;
  // Strips are ~4 stage px wide so the diagonal fold stays smooth at full-bleed sizes.
  const stripsFor = (w) => Math.max(96, Math.round(w / 4));

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
    paperBack: '#EFEEEA', // back of a sheet when nothing is printed on it (full layout)
  }, window.FB_PARAMS || {});

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // Resample a measured series to n values, keeping its shape (linear in normalised index).
  const resample = (arr, n) => Array.from({ length: n }, (_, i) => {
    const x = n === 1 ? 0 : i / (n - 1) * (arr.length - 1), j = Math.min(Math.floor(x), arr.length - 2);
    return arr[j] + (arr[j + 1] - arr[j]) * (x - j);
  });

  function timeline(nFlips) {
    const dur = nFlips === DUR.length ? DUR : resample(DUR, nFlips);
    const hold = nFlips === DUR.length ? HOLD : resample(HOLD, nFlips - 1);
    const flips = [];
    let t = 0;
    dur.forEach((d, i) => { flips.push({ s: t, d, cover: i === 0 }); t += d + (hold[i] || 0); });
    const end = t + FINAL_HOLD;
    return { flips, end, ghost: end - GHOST_LEN + 1 };
  }

  let G = LAYOUTS.spread, T = timeline(DUR.length);

  function stateAt(f) {
    let k = 0, flip = null;
    T.flips.forEach((F, i) => {
      const s = F.s + P.shift, e = F.s + F.d + P.shift;
      if (f >= e) k = i + 1;
      else if (f >= s) flip = { i, F, u: (f - s) / (e - s) };
    });
    return { k, flip };
  }

  // Strip pose at local progress p in [0,1]: fold distance from hinge (stage px) and flap angle.
  function pose(p, H) {
    p = clamp(p, 0, 1);
    if (p < P.curl) {
      const c = p / P.curl;
      return { fold: H * (1 - Math.pow(c, P.gamma)), ang: P.curlAngle * Math.pow(c, P.angPow) };
    }
    const c = (p - P.curl) / (1 - P.curl);
    return { fold: 0, ang: P.curlAngle + (180 - P.curlAngle) * c };
  }

  const load = (src) => new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  });

  // book.pages: page images in reading order (URLs, <img> or <canvas>), cover first.
  // Optional theme colours: surround (stage background), paper (page fill), back (unprinted back),
  // plus logo (image URL) or brand (wordmark text) for the spread layout.
  // spread pairs the pages as cover | (1,2) | (3,4) ...; 19 pages give the measured 9 flips exactly,
  // other counts resample the measured cadence. full turns every page (n pages -> n-1 flips).
  async function build(canvas, book, layout = 'spread') {
    G = Object.assign({}, LAYOUTS[layout], book.surround ? { bg: book.surround } : {});
    if (book.back) P.paperBack = book.back;
    const seq = await Promise.all(book.pages.map((p) => (typeof p === 'string' ? load(p) : p)));
    const spreads = [{ upper: null, lower: seq[0] }];
    for (let i = 1; i < seq.length; i += 2) spreads.push({ upper: seq[i], lower: seq[i + 1] || null });
    T = timeline(layout === 'full' ? seq.length - 1 : spreads.length - 1);
    return {
      canvas, ctx: canvas.getContext('2d'), layout, spreads, seq, scale: 1,
      logo: await load(book.logo), brand: book.brand || null, paper: book.paper || '#fff', ink: book.ink || '#181916', rule: book.rule || '#E9E9E9',
    };
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

  function drawPage(ctx, img, x, y, w, h, shadow, paper = '#fff') {
    ctx.save();
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,.10)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2; }
    ctx.fillStyle = paper;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    if (img) ctx.drawImage(img, x, y, w, h);
  }

  function drawLogo(R) {
    if (!G.logo) return;
    const { ctx } = R, { cx, cy } = G.logo;
    if (R.logo) { ctx.drawImage(R.logo, cx - 60, cy - 18, 120, 37); return; }
    if (R.brand) {
      // Theme wordmark, set in the theme's display face (brand: {text, font, color}).
      ctx.fillStyle = R.brand.color || R.ink; ctx.font = R.brand.font || '400 22px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(R.brand.text, cx, cy);
      ctx.textAlign = 'start'; return;
    }
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
    if (!P.hingeShade || !G.upper) return;
    // Measured: upper page darkens over its last 24px (lum 250 -> 215); the lower page starts at
    // lum 215 and recovers to white over 88px, falling off fast near the hinge.
    let g;
    if (hasUpper) {
      g = ctx.createLinearGradient(0, G.hingeY - 24, 0, G.hingeY);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
      ctx.fillStyle = g; ctx.fillRect(G.pageX, G.hingeY - 24, G.pageW, 24);
    }
    g = ctx.createLinearGradient(0, G.lower.y, 0, G.lower.y + 88);
    g.addColorStop(0, 'rgba(0,0,0,.12)'); g.addColorStop(0.25, 'rgba(0,0,0,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(G.pageX, G.lower.y, G.pageW, 88);
  }

  // Textures for a settled state k / a flip i, per layout.
  function pagesFor(R, k, flip) {
    if (R.layout === 'full') {
      const s = R.seq;
      return flip ? { upper: null, lower: s[flip.i + 1], front: s[flip.i], back: null } : { upper: null, lower: s[k] };
    }
    const t = (n, w) => (R.spreads[n] ? R.spreads[n][w] : null);
    return flip
      ? { upper: t(flip.i, 'upper'), lower: t(flip.i + 1, 'lower'), front: t(flip.i, 'lower'), back: t(flip.i + 1, 'upper') }
      : { upper: t(k, 'upper'), lower: t(k, 'lower') };
  }

  function drawSheet(R, front, back, u, lead) {
    const { ctx } = R, H = G.lower.h, upH = G.upper ? G.upper.h : H;
    const STRIPS = stripsFor(G.pageW), sw = G.pageW / STRIPS, top = G.hingeY + 1;
    const iw = (im) => im.naturalWidth || im.width, ih = (im) => im.naturalHeight || im.height;
    const fk = front ? ih(front) / H : 1, fx = front ? iw(front) / G.pageW : 1;
    const bk = back ? ih(back) / upH : 1, bx = back ? iw(back) / G.pageW : 1;
    for (let j = 0; j < STRIPS; j++) {
      const x = (j + 0.5) / STRIPS;
      const { fold, ang } = pose(u * (1 + lead) - lead * (1 - x), H);
      const dx = G.pageX + j * sw, L = H - fold, c = Math.cos(ang * Math.PI / 180), s = Math.sin(ang * Math.PI / 180);
      const w = sw + 0.5;
      // Flat part between hinge and fold (front face, unrotated).
      if (fold > 0 && front) ctx.drawImage(front, j * sw * fx, 0, sw * fx, fold * fk, dx, top, w, fold);
      else if (fold > 0) { ctx.fillStyle = R.paper; ctx.fillRect(dx, top, w, fold); }
      if (L <= 0.01) continue;
      if (c >= 0) {
        // Flap still facing the viewer: front face foreshortened below the fold.
        const h = L * c;
        if (front) ctx.drawImage(front, j * sw * fx, fold * fk, sw * fx, L * fk, dx, top + fold, w, h);
        ctx.fillStyle = `rgba(0,0,0,${(0.10 * s).toFixed(3)})`; ctx.fillRect(dx, top + fold, w, h);
      } else {
        // Flap past vertical: back face above the fold. Paper at lower-local y lands on upper-local
        // row (upperH - y), so rows run top-to-bottom without mirroring.
        const h = -L * c, r0 = Math.max(0, upH - fold - L), r1 = upH - fold;
        if (back) ctx.drawImage(back, j * sw * bx, r0 * bk, sw * bx, (r1 - r0) * bk, dx, top + fold - h, w, h);
        else { ctx.fillStyle = P.paperBack; ctx.fillRect(dx, top + fold - h, w, h); }
        ctx.fillStyle = `rgba(0,0,0,${(0.05 * s).toFixed(3)})`; ctx.fillRect(dx, top + fold - h, w, h);
      }
      if (!G.upper && fold > 0) {
        // Full layout: soft contact shadow cast by the lifted flap onto the page beneath.
        ctx.fillStyle = `rgba(0,0,0,${(0.10 * s).toFixed(3)})`;
        ctx.fillRect(dx, top + fold, w, Math.min(18, L) * (c >= 0 ? 1 : 0.6));
      }
    }
  }

  function render(R, f) {
    const { ctx } = R;
    ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    ctx.fillStyle = G.bg; ctx.fillRect(0, 0, G.w, G.h);
    if (G.hairline) { ctx.fillStyle = R.rule; ctx.fillRect(G.pageX, 111, G.pageW, 2); }

    const { k, flip } = stateAt(f);
    const pg = pagesFor(R, k, flip);
    if (G.upper && pg.upper) drawPage(ctx, pg.upper, G.pageX, G.upper.y, G.pageW, G.upper.h, false, R.paper);
    drawPage(ctx, pg.lower, G.pageX, G.lower.y, G.pageW, G.lower.h, !!G.upper, R.paper);
    hingeShade(ctx, !!pg.upper);

    if (flip) {
      if (flip.F.cover && G.upper) {
        // Cover only: the empty upper slot darkens as the sheet approaches (measured lum 246 -> 197).
        ctx.fillStyle = `rgba(0,0,0,${(0.2 * clamp(flip.u / 0.7, 0, 1)).toFixed(3)})`;
        ctx.fillRect(G.pageX, G.upper.y, G.pageW, G.upper.h);
      }
      drawSheet(R, pg.front, pg.back, flip.u, flip.F.cover ? P.coverLead : P.lead);
    }
    drawLogo(R);
    const g = f >= T.ghost ? clamp((f - T.ghost + 1) / GHOST_LEN, 0, 1) : 0;
    if (g > 0 && G.upper) { ctx.fillStyle = `rgba(0,0,0,${(0.12 * g).toFixed(3)})`; ctx.fillRect(0, 0, G.w, G.h); }
  }

  window.Flipbook = {
    FPS, P, LAYOUTS, build, resize, render, stateAt,
    get G() { return G; }, get FLIPS() { return T.flips; }, get END_FRAME() { return T.end; },
  };
})();
