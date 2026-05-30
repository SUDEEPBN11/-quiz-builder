import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useSession } from '../contexts/SessionContext'
import ParticipantList from '../components/ParticipantList'
import ErrorBanner from '../components/ErrorBanner'

export default function HostLobby() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { session, update } = useSession()

  const [participants, setParticipants] = useState([])
  const [error, setError] = useState(null)

  const presenterToken = session.presenterToken || sessionStorage.getItem('presenterToken')
  const sessionCode    = session.sessionCode    || sessionStorage.getItem('sessionCode')

  useEffect(() => {
    if (!socket || !presenterToken || !sessionCode) return

    socket.emit('presenter_join', { sessionCode, presenterToken })

    socket.on('presenter_joined', (data) => {
      update({ sessionCode: data.sessionCode })
    })

    socket.on('participant_list_update', ({ participants }) => {
      setParticipants(participants)
      update({ participants })
    })

    socket.on('start_quiz', () => {
      navigate(`/host/${sessionId}/quiz`)
    })

    socket.on('error', ({ message }) => setError(message))

    return () => {
      socket.off('presenter_joined')
      socket.off('participant_list_update')
      socket.off('start_quiz')
      socket.off('error')
    }
  }, [socket, presenterToken, sessionCode])

  const handleStart = () => {
    if (participants.length === 0) return setError('Wait for at least one participant to join.')
    socket.emit('start_quiz', { sessionCode, presenterToken })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      
      <div className="text-center mb-8 animate-slide-up">
        <div className="text-5xl mb-3"></div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Waiting Room</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Share the code with your participants</p>
      </div>

      
      <div className="card text-center mb-6 bg-gradient-to-br from-brand-600 to-purple-700 text-white border-0 animate-bounce-in">
        <p className="text-sm font-medium opacity-80 mb-1">Session Code</p>
        <p className="text-5xl font-extrabold tracking-widest">{sessionCode}</p>
        <p className="text-xs opacity-70 mt-2">Ask participants to go to the app and enter this code</p>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      
      <div className="mb-6">
        <ParticipantList participants={participants} />
      </div>

      
      <button
        className="btn-primary btn-lg w-full"
        onClick={handleStart}
        disabled={participants.length === 0}
      >
        {participants.length === 0
          ? '⏳ Waiting for participants…'
          : ` Start Quiz (${participants.length} joined)`}
      </button>

      
      {participants.length === 0 && (
        <div className="flex justify-center mt-6">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-75" />
            <div className="w-4 h-4 bg-brand-600 rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
}
