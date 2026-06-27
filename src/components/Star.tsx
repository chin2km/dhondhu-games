interface StarProps {
  fill?: string
  stroke?: string
  size?: number
  className?: string
}

/** The five-point star used everywhere as the reward motif. */
export function Star({ fill = '#FFC93C', stroke = '#E8A91E', size, className }: StarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  )
}
