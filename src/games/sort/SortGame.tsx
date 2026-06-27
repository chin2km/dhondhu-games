import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { dropTargetAt } from '../../engine/drag'
import { Star } from '../../components/Star'
import type { GameProps } from '../registry'
import './sort.css'

const PALETTE = [
  { id: 'red', fill: '#FF6B6B', stroke: '#E0484A' },
  { id: 'blue', fill: '#4DABF7', stroke: '#2E8BD6' },
  { id: 'green', fill: '#34C7A6', stroke: '#1FA588' },
  { id: 'yellow', fill: '#FFC93C', stroke: '#E8A91E' },
]

function config(level: number) {
  return ({ 1: { colors: 2, items: 4 }, 2: { colors: 3, items: 6 }, 3: { colors: 4, items: 8 } } as const)[
    level as 1 | 2 | 3
  ]
}

interface Item { id: number; color: string; placed: boolean }

function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export function SortGame({ onWin, award }: GameProps) {
  const level = useStore((s) => s.level)
  const { colors, items: count } = config(level)
  const colorIds = useMemo(() => PALETTE.slice(0, colors).map((c) => c.id), [colors])

  const [items, setItems] = useState<Item[]>(() => {
    // Build a roughly even spread, then shuffle.
    const list: Item[] = []
    for (let i = 0; i < count; i++) list.push({ id: i, color: colorIds[i % colorIds.length], placed: false })
    return shuffle(list)
  })
  const [dragId, setDragId] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hot, setHot] = useState<string | null>(null)

  const dragItem = items.find((i) => i.id === dragId) ?? null

  useEffect(() => {
    if (dragId === null) return
    const move = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const t = dropTargetAt(e.clientX, e.clientY, '.sort-basket')
      setHot(t?.dataset.color ?? null)
    }
    const up = (e: PointerEvent) => {
      const t = dropTargetAt(e.clientX, e.clientY, '.sort-basket')
      const item = items.find((i) => i.id === dragId)
      if (t && item && t.dataset.color === item.color) {
        sound.star()
        award(1)
        setItems((prev) => {
          const next = prev.map((i) => (i.id === dragId ? { ...i, placed: true } : i))
          if (next.every((i) => i.placed)) setTimeout(onWin, 450)
          return next
        })
      } else {
        sound.miss()
      }
      setDragId(null)
      setHot(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragId])

  function startDrag(e: React.PointerEvent, item: Item) {
    if (item.placed) return
    sound.click()
    setPos({ x: e.clientX, y: e.clientY })
    setDragId(item.id)
  }

  const placedCount = items.filter((i) => i.placed).length

  return (
    <div className="gx">
      <p className="gx-hint">Drag each shape into the basket with the same color! 🧺</p>

      <div className="sort-items">
        {items.filter((i) => !i.placed).map((item) => {
          const c = PALETTE.find((p) => p.id === item.color)!
          return (
            <button
              key={item.id}
              className={`sort-chip${dragId === item.id ? ' dragging' : ''}`}
              onPointerDown={(e) => startDrag(e, item)}
              aria-label={`${item.color} star`}
            >
              <Star fill={c.fill} stroke={c.stroke} />
            </button>
          )
        })}
      </div>

      <div className="sort-baskets">
        {colorIds.map((id) => {
          const c = PALETTE.find((p) => p.id === id)!
          const n = items.filter((i) => i.placed && i.color === id).length
          return (
            <div
              key={id}
              className={`sort-basket${hot === id ? ' hot' : ''}`}
              data-color={id}
              style={{ color: c.fill, borderColor: c.fill, background: `${c.fill}26` }}
              aria-label={`${id} basket`}
            >
              <span className="count">{n}</span>
            </div>
          )
        })}
      </div>

      <div className="gx-foot">
        <span className="scorepill"><Star /> {placedCount} / {count} sorted</span>
      </div>

      {dragItem && (() => {
        const c = PALETTE.find((p) => p.id === dragItem.color)!
        return (
          <div className="dragclone" style={{ left: pos.x, top: pos.y }}>
            <Star fill={c.fill} stroke={c.stroke} size={80} />
          </div>
        )
      })()}
    </div>
  )
}
