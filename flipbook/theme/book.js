// Flipbook theme: draws a book's pages from a declarative spec (theme/*.book.js) onto canvases,
// which flipbook.js then turns. A page is { layout, ...fields }; layouts are listed in LAYOUTS
// below and documented in README.md. Everything is laid out on a 1600x900 (16:9) page and
// rasterised at `scale`, so the same book serves the 16:9 full-bleed and the 9:16 spread layouts.
(() => {
  const W = 1600, H = 900, M = 88;       // page size and side margin
  const TOP = 150, BOTTOM = 800;         // content band between the header and the folio

  // Theme presets. Every colour/face a layout uses comes from here; a book picks one by name and
  // can override any token (book.theme = { base: 'atlas', accent: '#0A7' }).
  const THEMES = {
    atlas: {
      label: 'Atlas', paper: '#FBFAF7', ink: '#1B1B18', muted: '#8A877F', rule: '#E4E0D7', accent: '#C9473A',
      panel: '#EFECE5', surround: '#F6F6F6', back: '#EFEEEA', ring: 'rgba(27,27,24,.28)',
    },
    nocturne: {
      label: 'Nocturne', paper: '#131518', ink: '#ECE8DF', muted: '#8E9097', rule: '#2A2D33', accent: '#E8B04A',
      panel: '#1C1F24', surround: '#0B0C0E', back: '#1C1F24', ring: 'rgba(236,232,223,.30)',
    },
    blueprint: {
      label: 'Blueprint', paper: '#16336A', ink: '#EAF0FA', muted: '#93A9D1', rule: '#2C4F8D', accent: '#F2C14E',
      panel: '#1D3E7C', surround: '#0E244E', back: '#1D3E7C', ring: 'rgba(234,240,250,.32)',
    },
  };
  const FACES = {
    display: '"Instrument Serif", "Noto Serif TC", Georgia, serif',
    text: 'Inter, "Noto Sans TC", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    zh: '"Noto Serif TC", "Songti TC", "PMingLiU", serif',
  };

  const resolveTheme = (t) => {
    const o = typeof t === 'string' ? { base: t } : (t || {});
    return Object.assign({}, THEMES[o.base || 'atlas'] || THEMES.atlas, o);
  };

  // ---- text ---------------------------------------------------------------------------------
  const font = (ctx, face, size, weight = 400, italic = false) => {
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${FACES[face]}`;
  };
  const track = (ctx, em) => { if ('letterSpacing' in ctx) ctx.letterSpacing = `${em}em`; };
  // Greedy wrap on spaces; CJK runs (no spaces) break between characters.
  function lines(ctx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      const toks = para.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+\s*|\s+/g) || [''];
      let cur = '';
      for (const t of toks) {
        if (cur && ctx.measureText((cur + t).trimEnd()).width > maxW) { out.push(cur.trimEnd()); cur = t.trimStart(); }
        else cur += t;
      }
      out.push(cur.trimEnd());
    }
    return out;
  }
  function text(ctx, str, x, y, maxW, lh, maxLines = 99) {
    const ls = lines(ctx, str, maxW).slice(0, maxLines);
    ls.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    return y + ls.length * lh;
  }
  const upper = (s) => String(s).toUpperCase();

  // ---- map plates -----------------------------------------------------------------------------
  // An image entry is { src, disc: [cx, cy, r] } where disc marks the circular map inside the plate
  // as fractions of the image width/height (r of width). Plates are drawn as discs by default:
  // the disc fills a circle of diameter d centred at (x, y); z > 1 zooms in on (fx, fy).
  function disc(ctx, T, im, x, y, d, o = {}) {
    const r = d / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = T.panel; ctx.fill(); ctx.clip();
    if (im && im.img) {
      const iw = im.img.naturalWidth, ih = im.img.naturalHeight, [dcx, dcy, dr] = im.disc || [0.5, 0.5, 0.5];
      const s = (r * (o.z || 1)) / (dr * iw);
      const fx = (o.fx ?? dcx) * iw, fy = (o.fy ?? dcy) * ih;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im.img, x - fx * s, y - fy * s, iw * s, ih * s);
    }
    ctx.restore();
    if (o.rings) {
      // Range rings as fractions of the radius, labelled along the north-east diagonal.
      ctx.save(); ctx.strokeStyle = T.ring; ctx.lineWidth = 1.2; ctx.setLineDash([4, 5]);
      o.rings.forEach(([f]) => { ctx.beginPath(); ctx.arc(x, y, r * f, 0, Math.PI * 2); ctx.stroke(); });
      ctx.setLineDash([]); font(ctx, 'mono', 13, 500);
      o.rings.forEach(([f, label]) => {
        const a = -Math.PI / 4, lx = x + Math.cos(a) * r * f, ly = y + Math.sin(a) * r * f;
        const w = ctx.measureText(label).width + 14;
        ctx.fillStyle = T.paper; ctx.fillRect(lx - w / 2, ly - 11, w, 22);
        ctx.fillStyle = T.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx, ly + 1);
      });
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; ctx.restore();
    }
    if (o.ticks !== false) ticks(ctx, T, x, y, r);
  }
  // Graticule ring: a hairline just outside the disc with a tick every 10 deg, longer every 90,
  // and an N at the top. This is the template's signature mark.
  function ticks(ctx, T, x, y, r) {
    const R = r + 12;
    ctx.save(); ctx.strokeStyle = T.ring; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
    for (let a = 0; a < 360; a += 10) {
      const t = (a - 90) * Math.PI / 180, l = a % 90 === 0 ? 10 : 5;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(t) * R, y + Math.sin(t) * R);
      ctx.lineTo(x + Math.cos(t) * (R + l), y + Math.sin(t) * (R + l)); ctx.stroke();
    }
    font(ctx, 'mono', 12, 500); ctx.fillStyle = T.muted; ctx.textAlign = 'center';
    ctx.fillText('N', x, y - R - 16); ctx.textAlign = 'start'; ctx.restore();
  }
  // Rectangular plate (non-disc images such as the 3D model): cover-fit, zoom z on (fx, fy).
  function rect(ctx, T, im, x, y, w, h, o = {}) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = T.panel; ctx.fillRect(x, y, w, h);
    if (im && im.img) {
      const iw = im.img.naturalWidth, ih = im.img.naturalHeight;
      const s = Math.max(w / iw, h / ih) * (o.z || 1);
      const fx = (o.fx ?? 0.5) * iw, fy = (o.fy ?? 0.5) * ih;
      const dx = clamp(x + w / 2 - fx * s, x + w - iw * s, x), dy = clamp(y + h / 2 - fy * s, y + h - ih * s, y);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im.img, dx, dy, iw * s, ih * s);
    }
    ctx.restore();
  }
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  // A plate spec is an image key or { img, z, fx, fy, shape: 'disc'|'rect', rings }.
  const spec = (p) => (typeof p === 'string' ? { img: p } : p);
  function plate(ctx, T, B, p, x, y, w, h) {
    p = spec(p);
    const im = B.images[p.img];
    if ((p.shape || (im && im.disc ? 'disc' : 'rect')) === 'disc') disc(ctx, T, im, x + w / 2, y + h / 2, Math.min(w, h) - 2 * (p.ticks === false ? 0 : 30), p);
    else rect(ctx, T, im, x, y, w, h, p);
  }

  // ---- chrome ---------------------------------------------------------------------------------
  function chrome(ctx, T, B, pg, n, N) {
    track(ctx, 0.14); font(ctx, 'mono', 13, 500); ctx.textBaseline = 'alphabetic';
    if (pg.kicker !== false) {
      ctx.fillStyle = T.accent; ctx.fillRect(M, 55, 8, 8);
      ctx.fillStyle = T.muted; ctx.fillText(upper(`${String(n).padStart(2, '0')}  ${pg.kicker || pg.title || ''}`), M + 20, 64);
    }
    ctx.fillStyle = T.muted; ctx.textAlign = 'right'; ctx.fillText(upper(B.meta.running || B.meta.title), W - M, 64);
    ctx.fillStyle = T.rule; ctx.fillRect(M, 86, W - 2 * M, 1); ctx.fillRect(M, 836, W - 2 * M, 1);
    ctx.fillStyle = T.muted;
    ctx.fillText(`${String(n).padStart(2, '0')} / ${String(N - 1).padStart(2, '0')}`, W - M, 866);
    ctx.textAlign = 'start';
    if (B.meta.footer) ctx.fillText(upper(B.meta.footer), M, 866);
    track(ctx, 0);
  }
  // Page heading: serif title with an optional Chinese line beside it.
  function heading(ctx, T, pg, x, y, size = 64, maxW = 900) {
    ctx.fillStyle = T.ink; font(ctx, 'display', size);
    const end = text(ctx, pg.title || '', x, y, maxW, size * 1.02, 2);
    if (pg.zh) {
      const last = lines(ctx, pg.title || '', maxW).slice(0, 2).pop() || '';
      const lx = x + ctx.measureText(last).width + 22;
      font(ctx, 'zh', size * 0.5, 500); ctx.fillStyle = T.accent;
      ctx.fillText(pg.zh, lx, end - size * 1.02);
    }
    return end;
  }
  function body(ctx, T, str, x, y, maxW, size = 19) {
    if (!str) return y;
    ctx.fillStyle = T.muted; font(ctx, 'text', size, 400);
    return text(ctx, str, x, y, maxW, size * 1.55);
  }
  function label(ctx, T, str, x, y, align = 'start', color) {
    track(ctx, 0.12); font(ctx, 'mono', 13, 500); ctx.fillStyle = color || T.muted; ctx.textAlign = align;
    ctx.fillText(upper(str), x, y); ctx.textAlign = 'start'; track(ctx, 0);
  }
  // Stat block: big serif figure over a mono label, with a rule above.
  function stat(ctx, T, [value, name], x, y, w, size = 64) {
    ctx.fillStyle = T.rule; ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = T.ink; font(ctx, 'display', size); ctx.fillText(value, x, y + size * 1.05);
    label(ctx, T, name, x, y + size * 1.05 + 30);
  }

  // ---- layouts --------------------------------------------------------------------------------
  const LAYOUTS = {
    // { title, zh, subtitle, meta: [[k, v]], plate }
    cover(ctx, T, B, pg) {
      ctx.fillStyle = T.ink; font(ctx, 'text', 17, 600); track(ctx, 0.02); ctx.fillText(B.meta.brand || '', M, 70); track(ctx, 0);
      label(ctx, T, B.meta.date || '', W - M, 70, 'right');
      const pr = pg.plateBox || [820, 90, 700, 720];
      plate(ctx, T, B, pg.plate, ...pr);
      ctx.fillStyle = T.ink; font(ctx, 'display', 168);
      const y = text(ctx, pg.title, M - 6, 330, 720, 150);
      if (pg.zh) { font(ctx, 'zh', 60, 500); ctx.fillStyle = T.accent; ctx.fillText(pg.zh, M, y + 26); }
      if (pg.subtitle) { font(ctx, 'display', 34, 400, true); ctx.fillStyle = T.muted; text(ctx, pg.subtitle, M, y + 70, 640, 42); }
      (pg.meta || []).forEach(([k, v], i) => {
        const yy = 758 + i * 30;
        ctx.fillStyle = T.rule; ctx.fillRect(M, yy - 24, 600, 1);
        label(ctx, T, k, M, yy); track(ctx, 0.04); font(ctx, 'mono', 15, 400); ctx.fillStyle = T.ink; ctx.fillText(v, M + 170, yy); track(ctx, 0);
      });
    },
    // Auto-generated table of contents from the other pages' titles. { title, columns }
    contents(ctx, T, B, pg) {
      heading(ctx, T, pg, M, TOP + 40, 72, 500);
      body(ctx, T, pg.body, M, TOP + 110, 420);
      const items = B.pages.map((p, i) => [i, p]).filter(([i, p]) => i > 0 && p.layout !== 'contents');
      const cols = pg.columns || 2, per = Math.ceil(items.length / cols), cw = (W - 2 * M - 560) / cols;
      items.forEach(([i, p], k) => {
        const cx = M + 560 + Math.floor(k / per) * cw, cy = TOP + 16 + (k % per) * 70;
        ctx.fillStyle = T.rule; ctx.fillRect(cx, cy - 30, cw - 32, 1);
        label(ctx, T, String(i).padStart(2, '0'), cx, cy + 4, 'start', T.accent);
        ctx.fillStyle = T.ink; font(ctx, 'display', 30); ctx.fillText(p.title || '', cx + 56, cy + 8);
      });
    },
    // One big plate + sidebar. { title, zh, body, plate, stats: [[value, label]], side: 'left'|'right' }
    feature(ctx, T, B, pg) {
      const left = pg.side !== 'right', pw = spec(pg.plate).shape === 'rect' || !(B.images[spec(pg.plate).img] || {}).disc ? 860 : 700;
      const px = left ? M - 10 : W - M - pw + 10, sx = left ? M + pw + 60 : M, sw = W - 2 * M - pw - 60;
      const box = spec(pg.plate).shape === 'rect' || !(B.images[spec(pg.plate).img] || {}).disc ? [px + 10, TOP - 20, pw - 20, 640] : [px, 100, pw, 720];
      plate(ctx, T, B, pg.plate, ...box);
      let y = heading(ctx, T, pg, sx, TOP + 70, 64, sw);
      y = body(ctx, T, pg.body, sx, y + 18, Math.min(sw, 520));
      (pg.stats || []).forEach((s, i) => stat(ctx, T, s, sx + (i % 2) * (sw / 2), Math.max(y + 40, 470) + Math.floor(i / 2) * 150, sw / 2 - 28, 60));
    },
    // Two plates side by side with captions. { title, zh, items: [{ plate, label, caption, stat }] }
    pair(ctx, T, B, pg) {
      heading(ctx, T, pg, M, TOP + 26, 52, 1100);
      const cw = (W - 2 * M - 64) / 2;
      pg.items.forEach((it, i) => {
        const x = M + i * (cw + 64);
        plate(ctx, T, B, it.plate, x + cw / 2 - 260, 200, 520, 520);
        label(ctx, T, `${String.fromCharCode(65 + i)} · ${it.label}`, x, 750, 'start', T.ink);
        if (it.stat) label(ctx, T, it.stat, x + cw, 750, 'right', T.accent);
        if (it.caption) { ctx.fillStyle = T.muted; font(ctx, 'text', 17); text(ctx, it.caption, x, 784, cw, 26, 2); }
      });
    },
    // A row of 3-6 plates. { title, zh, body, items: [{ plate, label }] }
    grid(ctx, T, B, pg) {
      heading(ctx, T, pg, M, TOP + 40, 64, 700);
      body(ctx, T, pg.body, M + 820, TOP, W - 2 * M - 820);
      const n = pg.items.length, gap = 28, cw = (W - 2 * M - gap * (n - 1)) / n, d = Math.min(cw, 470);
      pg.items.forEach((it, i) => {
        const x = M + i * (cw + gap), cy = 300 + (BOTTOM - 300 - 50) / 2;
        plate(ctx, T, B, Object.assign({ ticks: n <= 4 }, spec(it.plate)), x + (cw - d) / 2, cy - d / 2, d, d);
        ctx.fillStyle = T.rule; ctx.fillRect(x, 752, cw, 1);
        label(ctx, T, String(i + 1).padStart(2, '0'), x, 784, 'start', T.accent);
        label(ctx, T, it.label, x + 40, 784, 'start', T.ink);
      });
    },
    // Headline figure + horizontal bars. { title, zh, figure: [value, label], body, rows: [[label, value, colour]], unit }
    bars(ctx, T, B, pg) {
      heading(ctx, T, pg, M, TOP + 40, 64, 560);
      if (pg.figure) {
        ctx.fillStyle = T.accent; font(ctx, 'display', 220); ctx.fillText(pg.figure[0], M - 8, 500);
        label(ctx, T, pg.figure[1], M, 548);
      }
      body(ctx, T, pg.body, M, 610, 520);
      const x0 = M + 700, w = W - M - x0, max = Math.max(...pg.rows.map((r) => r[1])), rh = Math.min(76, 600 / pg.rows.length);
      pg.rows.forEach(([name, v, col], i) => {
        const y = TOP + 20 + i * rh;
        label(ctx, T, name, x0, y + 18, 'start', T.ink);
        ctx.fillStyle = T.ink; font(ctx, 'mono', 15, 500); ctx.textAlign = 'right'; ctx.fillText(`${v.toFixed(1)}${pg.unit ?? '%'}`, W - M, y + 18); ctx.textAlign = 'start';
        ctx.fillStyle = T.rule; ctx.fillRect(x0, y + 34, w, 10);
        ctx.fillStyle = col || T.accent; ctx.fillRect(x0, y + 34, w * v / max, 10);
      });
    },
    // Colour rows. { title, zh, body, rows: [[name, [hex...], weights?]] }
    palette(ctx, T, B, pg) {
      heading(ctx, T, pg, M, TOP + 40, 64, 560);
      body(ctx, T, pg.body, M, TOP + 110, 480);
      const x0 = M + 640, w = W - M - x0, rh = 600 / pg.rows.length;
      pg.rows.forEach(([name, cols, wts], i) => {
        const y = TOP + 10 + i * rh, ws = wts || [46, 26, 16, 12], tot = ws.reduce((a, b) => a + b, 0);
        label(ctx, T, name, x0, y + 16, 'start', T.ink);
        let x = x0;
        cols.forEach((c, k) => {
          const cw = w * ws[k] / tot;
          ctx.fillStyle = c; ctx.fillRect(x, y + 30, cw - 4, rh - 64);
          ctx.strokeStyle = T.rule; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 30.5, cw - 5, rh - 65);
          label(ctx, T, c, x, y + rh - 14);
          x += cw;
        });
      });
    },
    // Large statement. { kicker, text, zh, note }
    statement(ctx, T, B, pg) {
      ctx.fillStyle = T.ink; font(ctx, 'display', 104);
      const y = text(ctx, pg.text, M - 4, 360, 1240, 108);
      if (pg.zh) { font(ctx, 'zh', 40, 500); ctx.fillStyle = T.accent; ctx.fillText(pg.zh, M, y + 40); }
      if (pg.note) body(ctx, T, pg.note, M, 740, 640);
    },
    // Full-bleed image (any picture): { plate, caption }. Chrome is drawn over it on a scrim.
    image(ctx, T, B, pg) {
      rect(ctx, T, B.images[spec(pg.plate).img], 0, 0, W, H, spec(pg.plate));
      if (pg.caption) {
        font(ctx, 'mono', 14, 500); track(ctx, 0.12);
        const w = ctx.measureText(upper(pg.caption)).width + 36;
        ctx.fillStyle = T.paper; ctx.fillRect(M, H - M - 44, w, 44);
        ctx.fillStyle = T.ink; ctx.fillText(upper(pg.caption), M + 18, H - M - 16); track(ctx, 0);
      }
    },
    // Colophon. { title, zh, lines: [[k, v]] }
    closing(ctx, T, B, pg) {
      ctx.fillStyle = T.ink; font(ctx, 'display', 168, 400, true); ctx.fillText(pg.title || 'Fin.', M - 6, 420);
      if (pg.zh) { font(ctx, 'zh', 48, 500); ctx.fillStyle = T.accent; ctx.fillText(pg.zh, M, 500); }
      (pg.lines || []).forEach(([k, v], i) => {
        const y = 620 + i * 36;
        ctx.fillStyle = T.rule; ctx.fillRect(M, y - 25, 760, 1);
        label(ctx, T, k, M, y); font(ctx, 'text', 17); ctx.fillStyle = T.ink; ctx.fillText(v, M + 220, y);
      });
      if (pg.plate) plate(ctx, T, B, pg.plate, 980, 190, 520, 520);
    },
  };
  const NO_CHROME = { cover: 1, image: 1 };

  const loadImg = (src) => new Promise((res) => {
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  });

  // Render every page of `book` at `scale` (page px = 1600 * scale). Returns the page images
  // (JPEG-backed <img>, so the browser can drop decoded pixels it no longer needs) and the theme.
  async function renderBook(book, { scale = 1, theme } = {}) {
    const T = resolveTheme(theme || book.theme);
    const B = Object.assign({}, book, { images: {} });
    await Promise.all(Object.entries(book.images || {}).map(async ([k, v]) => {
      const e = typeof v === 'string' ? { src: v } : v;
      B.images[k] = Object.assign({}, e, { img: await loadImg(e.src) });
    }));
    // Canvas text only uses faces that are already loaded, so request each one explicitly.
    if (document.fonts) {
      await Promise.all(['400 20px "Instrument Serif"', 'italic 400 20px "Instrument Serif"', '400 20px Inter', '600 20px Inter',
        '500 20px "JetBrains Mono"', '500 20px "Noto Serif TC"'].map((f) => document.fonts.load(f, 'Aa尖').catch(() => null)));
      await document.fonts.ready;
    }
    const N = book.pages.length;
    const pages = await Promise.all(book.pages.map(async (pg, n) => {
      const c = document.createElement('canvas');
      c.width = Math.round(W * scale); c.height = Math.round(H * scale);
      const ctx = c.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = T.paper; ctx.fillRect(0, 0, W, H);
      (LAYOUTS[pg.layout] || LAYOUTS.statement)(ctx, T, B, pg, n, N);
      if (!NO_CHROME[pg.layout]) chrome(ctx, T, B, pg, n, N);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
      return blob ? loadImg(URL.createObjectURL(blob)) : c;
    }));
    return { pages, theme: T };
  }

  window.FlipTheme = { W, H, THEMES, FACES, LAYOUTS, resolveTheme, renderBook };
})();
