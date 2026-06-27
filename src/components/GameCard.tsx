import { useNavigate } from 'react-router-dom'
import type { GameDef } from '../data/games'
import { useStore } from '../state/store'
import { sound } from '../engine/sound'
import { Star } from './Star'

interface GameCardProps {
  game: GameDef
  featured?: boolean
  index?: number
}

/** A console-style game tile showing this game's earned stars. */
export function GameCard({ game, featured = false, index = 0 }: GameCardProps) {
  const navigate = useNavigate()
  const stars = useStore((s) => s.gameStars[game.id] ?? 0)

  return (
    <button
      className={`gcard${featured ? ' featured' : ''}`}
      style={{ ['--c' as string]: game.accent, animationDelay: `${Math.min(index, 12) * 0.04}s` }}
      aria-label={`Play ${game.title}${stars ? `, ${stars} stars earned` : ''}`}
      onClick={() => {
        sound.click()
        navigate(`/play/${game.id}`)
      }}
    >
      {featured && <span className="fav-ribbon" aria-hidden="true">★ Most played</span>}
      <span className="gcard-stars" aria-hidden="true">
        <Star size={16} /> {stars}
      </span>
      <span className="blob" aria-hidden="true" />
      <span className="gicon" aria-hidden="true">{game.icon}</span>
      <h3>{game.title}</h3>
      <p>{game.tagline}</p>
      <span className="tag">{game.tag}</span>
      <span className="play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill={game.accent === 'var(--sun)' ? '#3A2E5C' : '#fff'}>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  )
}
