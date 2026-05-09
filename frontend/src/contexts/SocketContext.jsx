import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '../services/socket'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socket = useMemo(() => connectSocket(), [])
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect',    onConnect)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('connect',    onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  useEffect(() => () => disconnectSocket(), [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
