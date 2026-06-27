import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './bubble.css'

const HUES = ['#4DABF7', '#34C7A6', '#845EF7', '#FF8FB1', '#FFC93C', '#FF6B6B']

function config(level: number) {
  return ({
    1: { target: 8, spawn: 950, dur: [8, 11] },
    2: { target: 12, spawn: 750, dur: [6, 9] },
    3: { target: 16, spawn: 560, dur: [4.5, 7] },
  } as const)[level as 1 | 2 | 3]
}

interface Bubble { id: number; x: number; size: number; hue: string; dur: number }

export function BubbleGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [popped, setPopped] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)
  const goalRef = useRef<number>(cfg.target)
  const idRef = useRef(0)
  const doneRef = useRef(false)

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  useEffect(() => {
    const iv = setInterval(() => {
      setBubbles((b) => {
        if (b.length > 14 || doneRef.current) return b
        const size = 64 + Math.random() * 76
        return [
          ...b,
          {
            id: idRef.current++,
            x: 4 + Math.random() * 84,
            size,
            hue: HUES[Math.floor(Math.random() * HUES.length)],
            dur: cfg.dur[0] + Math.random() * (cfg.dur[1] - cfg.dur[0]),
          },
        ]
      })
    }, cfg.spawn)
    return () => clearInterval(iv)
  }, [cfg.spawn, cfg.dur])

  const remove = (id: number) => setBubbles((b) => b.filter((x) => x.id !== id))

  function pop(e: React.MouseEvent, bub: Bubble) {
    e.stopPropagation()
    if (doneRef.current) return
    sound.pop()
    burst(e.clientX, e.clientY, 'pop', [bub.hue, '#ffffff'])
    remove(bub.id)
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
      <div className="bubble-area">
        <span className="play-hud iconpill"><Star /> {popped} / {goal}</span>
        {bubbles.map((b) => (
          <button
            key={b.id}
            className="bubble"
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              background: `radial-gradient(circle at 35% 30%, #ffffff, ${b.hue})`,
            }}
            onClick={(e) => pop(e, b)}
            onAnimationEnd={() => remove(b.id)}
            aria-label="Bubble"
          />
        ))}
      </div>
    </div>
  )
}
