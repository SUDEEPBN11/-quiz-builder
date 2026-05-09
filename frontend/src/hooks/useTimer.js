import { useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'

/**
 * Drives a countdown display from server-side timer_tick events.
 * @param {number} initialSeconds
 * @returns {{ remaining: number, expired: boolean }}
 */
export function useTimer(initialSeconds = 0) {
  const { socket } = useSocket()
  const [remaining, setRemaining] = useState(initialSeconds)
  const [expired, setExpired]     = useState(false)

  useEffect(() => {
    setRemaining(initialSeconds)
    setExpired(false)
  }, [initialSeconds])

  useEffect(() => {
    if (!socket) return
    const onTick    = ({ remainingSeconds }) => setRemaining(remainingSeconds)
    const onExpired = () => { setRemaining(0); setExpired(true) }
    socket.on('timer_tick',    onTick)
    socket.on('timer_expired', onExpired)
    return () => {
      socket.off('timer_tick',    onTick)
      socket.off('timer_expired', onExpired)
    }
  }, [socket])

  return { remaining, expired }
}
