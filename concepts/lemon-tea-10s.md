# 檸檬茶 10 秒廣告：三個概念

參考結構：`references/nissin-cup-noodle-2013.md`（規模 → 停一拍 → 單色標題卡 → 產品）。
三個概念都用同一個 10 秒骨架，但場景、衝突同產品出場方式唔同。

`[BRAND]` 係品牌名佔位，換成你嘅品牌；產品暫定為「港式凍檸茶（玻璃杯）」，如果係紙包或樽裝，將每段 prompt 入面嘅產品描述換晒。

---

## 共用骨架（10 秒，9:16 直立）

| 時間 | 鏡頭 | 作用 |
|---|---|---|
| 0.0–2.0s | S1 最大規模 | 一開始就係最大場面，畫面入面埋一個**檸檬黃**元素（顏色種子） |
| 2.0–4.0s | S2 升級 | 中景，衝突加劇 |
| 4.0–6.0s | S3 高潮 | 特寫或者動作頂點 |
| 6.0–6.4s | 黑幀 | 全黑，**聲音唔好停** |
| 6.4–7.6s | 標題卡 | 全畫面檸檬黃，一個短詞 |
| 7.6–9.2s | 產品 | 產品特寫，水珠、冰、檸檬片 |
| 9.2–10.0s | 結尾 | 品牌標誌 |

**全片色調規則**：S1–S3 低飽和、偏灰褐；只有檸檬黃元素同標題卡係飽和色。

---

## 概念 A：熱浪大軍

**一句話**：中午嘅中環斑馬線，上班族好似一支軍隊頂住熱浪前進，熱氣好似戰場煙霧；一杯凍檸茶令佢哋「收兵」。

**同參考片嘅關係**：保留「大軍推進」嘅規模，將戰場換成城市熱浪。

### 連續性設定

- 地點：大型斑馬線，兩邊係高樓。
- 時間：正午，太陽喺畫面右上方，影子短、向左下。
- 人群：全部由畫面左邊行向右邊，唔可以掉頭。
- 顏色種子：人群中間一把**檸檬黃雨傘**，喺 S1 同 S2 都喺人群中間偏右。
- 主角：男，白恤衫、深藍領呔、黑色公事包，喺 S2、S3 出現。
- 交通燈：行人綠燈，全程唔變。

### 分鏡

| 鏡頭 | 時間 | 內容 |
|---|---|---|
| S1 | 0–2s | 高角度長焦，數百人過斑馬線，熱浪令遠處扭曲 |
| S2 | 2–4s | 平視中景，主角喺人群前排，拉鬆領呔 |
| S3 | 4–6s | 特寫，汗珠由額角流落，眼眯埋 |
| 標題卡 | 6.4–7.6s | 「透心涼！」 |
| 產品 | 7.6–9.2s | 手拎起凍檸茶，杯身水珠流落 |

### Prompts

```
S1 (2s). Lens: 200mm telephoto, high angle from a footbridge.
Camera: locked off, very slow push-in.
Subject: hundreds of office workers crossing a wide zebra crossing at noon,
all walking left to right, compressed like an advancing army.
Colour seed: one lemon-yellow umbrella in the crowd, centre-right.
Physics: heat haze distorts the far background; shadows short, falling to lower-left.
Grade: desaturated warm grey, the umbrella is the only saturated colour.
Do not change: walking direction, umbrella position, green pedestrian light.
```

```
S2 (2s). Lens: 50mm, eye level, front of the crowd.
Camera: slow dolly backward, matching walking speed.
Subject: a man in a white shirt and navy tie, black briefcase in right hand,
walking at the front of the crowd; he loosens his tie with his left hand.
Background: the lemon-yellow umbrella visible behind him, slightly out of focus.
Physics: sweat stains on the shirt collar; sun from upper right.
Do not change: his clothes, briefcase hand, walking direction.
```

```
S3 (2s). Lens: 100mm macro, extreme close-up.
Camera: static.
Subject: the same man's face; a single bead of sweat runs from his temple
down his cheek; he squints against the sun.
Physics: the bead moves downward only, following the skin.
Grade: desaturated, slight orange cast.
```

```
PRODUCT (1.6s). Lens: 85mm, shallow depth of field.
Camera: slow tilt up following the glass.
Subject: a hand lifts a tall glass of Hong Kong-style iced lemon tea
with three lemon slices and ice cubes; condensation drips down the glass.
Background: blurred city street, warm light.
Grade: the lemon tea is fully saturated; the background stays muted.
```

---

## 概念 B：茶餐廳午市戰場

**一句話**：一點鐘嘅茶餐廳好似騎兵衝鋒，伙記托住餐盤衝過枱與枱之間，廚房蒸氣好似炮火煙霧；一杯凍檸茶「啪」一聲擺落枱，全場停晒。

**同參考片嘅關係**：保留「衝鋒」嘅速度感同煙霧，將戰場縮細到一間餐廳。

### 連續性設定

- 地點：港式茶餐廳，卡位喺左邊，廚房門喺畫面後方正中。
- 時間：中午一點，日光燈＋窗外自然光由左邊入。
- 伙記：男，白色短袖制服、黑色圍裙，右手托餐盤。
- 顏色種子：伙記餐盤上一杯凍檸茶，檸檬片向住鏡頭。
- 枱面：綠色玻璃面枱，上面有一張點菜紙。

### 分鏡

| 鏡頭 | 時間 | 內容 |
|---|---|---|
| S1 | 0–2s | 廣角低角度，伙記由廚房衝出，蒸氣從後面湧出 |
| S2 | 2–4s | 跟拍，伙記喺卡位之間閃身，餐盤保持水平 |
| S3 | 4–6s | 特寫，杯子擺落枱面，冰塊跳起、茶面晃動但唔瀉 |
| 標題卡 | 6.4–7.6s | 「頂住！」 |
| 產品 | 7.6–9.2s | 匙羹壓檸檬片，再拎起杯 |

### Prompts

```
S1 (2s). Lens: 24mm wide, low angle near the floor.
Camera: static, the waiter runs toward the lens.
Subject: a waiter in a white short-sleeved uniform and black apron bursts
out of the kitchen door at the back centre, tray held level on his right hand.
Steam billows from the kitchen behind him like smoke on a battlefield.
Colour seed: one glass of iced lemon tea on the tray, lemon slice facing camera.
Physics: the tray stays level; steam rises and spreads, it does not fall.
Do not change: kitchen door position, tray hand, the glass on the tray.
```

```
S2 (2s). Lens: 35mm, waist height.
Camera: handheld tracking shot running beside the waiter.
Subject: the same waiter weaves between booths on the left and tables
on the right; customers lean back to let him pass.
Physics: liquid in the glass tilts slightly with his turns but never spills;
daylight from windows on the left.
Do not change: waiter uniform, tray level, lemon slice facing out.
```

```
S3 (2s). Lens: 100mm macro, table height.
Camera: static, slow motion (120fps feel).
Subject: the glass of iced lemon tea is set down hard on a green glass table
next to an order slip. Ice cubes jump a few millimetres and settle;
the tea surface ripples but does not overflow.
Physics: ripples spread from the centre outward; ice falls back by gravity.
```

```
PRODUCT (1.6s). Lens: 85mm, shallow depth of field.
Camera: slow push-in.
Subject: a long spoon presses the lemon slices in the iced lemon tea,
then a hand lifts the glass out of frame.
Grade: the tea and lemon are fully saturated; the restaurant stays muted.
```

---

## 概念 C：天台鐵梯

**一句話**：正午嘅建築地盤天台，熱到冒煙；一個工人順住生鏽鐵梯爬落街，打開貨車入面嘅冰箱，冷氣一湧而出。

**同參考片嘅關係**：保留「指揮官下令」同「衝落去」嘅動作，戰場換成地盤；呢個概念最考物理連續性。

### 連續性設定

- 地點：五層舊唐樓天台，**鐵梯固定喺大廈右邊外牆**，垂直落到地面。
- 貨車：白色客貨車，停喺鐵梯底**左邊**，尾門向住鐵梯、已經打開，車全程唔郁。
- 冰箱：藍色手提冰箱，擺喺貨車尾箱。
- 時間：正午，影子幾乎喺正下方。
- 主角：男工人，**檸檬黃安全帽**（顏色種子）、灰色背心、手套。
- 爬梯動作：面向牆，三點接觸（兩手一腳或兩腳一手），手輪流捉橫杆，安全帽全程戴住。

### 分鏡

| 鏡頭 | 時間 | 內容 |
|---|---|---|
| S1 | 0–2s | 航拍向下，天台上幾個工人，熱浪扭曲畫面 |
| S2 | 2–4s | 低角度向上，工人面向牆順住鐵梯爬落 |
| S3 | 4–6s | 特寫，手打開冰箱蓋，白色冷氣湧出 |
| 標題卡 | 6.4–7.6s | 「落嚟飲！」 |
| 產品 | 7.6–9.2s | 手拎起凍檸茶，背景係天台同藍天 |

### Prompts

```
S1 (2s). Drone shot, top-down, 30 metres above.
Camera: slow descent.
Subject: a five-storey old Hong Kong tenement rooftop at noon; four
construction workers in grey vests; one wears a lemon-yellow hard hat.
A rusty vertical iron ladder is fixed to the right exterior wall.
Physics: shadows almost directly beneath the workers; heat haze shimmers.
Grade: desaturated concrete grey, the yellow hard hat is the only saturated colour.
Do not change: ladder on the right wall, number of workers.
```

```
S2 (2s). Lens: 24mm, low angle from street level looking up the ladder.
Camera: static.
Subject: the worker in the lemon-yellow hard hat climbs down the rusty
vertical iron ladder facing the wall, hands alternating on the rungs,
always three points of contact.
Below-left of frame: the rear of a white van with its back door open.
Physics: gravity pulls his body close to the ladder; hard hat stays on;
the van does not move.
Do not change: ladder position, van position, hard hat colour.
```

```
S3 (2s). Lens: 50mm, close-up inside the van's rear.
Camera: static.
Subject: a gloved hand opens the lid of a blue cooler box;
white cold mist spills out and flows downward over the edge.
Physics: cold mist sinks and spreads, it does not rise.
```

```
PRODUCT (1.6s). Lens: 85mm, low angle.
Camera: slow tilt up.
Subject: the gloved hand lifts a glass of iced lemon tea against a blue sky,
the rooftop edge visible at the bottom of frame; condensation drips down.
Grade: the tea and sky are saturated; everything else stays muted.
```

---

## 製作提示

- **逐個鏡頭生成**：大部分影片模型一次只生成幾秒，每個 S1–S3 同產品鏡頭分開生成，之後喺剪片軟件拼接。
- **黑幀、標題卡、標誌**：唔使用 AI 生成，喺剪片軟件直接做，字體同顏色先至穩定。
- **角色一致**：先生成一張主角定妝圖，之後每個鏡頭用同一張做參考圖。
- **聲音**：S1–S3 用環境聲＋低頻鼓聲，黑幀嗰 0.4 秒保留回音，標題卡出現時加一下「冰塊碰杯」聲。
- **檢查清單**：每個鏡頭生成後，逐項對住「連續性設定」同「Do not change」檢查，唔啱就重做。
