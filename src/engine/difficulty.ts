import type { Level } from '../state/store'

export const LEVELS: { value: Level; name: string; seed: string; accent: string }[] = [
  { value: 1, name: 'Sprout', seed: '🌱', accent: 'var(--mint)' },
  { value: 2, name: 'Tree', seed: '🌳', accent: 'var(--sky)' },
  { value: 3, name: 'Mountain', seed: '⛰️', accent: 'var(--grape)' },
]

/** Number of pairs in Memory Match per difficulty size. */
export function memoryPairs(level: Level): number {
  return ({ 1: 3, 2: 6, 3: 8 } as const)[level]
}

/**
 * Adaptive nudge: after a streak of wins we suggest growing bigger; after
 * repeated struggles we ease back. Returns the suggested next level (or the
 * same level if no change). The UI keeps the child/parent in final control.
 */
export function nextLevel(current: Level, winStreak: number): Level {
  if (winStreak >= 3 && current < 3) return (current + 1) as Level
  return current
}
