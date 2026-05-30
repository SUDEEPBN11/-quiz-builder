import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useSession } from '../contexts/SessionContext'

export default function ParticipantLobby() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { session, update } = useSession()
  const [dots, setDots] = useState('.')

  const participantToken = session.participantToken || sessionStorage.getItem('participantToken')
  const displayName      = session.displayName      || sessionStorage.getItem('displayName')

  
  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!socket || !participantToken || !sessionCode) return

    socket.emit('join_session', { sessionCode, participantToken, displayName })

    socket.on('session_joined', (data) => {
      update({ totalScore: data.totalScore || 0 })
    })

    socket.on('start_quiz', () => {
      navigate(`/play/${sessionCode}/quiz`)
    })

    return () => {
      socket.off('session_joined')
      socket.off('start_quiz')
    }
  }, [socket, participantToken, sessionCode])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-24 md:pb-0">
      <div className="text-center max-w-sm animate-slide-up">
        
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white mx-auto mb-6 shadow-xl">
          {(displayName || '?')[0].toUpperCase()}
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">
          Hey, {displayName}! 
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          You're in! Waiting for the host to start{dots}
        </p>

        
        <div className="card bg-gradient-to-br from-brand-600 to-purple-700 text-white border-0 mb-6">
          <p className="text-xs opacity-70 mb-1">Session</p>
          <p className="text-3xl font-extrabold tracking-widest">{sessionCode}</p>
        </div>

        
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-brand-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
