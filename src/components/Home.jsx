import React, { useMemo } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon, FireIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const Home = ({ sessions, tags, onStartSession }) => {
  const { user, login, logout } = useAuth()
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
        {user ? (
          <button className="profile-btn" onClick={logout} title="Sign out">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
          </button>
        ) : (
          <button className="google-signin-btn" onClick={login}>
            <GoogleIcon />
            <span>Sign in</span>
          </button>
        )}
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
