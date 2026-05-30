import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useSession } from '../contexts/SessionContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import Leaderboard from '../components/Leaderboard'
import ParticipantList from '../components/ParticipantList'
import TimerRing from '../components/TimerRing'
import ErrorBanner from '../components/ErrorBanner'

export default function HostQuiz() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { session, update } = useSession()
  const rankings = useLeaderboard()

  const [currentQ,     setCurrentQ]     = useState(null)
  const [qIndex,       setQIndex]       = useState(-1)
  const [totalQ,       setTotalQ]       = useState(0)
  const [remaining,    setRemaining]    = useState(0)
  const [analytics,    setAnalytics]    = useState(null)
  const [participants, setParticipants] = useState([])
  const [error,        setError]        = useState(null)
  const [ended,        setEnded]        = useState(false)

  const presenterToken = session.presenterToken || sessionStorage.getItem('presenterToken')
  const sessionCode    = session.sessionCode    || sessionStorage.getItem('sessionCode')

  useEffect(() => {
    if (!socket || !presenterToken || !sessionCode) return

    socket.emit('presenter_join', { sessionCode, presenterToken })

    socket.on('new_question', (data) => {
      setCurrentQ(data)
      setQIndex(data.questionIndex)
      setTotalQ(data.totalQuestions)
      setRemaining(data.timerSeconds)
    })

    socket.on('timer_tick', ({ remainingSeconds }) => setRemaining(remainingSeconds))
    socket.on('timer_expired', () => setRemaining(0))

    socket.on('analytics_update', (data) => setAnalytics(data))

    socket.on('participant_list_update', ({ participants }) => {
      setParticipants(participants)
      update({ participants })
    })

    socket.on('quiz_ended', () => {
      setEnded(true)
      setTimeout(() => navigate(`/host/${sessionId}/analytics`), 2000)
    })

    socket.on('error', ({ message }) => setError(message))

    return () => {
      socket.off('new_question')
      socket.off('timer_tick')
      socket.off('timer_expired')
      socket.off('analytics_update')
      socket.off('participant_list_update')
      socket.off('quiz_ended')
      socket.off('error')
    }
  }, [socket, presenterToken, sessionCode])

  const emit = (event) => socket.emit(event, { sessionCode, presenterToken })

  if (ended) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-bounce-in">
          <div className="text-6xl mb-4"> </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Quiz Ended!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Loading analytics…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {currentQ ? `Question ${qIndex + 1} / ${totalQ}` : 'Host Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Code: <strong>{sessionCode}</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => emit('pause_quiz')} className="btn-secondary btn-sm">⏸ Pause</button>
          <button onClick={() => emit('end_quiz')}   className="btn-danger btn-sm">⏹ End</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <div className="lg:col-span-2 flex flex-col gap-4">
          {currentQ ? (
            <div className="card">
              
              <div className="flex items-start gap-4 mb-4">
                <TimerRing remaining={remaining} total={currentQ.timerSeconds} size={80} />
                <div className="flex-1">
                  <span className="badge badge-purple mb-2">{currentQ.difficulty}</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {currentQ.text}
                  </p>
                </div>
              </div>

              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {currentQ.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-xl text-white text-sm font-semibold ${
                      ['bg-red-500','bg-blue-500','bg-yellow-500','bg-emerald-500'][i]
                    }`}
                  >
                    {['▲','◆','●','■'][i]} {opt}
                  </div>
                ))}
              </div>

              
              <div className="flex gap-2">
                <button onClick={() => emit('prev_question')} className="btn-secondary flex-1">← Prev</button>
                <button onClick={() => emit('next_question')} className="btn-primary flex-1">Next →</button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-4">Ready to start!</p>
              <button onClick={() => emit('next_question')} className="btn-primary btn-lg">
                ▶ Start First Question
              </button>
            </div>
          )}

          
          {analytics?.questionStats && analytics.questionStats[qIndex] && (
            <div className="card">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3">Answer Stats</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Correct',   val: analytics.questionStats[qIndex].correct,   color: 'text-emerald-600' },
                  { label: 'Incorrect', val: analytics.questionStats[qIndex].incorrect, color: 'text-red-500' },
                  { label: 'Skipped',   val: analytics.questionStats[qIndex].skipped,   color: 'text-yellow-500' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <p className={`text-2xl font-extrabold ${color}`}>{val}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        
        <div className="flex flex-col gap-4">
          
          {analytics && (
            <div className="card">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3">Live Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">{analytics.activeCount}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <p className="text-xl font-extrabold text-slate-600 dark:text-slate-300">{analytics.totalParticipants}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
              {analytics.topPerformer && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-xs">
                  <span className="font-bold text-yellow-700 dark:text-yellow-400">🥇 {analytics.topPerformer.displayName}</span>
                  <span className="text-slate-500 ml-1">— {analytics.topPerformer.totalScore} pts</span>
                </div>
              )}
            </div>
          )}

          <Leaderboard rankings={rankings} compact />
          <ParticipantList participants={participants} />
        </div>
      </div>
    </div>
  )
}
