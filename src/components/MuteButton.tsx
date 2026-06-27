import { useStore } from '../state/store'

/** Toggle all sound. Lives in the top bar (handy for the grown-ups). */
export function MuteButton() {
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  return (
    <button
      className="icon-btn"
      onClick={toggleMute}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      title={muted ? 'Sound off' : 'Sound on'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
