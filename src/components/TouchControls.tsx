import { useEffect, useRef } from 'react'
import { isTouchDevice } from '../engine/touch'

interface TouchControlsProps {
  /** Called with true on press, false on release — drive a held-direction ref. */
  onLeft: (down: boolean) => void
  onRight: (down: boolean) => void
  /** Optional action button (e.g. fire). Auto-repeats while held. */
  onFire?: () => void
  fireLabel?: string
  /** 'cluster' (default): steer pair on the left, fire on the right.
   *  'spread': left button pinned far-left, right button far-right (e.g. road edges). */
  layout?: 'cluster' | 'spread'
}

/** On-screen left/right (+ optional fire) buttons. Renders only on touch devices. */
export function TouchControls({ onLeft, onRight, onFire, fireLabel = '🚀', layout = 'cluster' }: TouchControlsProps) {
  const fireIv = useRef<number | null>(null)
  useEffect(() => () => { if (fireIv.current) clearInterval(fireIv.current) }, [])

  if (!isTouchDevice()) return null

  const hold = (fn: (d: boolean) => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      fn(true)
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not all pointers support capture */ }
    },
    onPointerUp: (e: React.PointerEvent) => { e.preventDefault(); fn(false) },
    onPointerCancel: () => fn(false),
    onLostPointerCapture: () => fn(false),
  })

  function startFire(e: React.PointerEvent) {
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    onFire?.()
    if (fireIv.current) clearInterval(fireIv.current)
    fireIv.current = window.setInterval(() => onFire?.(), 220)
  }
  function stopFire() {
    if (fireIv.current) { clearInterval(fireIv.current); fireIv.current = null }
  }

  if (layout === 'spread') {
    return (
      <div className="touch-controls tc-spread">
        <button className="tc-btn" aria-label="Move left" {...hold(onLeft)}>◀</button>
        <button className="tc-btn" aria-label="Move right" {...hold(onRight)}>▶</button>
      </div>
    )
  }

  return (
    <div className="touch-controls">
      <div className="tc-steer">
        <button className="tc-btn" aria-label="Move left" {...hold(onLeft)}>◀</button>
        <button className="tc-btn" aria-label="Move right" {...hold(onRight)}>▶</button>
      </div>
      {onFire && (
        <button
          className="tc-btn tc-fire"
          aria-label="Fire"
          onPointerDown={startFire}
          onPointerUp={stopFire}
          onPointerCancel={stopFire}
          onLostPointerCapture={stopFire}
        >
          {fireLabel}
        </button>
      )}
    </div>
  )
}
