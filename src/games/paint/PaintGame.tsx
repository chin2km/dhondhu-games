import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './paint.css'

const CRAYONS = ['#FF6B6B', '#FFC93C', '#34C7A6', '#4DABF7', '#845EF7', '#3A2E5C']
const SIZES = [10, 22, 40]
const STAR_EVERY = 110
const STAR_CAP = 12

type Mode = 'crayon' | 'rainbow' | 'eraser'
interface Pt { x: number; y: number }
interface Stroke { mode: Mode; color: string; size: number; points: Pt[] }

export function PaintGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  // Higher sizes unlock the fancier default brush, but all tools are always available.
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const current = useRef<Stroke | null>(null)
  const drawing = useRef(false)
  const dist = useRef(0)
  const starsGiven = useRef(0)

  const [mode, setMode] = useState<Mode>(level === 3 ? 'rainbow' : 'crayon')
  const [color, setColor] = useState(CRAYONS[0])
  const [sizeIdx, setSizeIdx] = useState(1)
  const [earned, setEarned] = useState(0)
  const [canUndo, setCanUndo] = useState(false)

  function ctx() {
    return canvasRef.current!.getContext('2d')!
  }

  function strokeColor(s: Stroke, i: number): string {
    if (s.mode === 'eraser') return '#ffffff'
    if (s.mode === 'rainbow') return `hsl(${(i * 9) % 360} 85% 60%)`
    return s.color
  }

  function drawSegment(c: CanvasRenderingContext2D, s: Stroke, i: number) {
    if (i === 0) return
    c.strokeStyle = strokeColor(s, i)
    c.lineWidth = s.mode === 'eraser' ? s.size * 2.2 : s.size
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(s.points[i - 1].x, s.points[i - 1].y)
    c.lineTo(s.points[i].x, s.points[i].y)
    c.stroke()
  }

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = ctx()
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, canvas.width, canvas.height)
    for (const s of strokes.current) for (let i = 1; i < s.points.length; i++) drawSegment(c, s, i)
  }

  function fitCanvas() {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    canvas.width = Math.max(100, stage.clientWidth)
    canvas.height = Math.max(100, stage.clientHeight)
    redraw()
  }

  useEffect(() => {
    fitCanvas()
    window.addEventListener('resize', fitCanvas)
    return () => window.removeEventListener('resize', fitCanvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toLocal(e: React.PointerEvent): Pt {
    const r = canvasRef.current!.getBoundingClientRect()
    const canvas = canvasRef.current!
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    }
  }

  function down(e: React.PointerEvent) {
    drawing.current = true
    canvasRef.current?.setPointerCapture(e.pointerId)
    current.current = { mode, color, size: SIZES[sizeIdx], points: [toLocal(e)] }
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current || !current.current) return
    const s = current.current
    const p = toLocal(e)
    const prev = s.points[s.points.length - 1]
    s.points.push(p)
    drawSegment(ctx(), s, s.points.length - 1)

    dist.current += Math.hypot(p.x - prev.x, p.y - prev.y)
    if (dist.current >= STAR_EVERY && starsGiven.current < STAR_CAP && mode !== 'eraser') {
      dist.current = 0
      starsGiven.current += 1
      award(1)
      setEarned((n) => n + 1)
      sound.star()
    }
  }

  function up() {
    if (current.current && current.current.points.length > 0) {
      strokes.current.push(current.current)
      setCanUndo(true)
    }
    current.current = null
    drawing.current = false
  }

  function undo() {
    sound.click()
    strokes.current.pop()
    setCanUndo(strokes.current.length > 0)
    redraw()
  }

  function clear() {
    sound.whoosh()
    strokes.current = []
    setCanUndo(false)
    redraw()
  }

  return (
    <div className="paint">
      <div className="paint-tools">
        {CRAYONS.map((c) => (
          <button
            key={c}
            className={`swatch${mode === 'crayon' && color === c ? ' on' : ''}`}
            style={{ background: c }}
            onClick={() => { sound.click(); setColor(c); setMode('crayon') }}
            aria-label={`Crayon ${c}`}
          />
        ))}
        <button className={`swatch rainbow${mode === 'rainbow' ? ' on' : ''}`} onClick={() => { sound.click(); setMode('rainbow') }} aria-label="Rainbow brush" />
        <button className={`swatch eraser${mode === 'eraser' ? ' on' : ''}`} onClick={() => { sound.click(); setMode('eraser') }} aria-label="Eraser">🧽</button>

        <span className="tool-div" />
        {SIZES.map((s, i) => (
          <button key={s} className={`size-btn${sizeIdx === i ? ' on' : ''}`} onClick={() => { sound.click(); setSizeIdx(i) }} aria-label={`Brush size ${i + 1}`}>
            <span className="dot" style={{ width: 8 + i * 8, height: 8 + i * 8 }} />
          </button>
        ))}

        <span className="tool-div" />
        <button className="tool-btn" onClick={undo} disabled={!canUndo} aria-label="Undo">↶ Undo</button>
        <button className="tool-btn" onClick={clear} aria-label="Clear">🗑️</button>
        <button className="tool-btn" style={{ background: 'var(--mint)', color: '#fff', border: 'none' }} onClick={() => { sound.click(); onWin() }} aria-label="I'm done">✨ Done</button>
      </div>

      <div className="paint-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="paint-canvas2"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          aria-label="Drawing canvas"
        />
      </div>

      <div style={{ flex: 'none', textAlign: 'center' }}>
        <span className="scorepill"><Star /> {earned} stars</span>
      </div>
    </div>
  )
}
