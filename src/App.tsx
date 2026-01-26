import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './components/Home'
import StartSession from './components/StartSession'
import ActiveSession from './components/ActiveSession'
import SessionSummary from './components/SessionSummary'
import Stats from './components/Stats'
import Navigation from './components/Navigation'
import { storage, sendMessage } from './lib/platform'
import type { Tag, Session } from './types'

const OVERLAY_VIEWS = {
  NONE: 'none',
  START_SESSION: 'startSession',
  ACTIVE: 'active',
  SUMMARY: 'summary',
} as const

type OverlayView = typeof OVERLAY_VIEWS[keyof typeof OVERLAY_VIEWS]

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'projects', color: '#ef5f33' },
  { id: '2', name: 'study', color: '#0466c8' },
  { id: '3', name: 'work', color: '#f1c40f' },
]

function AppContent() {
  const { user, sessions: cloudSessions, tags: cloudTags, api, dataLoaded } = useAuth()
  const navigate = useNavigate()
  const [overlayView, setOverlayView] = useState<OverlayView>(OVERLAY_VIEWS.NONE)
  const [localTags, setLocalTags] = useState<Tag[]>(DEFAULT_TAGS)
  const [localSessions, setLocalSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch')
  const [countdownMinutes, setCountdownMinutes] = useState<number>(25)

  // Use cloud data when logged in, local data otherwise
  const tags = user && dataLoaded ? cloudTags : localTags
  const sessions = user && dataLoaded ? cloudSessions : localSessions

  // Load local data from storage on mount (for non-logged in users)
  useEffect(() => {
    storage.get(['tags', 'sessions', 'activeSession']).then((result) => {
      if (result.tags) setLocalTags(result.tags as Tag[])
      if (result.sessions) setLocalSessions(result.sessions as Session[])
      if (result.activeSession) {
        setCurrentSession(result.activeSession as Session)
        setOverlayView(OVERLAY_VIEWS.ACTIVE)
      }
    })
  }, [])

  // Save data to local storage (for non-logged in users)
  const saveToStorage = (key: string, value: unknown) => {
    if (value === null) {
      storage.remove(key)
    } else {
      storage.set({ [key]: value })
    }
  }

  const startSession = () => {
    if (!selectedTag) return

    const session: Session = {
      id: Date.now().toString(),
      tag: selectedTag,
      timerMode,
      countdownMinutes: timerMode === 'countdown' ? countdownMinutes : null,
      startTime: Date.now(),
      focusTime: 0,
      breakTime: 0,
      isPaused: false,
      isOnBreak: false,
      lastUpdateTime: Date.now(),
    }
    setCurrentSession(session)
    saveToStorage('activeSession', session)

    sendMessage({ type: 'START_SESSION', session })

    setOverlayView(OVERLAY_VIEWS.ACTIVE)
  }

  const endSession = async (finalSession: Session) => {
    const completedSession: Session = {
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

    sendMessage({ type: 'END_SESSION' })

    setCurrentSession(completedSession)
    setOverlayView(OVERLAY_VIEWS.SUMMARY)
  }

  const addTag = async (name: string, color: string) => {
    if (user && api) {
      try {
        await api.createTag(name, color)
      } catch (error) {
        console.error('Failed to save tag to cloud:', error)
      }
    } else {
      const newTag: Tag = { id: Date.now().toString(), name, color }
      const updatedTags = [...localTags, newTag]
      setLocalTags(updatedTags)
      saveToStorage('tags', updatedTags)
    }
  }

  const deleteSession = async (sessionId: string) => {
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

  const deleteTag = async (tagId: string) => {
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

  const updateTag = async (tagId: string, name: string, color: string) => {
    if (user && api) {
      try {
        await api.updateTag(tagId, name, color)
      } catch (error) {
        console.error('Failed to update tag in cloud:', error)
      }
    } else {
      const updatedTags = localTags.map(t =>
        t.id === tagId ? { ...t, name, color } : t
      )
      setLocalTags(updatedTags)
      saveToStorage('tags', updatedTags)
      // Also update sessions that use this tag
      const updatedSessions = localSessions.map(s =>
        s.tag.id === tagId ? { ...s, tag: { ...s.tag, name, color } } : s
      )
      setLocalSessions(updatedSessions)
      saveToStorage('sessions', updatedSessions)
    }
  }

  const addSession = async (session: Session) => {
    if (user && api) {
      try {
        await api.createSession(session)
      } catch (error) {
        console.error('Failed to save session to cloud:', error)
      }
    } else {
      const updatedSessions = [session, ...localSessions]
      setLocalSessions(updatedSessions)
      saveToStorage('sessions', updatedSessions)
    }
  }

  const renderOverlay = () => {
    switch (overlayView) {
      case OVERLAY_VIEWS.START_SESSION:
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
            onClose={() => setOverlayView(OVERLAY_VIEWS.NONE)}
            onAddTag={addTag}
          />
        )
      case OVERLAY_VIEWS.ACTIVE:
        return (
          <ActiveSession
            session={currentSession}
            onUpdateSession={setCurrentSession}
            onEndSession={endSession}
            onDiscard={() => {
              sendMessage({ type: 'END_SESSION' })
              setCurrentSession(null)
              setSelectedTag(null)
              setOverlayView(OVERLAY_VIEWS.NONE)
            }}
          />
        )
      case OVERLAY_VIEWS.SUMMARY:
        return (
          <SessionSummary
            session={currentSession}
            onClose={() => {
              setCurrentSession(null)
              setSelectedTag(null)
              setOverlayView(OVERLAY_VIEWS.NONE)
            }}
            onViewStats={() => {
              setOverlayView(OVERLAY_VIEWS.NONE)
              navigate('/stats')
            }}
          />
        )
      default:
        return null
    }
  }

  const isOverlayActive = overlayView !== OVERLAY_VIEWS.NONE

  return (
    <div className="app">
      {isOverlayActive ? (
        renderOverlay()
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Home
                sessions={sessions}
                tags={tags}
                onStartSession={() => setOverlayView(OVERLAY_VIEWS.START_SESSION)}
              />
            }
          />
          <Route
            path="/stats"
            element={
              <Stats
                sessions={sessions}
                tags={tags}
                onDeleteSession={deleteSession}
                onDeleteTag={deleteTag}
                onUpdateTag={updateTag}
                onAddTag={addTag}
                onAddSession={addSession}
              />
            }
          />
        </Routes>
      )}
      {!isOverlayActive && <Navigation />}
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Analytics />
    </HashRouter>
  )
}

export default App
