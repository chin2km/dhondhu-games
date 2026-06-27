import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './balloons.css'

const COLORS = [
  { id: 'red', hex: '#FF6B6B', name: 'red' },
  { id: 'blue', hex: '#4DABF7', name: 'blue' },
  { id: 'green', hex: '#34C7A6', name: 'green' },
  { id: 'yellow', hex: '#FFC93C', name: 'yellow' },
  { id: 'purple', hex: '#845EF7', name: 'purple' },
]

function config(level: number) {
  return ({
    1: { target: 8, spawn: 850, dur: [7, 10], pickColor: false, shuffleColor: false },
    2: { target: 10, spawn: 700, dur: [5.5, 8], pickColor: true, shuffleColor: false },
    3: { target: 12, spawn: 560, dur: [4, 6.5], pickColor: true, shuffleColor: true },
  } as const)[level as 1 | 2 | 3]
}

interface Balloon { id: number; x: number; color: string; dur: number }

export function BalloonsGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [popped, setPopped] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)
  const goalRef = useRef<number>(cfg.target)
  const [target, setTarget] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [wrongId, setWrongId] = useState<number | null>(null)
  const idRef = useRef(0)
  const doneRef = useRef(false)

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  useEffect(() => {
    const iv = setInterval(() => {
      setBalloons((b) => {
        if (b.length > 12 || doneRef.current) return b
        return [
          ...b,
          {
            id: idRef.current++,
            x: 4 + Math.random() * 82,
            color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
            dur: cfg.dur[0] + Math.random() * (cfg.dur[1] - cfg.dur[0]),
          },
        ]
      })
    }, cfg.spawn)
    return () => clearInterval(iv)
  }, [cfg.spawn, cfg.dur])

  // At the hardest size, change the wanted color now and then.
  useEffect(() => {
    if (!cfg.shuffleColor) return
    const iv = setInterval(() => setTarget(COLORS[Math.floor(Math.random() * COLORS.length)]), 6000)
    return () => clearInterval(iv)
  }, [cfg.shuffleColor])

  const remove = (id: number) => setBalloons((b) => b.filter((x) => x.id !== id))

  function pop(e: React.MouseEvent, bal: Balloon) {
    e.stopPropagation()
    if (doneRef.current) return
    const color = COLORS.find((c) => c.id === bal.color)!
    if (cfg.pickColor && bal.color !== target.id) {
      sound.miss()
      setWrongId(bal.id)
      setTimeout(() => setWrongId((w) => (w === bal.id ? null : w)), 300)
      return
    }
    sound.pop()
    burst(e.clientX, e.clientY, 'pop', [color.hex, '#ffffff'])
    remove(bal.id)
    award(1)
    setPopped((p) => {
      const np = p + 1
      if (np >= goalRef.current && !doneRef.current) {
        doneRef.current = true
        setTimeout(onWin, 450)
      }
      return np
    })
  }

  return (
    <div className="gx-fill">
      <div className="balloon-area">
        <span className="balloon-goal iconpill">
          {cfg.pickColor ? (
            <>Pop <span className="swatch-dot" style={{ background: target.hex }} /> {target.name}!</>
          ) : (
            <><Star /> {popped} / {goal}</>
          )}
        </span>
        {cfg.pickColor && (
          <span className="play-hud iconpill" style={{ top: 56 }}><Star /> {popped} / {goal}</span>
        )}
        {balloons.map((b) => {
          const color = COLORS.find((c) => c.id === b.color)!
          return (
            <button
              key={b.id}
              className={`balloon${wrongId === b.id ? ' wrong' : ''}`}
              style={{ left: `${b.x}%`, animationDuration: `${b.dur}s` }}
              onClick={(e) => pop(e, b)}
              onAnimationEnd={() => remove(b.id)}
              aria-label={`${color.name} balloon`}
            >
              <span className="body" style={{ background: `radial-gradient(circle at 32% 28%, #fff, ${color.hex})`, color: color.hex }}>
                <span className="shine" />
              </span>
              <span className="string" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
