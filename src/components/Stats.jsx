import React, { useState, useMemo } from 'react'
import DonutChart from './DonutChart'
import { TagIcon, CloseIcon, PlusIcon } from './Icons'
import './Stats.css'

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const Stats = ({ sessions, tags, onDeleteSession, onDeleteTag, onAddTag }) => {
  const [timeRange, setTimeRange] = useState('today')
  const [selectedTag, setSelectedTag] = useState(null)
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [showManageTasks, setShowManageTasks] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#F6AD55')

  const colors = ['#F6AD55', '#4FD1C5', '#4B6EF5', '#48BB78', '#FC8181', '#F687B3', '#9F7AEA']

  const filteredSessions = useMemo(() => {
    const now = Date.now()
    const ranges = {
      today: now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '4w': now - 28 * 24 * 60 * 60 * 1000,
      '12mo': now - 365 * 24 * 60 * 60 * 1000,
    }

    let filtered = sessions.filter(s => s.startTime >= ranges[timeRange])

    if (selectedTag) {
      filtered = filtered.filter(s => s.tag.id === selectedTag)
    }

    return filtered
  }, [sessions, timeRange, selectedTag])

  const taskDistribution = useMemo(() => {
    const distribution = {}

    filteredSessions.forEach(session => {
      const tagId = session.tag.id
      if (!distribution[tagId]) {
        distribution[tagId] = {
          id: tagId,
          name: session.tag.name,
          color: session.tag.color,
          value: 0,
        }
      }
      distribution[tagId].value += session.focusTime || 0
    })

    return Object.values(distribution)
  }, [filteredSessions])

  const totalTime = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
  }, [filteredSessions])

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return `${hours}h ${remainingMins}m`
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleAddTag = () => {
    if (newTagName.trim() && onAddTag) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName('')
    }
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <div className="stats-page">
      <header className="stats-header">
        <h1><span>your</span> stats</h1>
      </header>

      <div className="container">
        <div className="stats-filters">
          <button
            className={`filter-btn calendar ${timeRange === 'today' ? 'active' : ''}`}
            onClick={() => {
              const ranges = ['today', '7d', '4w', '12mo']
              const currentIndex = ranges.indexOf(timeRange)
              const nextIndex = (currentIndex + 1) % ranges.length
              setTimeRange(ranges[nextIndex])
            }}
            title="Cycle through time ranges"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <div className="tag-filter-wrapper">
            <button
              className="filter-btn tag-filter"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
            >
              <TagIcon className="filter-icon" />
              <span>{selectedTag ? tags.find(t => t.id === selectedTag)?.name : 'All tasks'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
            {showTagDropdown && (
              <div className="tag-dropdown">
                <button
                  className={`dropdown-item ${!selectedTag ? 'active' : ''}`}
                  onClick={() => { setSelectedTag(null); setShowTagDropdown(false); }}
                >
                  All tasks
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`dropdown-item ${selectedTag === tag.id ? 'active' : ''}`}
                    onClick={() => { setSelectedTag(tag.id); setShowTagDropdown(false); }}
                  >
                    <span className="dropdown-dot" style={{ background: tag.color }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="time-range-tabs">
          {[
            { key: 'today', label: 'Today' },
            { key: '7d', label: 'Last 7d' },
            { key: '4w', label: 'Last 4w' },
            { key: '12mo', label: 'Last 12mo' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`range-tab ${timeRange === tab.key ? 'active' : ''}`}
              onClick={() => setTimeRange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card distribution-card">
          <h3>Task distribution</h3>
          <p className="distribution-date">{dateLabel}</p>

          <div className="distribution-content">
            <DonutChart data={taskDistribution} size={120} strokeWidth={20} />
            <div className="distribution-stats">
              <p className="total-time">{formatDuration(totalTime)} total</p>
              <div className="distribution-legend">
                {taskDistribution.map(item => (
                  <div key={item.id} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="manage-tasks-btn" onClick={() => setShowManageTasks(true)}>
            <TagIcon className="manage-icon" />
            MANAGE TASKS
          </button>
        </div>

        <div className="sessions-section">
          <div className="sessions-header">
            <h3>Sessions {timeRange === 'today' ? 'today' : ''}</h3>
            <span className="sessions-date">{dateLabel}</span>
          </div>

          <div className="sessions-list">
            {filteredSessions.length === 0 ? (
              <p className="no-sessions">No sessions yet</p>
            ) : (
              filteredSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="session-item card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="session-info">
                    <span className="session-date-time">
                      {formatDate(session.startTime)} {formatTime(session.startTime)}-{formatTime(session.endTime)}
                    </span>
                    <div className="session-tag">
                      <TagIcon color={session.tag.color} className="tag-icon" />
                      <span>{session.tag.name}</span>
                      <span className="session-duration">• {formatDuration(session.focusTime)}</span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manage Tasks Modal */}
      {showManageTasks && (
        <div className="modal-overlay" onClick={() => setShowManageTasks(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Tasks</h2>
              <button className="modal-close" onClick={() => setShowManageTasks(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-content">
              <div className="add-tag-section">
                <input
                  type="text"
                  placeholder="New tag name"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                />
                <div className="color-options">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${newTagColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <button className="btn btn-primary add-tag-btn" onClick={handleAddTag}>
                  <PlusIcon /> Add Tag
                </button>
              </div>

              <div className="tags-list">
                {tags.map(tag => (
                  <div key={tag.id} className="tag-item">
                    <span className="tag-dot" style={{ background: tag.color }} />
                    <span className="tag-name">{tag.name}</span>
                    {onDeleteTag && (
                      <button className="tag-delete" onClick={() => onDeleteTag(tag.id)}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats
