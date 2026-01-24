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
    { id: 'focus', label: 'deep focus', value: session?.focusTime || 0, color: '#4B6EF5' },
    { id: 'break', label: 'on break', value: session?.breakTime || 0, color: '#F6AD55' },
  ], [session])

  const totalTime = (session?.focusTime || 0) + (session?.breakTime || 0)

  if (!session) return null

  return (
    <div className="min-h-extension flex flex-col animate-fadeIn">
      <header className="flex items-center justify-between px-5 py-4 animate-slideDown">
        <button className="close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <span className="text-xs font-semibold tracking-widest text-text-muted">
          {formatDate(session.startTime).toUpperCase()}
        </span>
        <div className="w-10" />
      </header>

      <div className="bg-gradient-to-br from-primary-blue-light to-[#E0E7FF] px-5 py-8 text-center animate-slideUp">
        <div className="flex items-center justify-center gap-3 mb-4 animate-scaleIn-delay">
          <span className="text-2xl animate-bounceIn">👏</span>
          <span className="text-4xl font-light text-text-dark tracking-wide">{formatTime(totalTime)}</span>
          <span className="text-2xl animate-bounceIn">👏</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium animate-scaleIn-delay">
          <TagIcon color={session.tag.color} className="w-4 h-4" />
          <span>{session.tag.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 px-5 py-6 animate-fadeIn-delay">
        <div className="flex-shrink-0">
          <DonutChart data={chartData} size={140} strokeWidth={24} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary-blue" />
            <span>{formatTimeShort(session.focusTime)} deep focus</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary-blue opacity-40" />
            <span>0s multitasking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-dark">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-accent-orange" />
            <span>{formatTimeShort(session.breakTime)} on break</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-b border-primary-blue-light">
        <div className="flex justify-between py-2">
          <span className="text-sm text-text-muted">Start time:</span>
          <span className="text-sm font-medium text-text-dark">{formatTimeOfDay(session.startTime)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-text-muted">End time:</span>
          <span className="text-sm font-medium text-text-dark">{formatTimeOfDay(session.endTime!)}</span>
        </div>
      </div>

      <button className="btn btn-primary mx-5 my-5 w-[calc(100%-40px)] animate-slideUp-delay" onClick={onViewStats}>
        SEE MORE STATS
      </button>
    </div>
  )
}

export default SessionSummary
