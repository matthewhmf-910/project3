// Pour cut (9:16). Logic: corner -> seats -> ice + lemon -> gentle pour -> top view of lemon -> real cup.
// window.render(t) is pure and returns a promise that resolves once the frame is drawn.
(function () {
  const DURATION = 15.5, FPS = 30, W = 1080, H = 1920;
  const IMG = {
    p1: { w: 941, h: 1672 }, p2: { w: 1152, h: 1536 }, v: { w: 720, h: 1280 },
    p3: { w: 1152, h: 1536 }, p4: { w: 1536, h: 2048 },
  };
  // Clip A (AI reference) cut before the foam appears: a1 = 0-1.6 s real time, a2 = 1.6-3.9 s at 0.7x.
  const SEQ = { a1: 49, a2: 97 };
  const LEMON_A2_END = { x: 400, y: 560 };  // lemon on the last pour frame
  const LEMON_TOP = { x: 578, y: 780 };      // drink_top
  const CUP = { x: 834, y: 1254 };           // table_lemon

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const $ = id => document.getElementById(id);
  const seqSrc = (name, i) => `seq/${name}/${String(i + 1).padStart(3, '0')}.jpg`;

  function place(img, fx, fy, zoom, ax = 0.5, ay = 0.45, free = false) {
    const s = Math.max(W / img.w, H / img.h) * zoom;
    let tx = W * ax - fx * s, ty = H * ay - fy * s;
    if (!free) { tx = clamp(tx, W - img.w * s, 0); ty = clamp(ty, H - img.h * s, 0); }
    return { s, tx, ty };
  }
  function shot(id, p, opacity, extra = '', rot = 0) {
    const el = $(id);
    const r = rot ? `translate(${W / 2}px, ${H / 2}px) rotate(${rot}deg) translate(${-W / 2}px, ${-H / 2}px) ` : '';
    el.style.transform = `${r}translate(${p.tx}px, ${p.ty}px) scale(${p.s})`;
    el.style.opacity = opacity;
    el.style.filter = extra;
  }
  function line(id, t, tin, tout) {
    const el = $(id);
    const pin = easeOut(prog(t, tin, tin + 0.6));
    const pout = tout == null ? 0 : easeInOut(prog(t, tout, tout + 0.4));
    el.style.opacity = pin * (1 - pout);
    el.style.transform = `translateY(${(1 - pin) * 28 - pout * 14}px)`;
  }
  async function setFrame(id, name, i) {
    const el = $(id), src = seqSrc(name, clamp(i, 0, SEQ[name] - 1));
    if (el.getAttribute('src') !== src) { el.setAttribute('src', src); await el.decode(); }
  }

  window.render = async function (t) {
    // S1 corner: slow push toward the kiosk.
    const p1 = prog(t, 0, 2.4);
    shot('p1', place(IMG.p1, 600, lerp(940, 880, p1), lerp(1.0, 1.1, p1)), 1 - prog(t, 2.0, 2.4));

    // S2 seats: chairs drift up.
    const p2 = prog(t, 2.0, 4.0);
    shot('p2', place(IMG.p2, 720, lerp(1060, 1140, p2), lerp(1.04, 1.1, p2), 0.5, 0.42),
         prog(t, 2.0, 2.4) * (1 - prog(t, 3.6, 4.0)));

    // S3 ice + lemon: clip holds still, camera barely pushes in.
    await setFrame('v1', 'a1', Math.floor((t - 3.6) * FPS));
    const p3 = prog(t, 3.6, 5.2);
    shot('v1', place(IMG.v, 380, 650, lerp(1.0, 1.05, p3)), t < 5.2 ? prog(t, 3.6, 4.0) : 0);

    // S4 pour, 0.7x: camera locked, the coffee does the moving. Then push into the lemon (8.4-9.2).
    await setFrame('v2', 'a2', Math.floor((t - 5.2) * FPS));
    const pz = easeInOut(prog(t, 8.4, 9.2));
    const pv = place(IMG.v, lerp(380, LEMON_A2_END.x, pz), lerp(650, LEMON_A2_END.y, pz), lerp(1.05, 2.6, pz), 0.5, 0.45, pz > 0);
    shot('v2', pv, t >= 5.2 ? 1 - prog(t, 8.8, 9.2) : 0);

    // S5 top view: lemon and ice from above, continuing the push, a slight turn.
    const p5 = prog(t, 8.8, 11.3);
    shot('p3', place(IMG.p3, LEMON_TOP.x, LEMON_TOP.y, lerp(1.08, 1.3, easeOut(p5)), 0.5, 0.42, true),
         prog(t, 8.8, 9.2) * (1 - prog(t, 10.9, 11.3)), '', lerp(2, 0, p5));

    // S6 the real cup on the round iron table: rack focus in, slow push.
    const p6 = prog(t, 10.9, 15.5);
    const blur = 7 * (1 - easeOut(prog(t, 10.9, 12.0)));
    shot('p4', place(IMG.p4, CUP.x, lerp(1300, CUP.y, p6), lerp(1.0, 1.14, easeInOut(p6)), 0.5, 0.40),
         prog(t, 10.9, 11.3), blur > 0.05 ? `blur(${blur}px)` : '');

    line('c1', t, 0.3, 3.4);
    line('c2', t, 3.9, 5.4);
    line('c3', t, 5.8, 8.2);
    line('c4', t, 11.8, 13.7);
    line('c5', t, 13.9, null);
  };

  window.TIMELINE = { DURATION, W, H };
})();
