# Scroll page

- `index.html` is the page as published to the Artifact host. The host adds the doctype, `<head>` and `<body>`.
- `local.html` is the same page wrapped for opening straight from disk. Regenerate it with `bash build-local.sh`.
- `seq/` holds the 146 pour frames. They come from `reference/clips/clipA_ice_lemon_pour.mp4`, cut at 0–3.9 s before the AI clip adds foam; the pour part is slowed to 0.7x.
- Scrolling through `#track` (560svh) plays the frames, then pushes into the lemon, then shows the top view (`img/drink_top.jpg`), then the real cup (`img/table_lemon.jpg`).
- With reduced motion turned on, the section stays a still picture with every step readable.
