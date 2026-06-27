import { useEffect, useRef } from 'react'

/**
 * Wires the host's "Keep playing" signal. When `continueToken` actually changes
 * (the child stays mounted), `resume()` runs so a game can clear its done flag
 * and extend its goal to keep playing indefinitely.
 *
 * We compare against the last-seen token (not a "first render" flag) so that
 * React StrictMode's double-invoked effects — which fire twice with the *same*
 * token on mount — never trigger a spurious resume.
 */
export function useContinue(continueToken: number | undefined, resume: () => void) {
  const last = useRef(continueToken)
  const fn = useRef(resume)
  fn.current = resume
  useEffect(() => {
    if (continueToken === last.current) return
    last.current = continueToken
    fn.current()
  }, [continueToken])
}
