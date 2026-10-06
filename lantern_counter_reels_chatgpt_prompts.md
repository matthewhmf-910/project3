# 夜間吧檯的燈籠 · Instagram Reels 製作檔

**用途：** 將以下 prompt 逐一貼入 ChatGPT，生成 6 格關鍵幀，再用影片工具將關鍵幀連成一條 13.5 秒嘅 Reels。

**方向：** C「夜間吧檯的燈籠」
**結構：** 點 → 線 → 弧 → 面，最後無縫循環

---

## 0. 使用步驟

1. 開一個新嘅 ChatGPT 對話，**上傳原本嗰張丼飯相**，貼上第 5 節嘅「開場訊息」。
2. 跟住第 6 節嘅次序，**每次只貼一個 prompt**，生成一張圖。
3. 每張圖出完，對照該格嘅「檢查」清單。唔啱就貼「修正句」，**唔好重新開對話**，否則碗同食物會變樣。
4. 生成次序係 **K6 → K2 → K1 → K3 → K4 → K5**(唔係 K1 開始)。先出主視覺，其餘幾格都由佢改出嚟，一致性最好。
5. 6 格齊晒之後，按第 8 節用影片工具生成 4 段動態，再按第 9 節剪接。

---

## 1. Canvas Summary

| 項目 | 設定 |
|---|---|
| 畫布 | 1080 × 1920 px，9:16 直幅(Reels 母版) |
| Feed 4:5 裁切 | 中間 1080 × 1350，y 285–1635 |
| 主頁格仔 3:4 裁切 | 中間 1080 × 1440，y 240–1680 |
| 頂部暗位 | y 0–288，純深黑 |
| 底部文案安全區 | y 1440–1920，只有深色胡桃木同碗腳倒影 |
| 右側 IG 按鈕區 | x 950–1080，y 1100–1700，保持暗位，唔放重要元素 |
| 安全邊距 | 72 px |
| 主光 | 單一暖色逆光，右後方(4 點鐘方向)，照向左下 |
| 關鍵幀內文字 | 無。所有文字之後喺剪片軟件加，保持可編輯 |

> **如果 ChatGPT 出唔到 9:16：** 佢會出 1024 × 1536(2:3)。左右各裁走 80 px，變成 864 × 1536，再放大到 1080 × 1920。所有 prompt 已經將重要元素放離左右邊緣 8% 以上，裁切唔會切到。

---

## 2. 幾何原則

1. **兩個三角形，一正一倒。** 食物係實體正三角形(頂點係海膽)。三個亮點(發光鮭魚卵、清酒杯、琥珀光點)連成倒三角形。
2. **圓形由細到大。** 鮭魚卵 → 清酒杯口 → 碗口 → 背景光斑。同一個圓形喺唔同尺度重複出現。
3. **一條主對角線。** 光由右上照落左下。全片六格都唔改光嘅方向。
4. **曲線中只有一條直線。** 海苔係唯一嘅直邊，斜立約 15°。
5. **黃金分割，唔放正中。** 海膽頂點放喺 0.38 / 0.40。
6. **明暗分三層。** 最亮係逆光鮭魚卵，中間調係蟹肉、米飯、海苔邊光，最暗係背景同木面。唔加第四種亮點。

**視線路徑(主視覺)：** 發光鮭魚卵 → 海膽 → 沿主對角線到清酒杯 → 琥珀光點 → 沿倒三角形返回碗。

---

## 3. Component Table(1080 × 1920 px)

### K6｜主視覺(全片最後一格，亦係封面)

| ID | 元素 | X | Y | W | H | 作用 |
|---|---|---|---|---|---|---|
| bowl | 條紋高腳碗連食物 | 119 | 690 | 540 | 692 | 實體三角形，中軸 x = 389 |
| uni_apex | 海膽頂點 | 410 | 768 | — | — | 黃金分割點 |
| nori | 海苔 | 200 | 840 | 110 | 200 | 唯一直邊，斜 15° |
| ikura_trail | 鮭魚卵軌跡 | 430 | 780 | 200 | 380 | 碗嘅遠側，逆光發亮 |
| sake_glass | 清酒杯(虛焦) | 766 | 960 | 110 | 155 | 倒三角形一角，中心 (821, 1037) |
| amber_light | 琥珀光點(虛焦) | 899 | 488 | 60 | 60 | 倒三角形頂點，中心 (929, 518) |
| counter | 胡桃木面 | 0 | 1382 | 1080 | 538 | 文案安全區 |
| neg_space | 右側暗位 | 680 | 288 | 400 | 1150 | 約 45% 負空間 |

### K1 / K2｜點燈

| ID | 元素 | K2 位置 | 備註 |
|---|---|---|---|
| bowl | 碗連食物 | x 54–724，y 600–1420 | 比 K6 近，碗中軸 x = 389 |
| match_pearl | 最亮嗰粒卵 | **(626, 826)** | 必須同 K3 一致 |
| amber_light | 琥珀光點 | (929, 518) | 同 K6 |
| K1 | 同 K2 構圖，闊 4% | — | 逆光幾乎全熄 |

### K3 / K4｜沿線(微距)

| ID | 元素 | 位置 | 備註 |
|---|---|---|---|
| K3 match_pearl | 海膽下第一粒卵 | **(626, 826)** | 同 K2 位置配對 |
| K3 uni | 海膽 | y 480–760 | 清晰對焦 |
| K4 last_pearls | 米飯上最後幾粒卵 | 約 (540, 1150) | 清晰對焦 |
| K4 stripe_arc | 碗口條紋弧線 | 由左邊入，y 1150–1382 | 引向右邊，接第三鏡 |

### K5｜圓的韻

| ID | 元素 | 位置 | 備註 |
|---|---|---|---|
| glass_rim | 清酒杯口橢圓 | 中心 (648, 960)，闊約 380 | 清晰對焦，逆光發亮 |
| bowl_blur | 條紋碗(虛焦) | x 0–300 | 喺左邊模糊 |

### 可選文字(剪片時加，唔好叫 ChatGPT 生成)

| ID | 內容 | X | Y | W | H | 出現時間 |
|---|---|---|---|---|---|---|
| txt_name | 店名(細細一行) | 640 | 340 | 368 | 60 | 10.5–12.5 秒定格時 |

---

## 4. JSON-Style Shot Contract

```json
{
  "canvas": { "width": 1080, "height": 1920, "fps": 24, "duration": 13.5 },
  "safeZones": {
    "feed4x5": { "y0": 285, "y1": 1635 },
    "grid3x4": { "y0": 240, "y1": 1680 },
    "captionZone": { "y0": 1440, "y1": 1920, "content": "dark walnut only" },
    "uiRight": { "x0": 950, "y0": 1100, "y1": 1700, "content": "shadow only" }
  },
  "rules": {
    "foodNeverMoves": true,
    "onlyCameraAndLightMove": true,
    "lightDirection": "back-right 4 o'clock toward lower-left, constant",
    "transitions": "hard cut only; continuity comes from composition",
    "textInFrames": false,
    "seamlessLoop": true
  },
  "shots": [
    { "id": 1, "name": "點燈", "element": "point", "start": "K1", "end": "K2", "sec": 3, "link": "match_pearl at (626, 826)" },
    { "id": 2, "name": "沿線", "element": "line",  "start": "K3", "end": "K4", "sec": 4, "link": "stripe arc enters from left" },
    { "id": 3, "name": "圓的韻", "element": "arc", "start": "K4", "end": "K5", "sec": 3, "link": "rack focus glass -> bowl" },
    { "id": 4, "name": "全景", "element": "plane", "start": "K5", "end": "K6", "sec": 3.5, "link": "light dims back to K1 for loop" }
  ]
}
```

---

## 5. ChatGPT 開場訊息(第一則訊息，連同原圖一齊上傳)

```
I am creating six keyframes for an Instagram Reel of the dish in the attached photo. The photo is the real dish. In every image, keep these exactly as in the photo: the high-footed porcelain donburi with tight, evenly spaced concentric cobalt-blue stripes on white glaze; the white sushi rice with toasted sesame; the steep cone of shredded pink-and-white crab meat; the golden uni on top; the salmon roe; the single sheet of crinkled nori; the cucumber slice; the small dab of wasabi. Realistic proportions. Nothing added.

Rules for every image:
- Vertical 9:16 (if not possible, 2:3, and keep all important content away from the outer 8% on the left and right).
- Low-key night scene at an omakase counter: oiled dark walnut counter, deep shadow background.
- One narrow warm backlight from behind and to the right (4 o'clock), raking toward the lower left, plus a very dim frontal fill so the crab stays pink and the uni stays golden.
- Palette: walnut brown, amber, coral orange, blush pink, ochre gold, cobalt blue.
- Natural film grain, true-to-life colour.
- No text, no logos, no hands, no steam, no splashes, no added garnish, no CGI gloss.

I will send one prompt at a time. Generate exactly one image per message. Reply "ready" now and wait.
```

---

## 6. 關鍵幀 Prompt(按以下次序)

### 第 1 張 · K6 主視覺

```
Keyframe K6 — hero shot. Editorial food photograph, vertical 9:16.

COMPOSITION: bowl on the left third, its vertical axis at 36% of frame width. The uni summit sits at 38% across, 40% down. The bowl foot ends at 72% down. The bowl spans roughly 11% to 61% of the frame width. Right side about 45% deep shadow as negative space. Top 15% pure darkness. Bottom 25% only dark walnut counter with a faint reflection of the bowl foot. Not centred, asymmetric.

ARRANGEMENT: bowl turned so the salmon roe trail (35–40 pearls) runs down the far side of the crab cone, toward the light. Nori leaning on the left flank at about 15 degrees, facing the camera, with a thin rim of light along its crinkled edge. Wasabi small on the near rim.

CAMERA: 30 degrees above the rim, looking slightly into the bowl so the cone's full height reads. 100mm lens, f/4. Focus through the uni and the front roe.

LIGHT: the backlight makes the roe glow from within like tiny lanterns and makes the rice grains shimmer. The concentric stripes fall half into shadow toward camera-left.

PROPS: one small clear glass of cold sake, out of focus, at 76% across, 54% down, its rim catching the backlight. One blurred warm amber point of light in the far background at 86% across, 27% down. Nothing else.
```

**檢查：**
- [ ] 海膽喺左上黃金點附近，唔係正中
- [ ] 碗嘅條紋同原圖一樣係密而均勻嘅同心圈
- [ ] 鮭魚卵係由內發光，唔係表面反白光
- [ ] 蟹肉仍然係粉紅色，唔係灰色
- [ ] 右邊有足夠暗位，下面四分一淨係木面
- [ ] 清酒杯同琥珀光點都係虛焦

**修正句：**
- 碗變咗：`Keep the bowl exactly as in the original photo: high foot, tight evenly spaced concentric cobalt stripes. Change nothing else.`
- 太光：`Make the scene darker and more low-key; keep only the backlight on the roe and a dim fill. Change nothing else.`
- 主體擺咗正中：`Move the bowl to the left third so its axis is at 36% of the width; leave the right side in deep shadow.`

---

### 第 2 張 · K2 點燈(結束)

```
Keyframe K2. Using the previous image as the base: same scene, same bowl, same light. Move the camera slightly closer so the bowl spans about 5% to 67% of the frame width and the bowl foot ends at 74% down. The backlight is at full strength: the roe glows translucent. The single brightest roe pearl must sit at exactly 58% across, 43% down. The amber point of light stays at 86% across, 27% down. Keep the sake glass out of frame or at the very edge in blur. Vertical 9:16.
```

**檢查：**
- [ ] 最亮嗰粒卵喺 (58%, 43%)，即係右中偏上
- [ ] 碗、食物同 K6 完全一致

---

### 第 3 張 · K1 點燈(開始)

```
Keyframe K1. Using the previous image (K2) as the base: identical bowl, food and position, but the camera is 4% wider. The backlight is almost off: the scene is near-black. Only the blurred amber point of light at 86% across, 27% down remains clearly visible, plus a faint thin rim of light along the top of the crab cone and the nori edge. The roe pearls are dark and barely visible. Vertical 9:16.
```

**檢查：**
- [ ] 幾乎全黑，但仍然認得出碗嘅輪廓
- [ ] 琥珀光點清楚
- [ ] 鮭魚卵未發光

---

### 第 4 張 · K3 沿線(開始)

```
Keyframe K3. Same dish, same light, now a 100mm macro shot, f/2.8, 35 degrees, vertical 9:16. Critical focus on the golden uni summit (between 25% and 40% down from the top) and the first roe pearl just beneath it. That first pearl must sit at exactly 58% across, 43% down, glowing in the backlight with a tiny specular highlight. Below it, the trail of roe descends vertically down the slope of shredded crab toward the lower part of the frame, falling out of focus. Upper area dark. Bottom 25% soft and dark.
```

**檢查：**
- [ ] 第一粒卵喺 (58%, 43%)，同 K2 最亮嗰粒同一位置(影片位置配對嘅關鍵)
- [ ] 海膽紋理清楚、完整，冇融化
- [ ] 下面嘅卵逐漸失焦

**修正句：**
- 配對卵位置唔啱：`Move the framing so the first roe pearl beneath the uni sits at 58% across, 43% down. Change nothing else.`

---

### 第 5 張 · K4 沿線(結束)

```
Keyframe K4. Same macro lens and light as the previous image, vertical 9:16. The camera has travelled down the slope: critical focus on the last few roe pearls resting on white rice and toasted sesame, centred around 50% across, 60% down. The crab slope rises softly out of focus toward the upper right. Two or three curved cobalt-and-white stripes of the bowl rim enter from the left edge between 60% and 72% down, forming an arc that leads to the right. Bottom 25% dark.
```

**檢查：**
- [ ] 米粒同芝麻有質感
- [ ] 條紋弧線由左邊入，向右引
- [ ] 弧線喺文案區(底部 25%)之上

---

### 第 6 張 · K5 圓的韻(結束)

```
Keyframe K5. Same scene and light, vertical 9:16. The camera has trucked right along the counter at bowl-rim height. A small clear glass of cold sake is in sharp focus, its rim centred at 60% across, 50% down and about 35% of the frame width across, glowing as a thin bright ellipse in the backlight. The ellipse echoes the curvature of the bowl rim. The striped bowl is soft and blurred at frame left, occupying the left 28% of the frame. Dark walnut counter with a soft reflection of the glass. Right edge and bottom 25% in shadow.
```

**檢查：**
- [ ] 杯口橢圓清晰、發亮
- [ ] 左邊見到模糊嘅藍白條紋
- [ ] 杯入面冇多餘嘢(冇冰、冇檸檬)

---

## 7. 9:16 裁切處理

- **出咗 1080 × 1920 或者其他 9:16：** 直接用。
- **出咗 1024 × 1536(2:3)：** 左右各裁 80 px，變成 864 × 1536，再放大到 1080 × 1920。
- 6 張必須用同一種方法處理，位置配對先會對得準。

---

## 8. 影片 Prompt(首幀＋尾幀)

用支援「首幀＋尾幀」嘅影片工具(例如 Sora、Kling、Runway、Veo)，每段上傳兩張關鍵幀，再貼對應 prompt。

### 鏡 1 · 點燈 · K1 → K2 · 3 秒
```
Static camera with a very slow, barely perceptible push-in. A warm backlight gradually rises from darkness, igniting the salmon roe pearls one by one from the top of the trail downward until they glow. Nothing in the bowl moves. Smooth, calm, cinematic. Vertical 9:16.
```

### 鏡 2 · 沿線 · K3 → K4 · 4 秒
```
Macro camera glides slowly down the slope of crab meat, following the trail of salmon roe from the uni to the rice, with a continuous rack focus that keeps the nearest pearls sharp. Highlights on the pearls shift naturally with the camera angle. Food completely still. Vertical 9:16.
```

### 鏡 3 · 圓的韻 · K4 → K5 · 3 秒
```
Slow lateral truck to the right at rim height. The blue-and-white striped bowl rim passes through the foreground out of focus, revealing a small glass of cold sake whose rim glows in the backlight. Constant speed, gentle ease at the end. Vertical 9:16.
```

### 鏡 4 · 全景 · K5 → K6 · 3.5 秒
```
Rack focus from the sake glass back to the bowl, then a slow dolly back revealing the full composition: bowl on the left third, uni summit at the golden-section point, deep shadow on the right. Settle and hold still for two seconds, then the backlight slowly dims over half a second until only the amber point and a faint rim light remain, matching the opening frame for a seamless loop. Vertical 9:16.
```

**全片動態規則：**
- 食物完全唔郁，唔會有流動、跌落或者煙。
- 只有鏡頭同光會郁。
- 四段速度一致，慢而穩，緩入緩出。
- 如果影片工具令食物變形或者郁動，喺 prompt 尾加：`The food is a still life and must not move or change shape.`

---

## 9. 剪接

| 時間 | 片段 | 備註 |
|---|---|---|
| 0.0–3.0 秒 | 鏡 1 | 由黑暗開始 |
| 3.0–7.0 秒 | 鏡 2 | 硬切，最亮嗰粒卵位置對齊 |
| 7.0–10.0 秒 | 鏡 3 | 硬切，條紋弧線接上 |
| 10.0–13.5 秒 | 鏡 4 | 定格 2 秒，最後 0.5 秒暗返 |

- **轉場：** 全部用硬切，唔加淡入淡出或者特效轉場。
- **循環：** 最後一格同 K1 一樣暗，IG 重播時會無縫接返。
- **文字(可選)：** 定格嗰 2 秒，喺 (640, 340) 加店名，細細一行，白色或者淺琥珀色。用剪片軟件加，唔好叫 AI 生成。
- **封面：** 用 K6。
- **Feed 輪播(額外)：** 將 K2、K3、K6 裁出中間 1080 × 1350，就係一個三張圖嘅輪播：光 → 細節 → 全貌。

---

## 10. Validation Checklist

- [ ] 6 張關鍵幀全部 1080 × 1920
- [ ] 碗、條紋、食物喺 6 張入面一致
- [ ] 光嘅方向 6 張都係右後方照向左下
- [ ] K2 同 K3 嘅配對卵都喺 (626, 826)
- [ ] 所有重要元素喺 Feed 4:5 範圍(y 285–1635)以內
- [ ] 底部 25% 同右側按鈕區冇重要元素
- [ ] 關鍵幀入面冇任何文字
- [ ] 冇多餘裝飾、冇煙、冇水花
- [ ] 影片中食物冇郁動、冇變形
- [ ] 最後一格同第一格嘅明暗接得上，循環無縫
