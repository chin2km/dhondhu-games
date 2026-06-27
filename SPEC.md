# Dondhu Games — Plan & Specification

A joyful, brain-building online games playground built for **Dhondhu (age 4–5)**, played on a **laptop/desktop** with a mouse.

> Design north star: **Big, forgiving, almost text-free, and bursting with celebration.** A 4–5 year old can't read instructions, can't aim a mouse precisely, and gives up fast if confused. Every decision below serves that reality.

---

## 1. Who we're designing for (and what it means)

| Reality of a 4–5 year old | What we do about it |
|---|---|
| Can't read sentences yet | No instructions in text. Use icons, a friendly **voice-over narrator**, animated demos ("watch, then you try"), and color. |
| Limited mouse precision | **Huge tap/drag targets** (min 64px, ideally 90px+). Drag-and-drop **snaps** generously — drop *near* the target counts. No tiny buttons, no double-clicks, no right-click. |
| Short attention span | Each round is **30–90 seconds**. Instant feedback on every action. Win celebration within a couple of minutes. |
| Big emotions | **Never punish.** No "Game Over", no red X with a buzzer, no timers that stress. Wrong answers gently bounce back with a soft sound and a "try again" wiggle. |
| Motivated by delight, not scores | **Stars** as the universal reward. Sounds, confetti, the mascot cheering, things that sparkle and bounce. |
| Loves repetition & mastery | Same games, progressively harder. Seeing his **star bank grow** and his **level "grow" (sprout → tree → mountain)**. |

---

## 2. Core experience pillars

1. **Stars are the currency of joy.** Every good action earns a star with a satisfying *ding* and animation. Stars accumulate in a visible bank. They unlock new sticker/mascot outfits (cosmetic only — no gambling, no purchases).
2. **Winning is a *moment*.** Confetti, the mascot doing a happy dance, a fanfare sound, three big stars popping in. This is the payoff your son will chase. (Already prototyped in the mockup.)
3. **Difficulty is a friendly choice AND adapts.** Three sizes shown as **🌱 Sprout / 🌳 Tree / ⛰️ Mountain** (not the words "easy/medium/hard" — he can't read them, but he understands *small → big*). The game also nudges difficulty up automatically after a streak of wins, and quietly down if he's struggling, so he's always in the "just right" zone.
4. **Brain development is the hidden curriculum.** Each game secretly trains a skill: memory, logic/sequencing, pattern recognition, counting, spatial reasoning, fine motor control, focus.
5. **A calm, safe sandbox.** No ads, no chat, no external links, no in-app purchases, no account required to play. A simple parent area shows progress.

---

## 3. The games (launch set + roadmap)

Each game maps to a brain skill and a chosen tech. Not all games share a stack — pick the right tool per game.

### Tier 1 — Build first (covers all four mechanics you asked for)

| Game | Mechanic | Brain skill | Tech | Why this tech |
|---|---|---|---|---|
| **🧠 Memory Match** | Memory / matching | Working memory | React + DOM/CSS | Cards, flips, simple state — DOM is perfect. *(Working in the mockup.)* |
| **🧺 Sort It Out** | Drag & drop | Categorization | React + `@dnd-kit` | Best-in-class accessible, touch+mouse drag with generous snapping. |
| **🧩 Puzzle Pals** (jigsaw) | Drag & drop puzzle | Spatial reasoning | React + Canvas 2D | Canvas handles arbitrary piece shapes and snap-to-slot smoothly. |
| **🎨 Magic Brush** (trace & color) | Drawing | Fine motor + creativity | Canvas 2D | Freehand brush strokes, fill-by-tap, guided tracing paths. |

### Tier 2 — Add next

| Game | Mechanic | Brain skill | Tech |
|---|---|---|---|
| **🔢 Count With Me** | Tap counting | Numeracy | React DOM |
| **🌀 Maze Mole** | Path drawing / arrows | Planning & logic | Canvas 2D |
| **🔍 Spot It!** (spot the difference) | Looking / tapping | Visual attention | Canvas 2D / image hotspots |
| **🟢 What's Next?** | Pattern completion | Sequencing logic | React DOM |

### Tier 3 — Later / wow-factor

- **Build-a-Scene** free play (drag stickers onto a background, drawing combined).
- **Shape Shadows** (match object to its silhouette).
- **Sound Match** (audio memory — match animal sounds).
- A **WebGL/Three.js** game for a "wow" 3D toy (e.g. stacking blocks) once the core is solid.

---

## 4. Difficulty model (per game)

Three named levels, each scaling the parameters that make a game harder — *not* by adding reading or stress, but by adding **quantity, similarity, and steps**.

| | 🌱 Sprout (3–4) | 🌳 Tree | ⛰️ Mountain |
|---|---|---|---|
| Memory Match | 3 pairs (6 cards) | 6 pairs | 8 pairs |
| Sort It Out | 2 baskets, obvious | 3 baskets | 4 baskets, subtle categories |
| Puzzle Pals | 4 big pieces | 9 pieces | 12–16 pieces |
| Count With Me | up to 5 | up to 10 | up to 20 |
| Pattern | AB pattern | ABC | ABAC / longer |

**Adaptive nudge:** after **3 wins in a row** at a level, the game offers (with a happy animation) to "grow bigger". After **2 struggles** (many retries / abandons), it quietly eases back. The manual size picker is always available — the parent or child stays in control.

---

## 5. Reward & progression system

- **Stars** — earned per correct action and per completed round. The win screen always grants a fixed bonus (e.g. 3 stars) so finishing always feels great.
- **Star Bank** — a persistent running total, always visible top-right.
- **Sticker Book / Mascot wardrobe** — stars unlock cosmetic items: hats and outfits for **Twinkle** the star mascot, background scenes, new brush colors. Purely cosmetic, collect-them-all motivation. No real money, ever.
- **Growth level** — 🌱 → 🌳 → ⛰️ visualizes overall mastery.
- **Day streak** — gentle "you played 3 days in a row!" encouragement (no punishment for breaking it).

All progress persists locally (see §7). Optional cloud sync later.

---

## 6. The mascot — "Twinkle"

A friendly smiling star (in the mockup). Twinkle:
- Greets him by name on the home screen (audio + animation).
- **Demonstrates** each game once before the first play (no reading needed).
- Cheers on wins, gives a soft encouraging "ooh, try again!" wiggle on misses.
- Is the thing he dresses up with earned stars — the emotional anchor of the whole site.

---

## 7. Technical architecture

**Stack:** React + TypeScript + **Vite**. Routing via React Router. Each game is a lazy-loaded module so the bundle stays small and games can use different rendering tech independently.

```
dondhu-games/
├─ src/
│  ├─ app/                 # shell: home, routing, layout, audio provider
│  ├─ components/          # StarBank, DifficultyPicker, GameCard, WinOverlay, Mascot
│  ├─ games/
│  │  ├─ memory/           # React DOM
│  │  ├─ sort/             # @dnd-kit
│  │  ├─ puzzle/           # Canvas 2D
│  │  ├─ paint/            # Canvas 2D
│  │  └─ <game>/           # each self-contained; shared GameContract interface
│  ├─ engine/              # shared: scoring, difficulty, persistence, confetti, sound
│  ├─ assets/              # images, sprites, audio (sfx + narration)
│  └─ state/               # star bank, progress, settings (Zustand)
├─ public/
└─ index.html
```

**Shared "Game Contract"** — every game implements the same interface so the shell can host any of them uniformly:

```ts
interface Game {
  id: string;
  title: string;
  accent: string;            // its color
  skill: BrainSkill;
  levels: 3;                 // sprout / tree / mountain
  mount(container, { level, onStar, onWin, onRetry }): () => void; // returns cleanup
}
```

**Key libraries**
- `@dnd-kit/core` — accessible, forgiving drag & drop (mouse + touch).
- `zustand` — tiny state store for star bank / progress / settings.
- `canvas-confetti` *or* the hand-rolled canvas confetti already prototyped — for win celebrations.
- `howler.js` — reliable sound effects + voice narration playback.
- Framer Motion (optional) — spring/bounce micro-interactions.

**Audio** is first-class (it replaces reading): a soft click on tap, a *ding* on star, a gentle *boing* on miss, a fanfare on win, plus short recorded **voice prompts** ("Find the two foxes!"). Include a mute toggle in the parent area.

**State & persistence**
- All progress in `localStorage` (works offline, zero backend needed for v1).
- Make it a **PWA** (installable, offline-capable) so it feels like a real app on the laptop and loads instantly.
- *Optional later:* a small backend (Supabase/Firebase) for cloud-synced progress across devices.

**Performance & quality**
- 60fps target for canvas games; pause render loops when a game isn't mounted.
- Respect `prefers-reduced-motion` (dial back ambient animation; keep essential feedback).
- Keyboard-operable and screen-reader-labeled where feasible (good practice + helps you test).
- No network calls during play. No third-party tracking.

---

## 8. Visual & sound identity

- **Palette:** sky-cream ground `#FFF9F0`, grape-ink text `#3A2E5C`; accents — sunshine `#FFC93C` (stars), strawberry `#FF6B6B`, mint `#34C7A6`, sky `#4DABF7`, grape `#845EF7`. Each game owns one accent so it's recognizable by color before he can read its name.
- **Type:** chunky rounded display + soft rounded body. Large sizes, high contrast.
- **Shape language:** fat rounded corners, soft drop-shadows, bouncy springs, things that wobble and sparkle. Nothing sharp or "serious".
- **Sound:** warm, soft, never harsh. Celebratory but not overstimulating.

---

## 9. Build roadmap

**Phase 0 — Foundation (week 1)**
Vite + React + TS scaffold, routing, design tokens, shell layout, Star Bank + persistence, Mascot component, Win Overlay + confetti, audio provider, Difficulty Picker. *(All of these are demonstrated in the mockup.)*

**Phase 1 — First playable (week 2)**
Ship **Memory Match** end-to-end through the real shell (it's already prototyped). This validates the whole loop: pick size → play → earn stars → win → celebrate → bank grows.

**Phase 2 — The four mechanics (weeks 3–4)**
Add **Sort It Out** (drag/drop), **Puzzle Pals** (canvas puzzle), **Magic Brush** (drawing). Now all four requested mechanics exist.

**Phase 3 — Breadth & polish (weeks 5–6)**
Tier 2 games, adaptive difficulty, sticker book / mascot wardrobe, day streak, PWA install, full sound pass, parent area.

**Phase 4 — Wow & scale (later)**
WebGL toy, cloud sync, more games, seasonal themes.

---

## 10. Decisions made

- **Name:** ✅ **Dhondhu Games** (matches his name).
- **Age / device:** ✅ 4–5, laptop/desktop (mouse-first, forgiving targets).
- **Themed worlds:** ✅ Animals, Space, Trucks, Dinosaurs, Cars — implemented as selectable *worlds* that reskin the games (the same Memory Match becomes rockets, dinos, or cars). Easy to add more.

## 11. Still open (your call later)

1. **Language:** English only, or some content / narration in another language too?
2. **Hosting:** just on his laptop, or a public URL (Vercel/Netlify) so he can play anywhere and family can see?
3. **Voice narration:** record prompts in your own voice (lovely for a 4-yo), or use a synthesized friendly voice? (Current sounds are warm synth tones, no voice yet.)

---

*This spec is the plan; the live mockup is the proof of feel; the app in this repo is Phase 1 built. Next: wire up the three remaining core mechanics (Sort It Out, Puzzle Pals, Magic Brush).*
