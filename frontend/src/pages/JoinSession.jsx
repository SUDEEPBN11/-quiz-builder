import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinSession } from '../services/api'
import { useSession } from '../contexts/SessionContext'
import ErrorBanner from '../components/ErrorBanner'

export default function JoinSession() {
  const navigate = useNavigate()
  const { update } = useSession()
  const [code,    setCode]    = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!code.trim()) return setError('Please enter a session code.')
    if (!name.trim()) return setError('Please enter your name.')
    setError(null)
    setLoading(true)
    try {
      const data = await joinSession(code.trim().toUpperCase(), name.trim())
      update({
        sessionId:        data.sessionId,
        sessionCode:      data.sessionCode,
        participantId:    data.participantId,
        participantToken: data.participantToken,
        displayName:      name.trim(),
      })
      sessionStorage.setItem('participantToken', data.participantToken)
      sessionStorage.setItem('participantId',    data.participantId)
      sessionStorage.setItem('sessionId',        data.sessionId)
      sessionStorage.setItem('sessionCode',      data.sessionCode)
      sessionStorage.setItem('displayName',      name.trim())
      navigate(`/play/${data.sessionCode}/lobby`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24 md:pb-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Join a Quiz</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter the session code from your host</p>
        </div>

        <div className="card">
          {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="label">Session Code</label>
              <input
                className="input text-center text-2xl font-extrabold tracking-widest uppercase"
                placeholder="QUIZ42"
                value={code}
                maxLength={8}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
                autoComplete="off"
              />
            </div>

            <div>
              <label className="label">Your Name</label>
              <input
                className="input"
                placeholder="Enter your display name"
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining…
                </span>
              ) : '🚀 Join Session'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6">
          No account needed — just a code and your name.
        </p>
      </div>
    </div>
  )
}
