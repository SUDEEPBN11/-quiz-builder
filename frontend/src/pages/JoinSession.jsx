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
    <div className="min-h-screen flex flex-col">

      {/* Top banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-10 px-4 text-center">
        <div className="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="w-12 h-12 text-white/90">
            <line x1="6" y1="12" x2="10" y2="12"/>
            <line x1="8" y1="10" x2="8" y2="14"/>
            <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none"/>
            <circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/>
            <path d="M6 20a2 2 0 0 1-2-2l-1-9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2l-1 9a2 2 0 0 1-2 2z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold mb-1">Join a Quiz</h1>
        <p className="text-white/80 text-sm">Enter the code your host shared with you</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <div className="card shadow-xl">
            <form onSubmit={handleJoin} className="flex flex-col gap-5">

              {/* Session code */}
              <div>
                <label className="label text-base font-bold">Session Code</label>
                <input
                  className="input text-center text-3xl font-extrabold tracking-widest uppercase h-16"
                  placeholder="ABCD12"
                  value={code}
                  maxLength={8}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-xs text-slate-400 mt-1 text-center">
                  Ask your host for the 6-character code
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="label text-base font-bold">Your Name</label>
                <input
                  className="input text-lg"
                  placeholder="e.g. Alex"
                  value={name}
                  maxLength={30}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">
                  This is how you'll appear on the leaderboard
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary btn-lg w-full mt-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining…
                  </span>
                ) : ' Join Session'}
              </button>

            </form>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ← Back to home
            </button>
          </div>

          {/* Info strip */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '', text: 'Instant join' },
              { icon: '', text: 'No account needed' },
              { icon: '', text: 'Works on mobile' },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{text}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
