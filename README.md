# 🌟 Dhondhu Games

A joyful, brain-building games playground made for **Dhondhu (age 4–5)**.
Built with React + TypeScript + Vite. See [SPEC.md](SPEC.md) for the full plan.

## Run it

```bash
npm install
npm run dev      # open the printed http://localhost:5173 URL
```

Other commands:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

## What's here

- **Home playground** — pick a *world* and a *size*, then choose a game.
- **5 themed worlds** that reskin the games: Animals 🦊, Space 🚀, Trucks 🚚, Dinos 🦕, Cars 🏎️.
- **3 difficulty sizes** shown as Sprout 🌱 / Tree 🌳 / Mountain ⛰️ — sizes, not words, because he can't read yet. Every game scales with the chosen size; nothing is locked.
- **Star Bank** — a persistent running total of stars (saved in the browser).
- **Soft synthesised sounds** (no audio files) with a mute toggle for grown-ups.
- **A confetti win celebration** at the end of every game.

### All 8 games are playable

| Game | What you do | Brain skill | Uses world theme |
|---|---|---|---|
| 🧠 Memory Match | Flip cards, find the pairs | Memory | ✅ |
| 🧺 Sort It Out | Drag each shape to its color basket | Categorizing (drag & drop) | — (colors) |
| 🧩 Puzzle Pals | Drag pieces to build the picture | Spatial reasoning | ✅ |
| 🎨 Magic Brush | Free-draw with crayons; glitter & rainbow at higher sizes | Creativity, fine motor | — (colors) |
| 🔢 Count With Me | Count the objects, tap the number | Numeracy | ✅ |
| 🌀 Maze Mole | Walk your character home (click or arrow keys), grab stars | Planning & logic | ✅ |
| 🔍 Spot It! | Find the one picture that's different | Visual attention | ✅ |
| 🟢 What's Next? | Complete the repeating pattern | Sequencing logic | ✅ |

## How it's built

| Area | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | Fast, lazy-loadable game modules |
| Routing | React Router (HashRouter) | Works hosted anywhere, no server rewrites |
| State | Zustand + `persist` | Tiny store; stars/level/world saved to `localStorage` |
| Sound | Web Audio API (synth) | Zero audio asset files; warm, soft tones |
| Win FX | Canvas confetti | Respects `prefers-reduced-motion` |

```
src/
├─ app/         App (routes), Home, GameHost
├─ components/  Brand, StarBank, Mascot, DifficultyPicker, WorldPicker,
│               GameCard, WinOverlay, Confetti, Star, MuteButton
├─ engine/      sound, difficulty
├─ data/        worlds (themes), games (registry)
├─ games/
│  ├─ registry.tsx   maps game id → component (the shared GameProps contract)
│  ├─ memory/  sort/  puzzle/  paint/
│  └─ count/   maze/  spot/    pattern/
├─ state/       store (zustand)
└─ styles/      tokens.css, global.css, games.css (shared game UI)
```

## Deploying to Cloudflare

This is a static single-page app (HashRouter, no backend), so it deploys as plain static
files — no Worker script, no SSR.

- **Build command:** `npm run build`
- **Output directory:** `dist`

[`wrangler.jsonc`](wrangler.jsonc) configures a **static-assets** deployment: it just uploads
`./dist`. Committing it is important — without it, `wrangler deploy` runs a "framework
auto-config" that injects `@cloudflare/vite-plugin` and re-builds, which needs a newer Node
than Cloudflare's default and fails with `node:module ... 'registerHooks'`. Our config
skips all of that.

**Simplest alternative:** a **Cloudflare Pages** project (Workers & Pages → Pages → Connect to
Git) with the two settings above. Pages publishes `dist/` directly and never runs `wrangler`,
so it needs no config at all.

## The game contract

Every game is a component of type `({ onWin }: GameProps) => JSX`. It reads `level`
and `world` from the store, calls `useStore().addStars(n)` as the child earns rewards,
and calls `onWin()` when the round is complete (the host awards a win bonus + confetti).

## Adding a new game

1. Add a folder `src/games/<id>/` with a `<Name>Game.tsx` implementing `GameProps`.
2. Register it in `src/games/registry.tsx`.
3. Add its card to `src/data/games.ts` with `playable: true`.

Difficulty scaling lives inside each game (a small `config(level)` helper), so a game
can scale whatever dimension makes *it* harder — more pairs, bigger maze, longer pattern.
