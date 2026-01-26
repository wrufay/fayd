import { useState, useMemo, useEffect, useRef, ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import DonutChart from './DonutChart'
import CalendarModal from './CalendarModal'
import AddMissedTime from './AddMissedTime'
import { TagIcon, CloseIcon, PlusIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import type { Session, Tag, ChartDataItem } from '../types'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

interface TrashIconProps {
  className?: string
}

const TrashIcon = ({ className }: TrashIconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const EditIcon = ({ className }: TrashIconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)


interface StatsProps {
  sessions: Session[]
  tags: Tag[]
  onDeleteSession: (sessionId: string) => void
  onDeleteTag: (tagId: string) => void
  onUpdateTag: (tagId: string, name: string, color: string) => void
  onAddTag: (name: string, color: string) => void
  onAddSession: (session: Session) => void
}

type TimeRange = 'today' | '7d' | '4w' | '12mo'

interface TaskDistributionItem extends ChartDataItem {
  id: string
  name: string
}

const Stats = ({ sessions, tags, onDeleteSession, onDeleteTag, onUpdateTag, onAddTag, onAddSession }: StatsProps) => {
  const { user, login, logout } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false)
  const [showManageTasks, setShowManageTasks] = useState<boolean>(false)
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [showAddMissedTime, setShowAddMissedTime] = useState<boolean>(false)
  const [missedTimeDate, setMissedTimeDate] = useState<Date>(new Date())
  const addMissedTimeRef = useRef<HTMLDivElement>(null)

  // Scroll to AddMissedTime modal when opened
  useEffect(() => {
    if (showAddMissedTime && addMissedTimeRef.current) {
      addMissedTimeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showAddMissedTime])
  const [newTagName, setNewTagName] = useState<string>('')
  const [newTagColor, setNewTagColor] = useState<string>('#ef5f33')
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  // Edit tag state
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editTagName, setEditTagName] = useState<string>('')
  const [editTagColor, setEditTagColor] = useState<string>('')

  const colors = ['#ef5f33', '#0466c8', '#f1c40f']

  const startEditTag = (tag: Tag) => {
    setEditingTagId(tag.id)
    setEditTagName(tag.name)
    setEditTagColor(tag.color)
  }

  const cancelEditTag = () => {
    setEditingTagId(null)
    setEditTagName('')
    setEditTagColor('')
  }

  const saveEditTag = () => {
    if (editingTagId && editTagName.trim()) {
      onUpdateTag(editingTagId, editTagName.trim(), editTagColor)
      cancelEditTag()
    }
  }

  const filteredSessions = useMemo(() => {
    const now = Date.now()

    // Get start of today (midnight)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const ranges: Record<TimeRange, number> = {
      today: todayStart.getTime(),
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '4w': now - 28 * 24 * 60 * 60 * 1000,
      '12mo': now - 365 * 24 * 60 * 60 * 1000,
    }

    let filtered = sessions.filter(s => s.startTime >= ranges[timeRange])

    if (selectedTag) {
      filtered = filtered.filter(s => s.tag.id === selectedTag)
    }

    return filtered
  }, [sessions, timeRange, selectedTag])

  const taskDistribution: TaskDistributionItem[] = useMemo(() => {
    const distribution: Record<string, TaskDistributionItem> = {}

    filteredSessions.forEach(session => {
      const tagId = session.tag.id
      if (!distribution[tagId]) {
        distribution[tagId] = {
          id: tagId,
          name: session.tag.name,
          color: session.tag.color,
          value: 0,
        }
      }
      distribution[tagId].value += session.focusTime || 0
    })

    return Object.values(distribution)
  }, [filteredSessions])

  const totalTime = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
  }, [filteredSessions])

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return `${hours}h ${remainingMins}m`
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleAddTag = () => {
    if (newTagName.trim() && onAddTag) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName('')
    }
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <div className="pb-[120px] min-h-extension overflow-y-auto relative">
      <header className="flex justify-between items-start p-3 sm:p-5">
        <h1 className="serif-bold text-xl sm:text-[28px]">
          <span className="serif-regular italic">your</span> stats
        </h1>
        {user ? (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-dark rounded-full coding-regular text-[13px] text-text-dark cursor-pointer transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            onClick={logout}
          >
            <span>Log out</span>
          </button>
        ) : (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-dark rounded-full coding-regular text-[13px] text-text-dark cursor-pointer transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            onClick={login}
          >
            <GoogleIcon />
            <span>Sign in</span>
          </button>
        )}
      </header>

      <div className="p-3 sm:p-5 relative z-[1] animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <button
            className="flex items-center gap-2 py-2.5 px-4 bg-none border-none rounded-sm coding-regular text-sm text-primary-blue cursor-pointer transition-all duration-200 hover:opacity-70"
            onClick={() => setShowCalendar(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Calendar</span>
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 py-2.5 px-4 bg-none border-none rounded-sm coding-regular text-sm text-primary-blue cursor-pointer transition-all duration-200 hover:opacity-70"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
            >
              <TagIcon className="w-4 h-4" />
              <span>{selectedTag ? tags.find(t => t.id === selectedTag)?.name : 'All tasks'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 ml-1">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
            {showTagDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-sm shadow-dropdown z-[100] mt-2 animate-scaleIn overflow-hidden">
                <button
                  className={cn(
                    "flex items-center gap-2 w-full py-3 px-4 border-none bg-transparent text-sm text-text-dark cursor-pointer transition-colors text-left hover:bg-primary-blue-light",
                    !selectedTag && "bg-primary-blue-light text-primary-blue"
                  )}
                  onClick={() => { setSelectedTag(null); setShowTagDropdown(false); }}
                >
                  All tasks
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={cn(
                      "flex items-center gap-2 w-full py-3 px-4 border-none bg-transparent text-sm text-text-dark cursor-pointer transition-colors text-left hover:bg-primary-blue-light",
                      selectedTag === tag.id && "bg-primary-blue-light text-primary-blue"
                    )}
                    onClick={() => { setSelectedTag(tag.id); setShowTagDropdown(false); }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: tag.color }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto">
          {([
            { key: 'today' as TimeRange, label: 'Today' },
            { key: '7d' as TimeRange, label: '7d' },
            { key: '4w' as TimeRange, label: '4w' },
            { key: '12mo' as TimeRange, label: '12mo' },
          ]).map(tab => (
            <button
              key={tab.key}
              className={cn(
                "py-2 sm:py-2.5 px-3 sm:px-4 rounded-sm border-none bg-transparent coding-regular text-xs sm:text-sm text-text-muted cursor-pointer transition-all duration-200 hover:bg-primary-blue-light whitespace-nowrap",
                timeRange === tab.key && "bg-primary-blue-light text-primary-blue"
              )}
              onClick={() => setTimeRange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-5 shadow-card mb-3 sm:mb-4 transition-all duration-300 hover:shadow-card-hover text-center">
          <h3 className="sans-bold text-base sm:text-lg mb-1">Task distribution</h3>
          <p className="text-xs text-text-muted tracking-[1px] mb-4 sm:mb-5">{dateLabel}</p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-5">
            <DonutChart data={taskDistribution} size={100} strokeWidth={16} />
            <div className="text-left">
              <p className="sans-bold text-base sm:text-lg text-text-dark mb-2 sm:mb-3">{formatDuration(totalTime)} total</p>
              <div className="flex flex-col gap-2">
                {taskDistribution.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-text-dark">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span>{item.name} • {formatDuration(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            className="flex items-center justify-center gap-2 w-full py-3 bg-transparent border-none border-t border-primary-blue-light mt-4 pt-4 sans-bold text-xs tracking-[1px] text-primary-blue cursor-pointer hover:underline"
            onClick={() => setShowManageTasks(true)}
          >
            <TagIcon className="w-4 h-4" />
            MANAGE TASKS
          </button>
        </div>

        <div className="mt-4 sm:mt-6 mb-4 sm:mb-5">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="sans-bold text-base sm:text-lg">Sessions {timeRange === 'today' ? 'today' : ''}</h3>
              <span className="text-xs text-text-muted tracking-[1px]">{dateLabel}</span>
            </div>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border border-dashed border-text-muted/20 bg-transparent text-text-muted/50 hover:border-text-muted/40 hover:text-text-muted [&_svg]:w-5 [&_svg]:h-5"
              onClick={() => {
                setMissedTimeDate(new Date())
                setShowAddMissedTime(true)
              }}
              title="Add missed time"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredSessions.length === 0 ? (
              <p className="text-center text-text-muted py-8 text-sm">No sessions yet</p>
            ) : (
              filteredSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-white rounded-md shadow-card transition-all duration-300 hover:shadow-card-hover flex items-center justify-between p-4 cursor-pointer animate-slideUp hover:translate-x-1"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-muted tracking-[0.5px]">
                      {formatDate(session.startTime)} {formatTime(session.startTime)}-{formatTime(session.endTime!)}
                    </span>
                    <div className="flex items-center gap-2 sans-regular text-sm">
                      <TagIcon color={session.tag.color} className="w-4 h-4" />
                      <span>{session.tag.name}</span>
                      <span className="text-text-muted font-normal">• {formatDuration(session.focusTime)}</span>
                    </div>
                  </div>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manage Tasks Modal */}
      {showManageTasks && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000] animate-fadeIn backdrop-blur-[2px]" onClick={() => { setShowManageTasks(false); cancelEditTag(); }}>
          <div className="bg-cream rounded-2xl w-[90%] max-w-[340px] max-h-[80%] overflow-hidden animate-modal shadow-dropdown" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 bg-white rounded-t-2xl">
              <h2 className="serif-bold text-xl">
                <span className="serif-regular italic">manage</span> tasks
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted rounded-lg transition-all duration-200 hover:text-text-dark [&_svg]:w-5 [&_svg]:h-5"
                onClick={() => { setShowManageTasks(false); cancelEditTag(); }}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[400px]">
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="serif-regular italic text-text-muted text-sm mb-3">add a new task</p>
                <input
                  type="text"
                  placeholder="tag name"
                  value={newTagName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                  onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddTag()}
                  className="w-full py-2.5 px-3 border border-text-muted/20 rounded-lg text-sm sans-regular outline-none mb-3 transition-colors focus:border-primary-blue/40 bg-cream"
                />
                <div className="flex gap-2 mb-4">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={cn(
                        "w-7 h-7 rounded-full border-[3px] border-transparent cursor-pointer transition-all duration-200 hover:scale-110",
                        newTagColor === color && "border-text-dark/30 scale-110"
                      )}
                      style={{ background: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full coding-regular text-xs border-[1.5px] cursor-pointer transition-all duration-300 bg-primary-blue/70 border-primary-blue/70 text-white hover:bg-primary-blue hover:border-primary-blue hover:-translate-y-px active:translate-y-0 w-full [&_svg]:w-4 [&_svg]:h-4"
                  onClick={handleAddTag}
                >
                  <PlusIcon /> add tag
                </button>
              </div>

              <p className="serif-regular italic text-text-muted text-sm mb-3">your tasks</p>
              <div className="flex flex-col gap-2">
                {tags.map(tag => (
                  <div key={tag.id} className="bg-white rounded-xl transition-all duration-200">
                    {editingTagId === tag.id ? (
                      // Edit mode
                      <div className="p-4 animate-fadeIn">
                        <input
                          type="text"
                          value={editTagName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditTagName(e.target.value)}
                          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && saveEditTag()}
                          autoFocus
                          className="w-full py-2 px-3 border border-text-muted/20 rounded-lg text-sm sans-regular outline-none mb-3 transition-colors focus:border-primary-blue/40 bg-cream"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {colors.map(color => (
                              <button
                                key={color}
                                className={cn(
                                  "w-6 h-6 rounded-full border-[3px] border-transparent cursor-pointer transition-all duration-200 hover:scale-110",
                                  editTagColor === color && "border-text-dark/30 scale-110"
                                )}
                                style={{ background: color }}
                                onClick={() => setEditTagColor(color)}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1.5 bg-transparent border border-text-muted/20 rounded-full coding-regular text-xs text-text-muted cursor-pointer hover:border-text-muted/40 transition-colors"
                              onClick={cancelEditTag}
                            >
                              cancel
                            </button>
                            <button
                              className="px-3 py-1.5 bg-primary-blue/70 border-none rounded-full coding-regular text-xs text-white cursor-pointer hover:bg-primary-blue transition-colors"
                              onClick={saveEditTag}
                            >
                              save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center gap-3 py-3 px-4">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tag.color }} />
                        <span className="flex-1 sans-regular text-sm">{tag.name}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted/40 rounded-md transition-all duration-200 hover:text-primary-blue [&_svg]:w-4 [&_svg]:h-4"
                          onClick={() => startEditTag(tag)}
                        >
                          <EditIcon />
                        </button>
                        {onDeleteTag && (
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted/40 rounded-md transition-all duration-200 hover:text-accent-red [&_svg]:w-4 [&_svg]:h-4"
                            onClick={() => onDeleteTag(tag.id)}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        sessions={sessions}
        onAddMissedTime={(date: Date) => {
          setShowCalendar(false)
          setMissedTimeDate(date)
          setShowAddMissedTime(true)
        }}
      />

      {/* Add Missed Time Modal */}
      {showAddMissedTime && (
        <div className="modal-overlay" onClick={() => setShowAddMissedTime(false)}>
          <div ref={addMissedTimeRef} className="modal max-h-[90%] overflow-y-auto" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <AddMissedTime
              tags={tags}
              onClose={() => setShowAddMissedTime(false)}
              onSave={(session: Session) => {
                onAddSession && onAddSession(session)
                setShowAddMissedTime(false)
              }}
              onAddTag={onAddTag}
              selectedDate={missedTimeDate}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-fadeIn" onClick={() => setShowDeleteModal(false)}>
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
                    if (sessionToDelete) {
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
    </div>
  )
}

export default Stats
