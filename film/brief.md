# Film brief: Coolest Coffee, "The lemon finds its way"

The lines left blank in the brief were decided here. Each decision has a one-line reason.

| Field | Decision | Reason |
| --- | --- | --- |
| mode | product | The glass is the hero. The type and lemon only exist to deliver the fresh wheel into it. |
| subject | 夏野豆行 · Coolest Coffee, pale brown cold brew with a dried lemon slice | Taken from HANDOFF.md and the approved poster. |
| viewer | People scrolling a 9:16 social feed | 9:16 is the target platform in HANDOFF.md. |
| end state | They see the full poster, with a fresh lemon wheel added to the glass | Matches storyboard panel 06: identity, no forced reset. |
| length | 10 s, 9:16, 1080×1920 | Matches the approved storyboard ("10 SECONDS"). |
| frame rate | 30 fps | Physical props with a handmade, character-like feel. |
| brand | Tokens from HANDOFF.md section 2; lettering keyed from the poster | No logo SVG or font files were supplied. |
| facts | `facts.json`. On-screen words come only from the poster and HANDOFF.md | No URL or product facts were supplied. |
| assets | `assets/*.png`, derived by `tools/build_assets.py` | The 4K PNGs named in the handoff were never delivered. |
| style | Storyboard sheet "THE LEMON FINDS ITS WAY" (6 panels) | Supplied reference. |
| sound | **Not done yet.** The client asked for the animation first. | The brief says audio comes first. This film is not finished until a scored cut exists. |
| autonomy | unattended | The client said "keep going and auto pilot" after QA pass 1. |
| toolchain | HTML + GSAP, rendered frame by frame with Playwright, encoded with ffmpeg | Same timeline as the landing page player. |
| sign-off | Poster end card with the stamp. **No CTA or URL.** | None supplied. The film cannot invent one. |

## Open issues (client decisions needed)

1. **Generated imagery.** The poster and props sheet appear to be AI-generated. Under the brief, generated images may appear on screen only if the brief allows it and they are labelled as concept. No label has been added yet; this needs the client's call.
2. **Stamp.** `06_STAMP.png` was typeset by us from the handoff's description, because the real mark was not supplied. That counts as redrawing a logo, so it must be replaced with the real file.
3. **CTA / URL.** No end-card call to action exists until one is supplied.
