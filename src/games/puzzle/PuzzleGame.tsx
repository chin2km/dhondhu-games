import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { dropTargetAt } from '../../engine/drag'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './puzzle.css'

// Bundle the provided artwork. Vite turns each import into a hashed URL.
const IMAGE_MAP = import.meta.glob('../puzzle-pals-images/*.jpg', { eager: true, import: 'default' }) as Record<
  string,
  string
>
const IMAGES = Object.values(IMAGE_MAP)

function gridFor(level: number) {
  return ({ 1: 2, 2: 3, 3: 4 } as const)[level as 1 | 2 | 3]
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

interface Piece { idx: number; row: number; col: number; placed: boolean }

export function PuzzleGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  const n = gridFor(level)

  const image = useMemo(() => IMAGES[Math.floor(Math.random() * IMAGES.length)], [])
  const [pieces, setPieces] = useState<Piece[]>(() => {
    const list: Piece[] = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) list.push({ idx: r * n + c, row: r, col: c, placed: false })
    return list
  })
  const [trayOrder] = useState<number[]>(() => shuffle(pieces.map((p) => p.idx)))
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hoverSlot, setHoverSlot] = useState<number | null>(null)
  const [wrongSlot, setWrongSlot] = useState<number | null>(null)

  const byIdx = (idx: number) => pieces.find((p) => p.idx === idx)!

  function sliceStyle(p: Piece) {
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: `${n * 100}% ${n * 100}%`,
      backgroundPosition: n > 1 ? `${(p.col / (n - 1)) * 100}% ${(p.row / (n - 1)) * 100}%` : 'center',
    }
  }

  function slotIdxAt(x: number, y: number): number | null {
    const el = dropTargetAt(x, y, '.puzzle-slot')
    if (!el) return null
    const v = el.dataset.idx
    return v == null ? null : Number(v)
  }

  useEffect(() => {
    if (dragIdx === null) return
    const move = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const slot = slotIdxAt(e.clientX, e.clientY)
      const target = slot != null ? byIdx(slot) : null
      // Only show the "droppable" ring on empty slots (don't reveal the right one).
      setHoverSlot(target && !target.placed ? slot : null)
    }
    const up = (e: PointerEvent) => {
      const slot = slotIdxAt(e.clientX, e.clientY)
      const target = slot != null ? byIdx(slot) : null
      if (slot != null && slot === dragIdx && target && !target.placed) {
        // Correct spot!
        sound.pop()
        award(1)
        burst(e.clientX, e.clientY, 'sparkle')
        setPieces((prev) => {
          const next = prev.map((p) => (p.idx === dragIdx ? { ...p, placed: true } : p))
          if (next.every((p) => p.placed)) setTimeout(onWin, 500)
          return next
        })
      } else {
        // Wrong spot — bounce back, show red flash on the slot the child aimed at.
        sound.miss()
        if (slot != null) {
          setWrongSlot(slot)
          setTimeout(() => setWrongSlot((w) => (w === slot ? null : w)), 420)
        }
      }
      setDragIdx(null)
      setHoverSlot(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragIdx])

  const placed = pieces.filter((p) => p.placed).length
  const total = n * n
  const dragPiece = dragIdx !== null ? byIdx(dragIdx) : null

  return (
    <div className="puzzle">
      <div className="puzzle-main">
        <div
          className="puzzle-board"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}
        >
          <div className="puzzle-ghost" style={{ backgroundImage: `url(${image})` }} />
          {pieces.map((p) => (
            <div
              key={p.idx}
              data-idx={p.idx}
              className={`puzzle-slot${hoverSlot === p.idx ? ' hover' : ''}${wrongSlot === p.idx ? ' wrong' : ''}`}
            >
              {p.placed && <div className="puzzle-fill" style={sliceStyle(p)} />}
            </div>
          ))}
        </div>
        <div className="puzzle-title">
          <span className="scorepill"><Star /> {placed} / {total} pieces</span>
        </div>
      </div>

      <div className="puzzle-tray" aria-label="Puzzle pieces">
        <div className="puzzle-tray-label">Look at the faded picture — drop each piece where it belongs! 🧩</div>
        {trayOrder
          .map(byIdx)
          .filter((p) => !p.placed)
          .map((p) => (
            <div
              key={p.idx}
              className={`puzzle-piece${dragIdx === p.idx ? ' dragging' : ''}`}
              style={sliceStyle(p)}
              onPointerDown={(e) => {
                sound.click()
                setPos({ x: e.clientX, y: e.clientY })
                setDragIdx(p.idx)
              }}
              aria-label="Puzzle piece"
            />
          ))}
      </div>

      {dragPiece && (
        <div className="dragclone" style={{ left: pos.x, top: pos.y }}>
          <div className="puzzle-piece-clone" style={sliceStyle(dragPiece)} />
        </div>
      )}
    </div>
  )
}
