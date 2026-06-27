import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { Star } from './Star'

/** The always-visible running total of stars, with a little bump on change. */
export function StarBank() {
  const stars = useStore((s) => s.stars)
  const [bump, setBump] = useState(false)
  const prev = useRef(stars)

  useEffect(() => {
    if (stars !== prev.current) {
      prev.current = stars
      setBump(true)
      const t = setTimeout(() => setBump(false), 420)
      return () => clearTimeout(t)
    }
  }, [stars])

  return (
    <div className={`starbank${bump ? ' bump' : ''}`} title="Stars Dhondhu has collected" aria-label={`${stars} stars`}>
      <Star />
      <span className="big">{stars}</span>
    </div>
  )
}
