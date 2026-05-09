const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ rankings = [], currentParticipantId, compact = false }) {
  const display = compact ? rankings.slice(0, 5) : rankings

  if (display.length === 0) {
    return (
      <div className="card text-center py-8 text-slate-400 dark:text-slate-500">
        <p className="text-3xl mb-2">🏆</p>
        <p className="text-sm">No rankings yet</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <span className="text-lg">🏆</span>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Leaderboard</h3>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {display.map((entry, i) => {
          const isMe = entry.participantId === currentParticipantId
          return (
            <li
              key={entry.participantId || i}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isMe ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              {/* Rank */}
              <span className="w-7 text-center font-bold text-sm">
                {i < 3 ? MEDALS[i] : <span className="text-slate-400">#{entry.rank}</span>}
              </span>

              {/* Name */}
              <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                {entry.displayName}
                {isMe && <span className="ml-1 text-xs text-brand-500">(you)</span>}
              </span>

              {/* Score */}
              <span className="font-extrabold text-sm tabular-nums text-slate-800 dark:text-slate-100">
                {entry.totalScore.toLocaleString()}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
