import React, { useMemo } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon, FireIcon } from './Icons'
import './Home.css'

const Home = ({ sessions, tags, onStartSession }) => {
  const today = new Date()
  const greeting = useMemo(() => {
    const hour = today.getHours()
    if (hour < 12) return 'good morning'
    if (hour < 17) return 'good afternoon'
    return 'good evening'
  }, [])

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime()
    const todaySessions = sessions.filter(s => s.startTime >= todayStart)

    const totalFocus = todaySessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
    return {
      focusMinutes: Math.floor(totalFocus / 60000),
      sessionCount: todaySessions.length,
    }
  }, [sessions])

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0
    const dayMs = 24 * 60 * 60 * 1000
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const dayStart = checkDate.getTime()
      const dayEnd = dayStart + dayMs
      const hasSession = sessions.some(s => s.startTime >= dayStart && s.startTime < dayEnd)

      if (hasSession) {
        count++
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else if (i === 0) {
        // Today hasn't had a session yet, that's okay
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else {
        break
      }
    }
    return count
  }, [sessions])

  // Week days
  const weekDays = useMemo(() => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const result = []
    const todayIdx = today.getDay()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - (todayIdx - i) * dayMs)
      date.setHours(0, 0, 0, 0)
      const dayStart = date.getTime()
      const dayEnd = dayStart + dayMs
      const completed = sessions.some(s => s.startTime >= dayStart && s.startTime < dayEnd)

      result.push({
        label: days[i],
        completed,
        isToday: i === todayIdx,
      })
    }
    return result
  }, [sessions])

  const dailyGoal = 180 // 3 hours in minutes

  return (
    <div className="container home">
      <header className="home-header">
        <div>
          <p className="greeting">{greeting},</p>
          <h1>Focus</h1>
        </div>
      </header>

      <div className="card progress-card">
        <div className="progress-content">
          <DonutChart
            data={[{ value: todayStats.focusMinutes, color: '#4B6EF5' }]}
            size={80}
            strokeWidth={12}
          />
          <div className="progress-info">
            <p className="progress-label">today</p>
            <p className="progress-time">
              <strong>{todayStats.focusMinutes}m</strong>/{dailyGoal / 60}h
            </p>
          </div>
          <div className="streak-badge">
            <span>{streak}d</span>
            <FireIcon className="fire-icon" />
          </div>
        </div>
        <div className="week-view">
          {weekDays.map((day, i) => (
            <div key={i} className={`week-day ${day.completed ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}>
              {day.completed ? (
                <div className="check-circle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              ) : (
                <span>{day.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="start-card card" onClick={onStartSession}>
        <div className="start-card-content">
          <div className="start-card-text">
            <h3>Start focusing</h3>
            <p>Begin a new focus session</p>
          </div>
          <div className="play-button">
            <PlayIcon />
          </div>
        </div>
      </button>
    </div>
  )
}

export default Home
