import { useState, ChangeEvent } from 'react'
import { CloseIcon, ClockIcon, StopwatchIcon, TagIcon, PlusIcon, PlayIcon } from './Icons'
import { cn } from '../lib/utils'
import type { Tag } from '../types'

interface StartSessionProps {
  tags: Tag[]
  selectedTag: Tag | null
  onSelectTag: (tag: Tag) => void
  timerMode: 'stopwatch' | 'countdown'
  onSetTimerMode: (mode: 'stopwatch' | 'countdown') => void
  countdownMinutes: number
  onSetCountdownMinutes: (minutes: number) => void
  onStart: () => void
  onClose: () => void
  onAddTag: (name: string, color: string) => void
}

const StartSession = ({
  tags,
  selectedTag,
  onSelectTag,
  timerMode,
  onSetTimerMode,
  countdownMinutes,
  onSetCountdownMinutes,
  onStart,
  onClose,
  onAddTag,
}: StartSessionProps) => {
  const [showAddTag, setShowAddTag] = useState<boolean>(false)
  const [newTagName, setNewTagName] = useState<string>('')
  const [newTagColor, setNewTagColor] = useState<string>('#F6AD55')

  const colors = ['#F6AD55', '#4FD1C5', '#4B6EF5', '#48BB78', '#FC8181', '#F687B3', '#9F7AEA']

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setShowAddTag(false)
    }
  }

  const countdownOptions = [15, 25, 30, 45, 60, 90]

  return (
    <div className="min-h-extension flex flex-col animate-fadeIn">
      <header className="flex items-center justify-between px-5 py-4 animate-slideDown">
        <button className="close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2 className="font-sans text-xl font-bold">
          <span className="italic font-normal">Start</span> working
        </h2>
        <div style={{ width: 40 }} />
      </header>

      <div className="container">
        <div className="toggle-container">
          <button
            className={cn("toggle-option", timerMode === 'countdown' && "active")}
            onClick={() => onSetTimerMode('countdown')}
          >
            <ClockIcon className="w-5 h-5" />
          </button>
          <button
            className={cn("toggle-option", timerMode === 'stopwatch' && "active")}
            onClick={() => onSetTimerMode('stopwatch')}
          >
            <StopwatchIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center my-6">
          <h3 className="text-lg font-semibold mb-1">{timerMode === 'stopwatch' ? 'Stopwatch timer' : 'Countdown timer'}</h3>
          <p className="text-text-muted text-sm">{timerMode === 'stopwatch' ? 'Work until your task is done' : `Focus for ${countdownMinutes} minutes`}</p>
        </div>

        {timerMode === 'countdown' && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {countdownOptions.map((mins, i) => (
              <button
                key={mins}
                className={cn(
                  "py-2 px-4 rounded-full border-2 border-primary-blue-light bg-transparent text-sm text-text-dark cursor-pointer transition-all duration-200 animate-scaleIn hover:border-primary-blue active:scale-95",
                  countdownMinutes === mins && "bg-primary-blue border-primary-blue text-white"
                )}
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                onClick={() => onSetCountdownMinutes(mins)}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-sans text-lg font-bold mb-1">Task goal</h3>
          <p className="font-sans italic text-text-muted text-sm mb-4">Track how you spend your time</p>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-full text-sm font-medium bg-white border-2 border-dashed border-primary-blue-light cursor-pointer transition-all duration-200 hover:border-primary-blue"
              onClick={() => setShowAddTag(true)}
            >
              <PlusIcon className="w-[18px] h-[18px] text-text-muted" />
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={cn(
                  "inline-flex items-center gap-1.5 py-2.5 px-4 rounded-full text-sm font-medium bg-primary-blue-light text-text-dark cursor-pointer transition-all duration-200 border-2 border-transparent",
                  selectedTag?.id === tag.id ? "bg-white" : "hover:border-current"
                )}
                onClick={() => onSelectTag(tag)}
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
              className="w-full px-4 py-3 border-2 border-primary-blue-light rounded-sm text-sm outline-none mb-3 focus:border-primary-blue"
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

        <button
          className={cn(
            "w-20 h-20 rounded-full bg-white border-4 border-primary-blue flex items-center justify-center mx-auto mt-8 cursor-pointer transition-all duration-200 animate-bounceIn [&_svg]:w-8 [&_svg]:h-8 [&_svg]:text-primary-blue [&_svg]:ml-1",
            selectedTag ? "hover:bg-primary-blue hover:scale-105 hover:[&_svg]:text-white active:scale-95" : "opacity-50 cursor-not-allowed border-text-muted [&_svg]:text-text-muted"
          )}
          style={{ animationDelay: '0.3s' }}
          onClick={onStart}
          disabled={!selectedTag}
        >
          <PlayIcon />
        </button>
      </div>
    </div>
  )
}

export default StartSession
