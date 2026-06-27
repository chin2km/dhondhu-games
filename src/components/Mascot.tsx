interface MascotProps {
  size?: number
  bob?: boolean
}

/** "Twinkle" — the friendly star buddy who anchors the whole site. */
export function Mascot({ size = 150, bob = true }: MascotProps) {
  return (
    <svg
      className={`mascot${bob ? ' bob' : ''}`}
      style={{ width: size, height: 'auto' }}
      viewBox="0 0 200 200"
      aria-label="Twinkle the star, Dhondhu's game buddy"
    >
      <ellipse cx="100" cy="185" rx="44" ry="8" fill="#3A2E5C" opacity=".12" />
      <path
        d="M100 18l20 40 44 6.5-32 31 7.6 43.5L100 118l-39.6 21 7.6-43.5-32-31 44-6.5z"
        fill="#FFC93C"
        stroke="#E8A91E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="86" cy="78" r="8" fill="#3A2E5C" />
      <circle cx="118" cy="78" r="8" fill="#3A2E5C" />
      <circle cx="89" cy="75" r="2.6" fill="#fff" />
      <circle cx="121" cy="75" r="2.6" fill="#fff" />
      <circle cx="74" cy="92" r="7" fill="#FF6B6B" opacity=".5" />
      <circle cx="130" cy="92" r="7" fill="#FF6B6B" opacity=".5" />
      <path d="M88 92c4 6 20 6 24 0" stroke="#3A2E5C" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
