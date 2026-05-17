import { useState, useEffect, useCallback } from 'react'

const WORK_SEC = 25 * 60
const BREAK_SEC = 5 * 60

export function usePomodoro() {
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC)
  const [cycle, setCycle] = useState(1)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (secondsLeft > 0) return
    if (phase === 'work') {
      setPhase('break')
      setSecondsLeft(BREAK_SEC)
    } else {
      setPhase('work')
      setSecondsLeft(WORK_SEC)
      setCycle((c) => c + 1)
    }
  }, [secondsLeft, phase])

  const toggleRunning = useCallback(() => {
    setRunning((r) => !r)
  }, [])

  const resetPhase = useCallback(() => {
    setRunning(false)
    setSecondsLeft(phase === 'work' ? WORK_SEC : BREAK_SEC)
  }, [phase])

  const skipPhase = useCallback(() => {
    if (phase === 'work') {
      setPhase('break')
      setSecondsLeft(BREAK_SEC)
    } else {
      setPhase('work')
      setSecondsLeft(WORK_SEC)
      setCycle((c) => c + 1)
    }
  }, [phase])

  const phaseTotal = phase === 'work' ? WORK_SEC : BREAK_SEC
  const progress = 1 - secondsLeft / phaseTotal

  return {
    phase,
    running,
    secondsLeft,
    cycle,
    phaseTotal,
    progress,
    toggleRunning,
    resetPhase,
    skipPhase,
  }
}
