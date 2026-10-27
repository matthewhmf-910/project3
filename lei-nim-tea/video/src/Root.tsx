import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";

export const Root: React.FC = () => (
  <Composition
    id="Film"
    component={Film}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
