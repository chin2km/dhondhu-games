import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { getWorld } from '../../data/worlds'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './catch.css'

const BASKET_W = 130
const TREAT = 56

function config(level: number) {
  return ({
    1: { target: 8, spawn: 1100, speed: 2.4, vary: 1.0 },
    2: { target: 12, spawn: 850, speed: 3.4, vary: 1.4 },
    3: { target: 16, spawn: 650, speed: 4.4, vary: 2.0 },
  } as const)[level as 1 | 2 | 3]
}

interface Treat { id: number; x: number; y: number; vy: number; icon: string }

export function CatchGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const world = useStore((s) => s.world)
  const cfg = config(level)
  const icons = getWorld(world).icons

  const areaRef = useRef<HTMLDivElement>(null)
  const basketX = useRef(0)
  const treatsRef = useRef<Treat[]>([])
  const idRef = useRef(0)
  const caughtRef = useRef(0)
  const goalRef = useRef<number>(cfg.target)
  const doneRef = useRef(false)

  const [treats, setTreats] = useState<Treat[]>([])
  const [basketLeft, setBasketLeft] = useState(0)
  const [caught, setCaught] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  // Spawn treats
  useEffect(() => {
    const iv = setInterval(() => {
      if (doneRef.current) return
      const w = areaRef.current?.clientWidth ?? 600
      treatsRef.current = [
        ...treatsRef.current,
        {
          id: idRef.current++,
          x: TREAT / 2 + Math.random() * (w - TREAT),
          y: -TREAT,
          vy: cfg.speed + Math.random() * cfg.vary,
          icon: icons[Math.floor(Math.random() * icons.length)],
        },
      ]
    }, cfg.spawn)
    return () => clearInterval(iv)
  }, [cfg.spawn, cfg.speed, cfg.vary, icons])

  // Physics loop
  useEffect(() => {
    let raf = 0
    const step = () => {
      const area = areaRef.current
      if (area && !doneRef.current) {
        const rect = area.getBoundingClientRect()
        const h = area.clientHeight
        const basketTop = h - 96
        const next: Treat[] = []
        for (const t of treatsRef.current) {
          const ny = t.y + t.vy
          const caughtIt = ny + TREAT * 0.4 >= basketTop && ny + TREAT * 0.4 <= h && Math.abs(t.x - basketX.current) < BASKET_W / 2
          if (caughtIt) {
            sound.whoosh()
            award(1)
            burst(rect.left + t.x, rect.top + basketTop, 'pop')
            caughtRef.current += 1
            setCaught(caughtRef.current)
            if (caughtRef.current >= goalRef.current && !doneRef.current) {
              doneRef.current = true
              setTimeout(onWin, 450)
            }
            continue
          }
          if (ny > h + TREAT) continue // missed — just disappears
          next.push({ ...t, y: ny })
        }
        treatsRef.current = next
        setTreats(next)
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.target])

  // Init basket at center, then follow the pointer anywhere on the page — so the
  // basket keeps moving even when the mouse leaves the play box or window edge.
  useEffect(() => {
    const w = areaRef.current?.clientWidth ?? 600
    basketX.current = w / 2
    setBasketLeft(w / 2)
    const onMove = (e: PointerEvent) => {
      const area = areaRef.current
      if (!area) return
      const rect = area.getBoundingClientRect()
      const x = Math.max(BASKET_W / 2, Math.min(rect.width - BASKET_W / 2, e.clientX - rect.left))
      basketX.current = x
      setBasketLeft(x)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="gx-fill">
      <div className="catch-area" ref={areaRef}>
        <span className="play-hud iconpill"><Star /> {caught} / {goal}</span>
        {treats.map((t) => (
          <span key={t.id} className="treat" style={{ left: t.x, top: t.y }} aria-hidden="true">
            {t.icon}
          </span>
        ))}
        <span className="basket-cursor" style={{ left: basketLeft }} aria-hidden="true">🧺</span>
        <span className="catch-hint">Move your mouse to catch! 🧺</span>
      </div>
    </div>
  )
}
