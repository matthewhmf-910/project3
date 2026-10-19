# VERIFY

Log: `out/verify_log.txt` (written by `finish.sh`).

| Check | Result | Evidence |
|-------|--------|----------|
| Duration 20.000 s, 600 frames @30 fps, all 3 cuts | PASS | ffprobe in verify_log |
| Sizes 1920×1080 / 1080×1920 / 1080×1080 | PASS | ffprobe |
| Black frames (blackdetect d≥0.1 s) | PASS: 0 in each cut | verify_log |
| Loudness | PASS: −17.8 LUFS integrated, −1.4 dBFS true peak | ebur128 |
| Determinism: same frame (9x16 @12.3 s) rendered twice, byte-compared | PASS | `cmp` identical |
| Frame sheet across full timeline (9x16 @1.5 fps, 16x9 @1 fps) | PASS: one line of copy at a time; ring sits on tabletop → cup rim → lemon; nothing cropped | inspected visually |
| Copy legible at phone size (scrim under copy in 9:16 / 1:1; S3 copy moved to top) | PASS | frame sheet |
| Captions match on-screen copy & timing | PASS | `captions.srt` vs `timeline.js` setLine times |
| Muted watch | PASS: story reads from copy alone | frame sheet |
| Audio-only listen | UNTESTED by ear (no speakers in the build box); levels measured only | — |
| Playback on real phone / IG upload | UNTESTED | — |
| Three rendered style frames | FIX: only the chosen one rendered (see DECISIONS.md) | — |
| Narration / voice-over | Not included: no voice supplied | — |
