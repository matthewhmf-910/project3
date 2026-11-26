// THE LAST CUP — single source of truth for picture, score and checks.
// 72 BPM: one beat = 0.8333 s; 12 beats = 10 s.
export const FPS = 30;
export const DUR = 10;
export const FRAMES = FPS * DUR;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const BPM = 72;
export const BEAT = 60 / BPM;
export const beat = (n: number) => n * BEAT;

/** Hard section boundaries (object-driven transitions). */
export const SEC = {
  pour: 0,
  pourEnd: 2.2,
  setDown: beat(3), // 2.50 kyusu meets the counter
  grasp: beat(4), // 3.33 palms close on the cup
  offer: 3.6,
  smile: 4.0,
  push: 4.4,
  dive: beat(6), // 5.00 breach the tea surface
  dish2: beat(7), // 5.83
  rise: beat(8), // 6.67 rise out of the (empty) cup
  chime: beat(9), // 7.50 wind chime strike
  bow: beat(10), // 8.33 the chef bows, title arrives
  end: DUR,
} as const;

/** Sound / cue events — exported to timeline.json for the mixer. */
export const EVENTS: { t: number; type: string; [k: string]: number | string }[] = [
  { t: 0.0, type: 'pour', dur: 2.25 },
  { t: 0.0, type: 'koto', note: 64, vel: 0.7 },
  { t: beat(1), type: 'koto', note: 71, vel: 0.55 },
  { t: beat(2), type: 'koto', note: 72, vel: 0.6 },
  { t: 2.3, type: 'drip', vel: 0.6 },
  { t: 2.45, type: 'drip', vel: 0.45 },
  { t: SEC.setDown, type: 'thunk', vel: 0.8 },
  { t: 3.0, type: 'cloth', dur: 0.5, vel: 0.5 },
  { t: SEC.grasp, type: 'touch', vel: 0.55 },
  { t: beat(5), type: 'koto', note: 76, vel: 0.65 },
  { t: 4.3, type: 'swell', dur: 0.72 },
  { t: SEC.dive, type: 'bloop', vel: 0.9 },
  { t: SEC.dive, type: 'koto', note: 69, vel: 0.6, wet: 1 },
  { t: SEC.dive + 0.1, type: 'bubbles', dur: 1.4 },
  { t: SEC.dish2, type: 'koto', note: 71, vel: 0.55, wet: 1 },
  { t: 6.25, type: 'koto', note: 77, vel: 0.45, wet: 1 },
  { t: SEC.rise, type: 'silence', dur: SEC.chime - SEC.rise },
  { t: SEC.chime, type: 'chime', vel: 1.0 },
  { t: SEC.chime + 0.9, type: 'chime-tink', vel: 0.35 },
  { t: 8.1, type: 'cloth', dur: 0.9, vel: 0.35 },
  { t: SEC.bow, type: 'koto-chord', notes: '52,59,64,71', vel: 0.65 },
  { t: 9.3, type: 'chime-tink', vel: 0.25 },
];

// World anchors (1 unit = 10 cm). Counter top is y = 0.
export const CUP0: [number, number, number] = [0.3, 0, -0.4];
export const MEM: [number, number, number] = [0, -100, 0]; // memory world origin
