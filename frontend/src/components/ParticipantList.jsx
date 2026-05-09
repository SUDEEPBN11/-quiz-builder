export default function ParticipantList({ participants = [] }) {
  const active   = participants.filter((p) => p.isActive)
  const inactive = participants.filter((p) => !p.isActive)

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Participants</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">{active.length} active</span>
          {inactive.length > 0 && <span className="badge badge-red">{inactive.length} away</span>}
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p className="text-3xl mb-2">⏳</p>
          Waiting for participants to join…
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${p.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {p.displayName}
              </span>
              {p.totalScore > 0 && (
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                  {p.totalScore.toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
