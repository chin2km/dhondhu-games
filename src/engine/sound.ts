import { useStore } from '../state/store'

// All sound is synthesised with the Web Audio API so the app ships with zero
// audio asset files. Warm, soft tones only — nothing harsh for little ears.

let ctx: AudioContext | null = null

function audio(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, startOffset: number, dur: number, type: OscillatorType = 'sine', gain = 0.14) {
  const a = audio()
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(a.destination)
  const t = a.currentTime + startOffset
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

function enabled(): boolean {
  return !useStore.getState().muted
}

export const sound = {
  /** Soft tick when something is tapped. */
  click() {
    if (!enabled()) return
    tone(520, 0, 0.08, 'triangle', 0.07)
  },
  /** Happy rising chime when a star is earned. */
  star() {
    if (!enabled()) return
    tone(880, 0, 0.12, 'sine', 0.12)
    tone(1320, 0.07, 0.16, 'sine', 0.1)
  },
  /** Gentle, non-scary "try again" wobble. */
  miss() {
    if (!enabled()) return
    tone(300, 0, 0.16, 'sine', 0.1)
    tone(232, 0.08, 0.2, 'sine', 0.09)
  },
  /** Little fanfare for finishing a round. */
  win() {
    if (!enabled()) return
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.42, 'triangle', 0.13))
  },
  /** Satisfying bubble/balloon pop. */
  pop() {
    if (!enabled()) return
    const a = audio()
    const osc = a.createOscillator()
    const g = a.createGain()
    osc.type = 'sine'
    osc.connect(g)
    g.connect(a.destination)
    const t = a.currentTime
    osc.frequency.setValueAtTime(900, t)
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12)
    g.gain.setValueAtTime(0.18, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13)
    osc.start(t)
    osc.stop(t + 0.15)
  },
  /** Quick whoosh for catching / dropping. */
  whoosh() {
    if (!enabled()) return
    tone(420, 0, 0.1, 'sawtooth', 0.05)
    tone(620, 0.04, 0.1, 'sawtooth', 0.04)
  },
  /** Silly chomp for Feed the Monster. */
  chomp() {
    if (!enabled()) return
    tone(160, 0, 0.09, 'square', 0.12)
    tone(110, 0.07, 0.12, 'square', 0.1)
  },
  /** A single tone at a given pitch — used by Copy Me / sequence games. */
  note(freq: number) {
    if (!enabled()) return
    tone(freq, 0, 0.32, 'sine', 0.16)
  },
}
