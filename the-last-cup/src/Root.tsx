import { Composition } from 'remotion';
import { Film, FilmProps } from './Film';
import { FPS, FRAMES, WIDTH, HEIGHT } from './timeline';

export const Root: React.FC = () => (
  <Composition<any, FilmProps>
    id="TheLastCup"
    component={Film}
    durationInFrames={FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ audio: false, quality: 'final' }}
  />
);
