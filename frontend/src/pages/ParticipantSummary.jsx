import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getParticipantSummary } from '../services/api'
import { useSession } from '../contexts/SessionContext'
import ErrorBanner from '../components/ErrorBanner'

export default function ParticipantSummary() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const participantId    = session.participantId    || sessionStorage.getItem('participantId')
  const participantToken = session.participantToken || sessionStorage.getItem('participantToken')
  const sessionId        = session.sessionId        || sessionStorage.getItem('sessionId')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getParticipantSummary(sessionId, participantId, participantToken)
        setData(res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (sessionId && participantId && participantToken) load()
    else { setError('Session data not found.'); setLoading(false) }
  }, [sessionId, participantId, participantToken])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-3">
              {data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : data.rank === 3 ? '🥉' : '🎉'}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {data.displayName}, great job!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's how you did</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Score',    val: data.totalScore.toLocaleString(), icon: '⭐', color: 'text-brand-600 dark:text-brand-400' },
              { label: 'Rank',     val: `#${data.rank}`,                  icon: '🏆', color: 'text-accent-500' },
              { label: 'Accuracy', val: `${data.accuracy}%`,              icon: '🎯', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(({ label, val, icon, color }) => (
              <div key={label} className="card text-center animate-bounce-in">
                <p className="text-2xl mb-1">{icon}</p>
                <p className={`text-xl font-extrabold ${color}`}>{val}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Per-question breakdown */}
          <div className="card">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Question Breakdown</h3>
            <ul className="flex flex-col gap-2">
              {data.perQuestionBreakdown.map((q, i) => (
                <li key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                  q.isSkipped   ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  q.isCorrect   ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                  'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-lg">
                    {q.isSkipped ? '⏭️' : q.isCorrect ? '✅' : '❌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Q{i + 1}</p>
                    {!q.isCorrect && !q.isSkipped && q.correctAnswer && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Correct: <span className="font-medium text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                      </p>
                    )}
                    {q.isSkipped && q.correctAnswer && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Answer: <span className="font-medium text-yellow-600 dark:text-yellow-400">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">+{q.scoreAwarded}</p>
                    <p className="text-xs text-slate-400">{(q.responseTimeMs / 1000).toFixed(1)}s</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Skipped questions */}
          {data.skippedQuestions.length > 0 && (
            <div className="card border-yellow-200 dark:border-yellow-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">
                ⏭️ Skipped Questions ({data.skippedQuestions.length})
              </h3>
              <ul className="flex flex-col gap-3">
                {data.skippedQuestions.map((q, i) => (
                  <li key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{q.questionText}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      ✓ {q.correctAnswer}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => navigate('/')} className="btn-primary btn-lg w-full">
            🏠 Back to Home
          </button>
        </div>
      )}
    </div>
  )
}
