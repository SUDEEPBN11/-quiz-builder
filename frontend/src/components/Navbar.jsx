import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useSocket } from '../contexts/SocketContext'

const navLinks = [
  { to: '/',     label: 'Home',     icon: '🏠' },
  { to: '/host', label: 'Host',     icon: '🎤' },
  { to: '/join', label: 'Join',     icon: '🎮' },
  { to: '/help', label: 'Help',     icon: '❓' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const { connected }    = useSocket()
  const { pathname }     = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-brand-600 dark:text-brand-400 hover:opacity-80 transition-opacity">
          <span className="text-2xl">⚡</span>
          <span>QuizBlitz</span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === to
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Connection indicator */}
          <span
            title={connected ? 'Connected' : 'Disconnected'}
            className={`w-2 h-2 rounded-full transition-colors ${connected ? 'bg-emerald-500' : 'bg-red-400'}`}
          />

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="btn-ghost p-2 rounded-xl text-lg"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex z-50">
        {navLinks.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              pathname === to
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
