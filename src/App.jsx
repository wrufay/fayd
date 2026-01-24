import React, { useState, useEffect } from 'react'
import Home from './components/Home'
import StartSession from './components/StartSession'
import QuoteScreen from './components/QuoteScreen'
import ActiveSession from './components/ActiveSession'
import SessionSummary from './components/SessionSummary'
import Stats from './components/Stats'
import Navigation from './components/Navigation'

const VIEWS = {
  HOME: 'home',
  START_SESSION: 'startSession',
  QUOTE: 'quote',
  ACTIVE: 'active',
  SUMMARY: 'summary',
  STATS: 'stats',
}

const DEFAULT_TAGS = [
  { id: '1', name: 'projects', color: '#F6AD55' },
  { id: '2', name: 'study', color: '#4FD1C5' },
  { id: '3', name: 'work', color: '#4B6EF5' },
  { id: '4', name: 'reading', color: '#48BB78' },
  { id: '5', name: 'exercise', color: '#FC8181' },
]

function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [tags, setTags] = useState(DEFAULT_TAGS)
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [timerMode, setTimerMode] = useState('stopwatch') // 'stopwatch' or 'countdown'
  const [countdownMinutes, setCountdownMinutes] = useState(25)

  // Load data from storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['tags', 'sessions', 'activeSession'], (result) => {
        if (result.tags) setTags(result.tags)
        if (result.sessions) setSessions(result.sessions)
        if (result.activeSession) {
          setCurrentSession(result.activeSession)
          setView(VIEWS.ACTIVE)
        }
      })
    } else {
      // Fallback to localStorage for development
      const storedTags = localStorage.getItem('flipd-tags')
      const storedSessions = localStorage.getItem('flipd-sessions')
      if (storedTags) setTags(JSON.parse(storedTags))
      if (storedSessions) setSessions(JSON.parse(storedSessions))
    }
  }, [])

  // Save data to storage
  const saveToStorage = (key, value) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [key]: value })
    } else {
      localStorage.setItem(`flipd-${key}`, JSON.stringify(value))
    }
  }

  const startSession = () => {
    if (!selectedTag) return
    setView(VIEWS.QUOTE)

    setTimeout(() => {
      const session = {
        id: Date.now().toString(),
        tag: selectedTag,
        timerMode,
        countdownMinutes: timerMode === 'countdown' ? countdownMinutes : null,
        startTime: Date.now(),
        focusTime: 0,
        breakTime: 0,
        isPaused: false,
        isOnBreak: false,
      }
      setCurrentSession(session)
      saveToStorage('activeSession', session)

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'START_SESSION', session })
      }

      setView(VIEWS.ACTIVE)
    }, 3000)
  }

  const endSession = (finalSession) => {
    const completedSession = {
      ...finalSession,
      endTime: Date.now(),
    }

    const updatedSessions = [completedSession, ...sessions]
    setSessions(updatedSessions)
    saveToStorage('sessions', updatedSessions)
    saveToStorage('activeSession', null)

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'END_SESSION' })
    }

    setCurrentSession(completedSession)
    setView(VIEWS.SUMMARY)
  }

  const addTag = (name, color) => {
    const newTag = { id: Date.now().toString(), name, color }
    const updatedTags = [...tags, newTag]
    setTags(updatedTags)
    saveToStorage('tags', updatedTags)
  }

  const deleteSession = (sessionId) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId)
    setSessions(updatedSessions)
    saveToStorage('sessions', updatedSessions)
  }

  const deleteTag = (tagId) => {
    const updatedTags = tags.filter(t => t.id !== tagId)
    setTags(updatedTags)
    saveToStorage('tags', updatedTags)
  }

  const handleNavigation = (navView) => {
    if (view === VIEWS.ACTIVE) return // Don't navigate away from active session
    setView(navView)
  }

  const renderView = () => {
    switch (view) {
      case VIEWS.HOME:
        return (
          <Home
            sessions={sessions}
            tags={tags}
            onStartSession={() => setView(VIEWS.START_SESSION)}
          />
        )
      case VIEWS.START_SESSION:
        return (
          <StartSession
            tags={tags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            timerMode={timerMode}
            onSetTimerMode={setTimerMode}
            countdownMinutes={countdownMinutes}
            onSetCountdownMinutes={setCountdownMinutes}
            onStart={startSession}
            onClose={() => setView(VIEWS.HOME)}
            onAddTag={addTag}
          />
        )
      case VIEWS.QUOTE:
        return <QuoteScreen tag={selectedTag} timerMode={timerMode} />
      case VIEWS.ACTIVE:
        return (
          <ActiveSession
            session={currentSession}
            onUpdateSession={setCurrentSession}
            onEndSession={endSession}
          />
        )
      case VIEWS.SUMMARY:
        return (
          <SessionSummary
            session={currentSession}
            onClose={() => {
              setCurrentSession(null)
              setSelectedTag(null)
              setView(VIEWS.HOME)
            }}
            onViewStats={() => setView(VIEWS.STATS)}
          />
        )
      case VIEWS.STATS:
        return (
          <Stats
            sessions={sessions}
            tags={tags}
            onDeleteSession={deleteSession}
            onDeleteTag={deleteTag}
            onAddTag={addTag}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {renderView()}
      {(view === VIEWS.HOME || view === VIEWS.STATS) && (
        <Navigation
          activeView={view}
          onNavigate={handleNavigation}
        />
      )}
    </div>
  )
}

export default App
