import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../state/store'
import { sound } from '../../engine/sound'
import { dropTargetAt } from '../../engine/drag'
import { burst } from '../../engine/juice'
import { Star } from '../../components/Star'
import { useContinue } from '../../engine/useContinue'
import type { GameProps } from '../registry'
import './monster.css'

const FOODS = ['🍎', '🍌', '🍓', '🍪', '🧁', '🍩', '🍕', '🍇', '🍊', '🍉']
const GOOD = ['Yum!', 'Mmm!', 'Tasty!', 'Nom nom!']
const BAD = ['Grrr!', 'Yuck!', 'Bleh!', 'Aaa!']

function config(level: number) {
  return ({
    1: { target: 5, foods: 3 },
    2: { target: 7, foods: 4 },
    3: { target: 9, foods: 6 },
  } as const)[level as 1 | 2 | 3]
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

export function MonsterGame({ onWin, award, continueToken }: GameProps) {
  const level = useStore((s) => s.level)
  const cfg = config(level)
  const foods = useMemo(() => shuffle(FOODS).slice(0, cfg.foods), [cfg.foods])

  const [fed, setFed] = useState(0)
  const [goal, setGoal] = useState<number>(cfg.target)
  const goalRef = useRef<number>(cfg.target)
  const [want, setWant] = useState(() => pick(foods))
  const [mood, setMood] = useState<'' | 'happy' | 'angry' | 'chomp'>('')
  const [reaction, setReaction] = useState<{ text: string; good: boolean; key: number } | null>(null)
  const [dragFood, setDragFood] = useState<{ food: string; key: number } | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hot, setHot] = useState(false)
  const doneRef = useRef(false)
  const reactKey = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }

  useContinue(continueToken, () => {
    doneRef.current = false
    goalRef.current += cfg.target
    setGoal(goalRef.current)
  })

  function nextWant(current: string) {
    if (foods.length < 2) return current
    let w = pick(foods)
    while (w === current) w = pick(foods)
    return w
  }

  useEffect(() => {
    if (dragFood === null) return
    const move = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setHot(!!dropTargetAt(e.clientX, e.clientY, '.monster'))
    }
    const up = (e: PointerEvent) => {
      const onMonster = dropTargetAt(e.clientX, e.clientY, '.monster')
      if (onMonster) feed(dragFood.food, e.clientX, e.clientY)
      setDragFood(null)
      setHot(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragFood, want])

  function showReaction(text: string, good: boolean) {
    reactKey.current += 1
    setReaction({ text, good, key: reactKey.current })
    later(() => setReaction((r) => (r && r.key === reactKey.current ? null : r)), 900)
  }

  function feed(food: string, x: number, y: number) {
    if (doneRef.current) return
    if (food !== want) {
      // Wrong food — monster gets cross.
      sound.miss()
      setMood('angry')
      showReaction(pick(BAD) + ' 😠', false)
      later(() => setMood(''), 600)
      return
    }
    // Correct!
    sound.chomp()
    burst(x, y, 'confetti')
    setMood('chomp')
    showReaction(pick(GOOD) + ' 😋', true)
    later(() => setMood('happy'), 130)
    later(() => setMood(''), 640)
    award(1)
    setWant((w) => nextWant(w))
    setFed((f) => {
      const nf = f + 1
      if (nf >= goalRef.current && !doneRef.current) {
        doneRef.current = true
        later(onWin, 600)
      }
      return nf
    })
  }

  return (
    <div className="gx-fill">
      <div className="monster-area">
        {reaction && <div className={`reaction ${reaction.good ? 'good' : 'bad'}`} key={reaction.key}>{reaction.text}</div>}

        <span className="iconpill"><Star /> {fed} / {goal} fed</span>

        <div className="thought">I want <span className="want" aria-hidden="true">{want}</span> please!</div>

        <div className={`monster ${mood} ${hot ? 'hot' : ''}`} aria-label="Hungry monster">
          <span className="horn l" />
          <span className="horn r" />
          <span className="brow l" />
          <span className="brow r" />
          <span className="eye l"><span className="pupil" /></span>
          <span className="eye r"><span className="pupil" /></span>
          <span className="mouth"><span className="tongue" /></span>
        </div>

        <div className="feed-tray" aria-label="Food">
          {foods.map((food, i) => (
            <button
              key={food}
              className={`food${dragFood?.food === food ? ' dragging' : ''}`}
              onPointerDown={(e) => {
                sound.click()
                setPos({ x: e.clientX, y: e.clientY })
                setDragFood({ food, key: i })
              }}
              aria-label={`Food ${food}`}
            >
              {food}
            </button>
          ))}
        </div>
      </div>

      {dragFood && (
        <div className="dragclone" style={{ left: pos.x, top: pos.y }}>
          <span className="food-clone" aria-hidden="true">{dragFood.food}</span>
        </div>
      )}
    </div>
  )
}
