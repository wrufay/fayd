import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
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

function AppContent() {
  const { user, sessions: cloudSessions, tags: cloudTags, api, dataLoaded } = useAuth()
  const [view, setView] = useState(VIEWS.HOME)
  const [localTags, setLocalTags] = useState(DEFAULT_TAGS)
  const [localSessions, setLocalSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [timerMode, setTimerMode] = useState('stopwatch') // 'stopwatch' or 'countdown'
  const [countdownMinutes, setCountdownMinutes] = useState(25)

  // Use cloud data when logged in, local data otherwise
  const tags = user && dataLoaded ? cloudTags : localTags
  const sessions = user && dataLoaded ? cloudSessions : localSessions

  // Load local data from storage on mount (for non-logged in users)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['tags', 'sessions', 'activeSession'], (result) => {
        if (result.tags) setLocalTags(result.tags)
        if (result.sessions) setLocalSessions(result.sessions)
        if (result.activeSession) {
          setCurrentSession(result.activeSession)
          setView(VIEWS.ACTIVE)
        }
      })
    } else {
      // Fallback to localStorage for development
      const storedTags = localStorage.getItem('flipd-tags')
      const storedSessions = localStorage.getItem('flipd-sessions')
      if (storedTags) setLocalTags(JSON.parse(storedTags))
      if (storedSessions) setLocalSessions(JSON.parse(storedSessions))
    }
  }, [])

  // Save data to local storage (for non-logged in users)
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

  const endSession = async (finalSession) => {
    const completedSession = {
      ...finalSession,
      endTime: Date.now(),
    }

    // Save to backend if logged in
    if (user && api) {
      try {
        await api.createSession(completedSession)
      } catch (error) {
        console.error('Failed to save session to cloud:', error)
      }
    } else {
      // Save locally for non-logged in users
      const updatedSessions = [completedSession, ...localSessions]
      setLocalSessions(updatedSessions)
      saveToStorage('sessions', updatedSessions)
    }
    saveToStorage('activeSession', null)

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'END_SESSION' })
    }

    setCurrentSession(completedSession)
    setView(VIEWS.SUMMARY)
  }

  const addTag = async (name, color) => {
    if (user && api) {
      try {
        await api.createTag(name, color)
      } catch (error) {
        console.error('Failed to save tag to cloud:', error)
      }
    } else {
      const newTag = { id: Date.now().toString(), name, color }
      const updatedTags = [...localTags, newTag]
      setLocalTags(updatedTags)
      saveToStorage('tags', updatedTags)
    }
  }

  const deleteSession = async (sessionId) => {
    if (user && api) {
      try {
        await api.deleteSession(sessionId)
      } catch (error) {
        console.error('Failed to delete session from cloud:', error)
      }
    } else {
      const updatedSessions = localSessions.filter(s => s.id !== sessionId)
      setLocalSessions(updatedSessions)
      saveToStorage('sessions', updatedSessions)
    }
  }

  const deleteTag = async (tagId) => {
    if (user && api) {
      try {
        await api.deleteTag(tagId)
      } catch (error) {
        console.error('Failed to delete tag from cloud:', error)
      }
    } else {
      const updatedTags = localTags.filter(t => t.id !== tagId)
      setLocalTags(updatedTags)
      saveToStorage('tags', updatedTags)
    }
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
            onStartSession={() => setView(VIEWS.START_SESSION)}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
