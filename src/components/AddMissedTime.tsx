import { useState, useMemo, ChangeEvent } from 'react'
import { CloseIcon, TagIcon, PlusIcon } from './Icons'
import { cn } from '../lib/utils'
import type { Tag, Session } from '../types'

interface AddMissedTimeProps {
  tags: Tag[]
  onClose: () => void
  onSave: (session: Session) => void
  onAddTag: (name: string, color: string) => void
  selectedDate?: Date
}

const AddMissedTime = ({
  tags,
  onClose,
  onSave,
  onAddTag,
  selectedDate = new Date(),
}: AddMissedTimeProps) => {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('10:00')
  const [showAddTag, setShowAddTag] = useState<boolean>(false)
  const [newTagName, setNewTagName] = useState<string>('')
  const [newTagColor, setNewTagColor] = useState<string>('#ef5f33')

  const colors = ['#ef5f33', '#f1c40f', '#4FD1C5', '#48BB78', '#0466c8', '#F687B3', '#9F7AEA']

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calculate duration from start and end times
  const duration = useMemo(() => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    const diff = endMinutes - startMinutes
    return diff > 0 ? diff : 0
  }, [startTime, endTime])

  const formatDuration = (mins: number): string => {
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setShowAddTag(false)
    }
  }

  const handleSave = () => {
    if (!selectedTag || duration <= 0) return

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(startHour, startMin, 0, 0)

    const endDateTime = new Date(selectedDate)
    endDateTime.setHours(endHour, endMin, 0, 0)

    const durationMs = duration * 60 * 1000

    const session: Session = {
      id: Date.now().toString(),
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      focusTime: durationMs,
      breakTime: 0,
      tag: selectedTag,
      timerMode: 'stopwatch',
      countdownMinutes: null,
    }

    onSave(session)
    onClose()
  }

  const canSave = selectedTag && duration > 0

  return (
    <div className="min-h-extension flex flex-col animate-fadeIn">
      <header className="flex items-center justify-between px-5 py-4 animate-slideDown">
        <button className="close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-xl font-bold">
            <span className="italic font-normal">Add</span> missed time
          </h2>
          <p className="font-sans text-xs text-text-muted mt-0.5">On {formatDate(selectedDate)}</p>
        </div>
        <div style={{ width: 40 }} />
      </header>

      <div className="container pt-2">
        <div className="mt-0 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-serif text-lg font-bold mb-1">Task goal</h3>
          <p className="font-serif italic text-text-muted text-base mb-4">track how you spend your time</p>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-full text-sm font-medium bg-white border-2 border-dashed border-cream-dark cursor-pointer transition-all duration-200 hover:border-primary"
              onClick={() => setShowAddTag(true)}
            >
              <PlusIcon className="w-[18px] h-[18px] text-text-muted" />
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={cn(
                  "inline-flex items-center gap-1.5 py-2.5 px-4 rounded-full text-sm font-medium bg-cream-dark text-text-dark cursor-pointer transition-all duration-200 border-2 border-transparent",
                  selectedTag?.id === tag.id ? "bg-white" : "hover:border-current"
                )}
                onClick={() => setSelectedTag(tag)}
                style={{ borderColor: selectedTag?.id === tag.id ? tag.color : undefined }}
              >
                <TagIcon className="w-4 h-4" color={tag.color} />
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        </div>

        {showAddTag && (
          <div className="card mt-4 animate-slideUp">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 border-2 border-cream-dark rounded-sm text-sm outline-none mb-3 focus:border-primary"
            />
            <div className="flex gap-2 mb-4">
              {colors.map(color => (
                <button
                  key={color}
                  className={cn(
                    "w-7 h-7 rounded-full border-[3px] border-transparent cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-90",
                    newTagColor === color && "border-text-dark animate-scaleIn"
                  )}
                  style={{ background: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary py-2.5 px-5 text-sm" onClick={() => setShowAddTag(false)}>
                Cancel
              </button>
              <button className="btn btn-primary py-2.5 px-5 text-sm" onClick={handleAddTag}>
                Add
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-serif text-lg font-bold mb-4">Time range</h3>

          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-text-muted uppercase tracking-[1px]">From</label>
              <input
                type="time"
                value={startTime}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                className="px-4 py-3 border-2 border-cream-dark rounded-sm text-base font-medium text-text-dark outline-none focus:border-primary transition-colors bg-white text-center"
              />
            </div>

            <span className="text-text-muted mt-6">→</span>

            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-text-muted uppercase tracking-[1px]">To</label>
              <input
                type="time"
                value={endTime}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                className="px-4 py-3 border-2 border-cream-dark rounded-sm text-base font-medium text-text-dark outline-none focus:border-primary transition-colors bg-white text-center"
              />
            </div>
          </div>

          {duration > 0 && (
            <p className="text-center mt-4 text-sm text-text-muted animate-fadeIn">
              Duration: <span className="font-semibold text-primary">{formatDuration(duration)}</span>
            </p>
          )}
          {duration <= 0 && startTime && endTime && (
            <p className="text-center mt-4 text-sm text-accent-red animate-fadeIn">
              End time must be after start time
            </p>
          )}
        </div>

        <button
          className={cn(
            "btn btn-primary mt-8 w-full py-4 text-base animate-slideUp",
            !canSave && "opacity-50 cursor-not-allowed"
          )}
          style={{ animationDelay: '0.3s' }}
          onClick={handleSave}
          disabled={!canSave}
        >
          SAVE SESSION
        </button>
      </div>
    </div>
  )
}

export default AddMissedTime
