import React, { useState, useMemo } from 'react'
import { CloseIcon, PlusIcon } from './Icons'
import './CalendarModal.css'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="calendar-header-icon">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
)

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,6 15,12 9,18" />
  </svg>
)

const TagIcon = ({ color }) => (
  <svg viewBox="0 0 24 24" fill={color || 'currentColor'} className="session-tag-icon">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" stroke="white" strokeWidth="2" />
  </svg>
)

const CalendarModal = ({ isOpen, onClose, sessions, onStartSession }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Calculate time summaries
  const timeSummaries = useMemo(() => {
    const now = new Date()
    const dayMs = 24 * 60 * 60 * 1000

    // Start of this week (Sunday)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Start of last week
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * dayMs)
    const endOfLastWeek = new Date(startOfWeek.getTime() - 1)

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const calcTime = (start, end) => {
      return sessions
        .filter(s => s.startTime >= start.getTime() && s.startTime <= (end?.getTime() || Date.now()))
        .reduce((sum, s) => sum + (s.focusTime || 0), 0)
    }

    return {
      thisWeek: calcTime(startOfWeek),
      lastWeek: calcTime(startOfLastWeek, endOfLastWeek),
      thisMonth: calcTime(startOfMonth),
      lastMonth: calcTime(startOfLastMonth, endOfLastMonth),
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
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else {
        break
      }
    }
    return count
  }, [sessions])

  // Get days with sessions for current month
  const daysWithSessions = useMemo(() => {
    const days = new Set()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    sessions.forEach(s => {
      const d = new Date(s.startTime)
      if (d.getFullYear() === year && d.getMonth() === month) {
        days.add(d.getDate())
      }
    })
    return days
  }, [sessions, currentDate])

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

    return sessions.filter(s => s.startTime >= start.getTime() && s.startTime < end.getTime())
  }, [sessions, selectedDate])

  const selectedDateTotal = useMemo(() => {
    return selectedDateSessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
  }, [selectedDateSessions])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days = []

    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(day)
    }

    return days
  }, [currentDate])

  const formatDuration = (ms) => {
    const totalMinutes = Math.floor(ms / 60000)
    if (totalMinutes < 60) return `${totalMinutes}m`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const formatDateLabel = (date) => {
    const isToday = date.toDateString() === today.toDateString()
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    return isToday ? `Today, ${monthName} ${day}` : `${monthName} ${day}`
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setSelectedDate(newDate)
    }
  }

  const isToday = (day) => {
    if (!day) return false
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    )
  }

  const isSelected = (day) => {
    if (!day) return false
    return (
      currentDate.getFullYear() === selectedDate.getFullYear() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    )
  }

  if (!isOpen) return null

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={e => e.stopPropagation()}>
        <div className="calendar-modal-header">
          <button className="calendar-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <CalendarIcon />
        </div>

        <div className="calendar-modal-content">
          {/* Time Summary Cards */}
          <div className="time-summary-cards">
            <div className="summary-card">
              <span className="summary-label">This week</span>
              <span className="summary-value">{formatDuration(timeSummaries.thisWeek)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Last week</span>
              <span className="summary-value">{formatDuration(timeSummaries.lastWeek)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">This month</span>
              <span className="summary-value">{formatDuration(timeSummaries.thisMonth)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Prev month</span>
              <span className="summary-value">{formatDuration(timeSummaries.lastMonth)}</span>
            </div>
          </div>

          {/* Streak */}
          <div className="streak-display">
            <span className="streak-line"></span>
            <span className="streak-text">You're on a {streak} day streak!</span>
            <span className="streak-line"></span>
          </div>

          {/* Month Navigation */}
          <div className="month-navigation">
            <button className="month-nav-btn" onClick={prevMonth}>
              <ChevronLeft />
            </button>
            <span className="month-name">{monthName}</span>
            <button className="month-nav-btn" onClick={nextMonth}>
              <ChevronRight />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            <div className="weekday-headers">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} className="weekday-header">{d}</span>
              ))}
            </div>
            <div className="calendar-days">
              {calendarDays.map((day, i) => (
                <button
                  key={i}
                  className={`calendar-day ${day ? '' : 'empty'} ${daysWithSessions.has(day) ? 'has-session' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Sessions */}
          <div className="selected-day-section">
            <div className="selected-day-header">
              <div>
                <h3 className="selected-day-title">{formatDateLabel(selectedDate)}</h3>
                <p className="selected-day-total">TOTAL TIME: {formatDuration(selectedDateTotal)}</p>
              </div>
              <button className="add-time-btn-circle" onClick={onStartSession}>
                <PlusIcon />
              </button>
            </div>

            <div className="selected-day-sessions">
              {selectedDateSessions.length === 0 ? (
                <p className="no-sessions-day">No sessions on this day</p>
              ) : (
                selectedDateSessions.map(session => (
                  <div key={session.id} className="calendar-session-card">
                    <div className="calendar-session-info">
                      <span className="calendar-session-time">
                        {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} {formatTime(session.startTime)}-{formatTime(session.endTime)}
                      </span>
                      <div className="calendar-session-tag">
                        <TagIcon color={session.tag.color} />
                        <span className="calendar-session-name">{session.tag.name}</span>
                        <span className="calendar-session-duration">• {formatDuration(session.focusTime)}</span>
                      </div>
                    </div>
                    <ChevronRight />
                  </div>
                ))
              )}
            </div>

            <button className="add-time-link" onClick={onStartSession}>
              ADD TIME TO THIS DAY
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal
