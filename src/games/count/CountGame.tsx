import { useMemo, useState } from 'react'
import { useStore } from '../../state/store'
import { getWorld } from '../../data/worlds'
import { sound } from '../../engine/sound'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './count.css'

function config(level: number) {
  return ({ 1: { max: 3, rounds: 4 }, 2: { max: 5, rounds: 4 }, 3: { max: 10, rounds: 5 } } as const)[
    level as 1 | 2 | 3
  ]
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

interface Round { count: number; choices: number[] }

function makeRound(max: number): Round {
  const count = 1 + Math.floor(Math.random() * max)
  const set = new Set<number>([count])
  while (set.size < 3) {
    const d = count + (Math.floor(Math.random() * 5) - 2)
    if (d >= 1 && d <= max) set.add(d)
  }
  return { count, choices: shuffle([...set]) }
}

export function CountGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  const world = useStore((s) => s.world)
  const { max, rounds } = config(level)
  const icon = getWorld(world).icons[0]

  const [roundNo, setRoundNo] = useState(0)
  const [round, setRound] = useState<Round>(() => makeRound(max))
  const [wrongChoice, setWrongChoice] = useState<number | null>(null)
  const [rightChoice, setRightChoice] = useState<number | null>(null)
  const items = useMemo(() => Array.from({ length: round.count }), [round])

  function pick(n: number) {
    if (rightChoice !== null) return
    if (n === round.count) {
      sound.star()
      award(1)
      setRightChoice(n)
      setTimeout(() => {
        if (roundNo + 1 >= rounds) {
          onWin()
        } else {
          setRoundNo((r) => r + 1)
          setRound(makeRound(max))
          setRightChoice(null)
          setWrongChoice(null)
        }
      }, 700)
    } else {
      sound.miss()
      setWrongChoice(n)
      setTimeout(() => setWrongChoice((c) => (c === n ? null : c)), 450)
    }
  }

  return (
    <div className="gx">
      <p className="gx-hint">How many do you see? Tap the right number! 🔢</p>

      <div className="rounddots" aria-label={`Round ${roundNo + 1} of ${rounds}`}>
        {Array.from({ length: rounds }).map((_, i) => (
          <i key={i} className={i <= roundNo ? 'on' : ''} />
        ))}
      </div>

      <div className="count-pond" aria-label={`${round.count} ${icon}`}>
        {items.map((_, i) => (
          <span key={`${roundNo}-${i}`} className="count-item" style={{ animationDelay: `${i * 0.05}s` }} aria-hidden="true">
            {icon}
          </span>
        ))}
      </div>

      <div className="choices">
        {round.choices.map((n) => (
          <button
            key={n}
            className={`choice num${wrongChoice === n ? ' wrong' : ''}${rightChoice === n ? ' right' : ''}`}
            onClick={() => pick(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="gx-foot">
        <span className="scorepill"><Star /> {roundNo + (rightChoice !== null ? 1 : 0)} / {rounds}</span>
      </div>
    </div>
  )
}
