import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Level, WorldId } from '../state/store'
import { TopBar } from '../components/TopBar'
import { WinOverlay } from '../components/WinOverlay'
import { GAME_COMPONENTS } from '../games/registry'
import { getGame } from '../data/games'
import { getWorld } from '../data/worlds'
import { LEVELS } from '../engine/difficulty'
import { useStore } from '../state/store'
import { sound } from '../engine/sound'

const WIN_BONUS = 5

interface Pending { kind: 'world' | 'level'; value: WorldId | Level; label: string }

export function GameHost() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const game = getGame(gameId)
  const GameComponent = GAME_COMPONENTS[gameId]

  const addStars = useStore((s) => s.addStars)
  const recordBest = useStore((s) => s.recordBest)
  const recordGame = useStore((s) => s.recordGame)
  const recordPlay = useStore((s) => s.recordPlay)
  const setWorld = useStore((s) => s.setWorld)
  const setLevel = useStore((s) => s.setLevel)
  const world = useStore((s) => s.world)
  const level = useStore((s) => s.level)
  const gameStars = useStore((s) => s.gameStars[gameId] ?? 0)

  const roundScore = useRef(0)
  const [round, setRound] = useState(0)
  const [continueToken, setContinueToken] = useState(0)
  const [won, setWon] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)

  useEffect(() => {
    if (gameId) recordPlay(gameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const award = useCallback(
    (n: number) => {
      roundScore.current += n
      addStars(n, gameId)
    },
    [addStars, gameId],
  )

  function handleWin() {
    roundScore.current += WIN_BONUS
    addStars(WIN_BONUS, gameId)
    recordBest(gameId, roundScore.current)
    recordGame()
    setWon(true)
  }

  function restart() {
    roundScore.current = 0
    setWon(false)
    setRound((r) => r + 1)
  }

  // "Keep playing": endless games resume in place (keep score, extend goal);
  // round games start a fresh round but keep the running score.
  function keepPlaying() {
    setWon(false)
    if (game?.endless) setContinueToken((t) => t + 1)
    else setRound((r) => r + 1)
  }

  // "New game": always a clean restart from zero.
  function newGame() {
    restart()
  }

  // Changing theme/difficulty mid-game offers a fresh start with the new choice.
  function requestWorld(id: WorldId) {
    if (id === world) return
    const w = getWorld(id)
    setPending({ kind: 'world', value: id, label: `${w.emoji} ${w.name}` })
  }
  function requestLevel(v: Level) {
    if (v === level) return
    const l = LEVELS.find((x) => x.value === v)!
    setPending({ kind: 'level', value: v, label: `${l.seed} ${l.name}` })
  }
  function confirmPending() {
    if (!pending) return
    if (pending.kind === 'world') setWorld(pending.value as WorldId)
    else setLevel(pending.value as Level)
    setPending(null)
    restart()
  }

  const accent = game?.accent ?? 'var(--grape)'
  const left = (
    <div className="hud-left">
      <button className="btn ghost" onClick={() => { sound.click(); navigate('/') }}>← Home</button>
      <span className="gametitle">
        {game ? <><span className="gt-icon" aria-hidden="true">{game.icon}</span> {game.title}</> : 'Game'}
      </span>
    </div>
  )

  return (
    <div className="gameroom" style={{ ['--accent' as string]: accent }}>
      <TopBar left={left} starValue={gameStars} onPickWorld={requestWorld} onPickLevel={requestLevel} />

      <main className="stage">
        {GameComponent ? (
          <GameComponent key={round} onWin={handleWin} award={award} continueToken={continueToken} />
        ) : (
          <div className="coming">
            <div className="big-emoji">🤔</div>
            <h2>Hmm, can't find that game</h2>
            <p style={{ marginTop: 20 }}>
              <button className="btn" onClick={() => navigate('/')}>Pick a game</button>
            </p>
          </div>
        )}
      </main>

      {won && (
        <WinOverlay
          bonus={WIN_BONUS}
          keepLabel={game?.endless ? 'Keep playing' : 'Next round'}
          onKeepPlaying={keepPlaying}
          onNewGame={newGame}
        />
      )}

      {pending && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Start over?">
          <div className="winbox" style={{ borderColor: 'var(--grape)' }}>
            <h2 style={{ fontSize: '1.6rem' }}>Start over?</h2>
            <p>Play again with {pending.label}?</p>
            <div className="win-actions">
              <button className="btn grape" onClick={confirmPending}>Yes, start over</button>
              <button className="btn ghost" onClick={() => setPending(null)}>Keep playing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
