// Shared Remotion setup: bundle once, headless shell, software GL (no GPU in CI containers).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { selectComposition } from '@remotion/renderer';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const candidates = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
].filter(Boolean);
export const browserExecutable = candidates.find((p) => fs.existsSync(p)) ?? null;

// GPU: angle; no GPU: swangle (SwiftShader through ANGLE). Override with REMOTION_GL.
export const chromiumOptions = { gl: process.env.REMOTION_GL ?? 'swangle', ignoreCertificateErrors: false };

export async function setup(inputProps = {}) {
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
  const composition = await selectComposition({
    serveUrl,
    id: 'TheLastCup',
    inputProps,
    browserExecutable,
    chromiumOptions,
    timeoutInMilliseconds: 120000,
  });
  return { serveUrl, composition };
}
