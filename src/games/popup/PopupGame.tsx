import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { getWorld } from '../../data/worlds'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './popup.css'

function config(level: number) {
  return ({
    1: { holes: 4, cols: 2, target: 10, upMs: 1150, spawn: 850, bombs: false },
    2: { holes: 6, cols: 3, target: 14, upMs: 950, spawn: 680, bombs: false },
    3: { holes: 9, cols: 3, target: 18, upMs: 780, spawn: 560, bombs: true },
  } as const)[level as 1 | 2 | 3]
}

interface Cell { icon: string; bomb: boolean; key: number }

export function PopupGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const world = useStore((s) => s.world)
  const cfg = config(level)
  const icons = getWorld(world).icons

  const HOLES = Array.from({ length: cfg.holes }, (_, i) => i)
  const cellsRef = useRef<Record<number, Cell | undefined>>({})
  const [cells, setCells] = useState<Record<number, Cell | undefined>>({})
  const [score, setScore] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)
  const goalRef = useRef<number>(cfg.target)
  const keyRef = useRef(0)
  const poppedRef = useRef(0)
  const doneRef = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  useEffect(() => {
    const spawn = () => {
      if (doneRef.current) return
      const cur = cellsRef.current
      const free = HOLES.filter((i) => !cur[i])
      if (!free.length) return
      const idx = free[Math.floor(Math.random() * free.length)]
      const key = ++keyRef.current
      const bomb = cfg.bombs && Math.random() < 0.22
      const icon = bomb ? '💣' : icons[Math.floor(Math.random() * icons.length)]
      const next = { ...cur, [idx]: { icon, bomb, key } }
      cellsRef.current = next
      setCells(next)
      timers.current.push(
        window.setTimeout(() => {
          if (cellsRef.current[idx]?.key === key) {
            const n = { ...cellsRef.current, [idx]: undefined }
            cellsRef.current = n
            setCells(n)
          }
        }, cfg.upMs),
      )
    }
    const iv = setInterval(spawn, cfg.spawn)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.spawn, cfg.upMs, cfg.bombs])

  function tap(e: React.PointerEvent, idx: number) {
    const c = cellsRef.current[idx]
    if (!c || doneRef.current) return
    const n = { ...cellsRef.current, [idx]: undefined }
    cellsRef.current = n
    setCells(n)
    if (c.bomb) {
      sound.miss()
      return
    }
    sound.pop()
    burst(e.clientX, e.clientY, 'pop')
    award(1)
    poppedRef.current += 1
    setScore(poppedRef.current)
    if (poppedRef.current >= goalRef.current && !doneRef.current) {
      doneRef.current = true
      setTimeout(onWin, 450)
    }
  }

  return (
    <div className="gx-fill">
      <div className="popup-area">
        <span className="play-hud iconpill"><Star /> {score} / {goal}</span>
        <div className="popup-grid" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}>
          {HOLES.map((i) => {
            const c = cells[i]
            return (
              <div key={i} className={`hole${c ? ' up' : ''}`}>
                <button className="critter" onPointerDown={(e) => tap(e, i)} aria-label={c ? 'Pop!' : 'Hole'}>
                  {c?.icon ?? '🐹'}
                </button>
                <div className="dirt" />
              </div>
            )
          })}
        </div>
        <span className="popup-hint">Tap the critters as they pop up! {cfg.bombs ? 'Avoid the 💣!' : ''}</span>
      </div>
    </div>
  )
}
