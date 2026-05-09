import { createContext, useContext, useState } from 'react'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    sessionId: null,
    sessionCode: null,
    presenterToken: null,
    participantId: null,
    participantToken: null,
    displayName: null,
    participants: [],
    totalScore: 0,
    rank: null,
  })

  const update = (patch) => setSession((s) => ({ ...s, ...patch }))
  const reset  = () => setSession({
    sessionId: null, sessionCode: null, presenterToken: null,
    participantId: null, participantToken: null, displayName: null,
    participants: [], totalScore: 0, rank: null,
  })

  return (
    <SessionContext.Provider value={{ session, update, reset }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
