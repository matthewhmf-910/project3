import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const TestTitle: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const subEnter = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const exit = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lineWidth = interpolate(frame, [8, 40], [0, 480], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #1e2a4a, #0b0f1a)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        opacity: exit,
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: -2,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60}px)`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          height: 6,
          width: lineWidth,
          background: "#f5a623",
          borderRadius: 3,
          margin: "28px 0",
        }}
      />
      <div
        style={{
          color: "#c9d3ea",
          fontSize: 56,
          opacity: subEnter,
          transform: `translateY(${(1 - subEnter) * 30}px)`,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
