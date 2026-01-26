import { useMemo } from 'react'
import DonutChart from './DonutChart'
import { CloseIcon, TagIcon } from './Icons'
import type { Session, ChartDataItem } from '../types'

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

  const formatTimeShort = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const formatTimeOfDay = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const chartData: ChartDataItem[] = useMemo(() => [
    { id: 'focus', label: 'deep focus', value: session?.focusTime || 0, color: '#ef5f33' },
    { id: 'break', label: 'on break', value: session?.breakTime || 0, color: '#f1c40f' },
  ], [session])

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

      <div className="bg-gradient-to-br from-primary-light to-cream-dark px-3 sm:px-5 py-6 sm:py-8 text-center animate-slideUp">
        <div className="flex items-center justify-center mb-3 sm:mb-4 animate-scaleIn-delay">
          <span className="coding-regular text-3xl sm:text-4xl text-text-dark tracking-wide">{formatTime(totalTime)}</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full sans-regular text-sm animate-scaleIn-delay">
          <TagIcon color={session.tag.color} className="w-4 h-4" />
          <span>{session.tag.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 px-3 sm:px-5 py-4 sm:py-6 animate-fadeIn-delay">
        <div className="flex-shrink-0">
          <DonutChart data={chartData} size={110} strokeWidth={20} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary" />
            <span>{formatTimeShort(session.focusTime)} deep focus</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary opacity-40" />
            <span>0s multitasking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-accent-yellow" />
            <span>{formatTimeShort(session.breakTime)} on break</span>
          </div>
        </div>
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

      <button className="inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 rounded-full coding-regular text-xs sm:text-sm border-[1.5px] cursor-pointer transition-all duration-300 bg-crimson border-crimson text-white hover:bg-primary-dark hover:border-primary-dark hover:-translate-y-px hover:shadow-button active:translate-y-0 mx-3 sm:mx-5 my-4 sm:my-5 w-[calc(100%-24px)] sm:w-[calc(100%-40px)] animate-slideUp-delay" onClick={onViewStats}>
        SEE MORE STATS
      </button>
    </div>
  )
}

export default SessionSummary
