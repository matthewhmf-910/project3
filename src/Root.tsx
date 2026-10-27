import { Composition } from "remotion";
import { TestTitle } from "./TestTitle";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TestTitle"
      component={TestTitle}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ title: "Hello, Remotion", subtitle: "Test title card" }}
    />
  );
};
