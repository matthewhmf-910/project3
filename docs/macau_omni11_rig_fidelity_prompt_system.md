# Project Macau — Omni 1.1 Rig Animation 高保真還原系統
### 把「模型生成限制」寫進 video prompt 的建構規範

版本：v1.0
適用素材：Macau 街景 plate、Daruma 主角（紅色達摩背包客）、LEGO 雙人 + 摩托車、蛋撻、竹棚 / 圍欄 / 沙包等道具
Motion reference：`Still5_to_10s_Project_Macau_Motion_Reference_Part_2`（5.00s / 540×960 / 9:16 / 30fps / greybox previz）

---

## 0. 先講清楚一個前提（這決定了整份文件的做法）

Omni 1.1（以及同代所有 image/reference-to-video 模型）**沒有 rig，沒有骨骼，沒有 3D 空間解算**。
它做的是 *latent motion transfer*：把 driving 訊號（reference video / audio / text）壓成一組 motion latent，再把你的 reference image 的外觀 latent 疊上去解碼成像素。

因此：

| 你以為的 | 實際發生的 | 對 prompt 的意義 |
|---|---|---|
| 骨骼重定向（retarget） | 外觀 warp + 生成補繪 | 動作只能「近似」，必須用鏡頭語言遮蔽誤差 |
| 3D 空間一致 | 逐幀 2D 一致性維持 | 空間關係要靠 plate 與構圖鎖死，不能靠模型算 |
| 角色比例不變 | 每幀重新生成，會漂移 | identity 要靠短鏡頭 + 高解析參考圖守住 |
| 一次生成整段 | 每次生成一個**連續鏡頭** | 剪接必須在 NLE 做，**不可以寫進 prompt** |

**結論：高保真 = 「previz 定義動作 → 拆成模型能吃的最小單元 → 每個單元用限制感知型 prompt 生成 → 剪接與補正在後期完成」。**
任何試圖用一條 prompt 還原整段 previz 的做法，保真度必然崩。

---

## 1. Previz 逐幀拆解

> ⚠️ **本節的時間碼已被實測數據取代。以 [`previz_measured_beatmap.md`](previz_measured_beatmap.md) 為準。**
> 下表是初版目測結果，實測顯示 0.85 / 2.20 / 2.85 都不是真正的剪接點，
> 而且全片是 **8 個鏡頭**不是 5 個。保留下表僅供對照。

規格：5.00s，540×960（9:16），30fps，低多邊形 greybox，主角＝紅球身 + 白球頭，騎滑板車，場景＝窄街走廊，兩側掛招牌板。

| Beat | 時間碼 | 鏡頭 | 主體動作 | Rig 關鍵 |
|---|---|---|---|---|
| **A** | 0.00–0.85s | 低角度廣角，街道走廊，消失點在畫面中央 | 角色由中景朝鏡頭駛近 | 身體軸線垂直，滑板車直線推進 |
| **B** | 0.85–1.50s | 快速推進至中近景（胸上） | 角色正面逼近，幾乎撞鏡 | 頭部球體佔畫面 1/3，肩線微擺 |
| **C** | 1.50–2.20s | 切回全身，角色遠離 | 角色背向鏡頭遠離 | 背包剪影成為辨識點 |
| **D** | 2.20–2.85s | 極近景 over-the-shoulder（紅球背面佔左半畫面） | 鏡頭掠過肩膀，街道在後景展開 | 這是**最容易崩**的一個 beat |
| **E** | 2.85–5.00s | 前導追蹤鏡（鏡頭倒退，角色置中） | 角色持續正面推進，最後拉遠縮小 | 長鏡頭，identity drift 風險最高 |

**這五個 beat 是五次獨立生成，不是一次。** 每個 beat 各自 ≤ 3s 是保真度的關鍵。

---

## 2. Omni 1.1 生成限制清單 → 對應 prompt 條款

這是整份文件的核心。左欄是模型限制，右欄是**你必須寫進（或刻意不寫進）prompt 的東西**。

### 2.1 硬限制（無法用 prompt 繞過，只能用製作流程繞過）

| # | 限制 | Prompt / Pipeline 對策 |
|---|---|---|
| H1 | **單次生成 = 單一連續鏡頭，不支援剪接** | prompt 內**禁止**出現 `cut to`, `then`, `next shot`, `transition`。一個 beat 一次生成，剪接回 NLE。 |
| H2 | **時長上限（依方案 5s / 10s 檔位）** | 所有 beat 設計成 ≤3s；長於 3s 的 E beat 拆成 E1/E2 兩段，用同一末幀接續（last-frame → first-frame 續接）。 |
| H3 | **無真 3D，攝影機運動只能「暗示」不能「指定」** | 不要寫焦距、軌道半徑、機位座標。改寫**視覺結果**：「主體在畫面中持續等大，兩側牆面向後退去」＝倒退追蹤。 |
| H4 | **Identity drift 隨時長線性上升** | 短鏡頭 + 每次生成都餵**同一張** hero reference（不要換角度圖），角度變化用不同 reference 圖分開生成。 |
| H5 | **手部 / 細小肢端崩壞率高** | 構圖上讓手處於**握持狀態**（握把手 / 握相機），prompt 明寫 `hands remain gripping the handlebar, never leaving it`。避免張開的手指。 |
| H6 | **文字與符號無法穩定重繪** | 街景招牌（"TAK SENG ON"、"AVENIDA DE ALMEIDA RIBEIRO"）**不可交給模型生成**。做法：招牌區域用原 plate 鎖版，或後期貼回。prompt 加 `no legible signage text`。 |
| H7 | **人形先驗（human prior）強** | Daruma 是無四肢球體、LEGO 是方塊剛體——模型會偷偷「人化」。prompt 必須反覆聲明剛體屬性（見 §3.2 的 Rigidity Block）。這是本專案**最大**的保真風險。 |
| H8 | **多主體交互不穩** | LEGO 雙人 + 摩托車 + 蛋撻 = 四個主體。做法：摩托車與騎士當作**一個合成剛體**（用你已有的合成 PNG 作 reference），不要讓模型分開解算。 |
| H9 | **輸出解析度受限，銳度不足** | 生成階段接受 720p，最後統一走 upscale + grain match 回原 plate 質感。prompt 不要寫 `8K`、`ultra sharp`（會誘發過銳偽影）。 |
| H10 | **參考影片的風格會滲漏** | greybox previz 的**灰白低多邊形質感會滲進成品**。務必在 negative 明寫 `no untextured grey blockout, no low-poly faceting, no previz look`。 |

### 2.2 軟限制（可以靠 prompt 明確壓制）

| # | 限制 | Prompt 條款 |
|---|---|---|
| S1 | 模型愛加運動模糊與速度線 | `no speed lines, no motion streaks, shutter consistent with 1/50s` |
| S2 | 模型愛改光線方向 | 明寫 plate 的光：`overcast diffuse daylight from upper frame, soft contact shadows, no hard sun` |
| S3 | 模型愛加鏡頭光暈 / 顆粒 / vignette | negative：`no lens flare, no added vignette, no film grain overlay` |
| S4 | 模型愛讓靜物飄動 | `barriers, scaffolding, sandbags and street furniture remain perfectly static` |
| S5 | 模型愛改色溫 | 鎖死：`warm desaturated pastel palette, cream / ochre / sage / muted teal, unchanged throughout` |
| S6 | 模型愛「補完」畫面邊緣 | `no camera roll, horizon stays level, framing edges stable` |
| S7 | 表情會亂跑（Daruma 大眼、LEGO 印刷臉） | `printed facial features are a flat decal, they do not deform, blink or emote` ← LEGO 尤其重要 |
| S8 | 背景人流會自動生成 | `street is completely empty, no pedestrians, no traffic, no crowd` |

---

## 3. Prompt 建構模板（限制感知型九段式）

每一個 beat 的 prompt 都用同一個骨架。**順序不能調**——前段權重高，把不可妥協的東西放前面。

```
[1] SHOT TYPE + DURATION
[2] SUBJECT LOCK        ← identity，引用 reference 圖
[3] RIGIDITY BLOCK      ← 對抗 H7 人形先驗（本專案最關鍵）
[4] ACTION              ← 只描述 previz 的單一動作
[5] CAMERA AS RESULT    ← 對抗 H3，寫結果不寫機位
[6] ENVIRONMENT LOCK    ← plate 一致性
[7] LIGHT + PALETTE LOCK
[8] RENDER STYLE
[9] NEGATIVE
```

### 3.1 Subject Lock（逐角色固定文本，複製貼上不要改字）

**Daruma Hero**
```
The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, short stubby limbs, brown leather rucksack with bedroll on the
back, vintage camera on a strap, dark canvas sneakers. Proportions, colours
and every strap position are identical to the reference and never change.
```

**LEGO Rider (male / female)**
```
The subject is the LEGO minifigure from the reference image: injection-moulded
ABS plastic, yellow cylindrical head with a flat printed face, black torso with
moulded arm sockets, C-clip claw hands, solid one-piece legs, moulded hair
piece. Plastic seams, sprue marks and surface sheen are identical to the
reference and never change.
```

### 3.2 Rigidity Block（對抗人形先驗——本專案的保命符）

**Daruma 版：**
```
The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from whole-
body tilt about the base and from the short limbs. The head is fused to the
body and cannot rotate independently. Do not add a neck, a torso, shoulders,
articulated fingers or a human silhouette.
```

**LEGO 版：**
```
The figure is rigid moulded plastic with exactly six points of articulation:
neck, two shoulders, two hips, and wrists that rotate only. Limbs are straight
cylinders and do not bend at elbow or knee. The face is a flat printed decal
that never deforms. Do not add cloth folds, skin, muscle deformation or
human-like weight shift.
```

### 3.3 Camera as Result（對抗 H3 的寫法對照表）

| ❌ 不要寫（模型接不住） | ✅ 改成這樣寫 |
|---|---|
| dolly in at 2 m/s | the subject grows steadily larger and fills more of the frame |
| 24mm wide lens, low angle | the street walls converge to a vanishing point behind the subject; ground line sits low in frame |
| tracking shot following the rider | the subject stays centred and the same size while the walls slide backwards past the edges |
| over-the-shoulder push past | the red shell occupies the left third of frame in the foreground; the street beyond stays sharp |
| pull out to reveal | the subject shrinks toward the centre of frame as more street enters the edges |

---

## 4. 五個 Beat 的成品 Prompt

> 每段獨立生成。Reference image 用途已標明。生成後在 NLE 依 §1 時間碼剪接。

### Beat A — 接近（0.00–0.85s，生成 2s 取用 0.85s）

```
A 2-second continuous shot, no cuts.

The subject is the red daruma traveler from the reference image: a single
egg-shaped red body with a matte ceramic surface and fine crackle texture,
gold floral motif on the lower body, large printed cartoon eyes with thick
black brows, brown leather rucksack with bedroll on the back, vintage camera
on a strap, dark canvas sneakers. Proportions, colours and every strap
position are identical to the reference and never change.

The body is a single rigid ovoid shell. It does not bend, squash, stretch,
breathe or twist at the waist — it has no waist. All motion comes from whole-
body tilt about the base and from the short limbs. The head is fused to the
body and cannot rotate independently. Do not add a neck, shoulders,
articulated fingers or a human silhouette.

Action: the daruma rides a black kick scooter straight down the centre of the
street toward the viewer at a steady walking pace, one foot planted on the
deck, the other pushing off the ground in a slow repeating cycle. Both hands
stay gripping the handlebar and never leave it. The rucksack sways only
slightly with each push.

Camera: the subject starts small in the middle distance and grows steadily
larger, staying on the centre line of the street. The building walls converge
to a vanishing point directly behind the subject. The ground line sits low in
frame. The horizon stays level; no camera roll, no shake.

Environment: a narrow Macau old-town street exactly as in the plate — colonial
shophouse facades in cream, ochre, sage and pale blue, green iron railings,
a wrought-iron street lamp, red-and-white crowd barriers and a dark mesh gate
across the far end, patterned paving with yellow grid markings. The street is
completely empty: no pedestrians, no traffic, no crowd. Barriers, scaffolding,
sandbags and all street furniture remain perfectly static.

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

### Beat B — 逼近特寫（0.85–1.50s，生成 2s）

同上，**只改 Action 與 Camera 兩段**：

```
Action: the daruma continues riding directly at the viewer, body tilted very
slightly forward, hands locked on the handlebar. The printed eyes stay fixed
forward and do not blink or change expression.

Camera: the subject fills the frame rapidly until the head and upper body
occupy roughly the upper third and the red shell dominates the centre. The
background compresses and softens behind it. Framing stays centred and level.
```

### Beat C — 遠離（1.50–2.20s，生成 2s）

```
Action: the daruma rides away from the viewer down the centre of the street,
seen from behind. The brown rucksack and bedroll are the dominant silhouette.
The scooter tracks a perfectly straight line.

Camera: the subject shrinks steadily toward the vanishing point as more street
enters the frame edges. The walls stay parallel to frame edges. No roll.
```

### Beat D — 越肩極近景（2.20–2.85s，生成 2s）⚠️ 高風險

> 這一鏡最容易崩（前景剛體 + 大位移 + 背景視差）。建議**兩層合成**：前景 daruma 單獨生成走綠幕/透明底，背景 plate 做 2.5D 推鏡，後期合成。若堅持單次生成，用下列 prompt：

```
Action: the daruma is in extreme close-up in the left foreground, seen from
behind and slightly above; only the curved red shell, the rucksack straps and
the edge of the white head are visible. The shell surface texture stays crisp
and does not smear.

Camera: the red shell occupies the left third of the frame in the near
foreground and slides slowly toward the left edge, while the street beyond
stays sharp and opens up on the right. Parallax is gentle and continuous.
The horizon stays level.
```
額外 negative 追加：`no foreground smearing, no ghosting, no texture sliding on the shell, no duplicated limbs`

### Beat E — 前導追蹤長鏡（2.85–5.00s）→ **拆成 E1 / E2**

E1（2.85–4.00s）：
```
Action: the daruma rides toward the viewer at a steady pace, holding a
constant position in the centre of the frame. The push-off cycle repeats
evenly. Hands never leave the handlebar.

Camera: the subject stays centred and the same size throughout, while the
building walls slide backwards past the left and right frame edges at a
constant rate. This must read as a smooth, continuous move with no
acceleration and no shake.
```

E2（4.00–5.00s，用 E1 末幀作 first-frame 續接）：
```
Action: the daruma continues riding forward, unchanged.

Camera: the subject shrinks slowly toward the centre of frame as more of the
street enters the edges, coming to rest in the far middle distance.
```

---

## 5. Reference Image 準備規範（保真度有一半在這裡）

| 項目 | 要求 | 理由 |
|---|---|---|
| 解析度 | 短邊 ≥ 1024，PNG 無損 | JPEG artefact 會被模型放大成材質雜訊 |
| 背景 | 純透明或純中性灰，**不要**已有街景 | 避免背景與 plate 打架 |
| 角度 | **每個 beat 用最接近該鏡頭角度的那張** | 你的 character sheet 已有正/側/背/3/4，直接對號入座 |
| 合成剛體 | LEGO 騎士 + 摩托車 + 蛋撻 用**已合成的單張 PNG** | 對抗 H8 多主體不穩 |
| 光線 | 參考圖光線方向要與 plate 一致（頂部漫射） | 否則模型每幀都在「重打光」，造成閃爍 |
| 尺寸 | 主體佔畫幅 60–80%，四邊留白 | 給模型 crop 空間，避免邊緣截斷 |

**Beat ↔ Reference 對照：**

| Beat | 用哪張 character sheet 圖 |
|---|---|
| A | Daruma 正面（scooter 那張最佳） |
| B | Daruma 正面近景（相機掛胸那張） |
| C | Daruma 背面（背包全見那張） |
| D | Daruma 3/4 背側（scooter 側後那張，即你提供的第 5 張） |
| E1 / E2 | 與 A 同一張（維持 identity 連續） |

---

## 6. JSON Prompt Contract（可直接餵給批次腳本）

見 `prompts/macau_omni11_shot_contract.json`。結構與本文件 §3 九段式一一對應，
`locks` 區塊是所有鏡頭共用的常量，`shots` 只覆寫 `action` 與 `camera`。

---

## 7. QC 檢查表（每個生成回合逐項打勾）

**保真度（必過，任一不過即重生成）**
- [ ] 主體形狀與 reference 一致，無變胖/變瘦/變高
- [ ] Daruma 未長出脖子、肩膀或人形輪廓
- [ ] LEGO 手仍是 C 形夾爪，未變成人手
- [ ] 印刷臉部無形變、無眨眼、無表情變化
- [ ] 雙手全程握住把手
- [ ] 背包 / 相機 / 綁帶位置未漂移

**風格（必過）**
- [ ] 無 greybox 灰白 / 低多邊形殘留（H10）
- [ ] 色溫與 plate 一致，首末幀比對無偏移
- [ ] 無 lens flare / vignette / 顆粒疊加
- [ ] 招牌文字未被模型亂寫（H6）

**運動（對照 previz — 用 `tools/motion_match.py` 量測，不要只靠肉眼）**
```bash
python3 tools/motion_match.py extract previz.mp4 --in <beat_in> --duration <len> --out ref.csv
python3 tools/motion_match.py extract take.mp4 --out gen.csv
python3 tools/motion_match.py compare ref.csv gen.csv --beat <A|B|C|D|E1|E2>
```
- [ ] `主體尺度曲線 (area)` PASS
- [ ] `水平走位 (cx)` PASS
- [ ] `垂直走位 (cy)` PASS
- [ ] `運動方向` PASS（推/拉/平沒有搞反）
- [ ] 無鏡頭滾動、無晃動、地平線水平
- [ ] 靜物完全靜止

> 量測只驗運動軌跡。形狀崩壞、色溫漂移、招牌亂字這三類**量測抓不到**，
> 仍須人眼過上面的保真與風格兩組。

**技術**
- [ ] 9:16，30fps，無跳幀
- [ ] 首末幀可與相鄰 beat 接續

---

## 8. 生成失敗時的補救順序（不要盲目重 roll）

1. **形狀崩** → 加強 Rigidity Block，並把 reference 換成更貼近該角度的圖；縮短時長。
2. **風格滲漏（灰白 previz 感）** → 降低 motion reference 的權重 / 影響強度；negative 加碼 H10 條款。
3. **Identity drift** → 把該 beat 再對半切；用前段末幀作續接首幀。
4. **鏡頭不聽話** → 停止描述鏡頭，改成純粹描述「主體在畫面中的大小與位置變化」（§3.3）。
5. **多主體打架（LEGO + 車 + 蛋撻）** → 改用合成剛體單圖；蛋撻若仍飄，改為後期貼合成。
6. **以上皆失敗** → 該鏡改走 2.5D：角色單層生成透明底 + plate 做 parallax 推鏡，後期合成。Beat D 建議直接從這裡開始。

---

## 9. 一句話總結

> Previz 定義「動作真相」，Omni 1.1 只負責「材質與光線的還原」。
> 把每個限制翻譯成一條 prompt 條款，把每個 beat 壓到 3 秒以內，
> 剪接、文字、多主體交互一律留在後期——這樣才拿得到高保真。

---

### 待確認

本文件的限制清單以 **OmniHuman 系列 1.1（image + motion/audio driven，單鏡頭輸出）** 的通用行為撰寫。
若你用的是其他 "Omni 1.1"（例如 OmniGen 系或平台自訂版本），請告知，§2 的 H2 / H4 / H9 三條的具體數值需要按該版本的實際檔位改寫，其餘條款通用。
