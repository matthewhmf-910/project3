import fs from "fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Remotion normally downloads its own Chrome Headless Shell. Where that download
// is blocked, use a local Chromium instead: set REMOTION_CHROME, or fall back to
// the Playwright headless shell if present.
const localChrome = [
  process.env.REMOTION_CHROME,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].find((p) => p && fs.existsSync(p));
if (localChrome) {
  Config.setBrowserExecutable(localChrome);
}
