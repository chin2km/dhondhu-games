/**
 * Find a drop target under a screen point. The dragged "clone" element uses
 * `pointer-events: none` so it is invisible to elementFromPoint and we hit the
 * real drop zone beneath the finger/cursor.
 */
export function dropTargetAt(x: number, y: number, selector: string): HTMLElement | null {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  return (el.closest(selector) as HTMLElement) ?? null
}
