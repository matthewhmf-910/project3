# 「就要那一口汽泡」素材生成提示詞總集

本文件把這次企劃的所有提示詞整理在一起，分成四部分：

1. **企劃提示鏈**：已填入本概念的 Gemini 提示詞（鉤子、腳本、分鏡）
2. **風格基準**：所有圖像與影片提示詞共用的角色、配色、光線設定
3. **素材提示詞**：角色、道具、場景的靜態圖像提示詞
4. **鏡頭提示詞**：22 個鏡頭的影片生成提示詞，以及音效、配樂、字幕規格

圖像與影片提示詞用英文撰寫，因為多數生成工具對英文的理解較準確；畫面上的字幕一律用繁體中文，在後製加入，不交給 AI 生成。

---

## 一、企劃提示鏈

### 1. 開場鉤子

```
For the video idea "Just One Fizz" — a stressed backpacker-traveler character in Taipei is buried under paper stacks and laptops sliding in from both sides of the frame. Breaking the fourth wall, the character shouts at the audience, pushes away a bottle of beer, a fine-dining plate, and a bowl of snacks, and only wants to grab a fizzy citrus lemon cold brew standing on a small floating terrain at the top of the frame — write 5 powerful hooks for the first 3 seconds. Make each one spark curiosity, trigger an emotional reaction, and leave viewers desperate to know what happens next. Keep them short, punchy, and impossible to ignore. Write all spoken lines and on-screen text in Traditional Chinese.
```

### 2. 35 秒腳本

```
Write a high-retention 35-second video script for the idea "Just One Fizz" (described above). Start with a powerful hook, deliver 3 quick and valuable points, and end with a memorable closing line. The 3 points must be useful to backpackers and travelers in Taipei:
1. In hot, humid Taipei weather, choose something light and refreshing instead of heavy food or drinks.
2. How to make a fizzy lemon cold brew in a hostel without a coffee machine (cold brew + sparkling water + lemon).
3. How to keep it cold and keep the fizz (refrigerate the cold brew, add ice before leaving, add sparkling water last).
Use short, conversational sentences that sound natural out loud. Make every second count and keep viewers watching until the end. Write in Traditional Chinese.
```

### 3. 分鏡表

```
Transform my script into a scroll-stopping shot list. For every line, specify the visuals, camera angle, on-screen text, and exact duration. Keep the pacing fast, the visuals engaging, and every shot purposeful. Make the video feel dynamic enough to hold attention until the final second. Total length must be exactly 35 seconds, vertical 9:16. Reuse the same wide camera position for the opening chaos shot and the frozen closing shot. Write on-screen text in Traditional Chinese.
```

---

## 二、風格基準

把以下段落貼在每一個圖像或影片提示詞的最前面，確保 22 個鏡頭看起來像同一支影片。

```
STYLE ANCHOR — "Just One Fizz"

Format: vertical 9:16, 1080 × 1920 px, cinematic short-form video still.

Character: a young adult backpacker in their mid-20s, East Asian, short messy black hair, light olive linen shirt with rolled sleeves, a small canvas crossbody bag, expressive face. Same character in every shot.

Look: high-energy, slightly surreal comedic realism. Bold, punchy, sci-fi-tinged commercial energy — clean and modern, not cartoon.

Color palette:
- Chaos world: cool desaturated grey-blue, harsh fluorescent office white
- Hero product: vivid lemon yellow, fresh citrus green, amber cold-brew brown, sparkling white highlights
- The cold brew bottle is always the most saturated, brightest object in the frame.

Lighting: chaos scenes use flat, cold overhead fluorescent light; hero product shots use a soft warm rim light with a subtle glow and crisp backlight on bubbles and ice.

Texture: realistic condensation droplets, visible carbonation bubbles, paper with real fibre and slight crumpling.

Avoid: real brand logos or labels, readable text inside the image, energy-drink trademarks or slogans, cartoon or anime style, distorted hands, extra fingers, warped faces, cluttered backgrounds.
```

---

## 三、素材提示詞

### A1. 角色設定圖（先產出，作為之後所有鏡頭的參考圖）

```
[STYLE ANCHOR]

Create ONE character reference sheet on a plain light-grey background.

Show the same character in 4 poses, arranged left to right:
1. Overwhelmed: hands on head, eyes wide, looking straight into the camera
2. Rejecting: one flat palm pushed forward toward the camera, head shaking
3. Shouting: mouth wide open, leaning toward the camera, pointing upward
4. Relieved: eyes half closed, holding a glass bottle, exhaling with a calm smile

Full body, consistent outfit, consistent face and hair in all 4 poses. Even studio lighting. No text, no labels.
```

### A2. 主角商品：檸檬氣泡冷萃

```
[STYLE ANCHOR]

Hero product shot of a tall clear glass bottle filled with fizzy lemon cold brew: amber-brown cold brew in the lower half blending into sparkling, slightly lighter liquid above, rising carbonation bubbles, a thin lemon wheel pressed against the inside of the glass, two clear ice cubes, heavy condensation droplets on the outside.

No label, no logo, no text on the bottle — a plain clear bottle with a simple metal cap.

Dark neutral background, warm rim light from behind, crisp backlight making the bubbles glow. Macro-sharp focus on the bubbles and droplets. Mouth-watering, refreshing, premium.
```

### A3. 浮空小地形

```
[STYLE ANCHOR]

A small floating island of terrain hovering in mid-air, about the size of a dinner plate: a chunk of earth and rock with moss and tiny green grass on top, small roots and pebbles hanging from the underside, a few tiny particles drifting off it.

The fizzy lemon cold brew bottle from the hero product shot stands upright in the center of the grassy top, glowing softly with a warm yellow halo.

Cold grey-blue background below fading into soft light above. Slightly magical, sci-fi, aspirational — the one bright and calm object above the chaos. Composition places the island in the top third of a 9:16 frame.
```

### A4. 混亂辦公場景（鏡號 1、21 共用）

```
[STYLE ANCHOR]

Wide, front-facing, locked-off shot of a small desk area overwhelmed by work: towering, leaning stacks of white paper rising from the bottom of the frame, loose sheets flying in the air, two open laptops sliding in from the left and right edges toward the center, glowing screens with blurred spreadsheets (no readable text).

The character sits in the exact center, small and overwhelmed. Harsh cold fluorescent overhead light, grey-blue tones, slight motion blur on the flying paper.

Top third of the frame is left as clean empty space for the floating terrain to appear later.
```

### A5. 被拒絕的三樣干擾物

各別生成，再於後製中從畫面右側滑入。

```
[STYLE ANCHOR]

Product cutout on a transparent or plain white background, front three-quarter view, studio light:

(a) A plain brown glass beer bottle with no label, cold, small droplets.
(b) An elegant fine-dining plate: a small seared steak with a sauce swirl and microgreens on a wide white porcelain plate.
(c) A ceramic bowl overflowing with mixed snacks — chips, crackers, and nuts.

No logos, no text, no brand markings.
```

### A6. 台北悶熱街景（鏡號 8）

```
[STYLE ANCHOR]

Handheld medium shot on a busy Taipei street in summer: arcade-covered sidewalk (騎樓), scooters parked in rows, shop signs blurred into soft colour (no readable text), visible heat haze shimmering off the asphalt, harsh midday sun.

The character walks toward the camera, wiping sweat from their forehead with the back of their hand, shirt slightly damp, squinting. Warm, oppressive, humid atmosphere.
```

### A7. 民宿桌面（鏡號 11–15）

```
[STYLE ANCHOR]

A small, clean hostel room table by a window with soft daylight: a clear glass with ice, a small jar of cold brew concentrate, a can of plain sparkling water (no label), half a fresh lemon on a small wooden board, a backpack resting against the table leg.

Bright, fresh, simple, inviting. Natural light, airy tones, a contrast to the cold chaos scenes.
```

### A8. 冰箱內視角（鏡號 16）

```
[STYLE ANCHOR]

Shot from inside a small hostel refrigerator looking out as the door opens: a jar of cold brew in the foreground, cool white fridge light spilling onto the character's face, the dim room behind them. Crisp, cool, refreshing.
```

---

## 四、鏡頭提示詞（影片生成）

每一段影片提示詞前都要貼上 **[STYLE ANCHOR]**，並附上角色設定圖（A1）作為參考圖。秒數是成片長度，建議每段多生成 1 秒，方便剪輯。

### 開場鉤子與衝突（0–8.5 秒）

| 鏡號 | 秒數 | 影片提示詞 |
|---|---|---|
| 1 | 1.5 | Use scene A4. Locked-off wide shot. Paper stacks surge upward from the bottom of the frame while two laptops slide in from left and right and meet at the center. Fast, chaotic, slight camera shake. |
| 2 | 1.5 | The character snaps their head up and stares directly into the camera, eyes wide. Fast push-in from medium to close-up at eye level. |
| 3 | 1.5 | Medium shot, slightly low angle. A plain brown beer bottle (A5a) slides in from the right; the character pushes it out of frame with a flat palm. |
| 4 | 1.5 | Same camera position. A fine-dining plate (A5b) slides in from the right; the character pushes it away, shaking their head. |
| 5 | 1.0 | Same camera position. A snack bowl (A5c) slides in; the character pushes it away even faster, annoyed. |
| 6 | 1.5 | Extreme close-up, low angle, handheld shake. The character shouts at the camera, mouth wide open; loose papers blow upward around them. |

### 重點一：熱天先選清爽的（8.5–15.5 秒）

| 鏡號 | 秒數 | 影片提示詞 |
|---|---|---|
| 7 | 2.0 | Slow tilt up from the character's face to the top of the frame, revealing the floating terrain (A3) with the glowing lemon cold brew bottle. Bubbles rise inside the bottle. |
| 8 | 2.0 | Use scene A6. Handheld medium shot, the character walks through heat haze wiping sweat from their forehead. |
| 9 | 1.5 | Top-down shot. The fine-dining plate slides slowly away across a table, out of frame. |
| 10 | 1.5 | Top-down shot on a clean surface. A jar of cold brew, a can of sparkling water, and half a lemon pop into frame one by one with a small bounce. |

### 重點二：民宿也能自己做（15.5–23 秒）

| 鏡號 | 秒數 | 影片提示詞 |
|---|---|---|
| 11 | 1.5 | Use scene A7. Front eye-level shot of the hostel table, the character gestures "no" at the empty space where a coffee machine would be. |
| 12 | 1.5 | Side macro shot. Amber cold brew pours into a glass of ice, swirling. |
| 13 | 1.5 | Side macro shot. Sparkling water pours in, carbonation bubbles erupting and rising fast. |
| 14 | 1.5 | Slow-motion macro. A hand squeezes a lemon half; juice droplets fall into the glass. |
| 15 | 1.5 | Medium close-up, eye level. The character raises the finished glass toward the camera with a confident grin. |

### 重點三：保持冰涼（23–30 秒）

| 鏡號 | 秒數 | 影片提示詞 |
|---|---|---|
| 16 | 2.0 | Use scene A8. Inside-the-fridge POV as the door opens; cool light falls on the character's face as they reach for the cold brew jar. |
| 17 | 1.5 | Slow-motion macro. Clear ice cubes drop into a glass, splashing lightly. |
| 18 | 2.0 | Tracking shot from behind. The character slides a sealed bottle into the side pocket of their backpack and walks out of the hostel door into daylight. |
| 19 | 1.5 | Macro close-up. Bubbles rise steadily inside the sealed bottle, lit from behind. |

### 收尾（30–35 秒）

| 鏡號 | 秒數 | 影片提示詞 |
|---|---|---|
| 20 | 1.5 | Close-up. The character's hand closes firmly around the glowing bottle on the floating terrain; behind it, flying papers freeze in mid-air. |
| 21 | 1.5 | Use scene A4, the exact same locked-off wide camera position as shot 1. Everything is frozen — papers suspended in air, laptops stopped mid-slide — while the character, in the center, calmly sips the cold brew. |
| 22 | 2.0 | Close-up, slow push-in. The character lowers the bottle, closes their eyes, exhales, and smiles with relief. Warm light gradually replaces the cold fluorescent tone. |

---

## 五、音效與配樂

### 配樂提示詞

```
35-second instrumental track for a vertical short video. 0–8s: tense, fast, glitchy electronic build with ticking hi-hats and a rising synth drone. 8–30s: upbeat, punchy, energetic electronic groove at around 120 BPM with clean sharp hits on every beat. At 30s: hard cut to near silence. 31–35s: a light, airy, warm outro with soft plucked synth notes. No vocals.
```

### 音效清單

| 鏡號 | 音效 |
|---|---|
| 1 | 紙張沙沙聲、鍵盤敲擊聲、逐漸升高的嗡嗡聲 |
| 3–5 | 每次推開物件的「咻」聲，速度一次比一次快 |
| 6 | 大喊時紙張飛起的風聲 |
| 7、19 | 細微的汽泡上升聲 |
| 12–14 | 倒液體聲、氣泡翻騰聲、檸檬擠壓聲 |
| 16 | 冰箱門打開聲與低沉的冷氣聲 |
| 17 | 冰塊落入杯中的清脆聲 |
| 20 | 全片最響亮的開瓶汽泡聲，前一刻完全靜音 |

---

## 六、字幕規格

字幕在後製加入，不要讓 AI 生成畫面中的文字。

- **字型：** 粗黑體，例如思源黑體 Heavy 或 Noto Sans TC Black
- **顏色：** 白字加深色描邊；收尾字卡改用檸檬黃
- **位置：** 畫面中下方，避開頂端浮空地形與平台介面區域
- **長度：** 每張字卡 8 個字以內
- **編號字幕：** 重點二的配方使用 ①②③，方便觀眾截圖

| 鏡號 | 字幕 |
|---|---|
| 1 | 第 47 份報告 |
| 2 | 停！ |
| 3 | 不要。 |
| 4 | 不要。 |
| 5 | 現在不行。 |
| 6 | 我只要汽泡的！ |
| 7 | 它就在那裡 |
| 8 | 台北夏天，又熱又悶 |
| 9 | 重口味＝更累 |
| 10 | 冷萃＋氣泡＋檸檬 |
| 11 | 不用咖啡機 |
| 12 | ① 冷萃 1 份 |
| 13 | ② 氣泡水 1 份 |
| 14 | ③ 檸檬少許 |
| 15 | 30 秒完成 |
| 16 | 冷萃要冷藏 |
| 17 | 出門前加冰 |
| 18 | 氣泡水最後加 |
| 19 | 汽泡不流失 |
| 22 | 有時候，你只需要那一口汽泡。 |

---

## 製作順序建議

1. 先生成 **A1 角色設定圖**與 **A2 主角商品**，確認造型後再進行其他素材。
2. 把 A1、A2 作為參考圖，生成 A3 到 A8 的場景與道具。
3. 依鏡號生成影片片段，每段多留 1 秒剪輯空間。
4. 剪輯時先對齊配樂節拍，再加入音效與字幕。
5. 發布前確認：沒有出現任何真實品牌標誌；「汽泡」「檸檬」等描述與實際產品相符。
