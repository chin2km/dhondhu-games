import { useEffect, useMemo, useRef, useState } from 'react'
import { GameCard } from '../components/GameCard'
import { TopBar } from '../components/TopBar'
import { GAMES } from '../data/games'
import { useStore } from '../state/store'

export function Home() {
  const stars = useStore((s) => s.stars)
  const setWorld = useStore((s) => s.setWorld)
  const setLevel = useStore((s) => s.setLevel)
  const playCount = useStore((s) => s.playCount)

  const gridRef = useRef<HTMLDivElement>(null)
  const [hideControls, setHideControls] = useState(false)

  // Hide Theme/Difficulty controls when scrolling down; reveal on scroll-up
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHideControls(y > lastY && y > 72)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Most-played games float to the top (stable sort keeps the rest in order).
  const ordered = useMemo(
    () => [...GAMES].sort((a, b) => (playCount[b.id] ?? 0) - (playCount[a.id] ?? 0)),
    [playCount],
  )

  // Focus the first tile on load for instant keyboard/console play.
  useEffect(() => {
    const first = gridRef.current?.querySelector<HTMLElement>('.gcard')
    first?.focus({ preventScroll: true })
  }, [])

  // Arrow-key navigation between tiles, by on-screen geometry (works for any layout).
  function onGridKey(e: React.KeyboardEvent) {
    const dirs = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']
    if (!dirs.includes(e.key)) return
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.gcard'))
    const active = document.activeElement as HTMLElement | null
    const idx = active ? cards.indexOf(active) : -1
    if (idx < 0) {
      e.preventDefault()
      cards[0]?.focus()
      return
    }
    const cur = active!.getBoundingClientRect()
    const cx = cur.left + cur.width / 2
    const cy = cur.top + cur.height / 2
    const horizontal = e.key === 'ArrowRight' || e.key === 'ArrowLeft'
    let best: HTMLElement | null = null
    let bestScore = Infinity
    for (const c of cards) {
      if (c === active) continue
      const r = c.getBoundingClientRect()
      const dx = r.left + r.width / 2 - cx
      const dy = r.top + r.height / 2 - cy
      const ok =
        (e.key === 'ArrowRight' && dx > 8) ||
        (e.key === 'ArrowLeft' && dx < -8) ||
        (e.key === 'ArrowDown' && dy > 8) ||
        (e.key === 'ArrowUp' && dy < -8)
      if (!ok) continue
      const along = Math.abs(horizontal ? dx : dy)
      const perp = Math.abs(horizontal ? dy : dx)
      const score = along + perp * 2
      if (score < bestScore) {
        bestScore = score
        best = c
      }
    }
    if (best) {
      e.preventDefault()
      best.focus()
    }
  }

  const brand = (
    <div className="brand-mini">
      <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 3l8.3 16.8 18.5 2.7-13.4 13 3.2 18.4L32 51.2 15.4 53.9l3.2-18.4L5.2 22.5l18.5-2.7z" fill="#FFC93C" stroke="#E8A91E" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="25" cy="29" r="3" fill="#3A2E5C" /><circle cx="39" cy="29" r="3" fill="#3A2E5C" />
        <path d="M25 37c3 3 11 3 14 0" stroke="#3A2E5C" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span className="name">Dhondhu<b>Games</b></span>
    </div>
  )

  return (
    <div className="dash">
      <TopBar left={brand} starValue={stars} onPickWorld={setWorld} onPickLevel={setLevel} hideControls={hideControls} />

      <main className="dash-body">
        <div className="shelf-title">
          Let's play! <span className="hint">— use the arrow keys, then press Enter</span>
        </div>
        <div className="game-grid" ref={gridRef} onKeyDown={onGridKey}>
          {ordered.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
