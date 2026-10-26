# Flipbook (scroll-driven)

Recreation of the opening flip-book of the reference video, driven by frame-accurate measurements.

- `analysis/flip_spec.json`: page geometry, flip/hold frame table and spread order, measured from the source at 30 fps
- `analysis/fit_result.json`: curl shape and per-flip start/duration, fitted to the measured page-edge positions
- `analysis/*.py`: measurement and fitting scripts (`diff.py` motion energy, `flips.py`/`twist.py` edge tracking, `fit2.py` model fit)
- `flipbook.js`: engine; `render(R, frame)` is a pure function of the source frame number
- `index.html`: canvas renderer. `?frame=N` renders one frame (capture/validation), `?play` autoplays at 30 fps, default is scroll-driven (`?ppf=` scroll px per frame); `?tex=` points at the page textures (default `assets/pages/`, `assets/ref/` for the reference crops)
- `pages/pages.html` + `pages/render_pages.js`: the 19 page layouts built from the Tsim Sha Tsui maps in `assets/user/`, rendered to `assets/pages/`; `pages/landcover.json` and `pages/palettes.json` are measured from those maps
- `build_standalone.py <texture_dir> <out.html>`: bundles everything into one HTML file

Validation textures cropped from the reference live in `assets/ref/` and are git-ignored.
