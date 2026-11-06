# v6: 6-second prompt with the reference's fast-forward feel

## Fair comparison
All clips were sampled at the reference's 14.29 fps and the same 1.83:1 crop, 128×72 greyscale.

| Clip | Mean motion | Median | % near-still frames | Mean sharpness |
|---|---|---|---|---|
| Reference GIF | 17.8 | 16.9 | 10.3 % | **6.38** |
| v1 render | 16.7 | 11.4 | 23.9 % | 9.49 |
| v3 render | 20.4 | 18.1 | 9.2 % | **12.83** |

Findings:
- The reference reads as fast-forward because of heavy shutter-drag and frame-blend blur. Its sharpness is half that of the renders. Cut rate alone does not create the effect.
- v1 was slow because 24 % of its frames were near-still (diner and sunrise holds). Its average motion was not much lower than the reference.
- v5 carried slow verbs ("creeps at walking pace", "slow crawl") and a mis-scaled near-hold (0.52–1.04 s; the correct scaling is 0.61–0.99 s). v6 fixes both.
