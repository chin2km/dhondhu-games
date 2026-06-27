import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { TouchControls } from '../../components/TouchControls'
import { isTouchDevice } from '../../engine/touch'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './space.css'

const ROCKS = ['☄️', '🪨', '🌑']

function config(level: number) {
  return ({
    1: { target: 8, spawn: 1150, speed: 1.6 },
    2: { target: 12, spawn: 850, speed: 2.4 },
    3: { target: 16, spawn: 650, speed: 3.2 },
  } as const)[level as 1 | 2 | 3]
}

interface Rock { id: number; x: number; y: number; vy: number; icon: string }
interface Bolt { id: number; x: number; y: number }

export function SpaceGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)

  const areaRef = useRef<HTMLDivElement>(null)
  const rocketX = useRef(0)
  const keys = useRef({ left: false, right: false })
  const rocksRef = useRef<Rock[]>([])
  const boltsRef = useRef<Bolt[]>([])
  const idRef = useRef(0)
  const lastFire = useRef(0)
  const frame = useRef(0)
  const popped = useRef(0)
  const goalRef = useRef<number>(cfg.target)
  const doneRef = useRef(false)

  const [rocks, setRocks] = useState<Rock[]>([])
  const [bolts, setBolts] = useState<Bolt[]>([])
  const [rocketLeft, setRocketLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  function fire() {
    if (doneRef.current) return
    if (frame.current - lastFire.current < 12) return // cooldown ~ 200ms
    lastFire.current = frame.current
    const area = areaRef.current
    const top = area ? area.clientHeight - 70 : 400
    boltsRef.current = [...boltsRef.current, { id: idRef.current++, x: rocketX.current, y: top }]
    sound.whoosh()
  }

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { keys.current.left = true; e.preventDefault() }
      else if (e.key === 'ArrowRight') { keys.current.right = true; e.preventDefault() }
      else if (e.key === ' ' || e.code === 'Space') { fire(); e.preventDefault() }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Spawn rocks
  useEffect(() => {
    const w = areaRef.current?.clientWidth ?? 600
    rocketX.current = w / 2
    setRocketLeft(w / 2)
    const iv = setInterval(() => {
      if (doneRef.current) return
      const cw = areaRef.current?.clientWidth ?? 600
      rocksRef.current = [...rocksRef.current, { id: idRef.current++, x: 40 + Math.random() * (cw - 80), y: -40, vy: cfg.speed + Math.random() * 1.2, icon: ROCKS[Math.floor(Math.random() * ROCKS.length)] }]
    }, cfg.spawn)
    return () => clearInterval(iv)
  }, [cfg.spawn, cfg.speed])

  // Physics
  useEffect(() => {
    let raf = 0
    const step = () => {
      frame.current += 1
      const area = areaRef.current
      if (area && !doneRef.current) {
        const w = area.clientWidth
        const h = area.clientHeight
        const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)
        if (dir) rocketX.current = Math.max(34, Math.min(w - 34, rocketX.current + dir * 7))
        setRocketLeft(rocketX.current)

        // move bolts up
        let bolts2 = boltsRef.current.map((b) => ({ ...b, y: b.y - 11 })).filter((b) => b.y > -30)
        let rocks2 = rocksRef.current.map((r) => ({ ...r, y: r.y + r.vy })).filter((r) => r.y < h + 50)
        const rect = area.getBoundingClientRect()

        // collisions — bolt top..bottom overlaps rock top..bottom (both use translateX(-50%) so x is the center)
        const hitRockIds = new Set<number>()
        const hitBoltIds = new Set<number>()
        for (const b of bolts2) {
          if (hitBoltIds.has(b.id)) continue
          for (const r of rocks2) {
            if (hitRockIds.has(r.id)) continue
            const xHit = Math.abs(b.x - r.x) < 42
            const yHit = (b.y + 28) > r.y && b.y < (r.y + 46)
            if (xHit && yHit) {
              hitRockIds.add(r.id)
              hitBoltIds.add(b.id)
              sound.pop()
              award(1)
              burst(rect.left + r.x, rect.top + r.y, 'sparkle')
              popped.current += 1
              setScore(popped.current)
              if (popped.current >= goalRef.current && !doneRef.current) {
                doneRef.current = true
                setTimeout(onWin, 450)
              }
              break
            }
          }
        }
        bolts2 = bolts2.filter((b) => !hitBoltIds.has(b.id))
        rocks2 = rocks2.filter((r) => !hitRockIds.has(r.id))

        boltsRef.current = bolts2
        rocksRef.current = rocks2
        setBolts(bolts2)
        setRocks(rocks2)
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.target])

  return (
    <div className="gx-fill">
      <div className="space-area" ref={areaRef}>
        <span className="play-hud iconpill"><Star /> {score} / {goal}</span>
        {rocks.map((r) => (
          <span key={r.id} className="rock" style={{ left: r.x, top: r.y }} aria-hidden="true">{r.icon}</span>
        ))}
        {bolts.map((b) => (
          <span key={b.id} className="bolt" style={{ left: b.x, top: b.y }} aria-hidden="true" />
        ))}
        <span className="rocket" style={{ left: rocketLeft }} aria-hidden="true">🚀</span>
        {!isTouchDevice() && <span className="space-hint">← → to fly • SPACE to pop the rocks</span>}
        <TouchControls
          onLeft={(d) => { keys.current.left = d }}
          onRight={(d) => { keys.current.right = d }}
          onFire={fire}
          fireLabel="⭐"
        />
      </div>
    </div>
  )
}
