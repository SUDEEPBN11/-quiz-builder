import { useEffect, useRef } from 'react'

export default function ScoreDisplay({ score, rank, delta }) {
  const prevScore = useRef(score)
  const changed   = score !== prevScore.current
  useEffect(() => { prevScore.current = score }, [score])

  return (
    <div className="flex items-center gap-4">
      <div className={`card text-center px-5 py-3 min-w-[100px] ${changed ? 'animate-bounce-in' : ''}`}>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Score</p>
        <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 tabular-nums">
          {score.toLocaleString()}
        </p>
        {delta > 0 && (
          <p className="text-xs text-emerald-500 font-bold animate-fade-in">+{delta}</p>
        )}
      </div>
      {rank && (
        <div className="card text-center px-5 py-3 min-w-[80px]">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Rank</p>
          <p className="text-2xl font-extrabold text-accent-500 tabular-nums">#{rank}</p>
        </div>
      )}
    </div>
  )
}
