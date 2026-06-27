import { useNavigate } from 'react-router-dom'

/** The Dhondhu Games wordmark + star logo. Clicking returns home. */
export function Brand() {
  const navigate = useNavigate()
  return (
    <button className="brand" onClick={() => navigate('/')} aria-label="Dhondhu Games home">
      <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 3l8.3 16.8 18.5 2.7-13.4 13 3.2 18.4L32 51.2 15.4 53.9l3.2-18.4L5.2 22.5l18.5-2.7z"
          fill="#FFC93C"
          stroke="#E8A91E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="29" r="3" fill="#3A2E5C" />
        <circle cx="39" cy="29" r="3" fill="#3A2E5C" />
        <path d="M25 37c3 3 11 3 14 0" stroke="#3A2E5C" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span className="name">Dhondhu<b>Games</b></span>
    </button>
  )
}
