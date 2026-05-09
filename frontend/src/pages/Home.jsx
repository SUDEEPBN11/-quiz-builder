import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '⚡', title: 'Real-Time',     desc: 'Instant question delivery and live leaderboard updates via Socket.IO.' },
  { icon: '🧠', title: 'AI-Powered',    desc: 'Generate quiz questions from any topic using OpenAI or Gemini.' },
  { icon: '📊', title: 'Analytics',     desc: 'Deep post-session insights for presenters and participants.' },
  { icon: '📎', title: 'PPTX Import',   desc: 'Upload a presentation and convert slides into quiz questions.' },
  { icon: '🏆', title: 'Leaderboard',   desc: 'Speed-based scoring keeps every second exciting.' },
  { icon: '📱', title: 'Mobile-First',  desc: 'Fully responsive — works great on phones, tablets, and desktops.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse-ring"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live quiz sessions, zero setup
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight animate-slide-up">
            Make Learning<br />
            <span className="text-yellow-300">Electrifying ⚡</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Host live quiz sessions, engage your audience in real time, and get instant analytics — powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/host')}
              className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-xl hover:shadow-2xl font-extrabold"
            >
              🎤 Host a Quiz
            </button>
            <button
              onClick={() => navigate('/join')}
              className="btn btn-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 font-bold"
            >
              🎮 Join a Session
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">
            Everything you need
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A complete platform for interactive learning — from question creation to post-session insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card-hover group">
              <div className="text-3xl mb-3 group-hover:animate-wiggle">{icon}</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-center text-slate-800 dark:text-slate-100 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🎤', title: 'Create a Session', desc: 'Host creates a quiz, adds questions manually or via AI, and gets a unique session code.' },
              { step: '2', icon: '🎮', title: 'Participants Join',  desc: 'Students enter the code and their name — no account needed. They\'re in instantly.' },
              { step: '3', icon: '🏆', title: 'Play & Compete',    desc: 'Answer questions in real time, watch the live leaderboard, and review results.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white text-xl font-extrabold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {step}
                </div>
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">
          Ready to quiz? 🚀
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Start a session in seconds — no account required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/host')} className="btn-primary btn-lg">
            🎤 Start Hosting
          </button>
          <button onClick={() => navigate('/join')} className="btn-secondary btn-lg">
            🎮 Join a Quiz
          </button>
        </div>
      </section>
    </div>
  )
}
