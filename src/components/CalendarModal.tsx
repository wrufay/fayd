import { useState, useMemo, MouseEvent } from 'react'
import { CloseIcon, PlusIcon } from './Icons'
import DonutChart from './DonutChart'
import { cn } from '../lib/utils'
import type { Session, ChartDataItem } from '../types'

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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  onAddMissedTime: (date: Date) => void
  onDeleteSession?: (sessionId: string) => void
}

const CalendarModal = ({ isOpen, onClose, sessions, onAddMissedTime, onDeleteSession }: CalendarModalProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showSessions, setShowSessions] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])


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

  // Chart data grouped by tag for selected date
  const selectedDateChartData: ChartDataItem[] = useMemo(() => {
    const tagTotals = new Map<string, { name: string; color: string; time: number }>()

    selectedDateSessions.forEach(session => {
      const tagId = session.tag.id
      const existing = tagTotals.get(tagId)
      if (existing) {
        existing.time += session.focusTime || 0
      } else {
        tagTotals.set(tagId, {
          name: session.tag.name,
          color: session.tag.color,
          time: session.focusTime || 0
        })
      }
    })

    return Array.from(tagTotals.entries()).map(([id, data]) => ({
      id,
      label: data.name,
      value: data.time,
      color: data.color
    }))
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
      setShowSessions(false)
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

  if (!isOpen) return null

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })

  return (
    <>
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-fadeIn p-4" onClick={onClose}>
      <div className="w-extension max-h-[90vh] bg-cream overflow-y-auto animate-slideUp rounded-2xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 bg-white rounded-t-2xl">
          <button className="bg-transparent border-none cursor-pointer p-2 text-text-muted hover:text-text-dark transition-colors [&_svg]:w-6 [&_svg]:h-6" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="p-5">
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
              {calendarDays.map((day, i) => {
                const hasSession = daysWithSessions.has(day as number)
                return (
                  <button
                    key={i}
                    className={cn(
                      "aspect-square flex items-center justify-center sans-regular text-base text-text-dark cursor-pointer rounded-full transition-all duration-200",
                      !day && "cursor-default",
                      hasSession && "bg-primary-blue-light text-primary-blue",
                      isToday(day) ? "border border-primary-blue/40" : "border border-transparent"
                    )}
                    onClick={() => handleDayClick(day)}
                    disabled={!day}
                  >
                    {day}
                  </button>
                )
              })}
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
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border border-dashed border-text-muted/20 bg-transparent text-text-muted/50 hover:border-text-muted/40 hover:text-text-muted [&_svg]:w-5 [&_svg]:h-5"
                onClick={() => onAddMissedTime(selectedDate)}
              >
                <PlusIcon />
              </button>
            </div>

            {/* Task Distribution Chart */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-cream-dark">
              <div className="flex-shrink-0">
                <DonutChart data={selectedDateChartData} size={80} strokeWidth={14} />
              </div>
              <div className="flex flex-col gap-2">
                {selectedDateChartData.length === 0 ? (
                  <span className="sans-regular text-sm text-text-muted">No tasks recorded</span>
                ) : (
                  selectedDateChartData.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-text-dark">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span>{item.label} • {formatDuration(item.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedDateSessions.length > 0 && (
              <>
                <button
                  className="block w-full text-center bg-primary-blue-light border-none sans-bold text-sm text-primary-blue tracking-[0.5px] cursor-pointer p-3 rounded-lg transition-all hover:bg-primary-blue/20"
                  onClick={() => setShowSessions(!showSessions)}
                >
                  {showSessions ? 'HIDE DETAILS' : 'SEE DETAILS'}
                </button>

                {showSessions && (
                  <div className="flex flex-col gap-3 mt-3 animate-fadeIn">
                    {selectedDateSessions.map(session => (
                      <div key={session.id} className="bg-primary-blue-light rounded-[12px] p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <span className="sans-regular text-xs text-text-muted tracking-[0.3px] mb-1 block">
                            {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} {formatTime(session.startTime)}-{formatTime(session.endTime!)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: session.tag.color }} />
                            <span className="sans-bold text-base text-text-dark">{session.tag.name}</span>
                            <span className="sans-regular text-sm text-text-muted">• {formatDuration(session.focusTime)}</span>
                          </div>
                        </div>
                        {onDeleteSession && (
                          <button
                            className="w-9 h-9 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer text-text-muted transition-all duration-200 hover:bg-accent-red/10 hover:text-accent-red [&_svg]:w-[18px] [&_svg]:h-[18px]"
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation()
                              setSessionToDelete(session.id)
                              setShowDeleteModal(true)
                            }}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center animate-fadeIn" onClick={() => setShowDeleteModal(false)}>
        <div className="bg-white rounded-[20px] w-[300px] p-6 animate-scaleIn" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="flex flex-col items-center">
            <h3 className="sans-bold text-xl text-text-dark mb-2">Delete this session?</h3>
            <p className="sans-regular text-sm text-text-muted mb-6">This can't be undone.</p>

            <div className="flex items-center justify-center gap-8 w-full">
              <button
                className="bg-transparent border-none coding-bold text-sm tracking-[1px] text-primary-blue cursor-pointer hover:underline"
                onClick={() => setShowDeleteModal(false)}
              >
                CANCEL
              </button>
              <button
                className="bg-transparent border-none coding-bold text-sm tracking-[1px] text-primary-blue cursor-pointer hover:underline"
                onClick={() => {
                  if (sessionToDelete && onDeleteSession) {
                    onDeleteSession(sessionToDelete)
                  }
                  setShowDeleteModal(false)
                  setSessionToDelete(null)
                }}
              >
                YES, DELETE
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default CalendarModal
