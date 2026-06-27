import { useMemo, useState } from 'react'
import type { Level } from '../../state/store'
import { useStore } from '../../state/store'
import { getWorld } from '../../data/worlds'
import type { WorldId } from '../../state/store'
import { memoryPairs } from '../../engine/difficulty'
import { sound } from '../../engine/sound'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './memory.css'

interface Card {
  key: number
  icon: string
  up: boolean
  done: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(level: Level, worldId: WorldId): Card[] {
  const pairs = memoryPairs(level)
  const icons = getWorld(worldId).icons.slice(0, pairs)
  const doubled = icons.flatMap((icon) => [icon, icon])
  return shuffle(doubled).map((icon, i) => ({ key: i, icon, up: false, done: false }))
}

export function MemoryGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  const world = useStore((s) => s.world)

  const [cards, setCards] = useState<Card[]>(() => buildDeck(level, world))
  const [firstIdx, setFirstIdx] = useState<number | null>(null)
  const [lock, setLock] = useState(false)
  const [score, setScore] = useState(0)

  const pairs = memoryPairs(level)
  const columns = pairs <= 3 ? 3 : 4
  const matched = useMemo(() => cards.filter((c) => c.done).length / 2, [cards])

  function flip(idx: number) {
    if (lock) return
    const card = cards[idx]
    if (card.up || card.done) return

    sound.click()
    const turned = cards.map((c, i) => (i === idx ? { ...c, up: true } : c))
    setCards(turned)

    if (firstIdx === null) {
      setFirstIdx(idx)
      return
    }

    // Second card turned — check for a match.
    const a = turned[firstIdx]
    const b = turned[idx]
    if (a.icon === b.icon) {
      const cleared = turned.map((c, i) => (i === firstIdx || i === idx ? { ...c, done: true } : c))
      setCards(cleared)
      setFirstIdx(null)
      setScore((s) => s + 1)
      award(1)
      sound.star()
      if (cleared.every((c) => c.done)) {
        setTimeout(onWin, 550)
      }
    } else {
      setLock(true)
      sound.miss()
      const aIdx = firstIdx
      setFirstIdx(null)
      setTimeout(() => {
        setCards((prev) => prev.map((c, i) => (i === aIdx || i === idx ? { ...c, up: false } : c)))
        setLock(false)
      }, 850)
    }
  }

  return (
    <div className="memory">
      <p className="demo-hint">Flip two cards. Find the matching pair to earn a star! ⭐</p>
      <div className="mboard" style={{ gridTemplateColumns: `repeat(${columns}, clamp(76px, 14vmin, 140px))` }} aria-label="Memory game board">
        {cards.map((card, i) => (
          <button
            key={card.key}
            className={`mcard${card.up ? ' up' : ''}${card.done ? ' done' : ''}`}
            onClick={() => flip(i)}
            disabled={card.done}
            aria-label={card.up || card.done ? card.icon : 'Hidden card'}
          >
            <span className="q" aria-hidden="true">?</span>
            <span className="face" aria-hidden="true">{card.icon}</span>
          </button>
        ))}
      </div>
      <div className="memory-foot">
        <span className="scorepill">
          <Star />
          {score} / {pairs} pairs
        </span>
      </div>
    </div>
  )
}
