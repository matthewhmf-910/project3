# Project Macau — Omni 1.1 逐鏡 Prompt（完整可貼版）

每個 beat 一個獨立生成。**整段複製貼上，不要刪減 Rigidity / Negative 段。**
配套：`macau_omni11_shot_contract.json`（機器可讀版）、`../docs/macau_omni11_rig_fidelity_prompt_system.md`（原理與限制表）

> **本檔是「prompt 本體」庫，不是分鏡表。**
> 哪一段 prompt 用在 previz 的哪個時間碼、生成多長、取用多長，
> 一律看 [`../docs/previz_measured_beatmap.md`](../docs/previz_measured_beatmap.md) 的實測 beat map。
> 舊標題上的目測時間碼已移除，因為實測顯示那些剪接點不成立。

---

## 0. 每次生成前的設定（Omni 1.1 面板）

| 欄位 | 設定 | 原因 |
|---|---|---|
| Reference image | 見各 beat 標註，**一張，PNG，短邊 ≥1024，透明或中性灰底** | 多圖會平均化 identity |
| Motion reference | previz 對應區段，**只截該 beat 的秒數** | 餵長了會帶進下一個鏡頭的運動 |
| Motion strength / 影響強度 | **0.55–0.70**（不要拉滿） | 拉滿會把 greybox 灰白質感一起 transfer 過來（H10） |
| Duration | 2s（E1/E2 各 2s） | 每個 beat ≤3s 是 identity 不漂的門檻 |
| Aspect / fps | 9:16 / 30fps | 對齊 previz |
| Resolution | 720p | 之後統一 upscale + grain match 回 plate |
| Seed | **固定並記錄** | 重 roll 時只改一個變數才知道是哪條 prompt 起作用 |
| Audio | 關閉 / 留空 | 本專案不做 lip-sync，開了會誘發臉部形變 |

---

## PROMPT BODY A — 接近（推近）
**Reference image：** Daruma 正面・騎滑板車

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
whole-body tilt about the base and from the short limbs. The head is fused to
the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the daruma glides straight down the centre of the street toward the
viewer at a steady walking pace, standing upright on a small black kick
scooter with both feet together on the deck. It does not push off the ground
and there is no stepping cycle — the glide is smooth and continuous. Both
hands rest on the handlebar and never leave it. The scooter is a thin stem and
two small wheels below the body, mostly hidden behind the legs. The rucksack
holds its position. The printed eyes stay fixed forward.

Camera: the subject starts small in the middle distance and grows steadily
larger, staying on the centre line of the street. The building walls converge
to a vanishing point directly behind the subject. The ground line sits low in
frame. The horizon stays level; no camera roll, no shake, no acceleration.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a dark
mesh gate across the far end, patterned paving with yellow grid markings. The
street is completely empty: no pedestrians, no traffic, no crowd. Barriers,
scaffolding, sandbags and all street furniture remain perfectly static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows
under the scooter and body, no hard sun. Warm desaturated pastel palette —
cream, ochre, sage, muted teal — unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text overlay.
```

---

## PROMPT BODY B — 逼近特寫（快速推近）
**Reference image：** Daruma 正面近景・相機掛胸

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
whole-body tilt about the base and from the short limbs. The head is fused to
the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the daruma glides directly at the viewer, standing upright with both
feet together on the scooter deck, body tilted very slightly forward, both
hands resting on the handlebar and never leaving it. There is no stepping
cycle. The printed eyes stay fixed forward and do not blink or change
expression. The rucksack and camera strap hold their positions.

Camera: the subject fills the frame rapidly until the head and upper body
occupy roughly the upper third and the red shell dominates the centre. The
background compresses and softens behind it. Framing stays centred and level;
no camera roll, no shake.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a dark
mesh gate across the far end, patterned paving with yellow grid markings. The
street is completely empty: no pedestrians, no traffic, no crowd. Barriers,
scaffolding, sandbags and all street furniture remain perfectly static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows
under the scooter and body, no hard sun. Warm desaturated pastel palette —
cream, ochre, sage, muted teal — unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no blinking, no facial expression
change, no colour temperature shift, no cuts, no transitions, no text overlay,
no face enlargement, no head detaching from body.
```

---

## PROMPT BODY C — 背向遠離（拉遠）
**Reference image：** Daruma 背面・背包全見

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, brown leather rucksack with a rolled
bedroll strapped to the back, thick leather straps crossing the shell, short
stubby limbs, dark canvas sneakers. Proportions, colours and every strap
position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from
whole-body tilt about the base and from the short limbs. The head is fused to
the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the daruma glides away from the viewer down the centre of the street,
seen from directly behind, standing upright with both feet together on the
scooter deck. The brown rucksack and bedroll are the dominant silhouette and
stay locked to the shell. The scooter tracks a perfectly straight line and is
visible only as a thin stem and two small wheels below the body. There is no
stepping cycle.

Camera: the subject shrinks steadily toward the vanishing point as more
street enters the frame edges. The walls stay parallel to the frame edges.
The horizon stays level; no roll, no shake, no acceleration.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a dark
mesh gate across the far end, patterned paving with yellow grid markings. The
street is completely empty: no pedestrians, no traffic, no crowd. Barriers,
scaffolding, sandbags and all street furniture remain perfectly static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows
under the scooter and body, no hard sun. Warm desaturated pastel palette —
cream, ochre, sage, muted teal — unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no cloth folds, no colour temperature shift, no cuts,
no transitions, no text overlay, no turning around, no face visible from
behind, no strap drifting.
```

---

## PROMPT BODY D — 越肩極近景 / 由左入畫 ⚠️ 高風險
**Reference image：** Daruma 3/4 背側・騎滑板車（你提供的第 5 張）
**建議：先跑一輪單次生成；若崩則直接改走底下的 2.5D 方案。**

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a rigid
egg-shaped red shell with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, brown leather rucksack with a rolled
bedroll, thick leather straps crossing the shell, seen from behind and
slightly above in extreme close-up.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist — it has no waist. The head is fused to the body. Do not add
a neck, shoulders, articulated fingers or a human silhouette. The shell
surface texture is painted on and moves rigidly with the shell; it must not
slide, smear or crawl across the surface.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: only the curved red shell, the rucksack straps and the right edge of
the white head are visible in the near foreground. The daruma continues
riding forward. Nothing about the shell deforms.

Camera: the red shell occupies the left third of the frame in the near
foreground and slides slowly toward the left edge, while the street beyond
stays sharp and opens up on the right. Parallax between foreground shell and
background street is gentle and continuous. The horizon stays level; no roll,
no whip, no shake.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers, patterned
paving with yellow grid markings. The street is completely empty: no
pedestrians, no traffic, no crowd. All street furniture remains perfectly
static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted teal
— unchanged from first to last frame.

Style: photoreal miniature-diorama render, physically based materials, the
foreground shell sharp and the mid-ground street sharp, 9:16 vertical, 30fps.

Negative: no foreground smearing, no ghosting, no texture sliding on the
shell, no duplicated limbs, no untextured grey blockout, no low-poly
faceting, no previz look, no legible signage text, no speed lines, no motion
streaks, no lens flare, no added vignette, no film grain overlay, no extra
characters, no crowd, no camera roll, no morphing of the body shape, no human
proportions, no neck, no articulated fingers, no colour temperature shift,
no cuts, no transitions, no text overlay.
```

**2.5D fallback（推薦直接用這個）：**
1. 用上面同一段 prompt，但把 Environment 段整段換成 `Plain neutral grey background, nothing else in frame.`，並在 Negative 加 `no background detail, no street`。
2. 生成角色單層 → 摳版成透明底。
3. plate 用 After Effects / Nuke 做 2.5D parallax 推鏡。
4. 合成，加回接觸陰影與微量 defocus。

---

## PROMPT BODY E1 — 前導追蹤（等距）
**Reference image：** 與 Beat A **同一張**（維持 identity 連續）

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
whole-body tilt about the base and from the short limbs. The head is fused to
the body and cannot rotate independently. Do not add a neck, a torso,
shoulders, articulated fingers or a human silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the daruma glides toward the viewer at a steady pace, holding a
constant position in the centre of the frame, standing upright on the kick
scooter with both feet together on the deck. There is no stepping or push-off
cycle. Both hands rest on the handlebar and never leave it. The printed eyes
stay fixed forward and do not blink.

Camera: the subject stays centred and exactly the same size throughout, while
the building walls slide backwards past the left and right frame edges at a
constant rate. This must read as one smooth continuous move with no
acceleration, no easing and no shake. The horizon stays level.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a dark
mesh gate across the far end, patterned paving with yellow grid markings. The
street is completely empty: no pedestrians, no traffic, no crowd. Barriers,
scaffolding, sandbags and all street furniture remain perfectly static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows
under the scooter and body, no hard sun. Warm desaturated pastel palette —
cream, ochre, sage, muted teal — unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no morphing of the body shape, no size drift, no human
proportions, no neck, no articulated fingers, no cloth folds, no blinking,
no facial expression change, no colour temperature shift, no cuts, no
transitions, no text overlay.
```

---

## PROMPT BODY E2 — 拉遠收尾
**Reference image：** **E1 的最後一幀**（last-frame → first-frame 續接）

```
A 2-second continuous shot, no cuts, continuing seamlessly from the reference
frame.

The subject is the red daruma traveler exactly as in the reference frame: a
single egg-shaped red body with a matte ceramic surface and fine crackle
texture, gold floral motif, printed cartoon eyes, brown leather rucksack with
bedroll, vintage camera on a strap, riding a black kick scooter. Proportions,
colours and strap positions are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. The head is fused to the
body. Do not add a neck, shoulders, articulated fingers or a human
silhouette.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the daruma continues gliding forward, unchanged, both feet together on
the deck and both hands on the handlebar. There is no stepping or push-off
cycle.

Camera: the subject shrinks slowly toward the centre of frame as more of the
street enters the edges, coming to rest in the far middle distance. The move
decelerates smoothly and never reverses. The horizon stays level; no roll,
no shake.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers and a dark
mesh gate across the far end, patterned paving with yellow grid markings. The
street is completely empty: no pedestrians, no traffic, no crowd. Barriers,
scaffolding, sandbags and all street furniture remain perfectly static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows,
no hard sun. Warm desaturated pastel palette — cream, ochre, sage, muted teal
— unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based materials, 9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no morphing of the body shape, no human proportions, no neck,
no articulated fingers, no blinking, no facial expression change, no colour
temperature shift, no cuts, no transitions, no text overlay, no re-approach,
no direction reversal.
```

---

## 附錄 — LEGO 騎士 + 摩托車 + 蛋撻（同場景備用鏡）

previz Part 2 沒有這組，但素材表有。若要在同一條街生成，**必須把騎士＋車＋蛋撻當成一個合成剛體**（用你已合成好的單張 PNG 作 reference），否則四個主體會互相打架（H8）。

**Reference image：** LEGO 男騎士 + 黑色機車 + 蛋撻（已合成單張 PNG）

```
A 2-second continuous shot, no cuts.

The subject is the LEGO minifigure rider and motorcycle from the reference
image, treated as one single rigid object: injection-moulded ABS plastic,
yellow cylindrical head with a flat printed face and thick black brows,
moulded black hair piece, black torso with moulded arm sockets, C-clip claw
hands gripping the handlebar, solid one-piece legs, a black scrambler
motorcycle with chrome exhaust, red shock spring and knobbly tyres, and a
single oversized Portuguese egg tart seated in the front cargo rack. Plastic
seams, sprue marks, surface sheen and the tart's caramelised top are
identical to the reference and never change.

The figure is rigid moulded plastic with exactly six points of articulation:
neck, two shoulders, two hips, and wrists that rotate only. Limbs are
straight cylinders and do not bend at elbow or knee. The face is a flat
printed decal that never deforms, blinks or emotes. The rider, the motorcycle
and the egg tart move together as one locked assembly. Do not add cloth
folds, skin, muscle deformation or human-like weight shift.

Motion blueprint: the attached driving video is a greybox previz and is the
authority on MOTION ONLY. Follow it exactly for timing, trajectory and
framing — the subject's speed and rhythm, the instant it enters and leaves
frame, how large it sits in frame at every moment, its path across the frame,
and the direction of travel. Take NOTHING of its appearance: its untextured
grey surfaces, flat shading, low-polygon faceting, placeholder proportions and
empty blockout environment must not reach the output. All appearance — shape,
materials, colour, texture, costume, proportions and environment — comes
solely from the reference image and the description below. Where the blueprint
and the reference image disagree, motion follows the blueprint and appearance
follows the reference image.

Action: the rider and motorcycle travel straight down the centre of the
street toward the viewer at a steady pace. Only the wheels rotate. The egg
tart stays firmly seated in the rack and does not wobble, tilt or float.
The claw hands stay clamped on the handlebar.

Camera: the subject grows steadily larger while staying on the centre line of
the street. The building walls converge to a vanishing point behind it. The
horizon stays level; no camera roll, no shake, no acceleration.

Environment: a narrow Macau old-town street exactly as in the plate —
colonial shophouse facades in cream, ochre, sage and pale blue, green iron
railings, a wrought-iron street lamp, red-and-white crowd barriers, patterned
paving with yellow grid markings. The street is completely empty: no
pedestrians, no traffic, no crowd. All street furniture remains perfectly
static.

Light: overcast diffuse daylight from the upper frame, soft contact shadows
under both wheels, no hard sun. Warm desaturated pastel palette — cream,
ochre, sage, muted teal — unchanged from first to last frame.

Style: photoreal miniature-diorama render, shallow tilt-shift depth of field
with the subject sharp, physically based plastic and chrome materials,
9:16 vertical, 30fps.

Negative: no untextured grey blockout, no low-poly faceting, no previz look,
no legible signage text, no speed lines, no motion streaks, no lens flare,
no added vignette, no film grain overlay, no extra characters, no crowd,
no camera roll, no bending limbs, no elbow or knee joints, no human hands,
no skin, no cloth folds, no facial expression change, no blinking, no tart
detaching or floating, no separate motion between rider and bike, no colour
temperature shift, no cuts, no transitions, no text overlay.
```

---

## 重 roll 決策表（不要盲目換 seed）

| 出了什麼問題 | 改哪一個變數（一次只改一個） |
|---|---|
| 達摩長出脖子/肩膀 | Rigidity Block 移到 Action **之前**已是最佳位置 → 改換更貼角度的 reference 圖 |
| 成品帶灰白 previz 感 | Motion strength 降到 0.45–0.55 |
| 動作跟不上 previz | Motion strength 升到 0.75，但 negative 的 H10 條款要加碼 |
| 主體大小在鏡頭中漂 | 該 beat 對半切成兩段 1s |
| 鏡頭亂動 | 把 Camera 段只留「主體在畫面中的大小與位置變化」，刪掉所有空間描述 |
| 招牌文字亂寫 | 後期把 plate 的招牌區域貼回，不要再 roll |
| 蛋撻 / 背包飄走 | 換成合成單圖；或該元素改後期貼合成 |
