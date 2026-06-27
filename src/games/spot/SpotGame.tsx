import { useMemo, useState } from 'react'
import { useStore } from '../../state/store'
import { getWorld } from '../../data/worlds'
import { sound } from '../../engine/sound'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './spot.css'

function config(level: number) {
  return ({ 1: { n: 2, rounds: 4 }, 2: { n: 3, rounds: 4 }, 3: { n: 4, rounds: 5 } } as const)[level as 1 | 2 | 3]
}

interface Board { left: string[]; right: string[]; diff: number }

function buildBoard(icons: string[], n: number): Board {
  const cells = n * n
  const left = Array.from({ length: cells }, () => icons[Math.floor(Math.random() * icons.length)])
  const right = left.slice()
  const diff = Math.floor(Math.random() * cells)
  let other = icons[Math.floor(Math.random() * icons.length)]
  while (other === left[diff]) other = icons[Math.floor(Math.random() * icons.length)]
  right[diff] = other
  return { left, right, diff }
}

export function SpotGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  const world = useStore((s) => s.world)
  const { n, rounds } = config(level)
  const icons = getWorld(world).icons

  const [roundNo, setRoundNo] = useState(0)
  const [board, setBoard] = useState<Board>(() => buildBoard(icons, n))
  const [found, setFound] = useState(false)
  const [nope, setNope] = useState<string | null>(null)
  const cellPx = n <= 2 ? 130 : n === 3 ? 96 : 74
  // re-key cells on round change so animations replay
  const roundKey = useMemo(() => `r${roundNo}`, [roundNo])

  function tap(index: number, side: 'L' | 'R') {
    if (found) return
    if (index === board.diff) {
      sound.star()
      award(1)
      setFound(true)
      setTimeout(() => {
        if (roundNo + 1 >= rounds) {
          onWin()
        } else {
          setRoundNo((r) => r + 1)
          setBoard(buildBoard(icons, n))
          setFound(false)
        }
      }, 750)
    } else {
      sound.miss()
      const id = `${side}${index}`
      setNope(id)
      setTimeout(() => setNope((c) => (c === id ? null : c)), 450)
    }
  }

  const renderGrid = (cells: string[], side: 'L' | 'R') => (
    <div
      className="spot-grid"
      style={{ gridTemplateColumns: `repeat(${n}, ${cellPx}px)`, ['--scell' as string]: `${cellPx}px` }}
    >
      {cells.map((icon, i) => (
        <button
          key={`${roundKey}-${side}-${i}`}
          className={`spot-cell${found && i === board.diff ? ' found' : ''}${nope === `${side}${i}` ? ' nope' : ''}`}
          onClick={() => tap(i, side)}
          aria-label="Picture"
        >
          {icon}
        </button>
      ))}
    </div>
  )

  return (
    <div className="gx">
      <p className="gx-hint">One picture is different in the two boxes. Can you tap it? 🔍</p>

      <div className="rounddots" aria-label={`Round ${roundNo + 1} of ${rounds}`}>
        {Array.from({ length: rounds }).map((_, i) => (
          <i key={i} className={i <= roundNo ? 'on' : ''} />
        ))}
      </div>

      <div className="spot-panels">
        {renderGrid(board.left, 'L')}
        <span className="spot-vs" aria-hidden="true">vs</span>
        {renderGrid(board.right, 'R')}
      </div>

      <div className="gx-foot">
        <span className="scorepill"><Star /> {roundNo + (found ? 1 : 0)} / {rounds}</span>
      </div>
    </div>
  )
}
