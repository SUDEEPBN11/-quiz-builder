/**
 * SVG circular countdown ring.
 * Color transitions: green → yellow → red based on remaining fraction.
 */
export default function TimerRing({ remaining, total, size = 96 }) {
  const fraction  = total > 0 ? remaining / total : 0
  const radius    = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset    = circumference * (1 - fraction)

  const color =
    fraction > 0.5 ? '#10b981' :   // emerald
    fraction > 0.25 ? '#f59e0b' :  // amber
    '#ef4444'                       // red

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor"
          strokeWidth={6}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
        />
      </svg>
      <span
        className="absolute text-2xl font-extrabold tabular-nums"
        style={{ color }}
        aria-live="polite"
        aria-label={`${remaining} seconds remaining`}
      >
        {remaining}
      </span>
    </div>
  )
}
