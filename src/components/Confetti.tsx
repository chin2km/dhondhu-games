import { useEffect, useRef } from 'react'

const COLORS = ['#FFC93C', '#FF6B6B', '#34C7A6', '#4DABF7', '#845EF7']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  s: number
  c: string
  a: number
  va: number
}

/** A burst of confetti that plays once on mount. Respects reduced motion. */
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const parts: Particle[] = []
    for (let i = 0; i < 170; i++) {
      parts.push({
        x: canvas.width * Math.random(),
        y: -20 - Math.random() * canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        s: 6 + Math.random() * 8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.3,
      })
    }

    let raf = 0
    let start: number | null = null
    const duration = 2600

    const loop = (ts: number) => {
      if (start === null) start = ts
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.a += p.va
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.a)
        ctx.fillStyle = p.c
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6)
        ctx.restore()
      }
      if (ts - start < duration) {
        raf = requestAnimationFrame(loop)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />
}
