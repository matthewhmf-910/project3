# Project Macau — 每鏡要附上什麼 Asset

搭配：`previz_measured_beatmap.md`（時間碼）、`../prompts/omni11_beat_prompts.md`（prompt 本體）
狀態：**v2 — 已收到站姿正面／正背面兩張高解圖，缺口大幅收窄**

---

## 0. 每次生成只有三個附件欄位

| 欄位 | 附什麼 | 數量 |
|---|---|---|
| **Reference image** | 該鏡角度對應的**單一**角色 PNG，去背 | **1 張，不能多** |
| **Motion reference** | previz **只截該 beat 的秒數** | 1 段 |
| **Prompt** | 對應的 prompt body（含 Motion Blueprint 段） | 1 段文字 |

**四個會毀掉 identity 的錯附法：**
- ❌ 附整張 character sheet → 六個角色被平均掉
- ❌ 附多張角度圖想「讓它理解 3D」→ 不會建模，只會混合，比例反而漂
- ❌ 把街景 plate 當 reference image → plate 屬於 prompt 的 Environment 段
- ❌ 附整段 5 秒 previz → 會把下一鏡的運動帶進來

---

## 1. ⚠️ previz 逐幀放大後的兩個發現（會改動 prompt）

把 previz 每個 beat 的下半畫面放大檢查後，發現原本的 Action 段有兩處是憑空寫的：

### 1.1 沒有「蹬地循環」

原 prompt 寫 `one foot planted on the deck, the other pushing off the ground in
a slow repeating cycle`。**previz 全程雙腳併攏站在踏板上等速滑行，沒有任何蹬地動作。**

已修正為 `both feet together on the deck` + `there is no stepping or push-off cycle`。
這條若不改，模型會生出 previz 沒有的動作，`motion_match.py` 也驗不出來（面積曲線一樣）。

### 1.2 滑板車是很小的元素

previz 裡滑板車只是**身體下方一根細桿 + 兩個小輪**，大部分被雙腿擋住；
在特寫鏡（B）根本不在畫面內。已在 prompt 註明
`a thin stem and two small wheels below the body, mostly hidden behind the legs`。

**這代表站姿 asset 的可用性比原先評估高很多** —— 滑板車不是主體造型的一部分，
模型只需要在腳下補一根細桿，錯了也幾乎看不見。

### 1.3 一個待你拍板的分歧

previz blockout 裡角色**雙臂垂在身側，沒有握把手**（blockout 沒做手臂動畫）。
但你的滑板車 hero asset 是**雙手握把手**的。

我的處理：**保留握把手**。理由是 H5——手處於握持狀態時崩壞率最低，放空的手指最容易爛；
而且 blockout 沒做手臂動畫，不該當成美術指示。
如果你要照 previz 的雙臂下垂，跟我講，我把 `hands rest on the handlebar` 改掉。

---

## 2. Asset 狀態（v2）

| Asset | 檔案 | 主體原生像素 | 狀態 |
|---|---|---|---|
| 達摩・站姿正面（掛相機） | `assets/prepped/daruma_standing_front_camera.png` | 737px △ | ✅ **新到** |
| 達摩・站姿正背面（背包） | `assets/prepped/daruma_standing_back_rucksack.png` | 737px △ | ✅ **新到** |
| 達摩・滑板車 3/4 背 | `assets/prepped/daruma_scooter_three_quarter_back.png` | 973px ✓ | ✅ |
| LEGO 男＋機車＋蛋撻 | `assets/prepped/lego_male_motorcycle_egg_tart.png` | 910px ✓ | ✅ 附錄鏡 |
| LEGO 女＋機車 | `assets/prepped/lego_female_motorcycle.png` | 922px ✓ | ✅ 附錄鏡 |
| Character sheet | — | 主體僅 140×195px | ❌ 差規格 7.3x，**不可當 reference** |
| 街景 plate ×4 | — | 941×1672，無 alpha | ➡️ 走 prompt Environment，不附 |

**△ 記號**：新到那兩張主體原生長邊只有 737px（規格 ≥1024，且比滑板車那張的 973px 低 24%）。
補白後畫布達標，但**細節沒有增加**——陶瓷裂紋、皮革縫線、金色花紋可能偏軟。
可以先開跑；若成品材質不夠實，回頭要更高解析度的出稿，這是唯一要補的一項。

---

## 3. 逐鏡附件表（v2）

方位判定依據：`area` 上升＝靠近、下降＝遠離，再對照放大幀確認。

| # | Beat | previz 區段 | 取用 | Reference image | Motion reference |
|---|---|---|---|---|---|
| 1 | **A1_A2** | 0.00–0.67 | 0.67s | ✅ `daruma_standing_back_rucksack` | `--in 0.00 --duration 0.67` |
| 2 | **A3** | 0.67–1.17 | 0.50s | ✅ `daruma_standing_front_camera` | `--in 0.67 --duration 0.50` |
| 3 | **B** | 1.17–1.50 | 0.33s | ✅ `daruma_standing_front_camera` | `--in 1.17 --duration 0.33` |
| 4 | **C** | 1.50–2.00 | 0.50s | ✅ `daruma_standing_back_rucksack` ※ | `--in 1.50 --duration 0.50` |
| 5 | **D** | 2.00–2.70 | 0.70s | ✅ `daruma_standing_back_rucksack` | `--in 2.00 --duration 0.70` |
| 6 | **E1** | 2.70–3.40 | 0.70s | ✅ `daruma_scooter_three_quarter_back` | `--in 2.70 --duration 0.70` |
| 7 | **E2** | 3.40–4.57 | 1.17s | 🔄 E1 的末幀 | `--in 3.40 --duration 1.17` |
| 8 | **F** | 4.67–5.00 | 0.33s | ✅ `daruma_standing_back_rucksack` ※ | `--in 4.67 --duration 0.33` |

**※ C 與 F 的方位我只有中等把握**——兩鏡主體都很小，放大後仍難確認正背。
若你知道原 previz 這兩鏡角色是朝鏡頭的，改用 `daruma_standing_front_camera`。

**八個鏡全部有料可跑。** 依賴只有一個：E1 必須先於 E2。其餘七鏡可並行。

截 motion reference：
```bash
ffmpeg -ss <in> -i previz_part2.mp4 -t <duration> -c copy beat_<id>_drive.mp4
```

---

## 4. 街景 Plate 的處理（不要當 reference image 附）

Plate 走 **prompt 的 Environment 段**。但兩件事要先做：

1. **選定一張主 plate 並鎖死。** 4 張街景圖跨鏡混用 → 每鏡街道長得不一樣。
2. **招牌文字 lock back。** 「TAK SENG ON」「AVENIDA DE ALMEIDA RIBEIRO」模型必寫錯（H6）。
   先從主 plate 切出招牌透明 PNG，後期貼回。

---

## 5. Reference image 出稿規格

用 `tools/prep_reference.py check <img>` 驗，`prep` 修。

| 項目 | 規格 | 不合的後果 |
|---|---|---|
| 格式 | PNG 無損 | JPEG artefact 被放大成材質雜訊 |
| 畫布短邊 | ≥ 1024 | — |
| **主體原生長邊** | **≥ 870**（畫布的 85%） | 補白達標但細節不足 → 材質偏軟 |
| 背景 | 全透明或純中性灰 | 跟 plate 打架，邊緣鬼影 |
| 主體佔比 | 60–80%，四邊留白 | 貼邊 → crop 時截肢 |
| 光線 | 頂部漫射，與 plate 一致 | 每幀重打光 → 成品閃爍 |
| 內容 | 只有一個角色 | 多主體 → identity 混合 |
| 合成剛體 | LEGO＋機車＋蛋撻用已合成單張 | 分開附 → 四主體打架（H8） |

---

## 6. 開工清單

- [x] ~~補「滑板車正面」asset~~ → 站姿正面已到，且 previz 顯示滑板車是極小元素，站姿可用
- [x] ~~補「滑板車正背面」asset~~ → 站姿正背面已到
- [x] 五張 reference 全部整成規格（`assets/prepped/`）
- [ ] 確認 C 與 F 兩鏡的角色方位（正面還是背面）
- [ ] 拍板 §1.3：握把手 vs 雙臂下垂
- [ ] 選定唯一主街景 plate
- [ ] 從主 plate 切出招牌透明 PNG 留給後期
- [ ] 用 ffmpeg 切出 8 段 motion reference
- [ ] 抽各 beat 基準曲線備驗收
- [ ] （選）若成品材質偏軟，要站姿兩張的更高解析度出稿

**現在八個鏡都可以開跑。** 建議先跑 E1（唯一原生解析度達標、且是高風險越肩鏡），
一鏡就能同時驗證素材規格、prompt 結構、Motion Blueprint 段與 `motion_match.py` 驗收流程。
