import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider }   from './contexts/ThemeContext'
import { SocketProvider }  from './contexts/SocketContext'
import { SessionProvider } from './contexts/SessionContext'
import Navbar              from './components/Navbar'

import Home                from './pages/Home'
import JoinSession         from './pages/JoinSession'
import HostSetup           from './pages/HostSetup'
import HostLobby           from './pages/HostLobby'
import HostQuiz            from './pages/HostQuiz'
import HostAnalytics       from './pages/HostAnalytics'
import ParticipantLobby    from './pages/ParticipantLobby'
import ParticipantQuiz     from './pages/ParticipantQuiz'
import ParticipantSummary  from './pages/ParticipantSummary'
import Help                from './pages/Help'

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <SessionProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-black transition-colors duration-300">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/"                                    element={<Home />} />
                  <Route path="/host"                                element={<HostSetup />} />
                  <Route path="/host/:sessionId/lobby"               element={<HostLobby />} />
                  <Route path="/host/:sessionId/quiz"                element={<HostQuiz />} />
                  <Route path="/host/:sessionId/analytics"           element={<HostAnalytics />} />
                  <Route path="/join"                                element={<JoinSession />} />
                  <Route path="/play/:sessionCode/lobby"             element={<ParticipantLobby />} />
                  <Route path="/play/:sessionCode/quiz"              element={<ParticipantQuiz />} />
                  <Route path="/play/:sessionCode/summary"           element={<ParticipantSummary />} />
                  <Route path="/help"                                element={<Help />} />
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center text-center px-4">
                      <div>
                        <p className="text-6xl mb-4">🔍</p>
                        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Page not found</h1>
                        <a href="/" className="btn-primary mt-4 inline-flex">Go Home</a>
                      </div>
                    </div>
                  } />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </SessionProvider>
      </SocketProvider>
    </ThemeProvider>
  )
}
