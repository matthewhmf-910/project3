# 檸檬冰咖啡 · 電影感 Motion 分鏡（15 秒，9:16）

## 成條片嘅 Logic
杯嘢係點樣「整出嚟」，片就點樣排：**空杯 → 碎冰 → 檸檬 → 輕輕倒咖啡 → 成品**。

三條規矩：
1. **每個鏡頭嘅結尾狀態，就係下一個鏡頭嘅開頭狀態。** 冰入咗先見到檸檬，檸檬放好先倒咖啡。
2. **頂部有變化就用正上 (top view)，液位或者分層有變化就用側面。** 放檸檬、咖啡滲上嚟睇頂；冰跌落、咖啡升上嚟睇側面。
3. **有動作嘅時候鏡頭定；冇動作嘅時候鏡頭先郁。** 冰跌、倒咖啡嗰陣 camera 唔好搶戲；靜止嗰幾格先用慢 push-in、pan、rotate 去「呼吸」。

## 分鏡表

| # | 時間 | 鏡頭 / 角度 | Camera 動作 | 畫面發生乜 | 點解放喺呢度 | 聲音 |
|---|------|------------|------------|-----------|-------------|------|
| 1 | 0.0–2.0 | 街角全景，平視 | 慢 dolly-in | 中山街角木屋，早上斜陽 | 交代地點 | 街聲 |
| 2 | 2.0–3.5 | 高角度 45° | 慢 pan：由兩張木椅 → 圓鐵桌 | 綠色圓鐵桌，木杯墊上有個空玻璃杯 | 由「店」收窄到「一杯」 | 街聲淡出 |
| 3 | 3.5–5.5 | 側面微距，杯身平視 | **定鏡** | 碎冰傾落杯，60fps 慢動作，冰碎彈起 | 第一個動作：冰 | 冰撞玻璃 |
| 4 | 5.5–7.5 | **正上 top view** | 好慢順時針轉 8–10° | 一片檸檬輕輕放喺碎冰面 | 頂部有變化，所以用 top view | 輕「嗒」一聲 |
| 5 | 7.5–8.5 | 正上 top view | 極慢 push-in | 檸檬加碎冰，光喺冰面閃 | 停一停，畀觀眾睇清楚 | 靜 |
| 6 | 8.5–11.5 | 側面 45° | **跟住液位慢慢 crane up** | 用細壺沿匙羹背**輕輕**倒冷咖啡，咖啡穿過碎冰由底升上嚟 | 液位變，所以用側面 | 細細倒水聲 |
| 7 | 11.5–13.0 | 正上 top view | 慢 push-in | 咖啡色由冰縫滲上嚟，包住檸檬邊 | 由側面返去頂：同 #4 首尾呼應 | 冰輕響 |
| 8 | 13.0–15.0 | 對準真相 `table_lemon.jpg` 嘅角度 | 慢 push-in + rack focus 到檸檬 | 成品：圓鐵桌、木杯墊、匙羹、檸檬 | 收尾＝真實產品相 | 一聲冰響，收 |

> 確認：**冇奶泡**。製作次序＝冰 → 檸檬 → 輕輕倒咖啡。已剪好嘅版本見 `out/lemon_pour_9x16.mp4`（`src/pour.html`）。

## Image-to-video prompts（Kling / Higgsfield / Runway 用）
- **#8** 用 `src/assets/table_lemon.jpg` 做 end frame；**#5 / #7** 用 `drink_top.jpg` 做參考。
- 其餘鏡頭冇現成相：要麼實拍，要麼用文字生成 start frame。

1. `Morning street corner in Taipei, small wooden coffee kiosk, warm low sun, slow dolly in, cinematic, 35mm, shallow depth of field`
2. `High angle 45°, empty rounded glass tumbler on a wooden coaster on a round sage-green metal table, slow pan from two wooden folding chairs to the table, soft daylight`
3. `Side macro at glass level, crushed ice tumbling into a rounded glass tumbler, slow motion 60fps, static camera, backlit sparkle, green metal table`
4. `Top-down overhead, a single thin lemon slice gently placed on crushed ice inside a round glass, very slow clockwise camera rotation, soft daylight, sage-green table`
5. `Top-down overhead, lemon slice resting on crushed ice, light glinting on ice, imperceptible push in, calm`
6. `Side 45°, cold coffee gently poured from a small pitcher over the back of a spoon into a glass of crushed ice with a lemon slice, coffee slowly rising through the ice, camera cranes up following the liquid level, slow motion, cinematic`
7. `Top-down overhead, dark coffee seeping up between crushed ice around a lemon slice, slow push in`
8. `Final hero: rounded glass with creamy layer and lemon slice on wooden coaster, spoon, round sage-green metal table, slow push in with rack focus onto the lemon` → end frame = `table_lemon.jpg`

**通用 negative prompt：** `no hands in frame except the pour, no text, no logo, no extra garnish, no straw`
