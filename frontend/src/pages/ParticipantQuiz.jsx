import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useSession } from '../contexts/SessionContext'
import { useTimer } from '../hooks/useTimer'
import { useLeaderboard } from '../hooks/useLeaderboard'
import QuestionCard from '../components/QuestionCard'
import TimerRing from '../components/TimerRing'
import ScoreDisplay from '../components/ScoreDisplay'
import Leaderboard from '../components/Leaderboard'
import ErrorBanner from '../components/ErrorBanner'

export default function ParticipantQuiz() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { session, update } = useSession()
  const rankings = useLeaderboard()

  const [currentQ,      setCurrentQ]      = useState(null)
  const [qIndex,        setQIndex]        = useState(0)
  const [totalQ,        setTotalQ]        = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [correctIndex,  setCorrectIndex]  = useState(null)
  const [revealed,      setRevealed]      = useState(false)
  const [score,         setScore]         = useState(0)
  const [scoreDelta,    setScoreDelta]    = useState(0)
  const [rank,          setRank]          = useState(null)
  const [showLB,        setShowLB]        = useState(false)
  const [paused,        setPaused]        = useState(false)
  const [error,         setError]         = useState(null)
  const [reconnecting,  setReconnecting]  = useState(false)

  const { remaining, expired } = useTimer(currentQ?.timerSeconds || 0)

  const participantToken = session.participantToken || sessionStorage.getItem('participantToken')
  const participantId    = session.participantId    || sessionStorage.getItem('participantId')

  useEffect(() => {
    if (!socket || !participantToken || !sessionCode) return

    socket.on('new_question', (data) => {
      setCurrentQ(data)
      setQIndex(data.questionIndex)
      setTotalQ(data.totalQuestions)
      setSelectedIndex(null)
      setCorrectIndex(null)
      setRevealed(false)
      setShowLB(false)
      setPaused(false)
      setScoreDelta(0)
    })

    socket.on('answer_result', ({ isCorrect, correctIndex, scoreAwarded, totalScore }) => {
      setCorrectIndex(correctIndex)
      setRevealed(true)
      setScore(totalScore)
      setScoreDelta(scoreAwarded)
      update({ totalScore })
    })

    socket.on('leaderboard_update', ({ rankings }) => {
      const me = rankings.find((r) => r.participantId === participantId)
      if (me) setRank(me.rank)
      setShowLB(true)
    })

    socket.on('quiz_paused', () => setPaused(true))

    socket.on('quiz_ended', () => {
      navigate(`/play/${sessionCode}/summary`)
    })

    socket.on('error', ({ message }) => setError(message))

    // Reconnect handling
    socket.on('disconnect', () => setReconnecting(true))
    socket.on('connect', () => {
      setReconnecting(false)
      socket.emit('reconnect_participant', { sessionCode, participantToken })
    })

    return () => {
      socket.off('new_question')
      socket.off('answer_result')
      socket.off('leaderboard_update')
      socket.off('quiz_paused')
      socket.off('quiz_ended')
      socket.off('error')
      socket.off('disconnect')
      socket.off('connect')
    }
  }, [socket, participantToken, sessionCode, participantId])

  const handleAnswer = (i) => {
    if (revealed || expired || selectedIndex !== null) return
    setSelectedIndex(i)
    socket.emit('submit_answer', { sessionCode, participantToken, questionIndex: qIndex, selectedIndex: i })
  }

  const handleSkip = () => {
    if (revealed || expired || selectedIndex !== null) return
    setSelectedIndex(-1)
    socket.emit('skip_question', { sessionCode, participantToken, questionIndex: qIndex })
  }

  // Reconnecting overlay
  if (reconnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Reconnecting…</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  // Paused overlay
  if (paused) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-bounce-in">
          <div className="text-5xl mb-4">⏸️</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Quiz Paused</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">The host will resume shortly…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Score + timer row */}
      <div className="flex items-center justify-between mb-5">
        <ScoreDisplay score={score} rank={rank} delta={scoreDelta} />
        {currentQ && !revealed && (
          <TimerRing remaining={remaining} total={currentQ.timerSeconds} size={80} />
        )}
      </div>

      {/* Question */}
      {currentQ ? (
        <>
          <QuestionCard
            question={currentQ}
            questionIndex={qIndex}
            totalQuestions={totalQ}
            selectedIndex={selectedIndex}
            correctIndex={correctIndex}
            revealed={revealed}
            onAnswer={handleAnswer}
            disabled={revealed || expired || selectedIndex !== null}
          />

          {/* Skip button */}
          {!revealed && !expired && selectedIndex === null && (
            <button
              onClick={handleSkip}
              className="btn-ghost w-full mt-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm"
            >
              Skip this question →
            </button>
          )}

          {/* Feedback after answer */}
          {revealed && (
            <div className={`mt-4 p-4 rounded-2xl text-center font-bold animate-bounce-in ${
              selectedIndex === correctIndex
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {selectedIndex === correctIndex ? `🎉 Correct! +${scoreDelta} pts` : '❌ Not quite!'}
            </div>
          )}

          {/* Leaderboard after answer */}
          {showLB && (
            <div className="mt-4 animate-slide-up">
              <Leaderboard rankings={rankings} currentParticipantId={participantId} compact />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-bounce">⏳</div>
          <p className="font-bold text-slate-700 dark:text-slate-300">Waiting for the next question…</p>
        </div>
      )}
    </div>
  )
}
