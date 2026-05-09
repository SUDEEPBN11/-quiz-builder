import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAnalytics } from '../services/api'
import { useSession } from '../contexts/SessionContext'
import { QuestionStatsChart, AccuracyPieChart } from '../components/AnalyticsChart'
import Leaderboard from '../components/Leaderboard'
import ErrorBanner from '../components/ErrorBanner'

export default function HostAnalytics() {
  const { sessionId } = useParams()
  const { session }   = useSession()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const presenterToken = session.presenterToken || sessionStorage.getItem('presenterToken')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnalytics(sessionId, presenterToken)
        setData(res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId, presenterToken])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading analytics…</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">📊 Session Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Post-session performance overview</p>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {data && (
        <div className="flex flex-col gap-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Participants', val: data.totalParticipants, icon: '👥', color: 'text-brand-600 dark:text-brand-400' },
              { label: 'Active',       val: data.activeCount,       icon: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Accuracy',     val: `${data.overallAccuracy}%`, icon: '🎯', color: 'text-purple-600 dark:text-purple-400' },
              { label: 'Answer Rate',  val: `${data.engagementMetrics?.answerRate || 0}%`, icon: '📈', color: 'text-accent-500' },
            ].map(({ label, val, icon, color }) => (
              <div key={label} className="card text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className={`text-2xl font-extrabold ${color}`}>{val}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card md:col-span-2">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-4">Per-Question Performance</h3>
              <QuestionStatsChart questionStats={data.questionStats} />
            </div>
            <div className="card flex flex-col items-center justify-center">
              <AccuracyPieChart accuracy={data.overallAccuracy} />
            </div>
          </div>

          {/* Top performers */}
          {data.topPerformer && (
            <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥇</span>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">{data.topPerformer.displayName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Top performer — {data.topPerformer.totalScore} points</p>
                </div>
              </div>
            </div>
          )}

          {/* Final leaderboard */}
          <Leaderboard rankings={data.finalLeaderboard || []} />
        </div>
      )}
    </div>
  )
}
