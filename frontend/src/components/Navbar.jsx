import { Link, useLocation } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
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
      className="w-4 h-4">
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none"/>
      <circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/>
      <path d="M6 20a2 2 0 0 1-2-2l-1-9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2l-1 9a2 2 0 0 1-2 2z"/>
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
      className="w-5 h-5 text-indigo-400">
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
    </svg>
  )
}

const navLinks = [
  { to: '/',     label: 'Home', Icon: HomeIcon,    color: 'hover:bg-indigo-600/20 hover:text-indigo-400',    active: 'bg-indigo-600/30 text-indigo-400'   },
  { to: '/host', label: 'Host', Icon: MicIcon,     color: 'hover:bg-rose-600/20 hover:text-rose-400',        active: 'bg-rose-600/30 text-rose-400'       },
  { to: '/join', label: 'Join', Icon: GamepadIcon, color: 'hover:bg-emerald-600/20 hover:text-emerald-400',  active: 'bg-emerald-600/30 text-emerald-400' },
  { to: '/help', label: 'Help', Icon: HelpIcon,    color: 'hover:bg-amber-600/20 hover:text-amber-400',      active: 'bg-amber-600/30 text-amber-400'     },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white hover:opacity-80 transition-opacity">
          <BoltIcon />
          <span>QuizBlitz</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, Icon, color, active }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === to ? active : `text-white/50 ${color}`
              }`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </div>

      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 flex z-50">
        {navLinks.map(({ to, label, Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              pathname === to ? active : 'text-white/40'
            }`}
          >
            <Icon />
            <span className="mt-0.5">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
