// Render all 300 frames to out/video.mp4 (silent; the mix is muxed by scripts/master.sh).
// node scripts/render.mjs [--concurrency 3] [--frames 0-299] [--out out/video.mp4]
import path from 'node:path';
import { renderMedia } from '@remotion/renderer';
import { setup, browserExecutable, chromiumOptions, ROOT, OUT } from './common.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const concurrency = Number(opt('--concurrency', 3));
const frames = opt('--frames', null);
const out = path.resolve(ROOT, opt('--out', path.join(OUT, 'video.mp4')));
const inputProps = { quality: 'final', audio: false };

const { serveUrl, composition } = await setup(inputProps);
const t0 = Date.now();
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  inputProps,
  codec: 'h264',
  crf: 14,
  pixelFormat: 'yuv420p',
  imageFormat: 'jpeg',
  jpegQuality: 96,
  muted: true,
  concurrency,
  frameRange: frames ? frames.split('-').map(Number) : null,
  outputLocation: out,
  browserExecutable,
  chromiumOptions,
  timeoutInMilliseconds: 300000,
  onProgress: ({ renderedFrames, encodedFrames }) => {
    if (renderedFrames !== last && renderedFrames % 10 === 0) {
      last = renderedFrames;
      const s = (Date.now() - t0) / 1000;
      console.log(`rendered ${renderedFrames}/${composition.durationInFrames}  encoded ${encodedFrames}  ${s.toFixed(0)}s`);
    }
  },
});
console.log(`done → ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
