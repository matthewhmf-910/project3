# Motion graphics (Remotion)

## Setup
```bash
npm install                      # Remotion 4 + React 19 + TypeScript
pip install -r requirements.txt  # numpy, for generating audio
```
FFmpeg is only needed for your own audio/video processing; Remotion bundles its own for rendering.
The official Remotion Agent Skills are in `.claude/skills/` (installed with `npx skills add remotion-dev/skills`).

## Usage
```bash
npm run studio        # Remotion Studio at http://localhost:3000
npm run test-render   # renders TestTitle -> out/test.mp4
python3 scripts/gen_tone.py public/tone.wav --freq 440 --seconds 3
```

Compositions are registered in `src/Root.tsx`. If Remotion can't download its headless Chrome
(for example, behind a restrictive proxy), set `REMOTION_CHROME` to a local Chrome/Chromium binary (see `remotion.config.ts`).
