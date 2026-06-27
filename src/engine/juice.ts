// A single full-screen canvas that any game can fire particle bursts onto.
// Lazily created, runs only while particles are alive, and is a no-op when the
// user prefers reduced motion.

interface P {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  shape: 'rect' | 'circle' | 'star'
}

const COLORS = ['#FFC93C', '#FF6B6B', '#34C7A6', '#4DABF7', '#845EF7', '#FF8FB1']

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: P[] = []
let raf = 0

function reduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:120;'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function tick() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter((p) => p.life < p.max)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.35
    p.vx *= 0.99
    p.life += 1
    const alpha = 1 - p.life / p.max
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.fillStyle = p.color
    if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.shape === 'star') {
      drawStar(ctx, p.x, p.y, p.size)
    } else {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.life * 0.2)
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx.restore()
    }
  }
  ctx.globalAlpha = 1
  if (particles.length) {
    raf = requestAnimationFrame(tick)
  } else {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

function drawStar(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5
    c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    const a2 = a + Math.PI / 5
    c.lineTo(x + Math.cos(a2) * r * 0.5, y + Math.sin(a2) * r * 0.5)
  }
  c.closePath()
  c.fill()
}

export type BurstShape = 'confetti' | 'sparkle' | 'pop'

/** Fire a burst of particles at screen coordinates (x, y). */
export function burst(x: number, y: number, kind: BurstShape = 'confetti', colors?: string[]) {
  if (reduced()) return
  ensureCanvas()
  const palette = colors && colors.length ? colors : COLORS
  const count = kind === 'pop' ? 12 : kind === 'sparkle' ? 16 : 24
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = (kind === 'pop' ? 3 : 5) + Math.random() * 5
    particles.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - (kind === 'confetti' ? 2 : 0),
      life: 0,
      max: 40 + Math.random() * 30,
      size: (kind === 'sparkle' ? 5 : 7) + Math.random() * 6,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: kind === 'sparkle' ? 'star' : kind === 'pop' ? 'circle' : 'rect',
    })
  }
  if (!raf) raf = requestAnimationFrame(tick)
}

/** Convenience: burst at the center of a DOM element. */
export function burstAt(el: Element, kind: BurstShape = 'pop', colors?: string[]) {
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, kind, colors)
}
