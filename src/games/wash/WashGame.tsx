import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './wash.css'

const WIN_PCT = 88  // % dirty pixels that must be cleared to win

function config(level: number) {
  return ({
    1: { radius: 52, dirtDensity: 0.72, jets: 1 },
    2: { radius: 40, dirtDensity: 0.82, jets: 1 },
    3: { radius: 30, dirtDensity: 0.90, jets: 1 },
  } as const)[level as 1 | 2 | 3]
}

const CARS = [
  { body: '#E74C3C', roof: '#C0392B', name: 'Red Racer' },
  { body: '#3498DB', roof: '#2980B9', name: 'Blue Cruiser' },
  { body: '#2ECC71', roof: '#27AE60', name: 'Green Machine' },
  { body: '#F39C12', roof: '#D68910', name: 'Orange Blaze' },
]

interface WashGameProps extends GameProps {
  level?: number
}

export function WashGame({ onWin }: WashGameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)
  const dirtRef = useRef<HTMLCanvasElement>(null)
  const sprayRef = useRef<HTMLCanvasElement>(null)
  const drawnRef = useRef(false)
  const doneRef = useRef(false)
  const isDown = useRef(false)
  const totalDirty = useRef(0)
  const dprRef = useRef(1)
  const sprayActive = useRef(false)
  const sprayTimer = useRef<number | null>(null)
  const [pct, setPct] = useState(0)
  const [spraying, setSpraying] = useState(false)
  const [won, setWon] = useState(false)
  const car = useRef(CARS[Math.floor(Math.random() * CARS.length)])

  // Draw the dirt layer on mount. We work entirely in DEVICE pixels (no ctx.scale)
  // so the erase coordinates map 1:1 and never drift.
  useEffect(() => {
    const canvas = dirtRef.current
    const sprayCanvas = sprayRef.current
    if (!canvas || !sprayCanvas || drawnRef.current) return
    drawnRef.current = true

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))
    dprRef.current = dpr
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    sprayCanvas.width = canvas.width
    sprayCanvas.height = canvas.height

    const ctx = canvas.getContext('2d')!
    drawDirt(ctx, canvas.width, canvas.height, dpr, cfg.dirtDensity)
    totalDirty.current = countDirtyPixels(canvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function drawDirt(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number, density: number) {
    // Brown/gray mottled dirt covering the whole canvas (device px; feature sizes scaled by dpr)
    ctx.clearRect(0, 0, W, H)
    const seed = 42
    const rng = (n: number) => ((Math.sin(n + seed) * 43758.5453) % 1 + 1) % 1

    // Base mud coat
    ctx.globalCompositeOperation = 'source-over'
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, `rgba(80,55,30,${density * 0.9})`)
    grad.addColorStop(0.5, `rgba(65,45,22,${density})`)
    grad.addColorStop(1, `rgba(50,35,15,${density * 0.95})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Lighter splotches
    for (let i = 0; i < 60; i++) {
      const x = rng(i * 3) * W
      const y = rng(i * 3 + 1) * H
      const r = (20 + rng(i * 3 + 2) * 55) * dpr
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, r)
      g2.addColorStop(0, `rgba(140,100,55,${density * 0.6})`)
      g2.addColorStop(1, `rgba(80,55,30,0)`)
      ctx.fillStyle = g2
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // Dark caked mud spots
    for (let i = 0; i < 35; i++) {
      const x = rng(i * 7) * W
      const y = rng(i * 7 + 1) * H
      const r = (8 + rng(i * 7 + 2) * 28) * dpr
      ctx.fillStyle = `rgba(40,28,10,${density * 0.75})`
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  }

  function countDirtyPixels(canvas: HTMLCanvasElement): number {
    const ctx = canvas.getContext('2d')!
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let count = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] > 20) count++
    return count
  }

  function measureCleaned(): number {
    const canvas = dirtRef.current
    if (!canvas || !totalDirty.current) return 0
    const remaining = countDirtyPixels(canvas)
    return Math.min(100, Math.round(((totalDirty.current - remaining) / totalDirty.current) * 100))
  }

  function spray(clientX: number, clientY: number) {
    if (doneRef.current) return
    const canvas = dirtRef.current
    const sprayCanvas = sprayRef.current
    if (!canvas || !sprayCanvas) return

    // Map the pointer (CSS px) into the canvas's device-pixel space. Using the
    // canvas/rect ratio means it stays correct at any DPR or display size.
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const px = (clientX - rect.left) * scaleX
    const py = (clientY - rect.top) * scaleY
    const radius = cfg.radius * scaleX // brush size in device px

    // Erase dirt right under the cursor
    const ctx = canvas.getContext('2d')!
    ctx.globalCompositeOperation = 'destination-out'
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.3)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.65, 'rgba(0,0,0,.9)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.arc(px, py, radius * 1.3, 0, Math.PI * 2); ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    // Spray sparkles (visual only, cleared on release)
    const sCtx = sprayCanvas.getContext('2d')!
    sCtx.clearRect(0, 0, sprayCanvas.width, sprayCanvas.height)
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * radius
      const sx = px + Math.cos(angle) * dist
      const sy = py + Math.sin(angle) * dist
      sCtx.fillStyle = `rgba(120,200,255,${0.4 + Math.random() * 0.5})`
      sCtx.beginPath(); sCtx.arc(sx, sy, (2 + Math.random() * 3) * scaleX, 0, Math.PI * 2); sCtx.fill()
    }

    // Update progress
    const cleaned = measureCleaned()
    setPct(cleaned)

    if (cleaned >= WIN_PCT && !doneRef.current) {
      doneRef.current = true
      burst(clientX, clientY, 'confetti')
      sound.win()
      setWon(true)
      setTimeout(onWin, 600)
    }
  }

  function startSpray(e: React.PointerEvent) {
    isDown.current = true
    setSpraying(true)
    sprayActive.current = true
    spray(e.clientX, e.clientY)
    sound.note(880)
  }

  function moveSpray(e: React.PointerEvent) {
    if (!isDown.current) return
    spray(e.clientX, e.clientY)
    // Play water sound in bursts
    if (!sprayTimer.current) {
      sprayTimer.current = window.setTimeout(() => {
        sound.whoosh()
        sprayTimer.current = null
      }, 80)
    }
  }

  function endSpray() {
    isDown.current = false
    setSpraying(false)
    sprayActive.current = false
    const sprayCanvas = sprayRef.current
    if (sprayCanvas) {
      const sCtx = sprayCanvas.getContext('2d')!
      sCtx.clearRect(0, 0, sprayCanvas.width, sprayCanvas.height)
    }
  }

  const c = car.current

  return (
    <div className="gx-fill">
      <div
        className={`wash-stage${spraying ? ' spraying' : ''}`}
        onPointerDown={startSpray}
        onPointerMove={moveSpray}
        onPointerUp={endSpray}
        onPointerLeave={endSpray}
      >
        {/* Progress HUD */}
        <div className="wash-hud">
          <span className="iconpill"><Star /> {pct}% clean</span>
          <div className="wash-bar-wrap">
            <div className="wash-bar-track">
              <div className="wash-bar-fill" style={{ width: `${pct}%` }} />
              <div className="wash-bar-goal" style={{ left: `${WIN_PCT}%` }} />
            </div>
          </div>
        </div>

        {/* 3-D perspective car scene */}
        <div className="car-scene">
          <div className="car-shadow" />
          <div className="car-3d" style={{ ['--body' as string]: c.body, ['--roof' as string]: c.roof }}>
            {/* Car body built with CSS */}
            <div className="car-roof" />
            <div className="car-body">
              <div className="car-window car-window-l" />
              <div className="car-window car-window-r" />
            </div>
            <div className="car-hood" />
            <div className="car-trunk" />
            <div className="car-wheels">
              <div className="wheel wheel-fl"><div className="hubcap" /></div>
              <div className="wheel wheel-fr"><div className="hubcap" /></div>
              <div className="wheel wheel-rl"><div className="hubcap" /></div>
              <div className="wheel wheel-rr"><div className="hubcap" /></div>
            </div>
            {/* Headlights & taillights */}
            <div className="light light-fl" /><div className="light light-fr" />
            <div className="light light-rl" /><div className="light light-rr" />
          </div>

          {/* Dirt overlay canvas */}
          <canvas ref={dirtRef} className="dirt-canvas" aria-hidden="true" />
          {/* Spray sparkle canvas */}
          <canvas ref={sprayRef} className="spray-canvas" aria-hidden="true" />
        </div>

        {!won && <p className="wash-hint">{spraying ? '💦 Washing…' : 'Hold & drag to power-wash the car!'}</p>}
        {won && <p className="wash-hint wash-done">✨ Sparkling clean! ✨</p>}
      </div>
    </div>
  )
}
