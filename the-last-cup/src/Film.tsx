import { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { Scene } from './scene/Scene';
import { FPS, SEC } from './timeline';
import { range, smoother } from './lib/math';
import { asset } from './assets';

const FONTS: [string, string, FontFaceDescriptors?][] = [
  ['Cormorant Garamond', 'fonts/cormorant-300.woff2', { weight: '300' }],
  ['Cormorant Garamond', 'fonts/cormorant-400i.woff2', { weight: '400', style: 'italic' }],
  ['Jost', 'fonts/jost-400.woff2', { weight: '400' }],
  ['Shippori Mincho', 'fonts/shippori-500-subset.woff2', { weight: '500' }],
  ['Yuji Syuku', 'fonts/yuji-syuku-subset.woff2', { weight: '400' }],
];

let fontsPromise: Promise<void> | null = null;
export function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONTS.map(async ([family, file, desc]) => {
        const f = new FontFace(family, `url(${asset(file)})`, desc);
        await f.load();
        (document.fonts as any).add(f);
      }),
    ).then(() => undefined);
  }
  return fontsPromise;
}

function useFontsReady() {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    loadFonts().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
}

const ivory = '#f2ead7';

function Titles({ t }: { t: number }) {
  // location tag at the open, small and quiet
  const tagIn = smoother(range(t, 0.25, 0.9)) * (1 - smoother(range(t, 2.6, 3.2)));
  // title: unblurs and tracks in
  const a = smoother(range(t, 8.62, 9.15));
  const sub = smoother(range(t, 8.9, 9.4));
  const jp = smoother(range(t, 8.8, 9.35));
  const foot = smoother(range(t, 9.05, 9.5));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 132,
          fontFamily: 'Jost',
          fontSize: 23,
          letterSpacing: '0.42em',
          color: ivory,
          opacity: tagIn * 0.85,
          lineHeight: 1.75,
          textShadow: '0 0 18px rgba(0,0,0,0.45)',
        }}
      >
        SHEUNG WAN
        <br />
        22:47 · LAST SEATING
        <div style={{ width: 52, height: 1, background: ivory, opacity: 0.7, marginTop: 22 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 196,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Cormorant Garamond',
          fontWeight: 300,
          fontSize: 86,
          whiteSpace: 'nowrap',
          letterSpacing: `${0.34 + (1 - a) * 0.2}em`,
          paddingLeft: `${0.34 + (1 - a) * 0.2}em`,
          color: ivory,
          opacity: a,
          filter: `blur(${(1 - a) * 9}px)`,
          textShadow: '0 2px 30px rgba(0,0,0,0.55)',
        }}
      >
        THE LAST CUP
      </div>
      <div
        style={{
          position: 'absolute',
          top: 312,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Cormorant Garamond',
          fontStyle: 'italic',
          fontSize: 40,
          letterSpacing: '0.06em',
          color: '#d9cdb0',
          opacity: sub * 0.9,
          transform: `translateY(${(1 - sub) * 10}px)`,
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}
      >
        a quiet omakase evening
      </div>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 470,
          writingMode: 'vertical-rl',
          fontFamily: 'Shippori Mincho',
          fontSize: 40,
          letterSpacing: '0.3em',
          color: '#cfae74',
          opacity: jp * 0.95,
          textShadow: '0 0 20px rgba(0,0,0,0.6)',
        }}
      >
        最後の一杯
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 118,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 22,
          fontFamily: 'Jost',
          fontSize: 21,
          letterSpacing: '0.46em',
          color: ivory,
          opacity: foot * 0.85,
          textShadow: '0 0 16px rgba(0,0,0,0.7)',
        }}
      >
        <span>GRATEFUL FOR THE MOMENT</span>
        <span style={{ width: 16, height: 19, background: '#a8342a', display: 'inline-block', opacity: 0.9 }} />
      </div>
    </AbsoluteFill>
  );
}

export type FilmProps = { audio?: boolean; quality?: 'final' | 'preview' | 'raw'; dbg?: string };

export const Film: React.FC<FilmProps> = ({ audio = false, quality = 'final', dbg = '' }) => {
  if (typeof window !== 'undefined') (window as any).__DBG = dbg;
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / FPS;
  const ready = useFontsReady();
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0805' }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          dpr={1}
          gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
          camera={{ fov: 30, near: 0.03, far: 120, position: [0, 2, 6] }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Scene t={t} quality={quality} />
        </ThreeCanvas>
      )}
      <Titles t={t} />
      {audio && <Audio src={asset('audio/the-last-cup.m4a')} />}
    </AbsoluteFill>
  );
};
