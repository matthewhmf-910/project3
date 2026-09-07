# Project Macau — 八鏡成品 Video Prompt（最終版）

**每個鏡：附 1 張 reference image ＋ 1 段裁好的 motion reference ＋ 下面整段文字。**
生成 2s，取用長度見各鏡標題。E1 必須先跑（E2 要用它的末幀），其餘七鏡可並行。

已拍板：握把手保留（H5 手崩率最低）；C 與 F 用背面 reference。

---

## 1. BEAT A1_A2 — previz 0.00–0.67s，取用 0.67s

**Reference image：** `assets/prepped/daruma_standing_back_rucksack.png`

```bash
ffmpeg -ss 0.0 -i previz_part2.mp4 -t 0.67 -c copy beat_A1_A2_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides away from the viewer down the centre of the
street, seen from directly behind, standing upright with both feet together
on the scooter deck. The brown rucksack and bedroll are the dominant
silhouette and stay locked to the shell. The scooter tracks a perfectly
straight line and is visible only as a thin stem and two small wheels below
the body. There is no stepping cycle.

Camera: the subject shrinks steadily toward the vanishing point as more
street enters the frame edges. The walls stay parallel to the frame edges.
The horizon stays level; no roll, no shake, no acceleration.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 2. BEAT A3 — previz 0.67–1.17s，取用 0.50s

**Reference image：** `assets/prepped/daruma_standing_front_camera.png`

```bash
ffmpeg -ss 0.67 -i previz_part2.mp4 -t 0.5 -c copy beat_A3_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides straight down the centre of the street toward the
viewer at a steady walking pace, standing upright on a small black kick
scooter with both feet together on the deck. It does not push off the ground
and there is no stepping cycle — the glide is smooth and continuous. Both
hands rest on the handlebar and never leave it. The scooter is a thin stem
and two small wheels below the body, mostly hidden behind the legs. The
rucksack holds its position. The printed eyes stay fixed forward.

Camera: the subject starts small in the middle distance and grows steadily
larger, staying on the centre line of the street. The building walls
converge to a vanishing point directly behind the subject. The ground line
sits low in frame. The horizon stays level; no camera roll, no shake, no
acceleration.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 3. BEAT B — previz 1.17–1.50s，取用 0.33s

**Reference image：** `assets/prepped/daruma_standing_front_camera.png`

```bash
ffmpeg -ss 1.17 -i previz_part2.mp4 -t 0.33 -c copy beat_B_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides directly at the viewer, standing upright with both
feet together on the scooter deck, body tilted very slightly forward, both
hands resting on the handlebar and never leaving it. There is no stepping
cycle. The printed eyes stay fixed forward and do not blink or change
expression. The rucksack and camera strap hold their positions.

Camera: the subject fills the frame rapidly until the head and upper body
occupy roughly the upper third and the red shell dominates the centre. The
background compresses and softens behind it. Framing stays centred and
level; no camera roll, no shake.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 4. BEAT C — previz 1.50–2.00s，取用 0.50s

**Reference image：** `assets/prepped/daruma_standing_back_rucksack.png`

```bash
ffmpeg -ss 1.5 -i previz_part2.mp4 -t 0.5 -c copy beat_C_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides toward the viewer at a steady pace, holding a
constant position in the centre of the frame, standing upright on the kick
scooter with both feet together on the deck. There is no stepping or
push-off cycle. Both hands rest on the handlebar and never leave it. The
printed eyes stay fixed forward and do not blink.

Camera: the subject stays centred and exactly the same size throughout,
while the building walls slide backwards past the left and right frame edges
at a constant rate. This must read as one smooth continuous move with no
acceleration, no easing and no shake. The horizon stays level.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 5. BEAT D — previz 2.00–2.70s，取用 0.70s

**Reference image：** `assets/prepped/daruma_standing_back_rucksack.png`

```bash
ffmpeg -ss 2.0 -i previz_part2.mp4 -t 0.7 -c copy beat_D_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides directly at the viewer, standing upright with both
feet together on the scooter deck, body tilted very slightly forward, both
hands resting on the handlebar and never leaving it. There is no stepping
cycle. The printed eyes stay fixed forward and do not blink or change
expression. The rucksack and camera strap hold their positions.

Camera: the subject grows steadily larger in a slow, even push-in — not a
rapid fill — staying near the centre of frame. The background compresses
gently behind it. The horizon stays level; no camera roll, no shake, no
acceleration.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 6. BEAT E1 — previz 2.70–3.40s，取用 0.70s

**Reference image：** `assets/prepped/daruma_scooter_three_quarter_back.png`

```bash
ffmpeg -ss 2.7 -i previz_part2.mp4 -t 0.7 -c copy beat_E1_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: only the curved red shell, the rucksack straps and the right edge of
the white head are visible in the near foreground. The daruma continues
riding forward. Nothing about the shell deforms.

Camera: the red shell occupies the left third of the frame in the near
foreground and slides slowly toward the left edge, while the street beyond
stays sharp and opens up on the right. Parallax between foreground shell and
background street is gentle and continuous. The horizon stays level; no
roll, no whip, no shake.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay, no foreground smearing, no ghosting, no texture sliding on the
shell, no duplicated limbs
```

---

## 7. BEAT E2 — previz 3.40–4.57s，取用 1.17s

**Reference image：** `generated/E1_last_frame.png`

```bash
ffmpeg -ss 3.4 -i previz_part2.mp4 -t 1.17 -c copy beat_E2_drive.mp4
```

```
A 2-second continuous shot, no cuts, continuing seamlessly from the
reference frame.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma continues gliding forward, unchanged, both feet together
on the deck and both hands on the handlebar. There is no stepping or
push-off cycle.

Camera: the subject shrinks slowly toward the centre of frame as more of the
street enters the edges, coming to rest in the far middle distance. The move
decelerates smoothly and never reverses. The horizon stays level; no roll,
no shake.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```

---

## 8. BEAT F — previz 4.67–5.00s，取用 0.33s

**Reference image：** `assets/prepped/daruma_standing_back_rucksack.png`

```bash
ffmpeg -ss 4.67 -i previz_part2.mp4 -t 0.33 -c copy beat_F_drive.mp4
```

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused
to the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the
frame, and the direction of travel. Take NOTHING of its appearance: its
untextured grey surfaces, flat shading, low-polygon faceting, placeholder
proportions and empty blockout environment must not reach the output. All
appearance — shape, materials, colour, texture, costume, proportions and
environment — comes solely from the reference image and the description
below. Where the blueprint and the reference image disagree, motion follows
the blueprint and appearance follows the reference image.

Action: the daruma glides away from the viewer down the centre of the
street, seen from directly behind, standing upright with both feet together
on the scooter deck. The brown rucksack and bedroll are the dominant
silhouette and stay locked to the shell. The scooter tracks a perfectly
straight line and is visible only as a thin stem and two small wheels below
the body. There is no stepping cycle.

Camera: the camera is locked off. The subject holds its position and size in
the far middle distance for the whole shot and nothing else in frame moves.
The horizon stays level; no roll, no shake, no drift.

Environment: A narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a
dark mesh gate across the far end, patterned paving with yellow grid
markings. The street is completely empty: no pedestrians, no traffic, no
crowd. Barriers, scaffolding, sandbags and all street furniture remain
perfectly static.

Light: Overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted
teal — unchanged from first to last frame.

Style: Photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd, no
camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text
overlay
```
