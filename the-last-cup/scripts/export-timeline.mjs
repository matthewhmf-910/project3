// Export src/timeline.ts → audio/timeline.json (the score and the mixer read the same numbers as the picture).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(ROOT, 'out', 'timeline.mjs');
await build({ entryPoints: [path.join(ROOT, 'src/timeline.ts')], outfile: tmp, format: 'esm', bundle: true, logLevel: 'error' });
const tl = await import(pathToFileURL(tmp).href);
const json = { fps: tl.FPS, dur: tl.DUR, bpm: tl.BPM, sec: tl.SEC, events: tl.EVENTS };
fs.writeFileSync(path.join(ROOT, 'audio/timeline.json'), JSON.stringify(json, null, 1));
console.log('audio/timeline.json', json.events.length, 'events');
