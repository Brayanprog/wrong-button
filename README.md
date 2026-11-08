# Wrong Button — The Button Museum

A hand-printed reflex game. **Four buttons. One instruction. No mercy.**

Read the label on the card, mind the ink, and press the right specimen
before the thread runs out. The tricks escalate: straight orders, shape
hunts, reverse logic, Stroop word-vs-ink traps, rule swaps, memory tests —
and the occasional **HANDS OFF** round where touching anything ends the tour.

## Play

- **Tap / click** the specimen, or use the keys below.
- Faster presses earn speed bonus; streaks multiply your score (up to ×10).
- Let a HANDS OFF clock expire untouched for a patience bonus.
- One wrong press — or an expired clock on a press round — and the exhibit
  closes early. The game-over poster tells you exactly what the label meant.

| Button | Keys |
| --- | --- |
| 🔴 Red (circle) | `1` · `Q` · `←` |
| 🔵 Blue (diamond) | `2` · `W` · `↑` |
| 🟡 Yellow (star) | `3` · `E` · `↓` |
| 🟢 Green (square) | `4` · `R` · `→` |
| Pause | `P` / `Esc` |

## Art direction

A fully custom, handmade look — **The Button Museum**: cream paper, warm
ink, cross-hatching, mis-registered print, stitched borders and washi tape.
All artwork is drawn procedurally in code (`utils/art.ts` for canvas,
`ui.tsx` for SVG icons/specimens, `utils/theme.ts` for the paper CSS system)
with local fonts (Fraunces, Karla, Caveat). Music is a custom-generated
music-box/marimba waltz (`assets/audio/bgm_button_museum.mp3`). No raster
image assets ship with the game.

## Run locally

```bash
npm install
npm run build        # bundles to dist/ with esbuild
npm run preview      # serves dist/ at http://localhost:3000
```

## Deploy

Deployed on [Vercel](https://vercel.com) as a static site (`vercel.json`:
`npm run build` → `dist/`). Pushes to `main` can be connected to the Vercel
project **`wrong-button`** for automatic redeploys.

## Structure

| Path | What |
| --- | --- |
| `App.tsx` | Game logic, canvas rendering, layout & posters |
| `utils/art.ts` | Procedural hand-printed canvas art helpers |
| `utils/theme.ts` | Paper CSS design system (`GAME_CSS`) |
| `ui.tsx` | Hand-inked SVG icons, brand mark, specimen strip |
| `utils/helper.tsx` | Input, overlays, WebAudio SFX |
| `utils/BackgroundMusic.tsx` | Seamless looping music player |
| `constants.ts` | Tunable timings, scoring, palette |
| `design/` | Asset manifest & game design document |
