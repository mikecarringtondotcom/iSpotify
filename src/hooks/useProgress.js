import { useState, useEffect, useRef } from 'react'

/**
 * Derives current progress from playerState and advances it locally
 * every second so the progress bar feels smooth without polling the API.
 */
export function useProgress(playerState) {
  const [progressMs, setProgressMs] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!playerState) return

    setProgressMs(playerState.position)

    clearInterval(intervalRef.current)

    if (!playerState.paused) {
      intervalRef.current = setInterval(() => {
        setProgressMs((prev) => Math.min(prev + 1000, playerState.duration))
      }, 1000)
    }

    return () => clearInterval(intervalRef.current)
  }, [playerState])

  const durationMs = playerState?.duration ?? 0
  const progressPct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0

  return { progressMs, durationMs, progressPct }
}
