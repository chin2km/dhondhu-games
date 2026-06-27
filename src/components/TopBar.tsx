import type { ReactNode } from 'react'
import type { Level, WorldId } from '../state/store'
import { useStore } from '../state/store'
import { WORLDS } from '../data/worlds'
import { LEVELS } from '../engine/difficulty'
import { sound } from '../engine/sound'
import { Star } from './Star'

interface TopBarProps {
  left: ReactNode
  starValue: number
  onPickWorld: (id: WorldId) => void
  onPickLevel: (l: Level) => void
  /** When true the Theme/Difficulty controls collapse (mobile, on scroll-down). */
  hideControls?: boolean
}

export function TopBar({ left, starValue, onPickWorld, onPickLevel, hideControls = false }: TopBarProps) {
  const world = useStore((s) => s.world)
  const level = useStore((s) => s.level)
  const muted = useStore((s) => s.muted)
  const mode = useStore((s) => s.mode)
  const toggleMute = useStore((s) => s.toggleMute)
  const toggleMode = useStore((s) => s.toggleMode)

  return (
    <header className={`dash-bar${hideControls ? ' bar-condensed' : ''}`}>
      {left}

      <div className="bar-controls">
        <div className="seg-group">
          <span className="ctrl-label">Theme</span>
          <div className="seg" role="group" aria-label="Choose a theme">
            {WORLDS.map((w) => (
              <button
                key={w.id}
                className="acc"
                style={{ ['--c' as string]: w.accent }}
                aria-pressed={world === w.id}
                aria-label={w.name}
                title={w.name}
                onClick={() => { sound.click(); onPickWorld(w.id) }}
              >
                {w.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="seg-group">
          <span className="ctrl-label">Difficulty</span>
          <div className="seg" role="group" aria-label="Choose difficulty">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                className="acc"
                style={{ ['--c' as string]: l.accent }}
                aria-pressed={level === l.value}
                aria-label={l.name}
                title={l.name}
                onClick={() => { sound.click(); onPickLevel(l.value) }}
              >
                {l.seed}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bar-utility">
        <span className="iconpill" aria-label={`${starValue} stars`}><Star /> {starValue}</span>
        <button className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Sound off' : 'Sound on'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className="icon-btn" onClick={toggleMode} aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          {mode === 'light' ? '🌙' : '🌞'}
        </button>
      </div>
    </header>
  )
}
