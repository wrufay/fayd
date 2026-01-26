import { useState, useEffect, useCallback } from 'react'
import { TagIcon, StopwatchIcon, StopIcon, PauseIcon, PlayIcon, CloseIcon } from './Icons'
import { cn } from '../lib/utils'
import { storage } from '../lib/platform'
import QuickLinksWidget from './QuickLinksWidget'
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
  const [elapsed, setElapsed] = useState<number>(() => {
    if (!session) return 0
    let initialElapsed = session.focusTime || 0
    if (session.lastUpdateTime && !session.isPaused) {
      const timeSinceUpdate = Date.now() - session.lastUpdateTime
      initialElapsed += timeSinceUpdate
    }
    return initialElapsed
  })
  const [isPaused, setIsPaused] = useState<boolean>(session?.isPaused || false)

  // Timer tick
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      if (!isPaused) {
        setElapsed(prev => prev + 1000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, session])

  // Save session state to storage periodically
  useEffect(() => {
    if (!session) return

    const saveState = () => {
      const updatedSession: Session = {
        ...session,
        focusTime: elapsed,
        isPaused,
        lastUpdateTime: Date.now(),
      }

      storage.set({ activeSession: updatedSession })
    }

    saveState()
    const saveInterval = setInterval(saveState, 2000)

    return () => clearInterval(saveInterval)
  }, [session, elapsed, isPaused])

  const formatTime = useCallback((ms: number): FormattedTime => {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    }
  }, [])

  // For countdown mode, calculate remaining time
  const isCountdown = session?.timerMode === 'countdown'
  const countdownTotal = (session?.countdownMinutes || 0) * 60 * 1000
  const remaining = countdownTotal - elapsed
  const displayTime = isCountdown ? remaining : elapsed
  const time = formatTime(displayTime)
  const isTimeUp = isCountdown && remaining <= 0

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleFinishClick = () => {
    setShowFinishModal(true)
  }

  const handleSave = () => {
    if (!session) return
    const finalSession: Session = {
      ...session,
      focusTime: elapsed,
    }
    setShowFinishModal(false)
    onEndSession(finalSession)
  }

  const handleDiscard = () => {
    setShowFinishModal(false)
    storage.remove('activeSession')
    if (onDiscard) {
      onDiscard()
    }
  }

  if (!session) return null

  return (
    <div className="min-h-extension flex flex-col p-3 sm:p-5 animate-fadeIn">
      <header className="flex items-center justify-center gap-4 bg-primary-blue-light rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-10 animate-slideDown mx-auto">
        <div className="flex items-center gap-2 serif-regular text-sm text-primary-blue">
          <TagIcon color={session.tag.color} className="w-[18px] h-[18px]" />
          <span>{session.tag.name}</span>
        </div>
        {isCountdown ? (
          <span className="coding-regular text-xs text-text-muted">{session.countdownMinutes}m</span>
        ) : (
          <StopwatchIcon className="w-5 h-5 text-text-muted" />
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center animate-scaleIn">
        <p className="coding-bold text-xs sm:text-sm tracking-[2px] text-text-muted mb-3 sm:mb-4">
          {isCountdown ? (isTimeUp ? 'TIME UP' : 'REMAINING') : 'FOCUSED'}
        </p>
        <div className={cn(
          "coding-regular text-4xl sm:text-[56px] tracking-[2px] flex items-center",
          isTimeUp ? "text-accent-red" : "text-text-muted"
        )}>
          <span>{time.hours}</span>
          <span className="mx-1">:</span>
          <span>{time.minutes}</span>
          <span className="mx-1">:</span>
          <span className={isTimeUp ? "text-accent-red" : "text-text-dark"}>{time.seconds}</span>
        </div>
      </div>

      <div className="flex justify-center gap-6 sm:gap-8 my-6 sm:my-10">
        <button
          className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer text-text-dark transition-all duration-200 animate-slideUp active:scale-95"
          style={{ animationDelay: '0.1s' }}
          onClick={handleFinishClick}
        >
          <span className="p-3 sm:p-4 rounded-full border-2 border-accent-green bg-accent-green/10 text-accent-green [&_svg]:w-6 [&_svg]:h-6 sm:[&_svg]:w-7 sm:[&_svg]:h-7 hover:bg-accent-green hover:text-white transition-all duration-200">
            <StopIcon />
          </span>
          <span className="coding-regular text-sm">Finish</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer text-text-dark transition-all duration-200 animate-slideUp active:scale-95"
          style={{ animationDelay: '0.2s' }}
          onClick={handlePause}
        >
          <span className="p-3 sm:p-4 rounded-full border-2 border-accent-orange bg-accent-orange/10 text-accent-orange [&_svg]:w-6 [&_svg]:h-6 sm:[&_svg]:w-7 sm:[&_svg]:h-7 transition-all duration-200">
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </span>
          <span className="coding-regular text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      {/* Study Stack - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-[100]">
        <QuickLinksWidget className="py-3" />
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
              <h3 className="sans-bold text-xl text-text-dark mb-6">Save your progress?</h3>

              <div className="flex items-center justify-center gap-8 w-full">
                <button
                  className="bg-transparent border-none coding-bold text-sm tracking-[1px] text-accent-red cursor-pointer hover:underline"
                  onClick={handleDiscard}
                >
                  DISCARD
                </button>
                <button
                  className="bg-transparent border-none coding-bold text-sm tracking-[1px] text-primary-blue cursor-pointer hover:underline"
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
