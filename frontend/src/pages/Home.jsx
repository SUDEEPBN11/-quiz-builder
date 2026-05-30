import { useNavigate } from 'react-router-dom'

// SVG icons — no emojis
function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-10 h-10">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-10 h-10">
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1" fill="currentColor"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
      <path d="M6 20a2 2 0 0 1-2-2l-1-9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2l-1 9a2 2 0 0 1-2 2z"/>
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.6A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .5-1.67A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.6A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.5-1.67A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

const FEATURES = [
  { Icon: BoltIcon,   label: 'Real-Time',  color: 'text-yellow-400' },
  { Icon: BrainIcon,  label: 'AI-Powered', color: 'text-purple-400' },
  { Icon: TrophyIcon, label: 'Leaderboard',color: 'text-amber-400'  },
  { Icon: ChartIcon,  label: 'Analytics',  color: 'text-blue-400'   },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">

      {/* Hero */}
      <section className="py-16 px-4 text-center border-b border-white/10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
          Quiz Builder
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Host live quiz sessions or join one — real-time, AI-powered, no account needed.
        </p>
      </section>

      {/* Cards */}
      <section className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* HOST card */}
          <div className="group flex flex-col items-center text-center gap-6 p-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
              <MicIcon />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Host a Quiz</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Create a session, add questions manually or with AI, and share the code with your audience.
              </p>
            </div>
            <button
              onClick={() => navigate('/host')}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all duration-150 text-sm cursor-pointer"
            >
              Start Hosting <ArrowRightIcon />
            </button>
          </div>

          {/* JOIN card */}
          <div className="group flex flex-col items-center text-center gap-6 p-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
              <GamepadIcon />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Join a Session</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Got a session code from your host? Enter it here and jump straight into the quiz.
              </p>
            </div>
            <button
              onClick={() => navigate('/join')}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all duration-150 text-sm cursor-pointer"
            >
              Join Now <ArrowRightIcon />
            </button>
          </div>

        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-white/10 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {FEATURES.map(({ Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className={color}>
                <Icon />
              </span>
              <span className="text-sm font-semibold text-white/60">{label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
