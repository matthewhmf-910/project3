import { StrictMode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Player, PlayerRef } from '@remotion/player';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Film, loadFonts } from '../src/Film';
import { Scene } from '../src/scene/Scene';
import { FPS, FRAMES, WIDTH, HEIGHT, SEC } from '../src/timeline';
// Inline every public asset so the preview is one self-contained file.
import corm300 from '../public/fonts/cormorant-300.woff2?inline';
import corm400i from '../public/fonts/cormorant-400i.woff2?inline';
import jost from '../public/fonts/jost-400.woff2?inline';
import shippori from '../public/fonts/shippori-500-subset.woff2?inline';
import yuji from '../public/fonts/yuji-syuku-subset.woff2?inline';
import score from '../public/audio/the-last-cup.m4a?inline';

(globalThis as any).__ASSETS = {
  'fonts/cormorant-300.woff2': corm300,
  'fonts/cormorant-400i.woff2': corm400i,
  'fonts/jost-400.woff2': jost,
  'fonts/shippori-500-subset.woff2': shippori,
  'fonts/yuji-syuku-subset.woff2': yuji,
  'audio/the-last-cup.m4a': score,
};

const CHAPTERS = [
  { t: 0, name: 'The pour', note: 'Macro on the last thread of sencha' },
  { t: SEC.setDown, name: 'The offering', note: 'Crane back; both hands lift the cup' },
  { t: SEC.dive, name: 'Inside the tea', note: 'Nigiri, chawanmushi, sashimi in amber' },
  { t: SEC.rise, name: 'Empty', note: '一期一会 at the bottom of the cup' },
  { t: SEC.bow, name: 'The bow', note: 'Ojigi, the chime, the title' },
];

const fmt = (t: number) => `0:${t.toFixed(2).padStart(5, '0')}`;

function FilmView() {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const on = () => setFrame(p.getCurrentFrame());
    p.addEventListener('frameupdate', on);
    return () => p.removeEventListener('frameupdate', on);
  }, []);
  const t = frame / FPS;
  const active = CHAPTERS.reduce((a, c, i) => (t >= c.t - 0.001 ? i : a), 0);
  return (
    <div className="stage">
      <div className="screen">
        <Player
          ref={ref}
          component={Film}
          inputProps={{ audio: true, quality: 'preview' }}
          durationInFrames={FRAMES}
          fps={FPS}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          controls
          loop
          clickToPlay
          style={{ width: '100%', height: '100%' }}
          acknowledgeRemotionLicense
        />
      </div>
      <ol className="chapters" aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          <li key={c.name}>
            <button
              id={`chapter-${i}`}
              className={i === active ? 'on' : ''}
              onClick={() => {
                ref.current?.seekTo(Math.round(c.t * FPS));
              }}
            >
              <span className="tc">{fmt(c.t)}</span>
              <span className="nm">{c.name}</span>
              <span className="nt">{c.note}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExploreView() {
  const [t, setT] = useState(4.2);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => setReady(true));
  }, []);
  const camera = useMemo(() => ({ position: [5.5, 5.2, 10.5] as [number, number, number], fov: 34, near: 0.03, far: 200 }), []);
  return (
    <div className="stage">
      <div className="screen explore">
        {ready && (
          <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} dpr={[1, 1.5]} camera={camera} gl={{ antialias: false }}>
            <Suspense fallback={null}>
              <Scene t={t} quality="preview" freeCamera />
            </Suspense>
            <OrbitControls target={[0.2, 2.4, -1.5]} enableDamping maxDistance={30} minDistance={1} />
          </Canvas>
        )}
        <p className="hint">Drag to orbit · scroll to zoom · the set at {t.toFixed(2)} s</p>
      </div>
      <div className="scrub">
        <label htmlFor="scrub-t">Moment in the film</label>
        <input id="scrub-t" type="range" min={0} max={9.96} step={1 / FPS} value={t} onChange={(e) => setT(Number(e.target.value))} />
        <div className="marks">
          {CHAPTERS.map((c) => (
            <button key={c.name} onClick={() => setT(Math.min(9.96, c.t + 0.4))}>
              {c.name}
            </button>
          ))}
        </div>
        <p className="aside">The free camera shows the counter set. The memory sequence lives inside the tea and plays in the film view.</p>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<'film' | 'explore'>(() => (location.hash === '#explore' ? 'explore' : 'film'));
  useEffect(() => {
    const on = () => setMode(location.hash === '#explore' ? 'explore' : 'film');
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return (
    <main>
      <header>
        <p className="eyebrow">A ten-second film, made entirely in code</p>
        <h1>The Last Cup</h1>
        <p className="lede">
          At the end of a quiet omakase evening in Sheung Wan, an old itamae pours the last cup of tea, and inside it the whole night glows once more
          before it is gone.
        </p>
        <nav className="tabs" aria-label="View">
          <a href="#film" className={mode === 'film' ? 'on' : ''}>
            Watch
          </a>
          <a href="#explore" className={mode === 'explore' ? 'on' : ''}>
            Explore the set
          </a>
        </nav>
      </header>
      {mode === 'film' ? <FilmView /> : <ExploreView />}
      <footer>
        <span>1080 × 1920 · 30 fps · 10.0 s</span>
        <span>Three.js · React Three Fiber · postprocessing · Remotion</span>
        <span className="jp">最後の一杯</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
