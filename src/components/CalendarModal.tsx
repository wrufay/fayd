import { useState, useMemo, MouseEvent } from 'react'
import { CloseIcon, PlusIcon } from './Icons'
import { cn } from '../lib/utils'
import type { Session } from '../types'

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,6 15,12 9,18" />
  </svg>
)

interface TagIconProps {
  color?: string
}

const TagIcon = ({ color }: TagIconProps) => (
  <svg viewBox="0 0 24 24" fill={color || 'currentColor'} className="w-4 h-4">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" stroke="white" strokeWidth="2" />
  </svg>
)

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  onAddMissedTime: (date: Date) => void
}

const CalendarModal = ({ isOpen, onClose, sessions, onAddMissedTime }: CalendarModalProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0
    const dayMs = 24 * 60 * 60 * 1000
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const dayStart = checkDate.getTime()
      const dayEnd = dayStart + dayMs
      const hasSession = sessions.some(s => s.startTime >= dayStart && s.startTime < dayEnd)

      if (hasSession) {
        count++
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else if (i === 0) {
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else {
        break
      }
    }
    return count
  }, [sessions])

  // Get days with sessions for current month
  const daysWithSessions = useMemo(() => {
    const days = new Set<number>()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    sessions.forEach(s => {
      const d = new Date(s.startTime)
      if (d.getFullYear() === year && d.getMonth() === month) {
        days.add(d.getDate())
      }
    })
    return days
  }, [sessions, currentDate])

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

    return sessions.filter(s => s.startTime >= start.getTime() && s.startTime < end.getTime())
  }, [sessions, selectedDate])

  const selectedDateTotal = useMemo(() => {
    return selectedDateSessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
  }, [selectedDateSessions])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (number | null)[] = []

    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(day)
    }

    return days
  }, [currentDate])

  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000)
    if (totalMinutes < 60) return `${totalMinutes}m`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const formatDateLabel = (date: Date): string => {
    const isToday = date.toDateString() === today.toDateString()
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    return isToday ? `Today, ${monthName} ${day}` : `${monthName} ${day}`
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day: number | null) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setSelectedDate(newDate)
    }
  }

  const isToday = (day: number | null): boolean => {
    if (!day) return false
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    )
  }

  const isSelected = (day: number | null): boolean => {
    if (!day) return false
    return (
      currentDate.getFullYear() === selectedDate.getFullYear() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    )
  }

  if (!isOpen) return null

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-fadeIn p-4" onClick={onClose}>
      <div className="w-extension max-h-[90vh] bg-cream overflow-y-auto animate-slideUp rounded-2xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 bg-white rounded-t-2xl">
          <button className="bg-transparent border-none cursor-pointer p-2 text-text-muted hover:text-text-dark transition-colors [&_svg]:w-6 [&_svg]:h-6" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="p-5">
          {/* Streak */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-text-muted to-transparent opacity-30"></span>
            <span className="sans-regular text-sm text-text-dark whitespace-nowrap">You're on a {streak} day streak!</span>
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-text-muted to-transparent opacity-30"></span>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-center gap-6 mb-5">
            <button className="bg-transparent border-none cursor-pointer p-2 text-primary-blue hover:scale-110 transition-transform [&_svg]:w-6 [&_svg]:h-6" onClick={prevMonth}>
              <ChevronLeft />
            </button>
            <span className="sans-bold text-xl text-text-dark">{monthName}</span>
            <button className="bg-transparent border-none cursor-pointer p-2 text-primary-blue hover:scale-110 transition-transform [&_svg]:w-6 [&_svg]:h-6" onClick={nextMonth}>
              <ChevronRight />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} className="text-center sans-regular text-xs text-text-muted py-2">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <button
                  key={i}
                  className={cn(
                    "aspect-square flex items-center justify-center border-none bg-transparent sans-regular text-base text-text-dark cursor-pointer rounded-full transition-all duration-200",
                    !day && "cursor-default",
                    day && "hover:bg-primary-blue-light",
                    daysWithSessions.has(day as number) && !isToday(day) && "bg-primary-blue-light text-primary-blue font-bold",
                    isToday(day) && "border-2 border-primary-blue bg-transparent text-primary-blue",
                    isSelected(day) && "shadow-[0_0_0_3px_rgba(4,102,200,0.3)]"
                  )}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Sessions */}
          <div className="bg-white rounded-DEFAULT p-5 mt-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="sans-bold text-lg text-text-dark mb-1">{formatDateLabel(selectedDate)}</h3>
                <p className="sans-regular text-xs text-text-muted tracking-[0.5px]">TOTAL TIME: {formatDuration(selectedDateTotal)}</p>
              </div>
              <button
                className="w-10 h-10 rounded-full border-2 border-primary-blue bg-transparent text-primary-blue cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-primary-blue hover:text-white [&_svg]:w-5 [&_svg]:h-5"
                onClick={() => onAddMissedTime(selectedDate)}
              >
                <PlusIcon />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {selectedDateSessions.length === 0 ? (
                <p className="text-center text-text-muted sans-regular text-sm py-5">No sessions on this day</p>
              ) : (
                selectedDateSessions.map(session => (
                  <div key={session.id} className="bg-primary-blue-light rounded-[12px] p-4 flex justify-between items-center cursor-pointer transition-transform duration-200 hover:translate-x-1">
                    <div className="flex-1">
                      <span className="sans-regular text-xs text-text-muted tracking-[0.3px] mb-1 block">
                        {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} {formatTime(session.startTime)}-{formatTime(session.endTime!)}
                      </span>
                      <div className="flex items-center gap-2">
                        <TagIcon color={session.tag.color} />
                        <span className="sans-bold text-base text-text-dark">{session.tag.name}</span>
                        <span className="sans-regular text-sm text-text-muted">• {formatDuration(session.focusTime)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              className="block w-full text-center bg-transparent border-none sans-bold text-sm text-primary-blue tracking-[0.5px] cursor-pointer p-3 transition-opacity hover:opacity-80 hover:underline"
              onClick={() => onAddMissedTime(selectedDate)}
            >
              ADD MISSED TIME
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal
