import { useStore } from '../state/store'
import { WORLDS } from '../data/worlds'
import { sound } from '../engine/sound'

/** Choose the themed world that skins every game (animals, space, trucks, dinos, cars). */
export function WorldPicker() {
  const world = useStore((s) => s.world)
  const setWorld = useStore((s) => s.setWorld)

  return (
    <section className="panel" aria-label="Choose a world">
      <div className="panel-head">
        <h2>Pick a world</h2>
      </div>
      <p className="panel-sub">Your games dress up in this theme! 🌈</p>
      <div className="worlds">
        {WORLDS.map((w) => (
          <button
            key={w.id}
            className="world"
            style={{ ['--c' as string]: w.accent }}
            aria-pressed={world === w.id}
            onClick={() => {
              sound.click()
              setWorld(w.id)
            }}
          >
            <span className="emoji" aria-hidden="true">{w.emoji}</span>
            <span className="wname">{w.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
