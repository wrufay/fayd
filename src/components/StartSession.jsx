import React, { useState } from 'react'
import { CloseIcon, ClockIcon, StopwatchIcon, TagIcon, PlusIcon, PlayIcon } from './Icons'
import './StartSession.css'

const StartSession = ({
  tags,
  selectedTag,
  onSelectTag,
  timerMode,
  onSetTimerMode,
  countdownMinutes,
  onSetCountdownMinutes,
  onStart,
  onClose,
  onAddTag,
}) => {
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#F6AD55')

  const colors = ['#F6AD55', '#4FD1C5', '#4B6EF5', '#48BB78', '#FC8181', '#F687B3', '#9F7AEA']

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setShowAddTag(false)
    }
  }

  const countdownOptions = [15, 25, 30, 45, 60, 90]

  return (
    <div className="start-session">
      <header className="start-session-header">
        <button className="close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2><span>Start</span> working</h2>
        <div style={{ width: 40 }} />
      </header>

      <div className="container">
        <div className="toggle-container">
          <button
            className={`toggle-option ${timerMode === 'countdown' ? 'active' : ''}`}
            onClick={() => onSetTimerMode('countdown')}
          >
            <ClockIcon className="toggle-icon" />
          </button>
          <button
            className={`toggle-option ${timerMode === 'stopwatch' ? 'active' : ''}`}
            onClick={() => onSetTimerMode('stopwatch')}
          >
            <StopwatchIcon className="toggle-icon" />
          </button>
        </div>

        <div className="timer-mode-info">
          <h3>{timerMode === 'stopwatch' ? 'Stopwatch timer' : 'Countdown timer'}</h3>
          <p>{timerMode === 'stopwatch' ? 'Work until your task is done' : `Focus for ${countdownMinutes} minutes`}</p>
        </div>

        {timerMode === 'countdown' && (
          <div className="countdown-options">
            {countdownOptions.map(mins => (
              <button
                key={mins}
                className={`countdown-option ${countdownMinutes === mins ? 'selected' : ''}`}
                onClick={() => onSetCountdownMinutes(mins)}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        <div className="task-section">
          <h3>Task goal</h3>
          <p className="task-subtitle">Track how you spend your time</p>

          <div className="tags-grid">
            <button className="tag add-tag" onClick={() => setShowAddTag(true)}>
              <PlusIcon className="tag-plus" />
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`tag ${selectedTag?.id === tag.id ? 'selected' : ''}`}
                onClick={() => onSelectTag(tag)}
                style={{ '--tag-color': tag.color }}
              >
                <TagIcon className="tag-icon" color={tag.color} />
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        </div>

        {showAddTag && (
          <div className="add-tag-form card">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              autoFocus
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
            <div className="add-tag-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddTag(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddTag}>
                Add
              </button>
            </div>
          </div>
        )}

        <button
          className={`start-btn ${!selectedTag ? 'disabled' : ''}`}
          onClick={onStart}
          disabled={!selectedTag}
        >
          <PlayIcon />
        </button>
      </div>
    </div>
  )
}

export default StartSession
