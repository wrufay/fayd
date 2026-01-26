import { useMemo } from 'react'
import { CloseIcon } from './Icons'
import type { Session } from '../types'

const MOTIVATIONAL_MESSAGES = [
  "Great work! Every minute of focus brings you closer to your goals.",
  "You showed up and put in the work. That's what matters most.",
  "Consistency beats intensity. Keep showing up!",
  "Another session complete. You're building something great.",
  "Focus is a superpower. You just used yours.",
  "Small steps lead to big achievements. Well done!",
  "You chose growth over distraction. That takes strength.",
  "Progress, not perfection. You're on the right track.",
  "Your future self will thank you for this session.",
  "Discipline is choosing what you want most over what you want now.",
]

interface SessionSummaryProps {
  session: Session | null
  onClose: () => void
  onViewStats: () => void
}

const SessionSummary = ({ session, onClose, onViewStats }: SessionSummaryProps) => {
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeOfDay = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  // Pick a random motivational message (stable per session)
  const motivationalMessage = useMemo(() => {
    const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    return MOTIVATIONAL_MESSAGES[index]
  }, [])

  const totalTime = (session?.focusTime || 0) + (session?.breakTime || 0)

  if (!session) return null

  return (
    <div className="min-h-extension flex flex-col animate-fadeIn">
      <header className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 animate-slideDown">
        <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted transition-all duration-300 hover:text-text-dark hover:rotate-90 active:rotate-90 active:scale-90 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6" onClick={onClose}>
          <CloseIcon />
        </button>
        <span className="sans-bold text-[10px] sm:text-xs tracking-widest text-text-muted">
          {formatDate(session.startTime).toUpperCase()}
        </span>
        <div className="w-9 sm:w-10" />
      </header>

      <div className="bg-gradient-to-br from-primary-light to-cream-dark px-3 sm:px-5 py-6 sm:py-8 mx-3 sm:mx-5 rounded-2xl text-center animate-slideUp">
        <div className="flex items-center justify-center mb-3 sm:mb-4 animate-scaleIn-delay">
          <span className="coding-regular text-3xl sm:text-4xl text-text-dark tracking-wide">{formatTime(totalTime)}</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full sans-regular text-sm animate-scaleIn-delay">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: session.tag.color }} />
          <span>{session.tag.name}</span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="px-5 sm:px-8 py-6 sm:py-8 text-center animate-fadeIn-delay">
        <p className="serif-regular text-lg sm:text-xl text-text-dark leading-relaxed">
          {motivationalMessage}
        </p>
      </div>

      <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-b border-cream-dark">
        <div className="flex justify-between py-2">
          <span className="text-sm text-text-muted">Start time:</span>
          <span className="sans-bold text-sm text-text-dark">{formatTimeOfDay(session.startTime)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-text-muted">End time:</span>
          <span className="sans-bold text-sm text-text-dark">{formatTimeOfDay(session.endTime!)}</span>
        </div>
      </div>

      <button className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-full coding-regular text-xs border-[1.5px] cursor-pointer transition-all duration-300 bg-crimson/70 border-crimson/70 text-white hover:bg-crimson hover:border-crimson hover:-translate-y-px active:translate-y-0 mx-auto my-4 animate-slideUp-delay" onClick={onViewStats}>
        SEE MORE STATS
      </button>
    </div>
  )
}

export default SessionSummary
