import { useState, useEffect, useCallback } from 'react'
import { TagIcon, StopwatchIcon, SettingsIcon, StopIcon, PauseIcon, PlayIcon, CoffeeIcon, CloseIcon } from './Icons'
import { cn } from '../lib/utils'
import type { Session } from '../types'

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

interface ActiveSessionProps {
  session: Session | null
  onUpdateSession: (session: Session) => void
  onEndSession: (session: Session) => void
  onDiscard?: () => void
}

interface FormattedTime {
  hours: string
  minutes: string
  seconds: string
}

const ActiveSession = ({ session, onUpdateSession, onEndSession, onDiscard }: ActiveSessionProps) => {
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false)
  // Initialize from saved session state
  const [elapsed, setElapsed] = useState<number>(() => {
    if (!session) return 0
    let initialElapsed = session.focusTime || 0
    // If timer was running (not paused, not on break), add time since last update
    if (session.lastUpdateTime && !session.isPaused && !session.isOnBreak) {
      const timeSinceUpdate = Date.now() - session.lastUpdateTime
      initialElapsed += timeSinceUpdate
    }
    return initialElapsed
  })
  const [breakElapsed, setBreakElapsed] = useState<number>(() => {
    if (!session) return 0
    let initialBreak = session.breakTime || 0
    // If on break and not paused, add time since last update
    if (session.lastUpdateTime && !session.isPaused && session.isOnBreak) {
      const timeSinceUpdate = Date.now() - session.lastUpdateTime
      initialBreak += timeSinceUpdate
    }
    return initialBreak
  })
  const [isPaused, setIsPaused] = useState<boolean>(session?.isPaused || false)
  const [isOnBreak, setIsOnBreak] = useState<boolean>(session?.isOnBreak || false)

  // Timer tick
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

  // Save session state to storage periodically
  useEffect(() => {
    if (!session) return

    const saveState = () => {
      const updatedSession: Session = {
        ...session,
        focusTime: elapsed,
        breakTime: breakElapsed,
        isPaused,
        isOnBreak,
        lastUpdateTime: Date.now(),
      }

      // Save to chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ activeSession: updatedSession })
      } else {
        localStorage.setItem('fayd-activeSession', JSON.stringify(updatedSession))
      }
    }

    // Save immediately and then every 2 seconds
    saveState()
    const saveInterval = setInterval(saveState, 2000)

    return () => clearInterval(saveInterval)
  }, [session, elapsed, breakElapsed, isPaused, isOnBreak])

  const formatTime = useCallback((ms: number): FormattedTime => {
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

  const handleFinishClick = () => {
    setShowFinishModal(true)
  }

  const handleSave = () => {
    if (!session) return
    const finalSession: Session = {
      ...session,
      focusTime: elapsed,
      breakTime: breakElapsed,
    }
    setShowFinishModal(false)
    onEndSession(finalSession)
  }

  const handleDiscard = () => {
    setShowFinishModal(false)
    // Clear stored session
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('activeSession')
    } else {
      localStorage.removeItem('fayd-activeSession')
    }
    if (onDiscard) {
      onDiscard()
    }
  }

  if (!session) return null

  return (
    <div className="min-h-extension flex flex-col p-5 animate-fadeIn">
      <header className="flex items-center justify-between bg-primary-blue-light rounded-DEFAULT px-4 py-3 mb-10 animate-slideDown">
        <div className="flex items-center gap-2 text-sm font-medium text-primary-blue">
          <TagIcon color={session.tag.color} className="w-[18px] h-[18px]" />
          <span>{session.tag.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <StopwatchIcon className="w-5 h-5 text-text-muted" />
        </div>
        <button className="w-9 h-9 flex items-center justify-center bg-white border-none rounded-lg cursor-pointer text-text-muted [&_svg]:w-5 [&_svg]:h-5">
          <SettingsIcon />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center animate-scaleIn">
        <p className="font-sans text-sm font-semibold tracking-[2px] text-text-muted mb-4">{isOnBreak ? 'ON BREAK' : 'FOCUSED'}</p>
        <div className="font-sans text-[56px] font-light text-text-muted tracking-[2px] flex items-center">
          <span>{time.hours}</span>
          <span className="mx-1">:</span>
          <span>{time.minutes}</span>
          <span className="mx-1">:</span>
          <span className="text-text-dark">{time.seconds}</span>
        </div>
      </div>

      <div className="flex justify-center gap-6 my-10">
        <button
          className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer text-text-dark transition-all duration-200 animate-slideUp active:scale-95"
          style={{ animationDelay: '0.1s' }}
          onClick={handleFinishClick}
        >
          <span className="p-4 rounded-full border-2 border-accent-green bg-accent-green/10 text-accent-green [&_svg]:w-7 [&_svg]:h-7 hover:bg-accent-green hover:text-white transition-all duration-200">
            <StopIcon />
          </span>
          <span className="font-sans text-sm font-medium">Finish</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer text-text-dark transition-all duration-200 animate-slideUp active:scale-95"
          style={{ animationDelay: '0.2s' }}
          onClick={handlePause}
        >
          <span className={cn(
            "p-4 rounded-full border-2 border-accent-orange bg-accent-orange/10 text-accent-orange [&_svg]:w-7 [&_svg]:h-7 transition-all duration-200",
            isPaused ? "bg-accent-orange text-white" : "hover:bg-accent-orange hover:text-white"
          )}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </span>
          <span className="font-sans text-sm font-medium">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer text-text-dark transition-all duration-200 animate-slideUp active:scale-95"
          style={{ animationDelay: '0.3s' }}
          onClick={handleBreak}
        >
          <span className={cn(
            "p-4 rounded-full border-2 border-primary-blue bg-primary-blue/10 text-primary-blue [&_svg]:w-7 [&_svg]:h-7 transition-all duration-200",
            isOnBreak ? "bg-primary-blue text-white" : "hover:bg-primary-blue hover:text-white"
          )}>
            <CoffeeIcon />
          </span>
          <span className="font-sans text-sm font-medium">{isOnBreak ? 'Focus' : 'Break'}</span>
        </button>
      </div>

      <div className="p-5 bg-primary-blue-light rounded-DEFAULT animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="font-sans text-lg font-semibold text-text-dark">{formatTime(elapsed).minutes}:{formatTime(elapsed).seconds}</span>
            <span className="font-sans text-xs text-text-muted uppercase tracking-[1px]">focus</span>
          </div>
          {breakElapsed > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-lg font-semibold text-text-dark">{formatTime(breakElapsed).minutes}:{formatTime(breakElapsed).seconds}</span>
              <span className="font-sans text-xs text-text-muted uppercase tracking-[1px]">break</span>
            </div>
          )}
        </div>
      </div>

      {/* Save Progress Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-fadeIn" onClick={() => setShowFinishModal(false)}>
          <div className="bg-white rounded-[20px] w-[280px] p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted hover:text-text-dark transition-colors [&_svg]:w-5 [&_svg]:h-5"
              onClick={() => setShowFinishModal(false)}
            >
              <CloseIcon />
            </button>

            <div className="flex flex-col items-center pt-4">
              <div className="text-primary-blue mb-4">
                <SaveIcon />
              </div>
              <h3 className="font-sans text-xl font-semibold text-text-dark mb-6">Save your progress?</h3>

              <div className="flex items-center justify-center gap-8 w-full">
                <button
                  className="bg-transparent border-none font-sans text-sm font-bold tracking-[1px] text-accent-red cursor-pointer hover:underline"
                  onClick={handleDiscard}
                >
                  DISCARD
                </button>
                <button
                  className="bg-transparent border-none font-sans text-sm font-bold tracking-[1px] text-primary-blue cursor-pointer hover:underline"
                  onClick={handleSave}
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveSession
