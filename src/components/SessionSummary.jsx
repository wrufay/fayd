import React, { useMemo } from 'react'
import DonutChart from './DonutChart'
import { CloseIcon, TagIcon } from './Icons'
import './SessionSummary.css'

const SessionSummary = ({ session, onClose, onViewStats }) => {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeShort = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const formatTimeOfDay = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const chartData = useMemo(() => [
    { id: 'focus', label: 'deep focus', value: session?.focusTime || 0, color: '#4B6EF5' },
    { id: 'break', label: 'on break', value: session?.breakTime || 0, color: '#F6AD55' },
  ], [session])

  const totalTime = (session?.focusTime || 0) + (session?.breakTime || 0)

  if (!session) return null

  return (
    <div className="session-summary">
      <header className="summary-header">
        <button className="close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <span className="summary-date">{formatDate(session.startTime).toUpperCase()}</span>
        <div style={{ width: 40 }} />
      </header>

      <div className="summary-hero">
        <div className="summary-time">
          <span className="emoji">👏</span>
          <span className="time">{formatTime(totalTime)}</span>
          <span className="emoji">👏</span>
        </div>
        <div className="summary-tag">
          <TagIcon color={session.tag.color} className="tag-icon" />
          <span>{session.tag.name}</span>
        </div>
      </div>

      <div className="summary-chart-section">
        <div className="chart-container">
          <DonutChart data={chartData} size={140} strokeWidth={24} />
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4B6EF5' }} />
            <span>{formatTimeShort(session.focusTime)} deep focus</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4B6EF5', opacity: 0.4 }} />
            <span>0s multitasking</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#F6AD55' }} />
            <span>{formatTimeShort(session.breakTime)} on break</span>
          </div>
        </div>
      </div>

      <div className="summary-details">
        <div className="detail-row">
          <span className="detail-label">Start time:</span>
          <span className="detail-value">{formatTimeOfDay(session.startTime)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">End time:</span>
          <span className="detail-value">{formatTimeOfDay(session.endTime)}</span>
        </div>
      </div>

      <div className="summary-goal">
        <div className="goal-header">
          <span className="goal-icon">⏱</span>
          <span>Daily Goal</span>
        </div>
        <div className="goal-progress">
          <div className="goal-bar">
            <div className="goal-fill" style={{ width: `${Math.min((session.focusTime / (3 * 60 * 60 * 1000)) * 100, 100)}%` }} />
          </div>
          <span className="goal-text">
            {Math.floor(session.focusTime / 60000)}m/3h
          </span>
        </div>
      </div>

      <button className="btn btn-primary stats-btn" onClick={onViewStats}>
        SEE MORE STATS
      </button>
    </div>
  )
}

export default SessionSummary
