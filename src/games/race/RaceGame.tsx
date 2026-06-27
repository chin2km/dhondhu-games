import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { TouchControls } from '../../components/TouchControls'
import { isTouchDevice } from '../../engine/touch'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './race.css'

const CAR_W = 64

function config(level: number) {
  return ({
    1: { target: 10, spawn: 1000, speed: 3.0, cone: 0.25 },
    2: { target: 14, spawn: 780, speed: 4.2, cone: 0.4 },
    3: { target: 18, spawn: 600, speed: 5.4, cone: 0.5 },
  } as const)[level as 1 | 2 | 3]
}

interface Item { id: number; x: number; y: number; vy: number; star: boolean }

export function RaceGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)

  const areaRef = useRef<HTMLDivElement>(null)
  const playerX = useRef(0)
  const keys = useRef({ left: false, right: false })
  const itemsRef = useRef<Item[]>([])
  const idRef = useRef(0)
  const collected = useRef(0)
  const goalRef = useRef<number>(cfg.target)
  const doneRef = useRef(false)

  const [items, setItems] = useState<Item[]>([])
  const [carLeft, setCarLeft] = useState(0)
  const [got, setGot] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)
  const [bonk, setBonk] = useState(false)

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  function roadBounds() {
    const w = areaRef.current?.clientWidth ?? 600
    return { lo: w * 0.18, hi: w * 0.82, w }
  }

  // Spawn
  useEffect(() => {
    const iv = setInterval(() => {
      if (doneRef.current) return
      const { lo, hi } = roadBounds()
      itemsRef.current = [
        ...itemsRef.current,
        { id: idRef.current++, x: lo + Math.random() * (hi - lo), y: -50, vy: cfg.speed + Math.random() * 1.5, star: Math.random() > cfg.cone },
      ]
    }, cfg.spawn)
    return () => clearInterval(iv)
  }, [cfg.spawn, cfg.speed, cfg.cone])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { keys.current.left = true; e.preventDefault() }
      if (e.key === 'ArrowRight') { keys.current.right = true; e.preventDefault() }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Init + mouse steering (touch devices steer with the on-screen buttons instead)
  useEffect(() => {
    const { w } = roadBounds()
    playerX.current = w / 2
    setCarLeft(w / 2)
    if (isTouchDevice()) return
    const onMove = (e: PointerEvent) => {
      const area = areaRef.current
      if (!area) return
      const rect = area.getBoundingClientRect()
      const { lo, hi } = roadBounds()
      playerX.current = Math.max(lo + CAR_W / 2, Math.min(hi - CAR_W / 2, e.clientX - rect.left))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Physics
  useEffect(() => {
    let raf = 0
    const step = () => {
      const area = areaRef.current
      if (area && !doneRef.current) {
        const h = area.clientHeight
        const { lo, hi } = roadBounds()
        // move car by keys
        const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)
        if (dir) playerX.current = Math.max(lo + CAR_W / 2, Math.min(hi - CAR_W / 2, playerX.current + dir * 7))
        setCarLeft(playerX.current)

        const carTop = h - 90
        const next: Item[] = []
        for (const it of itemsRef.current) {
          const ny = it.y + it.vy
          const hitCar = ny + 22 >= carTop && ny <= h && Math.abs(it.x - playerX.current) < CAR_W / 2 + 22
          if (hitCar) {
            const rect = area.getBoundingClientRect()
            if (it.star) {
              sound.star()
              award(1)
              burst(rect.left + it.x, rect.top + carTop, 'sparkle')
              collected.current += 1
              setGot(collected.current)
              if (collected.current >= goalRef.current && !doneRef.current) {
                doneRef.current = true
                setTimeout(onWin, 450)
              }
            } else {
              sound.miss()
              setBonk(true)
              setTimeout(() => setBonk(false), 250)
            }
            continue
          }
          if (ny > h + 50) continue
          next.push({ ...it, y: ny })
        }
        itemsRef.current = next
        setItems(next)
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.target])

  return (
    <div className="gx-fill">
      <div className={`race-area${bonk ? ' bonk' : ''}`} ref={areaRef}>
        <div className="road-lines" />
        <span className="play-hud iconpill"><Star /> {got} / {goal}</span>
        {items.map((it) => (
          <span key={it.id} className="race-item" style={{ left: it.x, top: it.y }} aria-hidden="true">
            {it.star ? '⭐' : '🚧'}
          </span>
        ))}
        <span className="race-car" style={{ left: carLeft }} aria-hidden="true">🏎️</span>
        {!isTouchDevice() && <span className="race-hint">← → arrow keys or move your mouse</span>}
        <TouchControls
          layout="spread"
          onLeft={(d) => { keys.current.left = d }}
          onRight={(d) => { keys.current.right = d }}
        />
      </div>
    </div>
  )
}
