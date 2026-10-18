# Ledger

Each round records the measured numbers before and after the fix, so progress is checkable.

## Round 0: first full render (measured QA, `film/qa.py`)
| check | before | after | fix |
| --- | --- | --- | --- |
| frozen total (limit <0.33 s) | 0.53 s | 0.07 s | The lemon rolls and the camera moves from frame 0. The camera keeps moving through the splash. |
| end-card safe area | stamp in top UI band | inside | Stamp lowered (y 300 → 418) and shrunk (300 → 272). |
| terracotta match | "off 13.9" | off 1.0 | The QA was contaminated by wood pixels; it now measures inside the shape only. The asset itself was correct. |
| key action in safe area | not measured | yes | New check for the lemon and the wheel. |
| contrast, kicker text | 5.28:1 | 5.28:1 | n/a |
