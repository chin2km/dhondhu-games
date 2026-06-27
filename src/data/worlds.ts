import type { WorldId } from '../state/store'

export interface World {
  id: WorldId
  name: string
  emoji: string
  accent: string
  /** Picture tokens used to skin games (e.g. memory card faces). At least 8. */
  icons: string[]
}

export const WORLDS: World[] = [
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🦊',
    accent: 'var(--mint)',
    icons: ['🦊', '🐢', '🐝', '🐸', '🦁', '🐼', '🐧', '🦉', '🐙'],
  },
  {
    id: 'space',
    name: 'Space',
    emoji: '🚀',
    accent: 'var(--grape)',
    icons: ['🚀', '🪐', '🌟', '🌙', '☄️', '👽', '🛸', '🌍', '⭐'],
  },
  {
    id: 'vehicles',
    name: 'Trucks',
    emoji: '🚚',
    accent: 'var(--sky)',
    icons: ['🚚', '🚜', '🚂', '🚁', '✈️', '🚌', '🚒', '🚓', '🛵'],
  },
  {
    id: 'dinosaurs',
    name: 'Dinos',
    emoji: '🦕',
    accent: 'var(--berry)',
    icons: ['🦕', '🦖', '🐉', '🥚', '🌋', '🦴', '🌿', '🪨'],
  },
  {
    id: 'cars',
    name: 'Cars',
    emoji: '🏎️',
    accent: 'var(--sun)',
    icons: ['🏎️', '🚗', '🚙', '🚕', '🛻', '🚐', '🚖', '🚘'],
  },
]

export function getWorld(id: WorldId): World {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0]
}
