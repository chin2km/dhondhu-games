import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Level = 1 | 2 | 3
export type WorldId = 'animals' | 'space' | 'vehicles' | 'dinosaurs' | 'cars'
export type Mode = 'light' | 'dark'

interface GameState {
  /** Lifetime stars across all games (the grand total in the top bar). */
  stars: number
  /** Lifetime stars per game id. */
  gameStars: Record<string, number>
  /** Best stars-in-one-round per game id. */
  best: Record<string, number>
  /** Difficulty size: 1 = Sprout, 2 = Tree, 3 = Mountain. */
  level: Level
  /** The themed world used to skin the games. */
  world: WorldId
  /** Sound on/off. */
  muted: boolean
  /** Light or dark appearance. */
  mode: Mode
  /** How many game rounds have been completed. */
  gamesPlayed: number
  /** How many times each game has been opened — drives "most played" sorting. */
  playCount: Record<string, number>

  /** Award stars to a game (and the grand total). */
  addStars: (n: number, gameId?: string) => void
  /** Record the best single-round score for a game. */
  recordBest: (gameId: string, score: number) => void
  /** Note that a game was opened (for most-played ordering). */
  recordPlay: (gameId: string) => void
  setLevel: (l: Level) => void
  setWorld: (w: WorldId) => void
  toggleMute: () => void
  toggleMode: () => void
  recordGame: () => void
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      stars: 0,
      gameStars: {},
      best: {},
      level: 1,
      world: 'animals',
      muted: false,
      mode: 'light',
      gamesPlayed: 0,
      playCount: {},

      addStars: (n, gameId) =>
        set((s) => ({
          stars: s.stars + n,
          gameStars: gameId ? { ...s.gameStars, [gameId]: (s.gameStars[gameId] ?? 0) + n } : s.gameStars,
        })),
      recordBest: (gameId, score) =>
        set((s) => (score > (s.best[gameId] ?? 0) ? { best: { ...s.best, [gameId]: score } } : s)),
      recordPlay: (gameId) =>
        set((s) => ({ playCount: { ...s.playCount, [gameId]: (s.playCount[gameId] ?? 0) + 1 } })),
      setLevel: (l) => set({ level: l }),
      setWorld: (w) => set({ world: w }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      recordGame: () => set((s) => ({ gamesPlayed: s.gamesPlayed + 1 })),
    }),
    { name: 'dhondhu-games' },
  ),
)
