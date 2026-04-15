import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import Display from './components/Display/Display'
import Controls from './components/Controls/Controls'
import Laps from './components/Laps/Laps'

const App = () => {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState([])
  const intervalRef = useRef(null)
  const baseRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    if (isRunning) {
      const start = performance.now()
      baseRef.current = timeRef.current
      intervalRef.current = setInterval(() => {
        const delta = (performance.now() - start) / 1000
        const next = baseRef.current + delta
        timeRef.current = next
        setTime(next)
      }, 50)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  useEffect(() => {
    timeRef.current = time
  }, [time])

  const handleStart = () => setIsRunning(true)
  const handleStop = () => {
    setIsRunning(false)
    baseRef.current = timeRef.current
  }
  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const handleLap = () => {
    const label = `Lap ${laps.length + 1}: ${time.toFixed(3)}s`
    setLaps((prev) => [...prev, label])
  }

  return (
    <div className="stopwatch-app">
      <Display time={time} />
      <Controls onStart={handleStart} onStop={handleStop} onReset={handleReset} />
      <button onClick={handleLap} disabled={!isRunning}>
        Lap
      </button>
      <Laps laps={laps} />
    </div>
  )
}

export default App
