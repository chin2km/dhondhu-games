import { useEffect } from 'react'
import { Confetti } from './Confetti'
import { Star } from './Star'
import { sound } from '../engine/sound'

interface WinOverlayProps {
  bonus: number
  /** Continue the same game without resetting (endless games keep their score & extend the goal). */
  onKeepPlaying: () => void
  /** Start the game over from scratch. */
  onNewGame: () => void
  /** Label for the continue button — "Keep playing" (endless) or "Next round" (round games). */
  keepLabel?: string
}

/** The big joyful "You did it!" moment shown when a round is completed. */
export function WinOverlay({ bonus, onKeepPlaying, onNewGame, keepLabel = 'Keep playing' }: WinOverlayProps) {
  useEffect(() => {
    sound.win()
  }, [])

  return (
    <>
      <Confetti />
      <div className="overlay" role="dialog" aria-modal="true" aria-label="You did it">
        <div className="winbox">
          <div className="win-stars" aria-hidden="true">
            <Star size={54} />
            <Star size={54} />
            <Star size={54} />
          </div>
          <h2>You did it! 🎉</h2>
          <p>Amazing job, Dhondhu! You earned {bonus} stars.</p>
          <div className="win-actions">
            <button className="btn grape" onClick={onKeepPlaying}>{keepLabel} ▶</button>
            <button className="btn ghost" onClick={onNewGame}>New game ↺</button>
          </div>
        </div>
      </div>
    </>
  )
}
