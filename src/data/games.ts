export interface GameDef {
  id: string
  title: string
  tagline: string
  icon: string
  /** CSS color token for this game's accent. */
  accent: string
  /** Short label shown on the card. */
  tag: string
  playable: boolean
  /** Arcade-style games that can resume in place when the player picks "Keep playing".
   *  (Round/puzzle games instead start a fresh round.) */
  endless?: boolean
}

export const GAMES: GameDef[] = [
  { id: 'memory', title: 'Memory Match', tagline: 'Flip the cards. Find the twins!', icon: '🧠', accent: 'var(--grape)', tag: 'Memory', playable: true },
  { id: 'bubble', title: 'Bubble Pop', tagline: 'Pop the bubbles — pop pop pop!', icon: '🫧', accent: 'var(--sky)', tag: 'Pop', playable: true, endless: true },
  { id: 'balloons', title: 'Pop the Balloons', tagline: 'Pop them before they float away!', icon: '🎈', accent: 'var(--berry)', tag: 'Reflex', playable: true, endless: true },
  { id: 'catch', title: 'Catch the Treats', tagline: 'Catch the goodies in your basket!', icon: '🧺', accent: 'var(--mint)', tag: 'Catch', playable: true, endless: true },
  { id: 'monster', title: 'Feed the Monster', tagline: 'Give the monster the food it wants!', icon: '👾', accent: 'var(--grape)', tag: 'Drag & Drop', playable: true, endless: true },
  { id: 'race', title: 'Race Car', tagline: 'Steer to grab stars, dodge the cones!', icon: '🏎️', accent: 'var(--berry)', tag: 'Driving', playable: true, endless: true },
  { id: 'space', title: 'Space Pop', tagline: 'Arrow keys to fly, space to pop rocks!', icon: '🚀', accent: 'var(--sky)', tag: 'Keyboard', playable: true, endless: true },
  { id: 'popup', title: 'Pop-Up Pals', tagline: 'Tap the critters as they pop up!', icon: '🐹', accent: 'var(--mint)', tag: 'Reflex', playable: true, endless: true },
  { id: 'puzzle', title: 'Puzzle Pals', tagline: 'Build the lovely picture, piece by piece.', icon: '🧩', accent: 'var(--mint)', tag: 'Puzzle', playable: true },
  { id: 'sort', title: 'Sort It Out', tagline: 'Drag each one to its color basket.', icon: '🌈', accent: 'var(--sky)', tag: 'Drag & Drop', playable: true },
  { id: 'paint', title: 'Magic Brush', tagline: 'Draw and color anything you like.', icon: '🎨', accent: 'var(--berry)', tag: 'Drawing', playable: true },
  { id: 'count', title: 'Count With Me', tagline: 'How many? Tap the number.', icon: '🔢', accent: 'var(--sun)', tag: 'Numbers', playable: true },
  { id: 'spot', title: 'Spot It!', tagline: 'Find the one that is different.', icon: '🔍', accent: 'var(--grape)', tag: 'Looking', playable: true },
  { id: 'wash', title: 'Car Wash', tagline: 'Power-wash the muddy car till it shines!', icon: '🚿', accent: 'var(--sky)', tag: 'Spray', playable: true },
]

export function getGame(id: string | undefined): GameDef | undefined {
  return GAMES.find((g) => g.id === id)
}
