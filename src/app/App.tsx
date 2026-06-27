import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './Home'
import { GameHost } from './GameHost'
import { useStore } from '../state/store'

export function App() {
  const mode = useStore((s) => s.mode)

  // Reflect light/dark choice on the document so all CSS tokens switch.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  // HashRouter so the app works when hosted anywhere (or opened locally)
  // without needing server-side route rewrites.
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:gameId" element={<GameHost />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
