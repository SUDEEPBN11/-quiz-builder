import { useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'

export function useLeaderboard() {
  const { socket } = useSocket()
  const [rankings, setRankings] = useState([])

  useEffect(() => {
    if (!socket) return
    const onUpdate = ({ rankings }) => setRankings(rankings || [])
    socket.on('leaderboard_update', onUpdate)
    return () => socket.off('leaderboard_update', onUpdate)
  }, [socket])

  return rankings
}
