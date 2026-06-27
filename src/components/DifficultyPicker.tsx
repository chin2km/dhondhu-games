import { useStore } from '../state/store'
import { LEVELS } from '../engine/difficulty'
import { Star } from './Star'
import { sound } from '../engine/sound'

/** Three sizes shown as Sprout / Tree / Mountain — sizes, not words, for a pre-reader. */
export function DifficultyPicker() {
  const level = useStore((s) => s.level)
  const setLevel = useStore((s) => s.setLevel)

  return (
    <section className="panel" aria-label="Choose how big">
      <div className="panel-head">
        <h2>How big today?</h2>
      </div>
      <p className="panel-sub">Pick your size — grow bigger as you get better! 🌱</p>
      <div className="levels">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            className="level"
            style={{ ['--c' as string]: l.accent }}
            data-lvl={l.value}
            aria-pressed={level === l.value}
            onClick={() => {
              sound.click()
              setLevel(l.value)
            }}
          >
            <span className="seed" aria-hidden="true">{l.seed}</span>
            <span className="lname">{l.name}</span>
            <span className="lstars" aria-hidden="true">
              {Array.from({ length: l.value }).map((_, i) => (
                <Star key={i} size={18} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
