// Procedural textures, drawn in code from seeded noise. Cached per module (deterministic).
import * as THREE from 'three';
import { fbm, mulberry32, vnoise, clamp, lerp } from './math';

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function tex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, img: ImageData | null) => ImageData | void,
  opts: { srgb?: boolean; repeat?: [number, number]; pixel?: boolean } = {},
) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  const img = opts.pixel ? ctx.createImageData(w, h) : null;
  const res = draw(ctx, img);
  if (res) ctx.putImageData(res, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  } else {
    t.wrapS = THREE.RepeatWrapping;
  }
  cache.set(key, t);
  return t;
}

const px = (img: ImageData, i: number, r: number, g: number, b: number, a = 255) => {
  img.data[i] = clamp(r, 0, 255);
  img.data[i + 1] = clamp(g, 0, 255);
  img.data[i + 2] = clamp(b, 0, 255);
  img.data[i + 3] = a;
};

// ---------------- Hinoki counter ----------------
// Pale blond cypress, fine straight grain along x, a few soft growth-ring waves.
export function hinokiColor() {
  return tex(
    'hinoki-c',
    2048,
    512,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 2048; x++) {
          const u = x / 2048;
          const v = y / 512;
          const warp = fbm(u * 3, v * 1.5, 4) * 0.35 + fbm(u * 0.7, v * 0.4, 3) * 0.6;
          const ring = Math.sin((v * 46 + warp * 9) * Math.PI);
          const fine = fbm(u * 2, v * 260, 2);
          const lateWood = Math.pow(Math.max(0, ring), 7) * 0.55;
          const g = 0.9 - lateWood * 0.35 - fine * 0.08 - fbm(u * 6, v * 6, 3) * 0.06;
          const knot = 0; // hinoki counters are prized knot-free
          px(im, (y * 2048 + x) * 4, 236 * g - knot, 205 * g - knot, 160 * g - knot);
        }
      return im;
    },
    { pixel: true },
  );
}
export function hinokiBump() {
  return tex(
    'hinoki-b',
    2048,
    512,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 2048; x++) {
          const u = x / 2048;
          const v = y / 512;
          const warp = fbm(u * 3, v * 1.5, 4) * 0.35 + fbm(u * 0.7, v * 0.4, 3) * 0.6;
          const ring = Math.pow(Math.max(0, Math.sin((v * 46 + warp * 9) * Math.PI)), 7);
          const pore = fbm(u * 4, v * 400, 2);
          const g = 180 - ring * 60 - pore * 40;
          px(im, (y * 2048 + x) * 4, g, g, g);
        }
      return im;
    },
    { pixel: true, srgb: false },
  );
}

// ---------------- Celadon yunomi (outer glaze) ----------------
// v=0 at the foot, v=1 at the rim (lathe profile order). Raw clay below an irregular glaze line,
// celadon above, pooling deeper green where the glaze is thick, iron speckle, faint crackle.
export function celadonColor() {
  return tex(
    'celadon-c',
    1024,
    1024,
    (_c, img) => {
      const im = img!;
      const rnd = mulberry32(7);
      const speck: [number, number, number][] = [];
      for (let i = 0; i < 900; i++) speck.push([rnd(), rnd(), rnd()]);
      for (let y = 0; y < 1024; y++)
        for (let x = 0; x < 1024; x++) {
          const u = x / 1024;
          const v = 1 - y / 1024; // canvas y down → v up
          // seamless in u: sample noise on a circle
          const cu = Math.cos(u * Math.PI * 2) * 2;
          const su = Math.sin(u * Math.PI * 2) * 2;
          const edge = 0.2 + (fbm(cu + 5, su + v * 0.1, 4) - 0.5) * 0.08 + Math.sin(u * Math.PI * 6) * 0.01;
          const i = (y * 1024 + x) * 4;
          if (v < edge) {
            // raw stoneware: warm beige-grey with grog
            const g = 0.82 + (fbm(cu * 4 + 1, su * 4 + v * 30, 3) - 0.5) * 0.25;
            px(im, i, 196 * g, 170 * g, 138 * g);
            continue;
          }
          const pool = Math.exp(-(v - edge) * 28); // thick glaze just above the edge
          const flow = fbm(cu * 1.2, su * 1.2 + v * 4, 4);
          const depth = clamp(pool * 0.9 + (flow - 0.5) * 0.35 + (1 - v) * 0.12);
          // celadon: pale sage-jade → deeper jade where thick
          const r = lerp(198, 120, depth);
          const g = lerp(214, 152, depth);
          const b = lerp(188, 122, depth);
          // brown rim where glaze thins over the lip
          const rim = clamp((v - 0.93) / 0.07);
          px(im, i, lerp(r, 168, rim * 0.6), lerp(g, 150, rim * 0.6), lerp(b, 112, rim * 0.6));
        }
      // iron speckle
      for (const [su, sv, sr] of speck) {
        const x = Math.floor(su * 1024);
        const y = Math.floor((1 - sv) * 1024);
        const r = sr < 0.85 ? 1 : 2;
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const xx = (x + dx + 1024) % 1024;
            const yy = y + dy;
            if (yy < 0 || yy >= 1024 || dx * dx + dy * dy > r * r) continue;
            const i = (yy * 1024 + xx) * 4;
            im.data[i] *= 0.45;
            im.data[i + 1] *= 0.4;
            im.data[i + 2] *= 0.35;
          }
      }
      return im;
    },
    { pixel: true },
  );
}
export function celadonBump() {
  return tex(
    'celadon-b',
    1024,
    1024,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 1024; y++)
        for (let x = 0; x < 1024; x++) {
          const u = x / 1024;
          const v = 1 - y / 1024;
          const cu = Math.cos(u * Math.PI * 2) * 3;
          const su = Math.sin(u * Math.PI * 2) * 3;
          // throwing rings: the potter's fingers left soft horizontal ridges
          const throwRing = Math.sin(v * 52 + fbm(cu, su, 3) * 3) * 0.5 + 0.5;
          const crackle = Math.abs(vnoise(cu * 9 + v * 40, su * 9) - 0.5) < 0.015 ? 1 : 0;
          const g = 140 + throwRing * 70 - crackle * 25 + (fbm(cu * 6, su * 6 + v * 20, 2) - 0.5) * 30;
          px(im, (y * 1024 + x) * 4, g, g, g);
        }
      return im;
    },
    { pixel: true, srgb: false },
  );
}

// ---------------- Cup interior bottom: ivory glaze + 一期一会 in iron-oxide brush ----------------
export function cupBottom(stain: number) {
  return tex(`cup-bottom-${stain}`, 1024, 1024, (ctx) => {
    const g = ctx.createRadialGradient(512, 512, 40, 512, 512, 512);
    g.addColorStop(0, '#ddd2b8');
    g.addColorStop(0.7, '#d4c8ab');
    g.addColorStop(1, '#bcc4a2'); // celadon creeping in at the wall
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);
    const rnd = mulberry32(19);
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(90,60,35,${0.15 + rnd() * 0.35})`;
      ctx.beginPath();
      ctx.arc(rnd() * 1024, rnd() * 1024, rnd() * 2.2 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (stain > 0) {
      // the last of the tea: a faint gold-green tide line and a single drop
      ctx.strokeStyle = 'rgba(150,140,60,0.35)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(512, 512, 470, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 一期一会, vertical, brushed in iron oxide (Yuji Syuku), slightly uneven ink density
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(-0.04);
    const chars = ['一', '期', '一', '会'];
    ctx.font = '150px "Yuji Syuku"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    chars.forEach((ch, k) => {
      const y = (k - 1.5) * 168;
      ctx.fillStyle = `rgba(${96 + k * 6},${48 + k * 3},${26},${0.86 - k * 0.04})`;
      ctx.fillText(ch, 0, y);
      ctx.fillStyle = 'rgba(70,35,20,0.18)';
      ctx.fillText(ch, 2, y + 2); // ink pooling
    });
    ctx.restore();
    // tiny red seal, bottom right of the text
    ctx.fillStyle = 'rgba(168,52,40,0.85)';
    ctx.fillRect(612, 700, 46, 54);
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(620, 708, 30, 4);
    ctx.fillRect(620, 726, 30, 4);
    ctx.fillRect(633, 708, 4, 38);
  });
}

// ---------------- Kyusu clay (tokoname-style red-brown) ----------------
export function kyusuColor() {
  return tex(
    'kyusu',
    512,
    512,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 512; x++) {
          const u = x / 512;
          const v = y / 512;
          const cu = Math.cos(u * Math.PI * 2) * 2;
          const su = Math.sin(u * Math.PI * 2) * 2;
          const g = 0.85 + (fbm(cu * 3, su * 3 + v * 8, 4) - 0.5) * 0.35;
          const sp = vnoise(cu * 60, su * 60 + v * 200) > 0.93 ? 0.6 : 1;
          px(im, (y * 512 + x) * 4, 128 * g * sp, 62 * g * sp, 40 * g * sp);
        }
      return im;
    },
    { pixel: true },
  );
}

// ---------------- Washi paper (lamp shade, tanzaku) ----------------
export function washi(tint = [244, 236, 220]) {
  return tex(
    `washi-${tint.join()}`,
    512,
    512,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 512; x++) {
          const u = x / 512;
          const v = y / 512;
          const fiber = Math.pow(vnoise(u * 90 + fbm(u * 4, v * 4) * 8, v * 9), 6) * 0.4;
          const g = 0.93 + (fbm(u * 10, v * 10, 4) - 0.5) * 0.12 - fiber * 0.2;
          px(im, (y * 512 + x) * 4, tint[0] * g, tint[1] * g, tint[2] * g);
        }
      return im;
    },
    { pixel: true, repeat: [1, 1] },
  );
}

// ---------------- Fabric weave (chef's coat) ----------------
export function weaveBump() {
  return tex(
    'weave',
    256,
    256,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 256; x++) {
          const a = Math.sin((x / 256) * Math.PI * 2 * 48) * Math.sin((y / 256) * Math.PI * 2 * 48);
          const g = 128 + a * 50 + (vnoise(x * 0.3, y * 0.3) - 0.5) * 40;
          px(im, (y * 256 + x) * 4, g, g, g);
        }
      return im;
    },
    { pixel: true, srgb: false, repeat: [6, 6] },
  );
}

// ---------------- Seigaiha (wave) pattern for the glass chime ----------------
export function seigaiha() {
  return tex('seigaiha', 512, 256, (ctx) => {
    ctx.clearRect(0, 0, 512, 256);
    ctx.strokeStyle = 'rgba(120,160,120,0.9)';
    ctx.lineWidth = 3;
    const R = 32;
    for (let row = 0; row < 7; row++)
      for (let col = -1; col < 10; col++) {
        const cx = col * R * 2 + (row % 2) * R;
        const cy = 120 + row * (R / 2) * 0.9;
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          ctx.arc(cx, cy, (R * k) / 3, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      }
    // fade to clear at the top of the bell
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.45, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
  });
}

// ---------------- Soft radial sprite (bokeh, motes, contact shadow) ----------------
export function radial(key: string, stops: [number, string][]) {
  return tex(`radial-${key}`, 256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}

// ---------------- Dark stone plate (memory dishes) ----------------
export function stone(seed = 3) {
  return tex(
    `stone-${seed}`,
    512,
    512,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 512; x++) {
          const u = x / 512;
          const v = y / 512;
          const g = 0.55 + (fbm(u * 6 + seed, v * 6, 5) - 0.5) * 0.5 + (vnoise(u * 300, v * 300) - 0.5) * 0.12;
          px(im, (y * 512 + x) * 4, 70 * g, 66 * g, 60 * g);
        }
      return im;
    },
    { pixel: true },
  );
}

// ---------------- Tuna marbling (otoro: pink flesh, white fat lines) ----------------
export function otoro(kind: 'otoro' | 'akami' | 'hirame' | 'saba') {
  return tex(
    `fish-${kind}`,
    512,
    256,
    (_c, img) => {
      const im = img!;
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 512; x++) {
          const u = x / 512;
          const v = y / 256;
          const w = fbm(u * 3, v * 3, 3) * 0.6;
          const i = (y * 512 + x) * 4;
          if (kind === 'otoro' || kind === 'akami') {
            const lines = Math.pow(Math.abs(Math.sin((u * 7 + v * 2.5 + w) * Math.PI)), kind === 'otoro' ? 18 : 60);
            const fat = clamp(lines * 1.4 + (kind === 'otoro' ? 0.18 : 0));
            const base = kind === 'otoro' ? [232, 132, 128] : [176, 36, 44];
            px(im, i, lerp(base[0], 250, fat), lerp(base[1], 214, fat), lerp(base[2], 200, fat));
          } else if (kind === 'hirame') {
            const lines = Math.pow(Math.abs(Math.sin((u * 9 + w) * Math.PI)), 30);
            px(im, i, 238 - lines * 12, 228 - lines * 4, 222);
          } else {
            // saba: silver-blue skin with dark zebra marks over pale flesh
            const skin = v < 0.55;
            const mark = Math.sin((u * 14 + fbm(u * 5, v * 5) * 3) * Math.PI) > 0.55 && v < 0.35;
            if (skin) {
              const s = mark ? 0.35 : 0.85 + v * 0.2;
              px(im, i, 150 * s, 170 * s, 182 * s);
            } else px(im, i, 230, 196, 184);
          }
        }
      return im;
    },
    { pixel: true },
  );
}
