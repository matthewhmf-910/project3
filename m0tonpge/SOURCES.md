# SOURCES

Every claim in the film is something you can see in a supplied photo or something the owner told us directly.

| ID | Claim / visual | Type | Source | Scene |
|----|----------------|------|--------|-------|
| E1 | A small wooden kiosk on a street corner in Zhongshan, Taipei | Owner statement + render | Owner brief; `src/assets/corner_render.png` (3D render, not a photo) | S1 |
| E2 | Two long wooden chairs outside | Verified in photo | `src/assets/chairs_corner.png` | S2 |
| E3 | One round iron (green, metal) table | Verified in photo | `src/assets/table_lemon.jpg` | S3 |
| E4 | Sells one drink: iced coffee with a lemon slice | Owner statement; the drink is visible in photos | Owner brief; `table_lemon.jpg`, `drink_top.jpg` | S4–S5 |
| I1 | "Small enough to sell one cup" / "Just enough" | Interpretation (brand voice) | — | S4, S6 |
| M1 | Circle: tabletop → cup rim → lemon slice | Illustrative device, not a claim | — | S3–S5 |

Left out on purpose:
- The shop name on the apron in `kiosk_window.png`. It isn't confirmed as the brand to use, so the film carries no name. It can be added on the end card (`#c6` kicker in `src/index.html`).
- No prices, opening hours or recipe details, because none were supplied.
- `kiosk_window.png` isn't used in the cut: the drink in its foreground is a plain iced black coffee, not the lemon coffee.
- `reference/poster_style_ref.jpg` is an AI-generated poster sheet, used only as a palette reference (ivory / sage / terracotta).

## Pour cut (`out/lemon_pour_9x16.mp4`)
| ID | Visual | Type | Source |
|----|--------|------|--------|
| V1 | Ice + lemon in glass, then coffee poured | AI-generated reference clip, **not the real shop's glass or table** | `reference/clips/clipA_ice_lemon_pour.mp4`, 0–3.9 s only (it adds a foam/milk head from ~4.0 s, and the owner confirmed there is no foam) |
| — | Clip B | Not used: pours into an empty glass (no ice first), adds foam, has a hologram grid and a "Dola AI" watermark | `reference/clips/clipB_pour_dola.mp4` |
| E5 | Order: ice → lemon → gently poured coffee, no foam | Owner statement | chat |
