// One timeline drives every format. window.render(t) is pure: same t -> same frame.
(function () {
  const DURATION = 20;
  const params = new URLSearchParams(location.search);
  const FMT = params.get('f') || '9x16';

  // Per-format layout. Reposition, never blind-crop the master.
  const LAYOUTS = {
    '16x9': { W: 1920, H: 1080, mode: 'split', stage: [840, 0, 1080, 1080],
              copy: { x: 120, y: 380, w: 680 }, k: 20, h: 66, e: 28,
              disc: { cx: 0.5, cy: 0.5, r: 0.36 }, ring: 5 },
    '9x16': { W: 1080, H: 1920, mode: 'over', stage: [0, 0, 1080, 1920],
              copy: { x: 84, y: 1440, w: 912 }, topY: 150, k: 24, h: 92, e: 36, scrim: 0.46,
              disc: { cx: 0.5, cy: 0.38, r: 0.40 }, ring: 6 },
    '1x1':  { W: 1080, H: 1080, mode: 'over', stage: [0, 0, 1080, 1080],
              copy: { x: 72, y: 800, w: 936 }, topY: 64, k: 20, h: 68, e: 28, scrim: 0.52,
              disc: { cx: 0.5, cy: 0.37, r: 0.30 }, ring: 5 },
  };
  const L = LAYOUTS[FMT];

  // Image facts (source pixels), measured from the photos.
  const IMG = {
    s1: { w: 941,  h: 1672 },   // corner_render: empty corner, golden hour
    s2: { w: 1152, h: 1536 },   // chairs_corner: two folding chairs + plant
    s3: { w: 1536, h: 2048 },   // table_lemon: the round green iron table, lemon coffee from above
    s4: { w: 1152, h: 1536 },   // drink_top: glass from above, lemon slice
  };
  // In table_lemon: the round iron tabletop and the glass rim on it. In drink_top: rim and lemon.
  const TABLE = { x: 1460, y: 1620, r: 1280 };
  const CUP = { x: 834, y: 1254, r: 252 };
  const RIM = { x: 590, y: 700, r: 470 };
  const LEMON = { x: 578, y: 780, r: 330 };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  const $ = id => document.getElementById(id);
  const frame = $('frame'), stage = $('stage');
  const [SX, SY, SW, SH] = L.stage;

  document.body.classList.add(L.mode);
  Object.assign(frame.style, { width: L.W + 'px', height: L.H + 'px' });
  Object.assign(stage.style, { left: SX + 'px', top: SY + 'px', width: SW + 'px', height: SH + 'px' });
  const copy = $('copy');
  Object.assign(copy.style, { left: L.copy.x + 'px', top: L.copy.y + 'px', width: L.copy.w + 'px' });
  copy.style.setProperty('--k', L.k + 'px');
  copy.style.setProperty('--h', L.h + 'px');
  copy.style.setProperty('--e', L.e + 'px');
  if (L.scrim) $('scrim').style.height = (L.scrim * 100) + '%';
  // Over formats: the cup sits at the bottom of S3, so its line moves to the top.
  if (L.topY != null) $('c3').style.top = (L.topY - L.copy.y) + 'px';
  const ring = $('ring');
  ring.setAttribute('width', SW); ring.setAttribute('height', SH);
  const ringc = $('ringc');
  ringc.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--lemon').trim());
  ringc.setAttribute('stroke-width', L.ring);
  // Stage behind the disc is the dark green of the tabletop in drink_top.
  stage.style.background = '#25302c';

  // Cover-fit an image so focal point (fx,fy) lands at stage point (ax*SW, ay*SH).
  function place(img, fx, fy, zoom, ax, ay) {
    const s = Math.max(SW / img.w, SH / img.h) * zoom;
    const tx = clamp(SW * ax - fx * s, SW - img.w * s, 0);
    const ty = clamp(SH * ay - fy * s, SH - img.h * s, 0);
    return { s, tx, ty };
  }
  function setShot(el, p, opacity, extra) {
    el.style.transform = `translate(${p.tx}px, ${p.ty}px) scale(${p.s})`;
    el.style.opacity = opacity;
    el.style.filter = extra || '';
  }
  function setLine(id, t, tin, tout) {
    const el = $(id);
    const pin = easeOut(prog(t, tin, tin + 0.6));
    const pout = tout == null ? 0 : easeInOut(prog(t, tout, tout + 0.4));
    el.style.opacity = pin * (1 - pout);
    el.style.transform = `translateY(${(1 - pin) * 28 - pout * 14}px)`;
  }

  // Scene timing (seconds). Ending written first: lemon disc + "剛剛好" holds 18.3 -> 20.
  const T = {
    s1: [0, 4.3], s2: [3.8, 7.9], s3: [7.4, 12.6],
    ringDraw: [8.5, 9.7], ringToCup: [9.9, 10.9], ringMove: [11.0, 12.6], discIn: [11.6, 12.6], lemonPush: [12.6, 20],
  };

  window.render = function (t) {
    // S1 QUESTION: empty corner, slow push toward the kiosk.
    const p1 = prog(t, 0, 4.3);
    setShot($('s1'), place(IMG.s1, lerp(520, 600, p1), lerp(980, 900, p1), lerp(1.0, 1.14, p1), 0.5, 0.52),
            1 - prog(t, 3.8, 4.3));

    // S2 MODEL: the seating. Chairs drift up into frame.
    const p2 = prog(t, 3.8, 7.9);
    setShot($('s2'), place(IMG.s2, 720, lerp(1080, 1140, p2), lerp(1.04, 1.12, p2), 0.5, L.mode === 'over' ? 0.42 : 0.55),
            prog(t, 3.8, 4.3) * (1 - prog(t, 7.4, 7.9)));

    // S3 PROOF: the round iron table, then the cup on it.
    const p3 = easeInOut(prog(t, 7.4, 11.0));
    const pl3 = place(IMG.s3, lerp(820, CUP.x, p3), lerp(1150, CUP.y, p3), lerp(1.0, 1.25, p3), 0.5, L.mode === 'over' ? 0.45 : 0.5);
    const dim = prog(t, 11.0, 12.4);
    $('scrimTop').style.opacity = prog(t, 7.6, 8.2) * (1 - prog(t, 10.9, 11.4));
    setShot($('s3'), pl3, prog(t, 7.4, 7.9) * (1 - dim),
            dim > 0 ? `blur(${dim * 8}px)` : '');

    // The circle: traces the tabletop, tightens to the cup rim, then becomes the lemon disc.
    const map = c => ({ x: pl3.tx + c.x * pl3.s, y: pl3.ty + c.y * pl3.s, r: c.r * pl3.s });
    const pc = easeInOut(prog(t, ...T.ringToCup));
    const tC = map(TABLE), cC = map(CUP);
    const cupC = { x: lerp(tC.x, cC.x, pc), y: lerp(tC.y, cC.y, pc), r: lerp(tC.r, cC.r, pc) };
    const discR = Math.min(SW, SH) * L.disc.r;
    const discC = { x: SW * L.disc.cx, y: SH * L.disc.cy, r: discR };
    const pm = easeInOut(prog(t, ...T.ringMove));
    const rc = { x: lerp(cupC.x, discC.x, pm), y: lerp(cupC.y, discC.y, pm), r: lerp(cupC.r, discC.r, pm) };
    ringc.setAttribute('cx', rc.x); ringc.setAttribute('cy', rc.y); ringc.setAttribute('r', rc.r);
    const circ = 2 * Math.PI * rc.r;
    const pd = easeInOut(prog(t, ...T.ringDraw));
    ringc.setAttribute('stroke-dasharray', `${circ * pd} ${circ}`);
    ringc.setAttribute('transform', `rotate(-90 ${rc.x} ${rc.y})`);
    ringc.style.opacity = t < T.ringDraw[0] ? 0 : lerp(1, 0.7, prog(t, 12.6, 14));

    // S4 TURN / S5 PAYOFF: the cup inside the circle, pushing into the lemon.
    const disc = $('disc');
    Object.assign(disc.style, { left: (rc.x - rc.r) + 'px', top: (rc.y - rc.r) + 'px',
                                width: rc.r * 2 + 'px', height: rc.r * 2 + 'px' });
    disc.style.opacity = easeOut(prog(t, ...T.discIn));
    const pl = easeInOut(prog(t, ...T.lemonPush));
    const fx = lerp(RIM.x, LEMON.x, pl), fy = lerp(RIM.y, LEMON.y, pl);
    const k = lerp(rc.r * 1.02 / RIM.r, rc.r * 1.05 / LEMON.r, pl);
    $('s4').style.transform = `translate(${rc.r - fx * k}px, ${rc.r - fy * k}px) scale(${k})`;

    // Copy: one thought at a time.
    setLine('c1', t, 0.5, 3.5);
    setLine('c2', t, 4.4, 7.2);
    setLine('c3', t, 8.2, 10.9);
    setLine('c4', t, 12.7, 15.0);
    setLine('c5', t, 15.5, 17.8);
    setLine('c6', t, 18.3, null);
  };

  window.TIMELINE = { DURATION, FMT, W: L.W, H: L.H, T };
  window.render(Number(params.get('t') || 0));
})();
