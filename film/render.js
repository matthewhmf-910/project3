/* Frame-by-frame renderer for the reel.
 *
 *   node film/render.js [outDir] [--fps 30] [--sub 3] [--from 0] [--to <sec>]
 *
 * Every frame n is FILM.seek(n / fps): no timers, no wall clock. Each frame is
 * the average of `sub` samples spread over a 180-degree shutter (half a frame),
 * so fast moves get real motion blur and still frames stay sharp. Writes
 * frames/f_0000.png..., rects.json (text positions per frame for QA), then
 * encodes reel.mp4 with ffmpeg (H.264, yuv420p).
 */
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? +args[i + 1] : d; };
const out = path.resolve(args[0] && !args[0].startsWith("--") ? args[0] : "dist/film");
const FPS = opt("fps", 30), SUB = opt("sub", 3), STEP = opt("step", 1); // --step N: quick preview of every Nth frame
const ffmpeg = process.env.FFMPEG || execFileSync("python3", ["-c", "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())"]).toString().trim();

(async () => {
  const frames = path.join(out, "frames"), subs = path.join(out, "sub");
  const keep = args.includes("--keep"); // re-render only --from..--to into an existing render, then re-encode all
  if (!keep) fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  fs.mkdirSync(subs, { recursive: true });

  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("file://" + path.resolve(__dirname, "index.html"));
  await page.evaluate(() => FILM.ready());
  const duration = await page.evaluate(() => FILM.duration);
  const first = Math.round(opt("from", 0) * FPS), last = Math.round(opt("to", duration) * FPS);

  const rects = {};
  const t0 = Date.now();
  let blurred = 0;
  for (let n = first; n < last; n += STEP) {
    const files = [];
    // still frame (nothing differs across the shutter) -> one sample is enough
    const moving = SUB > 1 && await page.evaluate(([a, b]) => FILM.signature(a) !== FILM.signature(b),
      [Math.max(0, (n - 0.25) / FPS), (n + 0.25) / FPS]);
    const samples = moving ? SUB : 1;
    blurred += moving ? 1 : 0;
    for (let s = 0; s < samples; s++) {
      const t = (n + (samples > 1 ? (s / (samples - 1) - 0.5) * 0.5 : 0)) / FPS; // centred on the frame, half-frame shutter
      await page.evaluate((t) => FILM.seek(Math.max(0, t)), t);
      const f = path.join(subs, `f_${String(n).padStart(4, "0")}_${s}.png`);
      await page.screenshot({ path: f });
      files.push(f);
    }
    await page.evaluate((t) => FILM.seek(t), n / FPS);
    rects[n] = await page.evaluate(() => FILM.textRects());
    if (n % 30 === 0) process.stdout.write(`frame ${n}/${last} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  await browser.close();
  if (errors.length) { console.error("page errors:", errors); process.exit(1); }
  const rectsFile = path.join(out, "rects.json");
  const merged = keep && fs.existsSync(rectsFile) ? { ...JSON.parse(fs.readFileSync(rectsFile)).rects, ...rects } : rects;
  fs.writeFileSync(rectsFile, JSON.stringify({ fps: FPS, duration, first: keep ? 0 : first, rects: merged }));

  // average the sub-samples (numpy), then encode
  execFileSync("python3", ["-I", path.join(__dirname, "accumulate.py"), subs, frames, String(SUB)], { stdio: "inherit" });
  fs.rmSync(subs, { recursive: true, force: true });
  if (STEP === 1) execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-start_number", String(keep ? 0 : first),
    "-i", path.join(frames, "f_%04d.png"), "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(out, "reel.mp4")], { stdio: "inherit" });
  if (STEP > 1) return console.log(`preview: every ${STEP}th frame in ${path.join(out, "frames")}`);
  console.log(`motion-blurred ${blurred}/${last - first} frames`);
  console.log(`rendered ${last - first} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${path.join(out, "reel.mp4")}`);
})();
