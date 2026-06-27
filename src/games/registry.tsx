import type { ComponentType } from 'react'
import { MemoryGame } from './memory/MemoryGame'
import { SortGame } from './sort/SortGame'
import { PuzzleGame } from './puzzle/PuzzleGame'
import { PaintGame } from './paint/PaintGame'
import { CountGame } from './count/CountGame'
import { SpotGame } from './spot/SpotGame'
import { BubbleGame } from './bubble/BubbleGame'
import { BalloonsGame } from './balloons/BalloonsGame'
import { CatchGame } from './catch/CatchGame'
import { MonsterGame } from './monster/MonsterGame'
import { RaceGame } from './race/RaceGame'
import { SpaceGame } from './space/SpaceGame'
import { PopupGame } from './popup/PopupGame'
import { WashGame } from './wash/WashGame'

/** Every game implements the same contract. */
export interface GameProps {
  /** Call when the round is complete — the host shows the win celebration + bonus. */
  onWin: () => void
  /** Award stars for an in-game action (counts toward this game's total + the grand total). */
  award: (n: number) => void
  /** Increments when the player picks "Keep playing". Endless games watch this
   *  (via useContinue) to clear their done flag and extend the goal. */
  continueToken?: number
}

export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  memory: MemoryGame,
  sort: SortGame,
  puzzle: PuzzleGame,
  paint: PaintGame,
  count: CountGame,
  spot: SpotGame,
  bubble: BubbleGame,
  balloons: BalloonsGame,
  catch: CatchGame,
  monster: MonsterGame,
  race: RaceGame,
  space: SpaceGame,
  popup: PopupGame,
  wash: WashGame,
}
