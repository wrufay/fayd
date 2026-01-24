import React, { useState, useEffect, useCallback } from 'react'
import { TagIcon, StopwatchIcon, SettingsIcon, StopIcon, PauseIcon, PlayIcon, CoffeeIcon } from './Icons'
import './ActiveSession.css'

const ActiveSession = ({ session, onUpdateSession, onEndSession }) => {
  const [elapsed, setElapsed] = useState(0)
  const [breakElapsed, setBreakElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)

  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      if (!isPaused) {
        if (isOnBreak) {
          setBreakElapsed(prev => prev + 1000)
        } else {
          setElapsed(prev => prev + 1000)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, isOnBreak, session])

  const formatTime = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    }
  }, [])

  const time = formatTime(isOnBreak ? breakElapsed : elapsed)

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleBreak = () => {
    if (isOnBreak) {
      // Resume focus
      setIsOnBreak(false)
    } else {
      // Start break
      setIsOnBreak(true)
    }
  }

  const handleFinish = () => {
    const finalSession = {
      ...session,
      focusTime: elapsed,
      breakTime: breakElapsed,
    }
    onEndSession(finalSession)
  }

  if (!session) return null

  return (
    <div className="active-session">
      <header className="session-header">
        <div className="session-tag">
          <TagIcon color={session.tag.color} className="tag-icon" />
          <span>{session.tag.name}</span>
        </div>
        <div className="session-mode">
          <StopwatchIcon className="mode-icon" />
        </div>
        <button className="settings-btn">
          <SettingsIcon />
        </button>
      </header>

      <div className="timer-section">
        <p className="timer-label">{isOnBreak ? 'ON BREAK' : 'FOCUSED'}</p>
        <div className="timer-display">
          <span>{time.hours}</span>
          <span className="separator">:</span>
          <span>{time.minutes}</span>
          <span className="separator">:</span>
          <span className="active-digit">{time.seconds}</span>
        </div>
      </div>

      <div className="controls">
        <button className="control-btn finish" onClick={handleFinish}>
          <StopIcon />
          <span>Finish</span>
        </button>

        <button className={`control-btn pause ${isPaused ? 'paused' : ''}`} onClick={handlePause}>
          {isPaused ? <PlayIcon /> : <PauseIcon />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button className={`control-btn break ${isOnBreak ? 'on-break' : ''}`} onClick={handleBreak}>
          <CoffeeIcon />
          <span>{isOnBreak ? 'Focus' : 'Break'}</span>
        </button>
      </div>

      <div className="session-footer">
        <div className="footer-stats">
          <div className="stat">
            <span className="stat-value">{formatTime(elapsed).minutes}:{formatTime(elapsed).seconds}</span>
            <span className="stat-label">focus</span>
          </div>
          {breakElapsed > 0 && (
            <div className="stat">
              <span className="stat-value">{formatTime(breakElapsed).minutes}:{formatTime(breakElapsed).seconds}</span>
              <span className="stat-label">break</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActiveSession
