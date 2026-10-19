# DECISIONS

## Thesis
- **Before:** a café needs a room, a counter and a menu.
- **After:** this one is a corner, two chairs, one round table and one cup. The smallness is the point.
- **Opening question → final answer:** "一間店，可以多小？" → "小到，只賣一杯… 剛剛好。"

## Structure (20 s, 30 fps)
| Scene | Time | Beat | Image | Copy |
|------|------|------|-------|------|
| S1 | 0–4.3 | Question | corner_render: slow push toward the kiosk | 一間店，可以多小？ |
| S2 | 3.8–7.9 | Model: seating | chairs_corner | 兩張長木椅。 |
| S3 | 7.4–11.4 | Proof: table | table_lemon; a lemon-yellow ring traces the tabletop, then tightens onto the cup rim | 一張圓鐵桌。 |
| S4 | 11.0–15.4 | Turn | the ring travels to centre and becomes a circular window onto drink_top; photo blurs away; sound ducks | 小到，只賣一杯。 |
| S5 | 15.5–18.2 | Payoff | slow push into the lemon slice | 冰咖啡，一片檸檬。 |
| S6 | 18.3–20 | Hold | lemon disc held | 剛剛好。 |

## Visual object
One circle carries the whole film: the round table, then the glass rim, then the lemon slice. It's the only animated graphic, and its lemon yellow (`#e8c547`) is the only accent colour.

## Style frame chosen
I chose the disc on the dark green of the tabletop because the green continues the real table, so the cut keeps the object's identity instead of swapping to a new setting.

I also considered two alternatives but didn't render them as style frames (the brief asks for three rendered frames, so this step is incomplete):
- a full-bleed hard cut to the drink
- the disc on ivory paper

## Per-format layout (rebuilt from scene source, not cropped)
- **16:9:** split layout. Copy sits on ivory paper on the left; a 1080² photo panel is on the right.
- **9:16 / 1:1:** full-bleed photo with copy over a bottom scrim. In S3 the copy moves to the top (with a top scrim) because the cup sits low in the frame.

## Type
- Chinese headline: Noto Serif TC 600
- Kicker: Noto Sans TC 500, letter-spaced caps
- English line: Fraunces italic

Fonts are SIL OFL and come from npm (`@fontsource/*`).

## Audio
- No music or voice was supplied, so `audio.py` synthesises the bed: brown-noise street tone, a soft Fmaj9 pad, and ice clinks on the cup reveal (12.6 s) and on the final line (18.3 s).
- The pad ducks to near silence at the turn.
- There is no narration; the on-screen copy carries the film with sound off. `captions.srt` repeats the copy for platforms that want a caption file.
