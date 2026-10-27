import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { FilmV4 } from "./FilmV4";
import { TestKinetic } from "./TestKinetic";

export const Root: React.FC = () => (
  <>
  <Composition
    id="Film"
    component={Film}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition id="FilmV4" component={FilmV4} durationInFrames={900} fps={30} width={1080} height={1920} />
  <Composition id="TestKinetic" component={TestKinetic} durationInFrames={150} fps={30} width={1080} height={1920} />
  </>
);
