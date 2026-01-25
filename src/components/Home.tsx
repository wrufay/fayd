import { useMemo, useState, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { storage } from '../lib/platform'
import type { Session, Tag } from '../types'

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

interface WidgetLinks {
  youtube: string
  spotify: string
  notion: string
}

type WidgetType = keyof WidgetLinks

interface HomeProps {
  sessions: Session[]
  tags: Tag[]
  onStartSession: () => void
}

interface WeekDay {
  label: string
  completed: boolean
  isToday: boolean
}

const Home = ({ sessions, tags, onStartSession }: HomeProps) => {
  const { user } = useAuth()
  const today = new Date()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState('')
  const [widgetLinks, setWidgetLinks] = useState<WidgetLinks>({ youtube: '', spotify: '', notion: '' })
  const [editingWidget, setEditingWidget] = useState<WidgetType | null>(null)
  const [editingUrl, setEditingUrl] = useState('')

  // Load todos and widget links from storage on mount
  useEffect(() => {
    storage.get(['todos', 'widgetLinks']).then((result) => {
      if (result.todos) setTodos(result.todos as TodoItem[])
      if (result.widgetLinks) setWidgetLinks(result.widgetLinks as WidgetLinks)
    })
  }, [])

  // Save todos to storage when they change
  useEffect(() => {
    storage.set({ todos })
  }, [todos])

  // Save widget links to storage when they change
  useEffect(() => {
    storage.set({ widgetLinks })
  }, [widgetLinks])

  const addTodo = () => {
    if (!newTodoText.trim() || todos.length >= 5) return
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
    }
    setTodos([...todos, newTodo])
    setNewTodoText('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handleWidgetClick = (type: WidgetType) => {
    if (widgetLinks[type]) {
      window.open(widgetLinks[type], '_blank')
    } else {
      setEditingWidget(type)
      setEditingUrl('')
    }
  }

  const handleWidgetLongPress = (type: WidgetType) => {
    setEditingWidget(type)
    setEditingUrl(widgetLinks[type])
  }

  const saveWidgetLink = () => {
    if (editingWidget) {
      setWidgetLinks(prev => ({ ...prev, [editingWidget]: editingUrl.trim() }))
      setEditingWidget(null)
      setEditingUrl('')
    }
  }

  const clearWidgetLink = () => {
    if (editingWidget) {
      setWidgetLinks(prev => ({ ...prev, [editingWidget]: '' }))
      setEditingWidget(null)
      setEditingUrl('')
    }
  }

  const greeting = useMemo(() => {
    const hour = today.getHours()
    if (hour < 12) return 'good morning'
    if (hour < 17) return 'good afternoon'
    return 'good evening'
  }, [])

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime()
    const todaySessions = sessions.filter(s => s.startTime >= todayStart)

    const totalFocus = todaySessions.reduce((sum, s) => sum + (s.focusTime || 0), 0)
    return {
      focusMinutes: Math.floor(totalFocus / 60000),
      sessionCount: todaySessions.length,
    }
  }, [sessions])

  // Week days
  const weekDays: WeekDay[] = useMemo(() => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const result: WeekDay[] = []
    const todayIdx = today.getDay()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - (todayIdx - i) * dayMs)
      date.setHours(0, 0, 0, 0)
      const dayStart = date.getTime()
      const dayEnd = dayStart + dayMs
      const completed = sessions.some(s => s.startTime >= dayStart && s.startTime < dayEnd)

      result.push({
        label: days[i],
        completed,
        isToday: i === todayIdx,
      })
    }
    return result
  }, [sessions])

  return (
    <div className="p-3 sm:p-5 relative z-[1] animate-fadeIn pb-20">
      <header className="mb-4 sm:mb-6 animate-slideDown">
        <p className="serif-regular text-sm sm:text-base italic text-text-muted mb-1">{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''},</p>
        <h1 className="serif-regular text-lg sm:text-xl text-text-dark">time to <span className="serif-bold">f</span>orget <span className="serif-bold">a</span>bout <span className="serif-bold">y</span>our <span className="serif-bold">d</span>istractions.</h1>
      </header>


      {/* front top container */}
      <div className="bg-white rounded-lg p-3 sm:p-5 shadow-md mb-3 sm:mb-4 transition-all duration-300 hover:shadow-card-hover bg-gradient-to-br from-white to-cream animate-slideUp">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <DonutChart
            data={[{ value: todayStats.focusMinutes, color: '#ef5f33' }]}
            size={80}
            strokeWidth={12}
          />
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-1">today</p>
            <p className="text-xl text-text-dark">
              <strong className="sans-bold">{todayStats.focusMinutes}m</strong>
            </p>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-xs bg-cream animate-scaleIn transition-all duration-200",
                day.completed ? "bg-primary-light text-primary font-bold" : "text-text-muted",
                day.isToday && !day.completed && "border-2 border-primary-light"
              )}
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              {day.completed ? (
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              ) : (
                <span>{day.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        className="bg-white rounded-md p-3 sm:p-5 shadow-md mb-5 sm:mb-6 transition-all duration-300 !bg-primary-blue/70 !text-white border-none cursor-pointer text-left w-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-card-hover active:-translate-y-0.5 active:scale-[0.98] animate-slideUp"
        style={{ animationDelay: '0.2s' }}
        onClick={onStartSession}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="sans-bold text-lg sm:text-xl mb-1 text-white">Start focusing</h3>
            <p className="serif-regular text-sm sm:text-base italic opacity-90 text-white">let's get things done</p>
          </div>
          <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <PlayIcon className="w-5 h-5 ml-[3px] text-white" />
          </div>
        </div>
      </button>

      {/* To-do List */}
      <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col gap-2">
          {todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 group py-1"
            >
              <button
                className={cn(
                  "w-[18px] h-[18px] border-2 rounded-[4px] flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer",
                  todo.completed
                    ? "bg-primary-blue border-primary-blue text-white"
                    : "border-text-muted bg-transparent hover:border-primary-blue"
                )}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
              <span
                className={cn(
                  "flex-1 sans-regular text-sm transition-all duration-200",
                  todo.completed ? "text-text-muted line-through" : "text-text-dark"
                )}
              >
                {todo.text}
              </span>
              <button
                className="w-6 h-6 flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-red transition-all duration-200 cursor-pointer bg-transparent border-none"
                onClick={() => deleteTodo(todo.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {todos.length < 5 && (
            <div className="flex items-center gap-3 py-1">
              <div className="w-[18px] h-[18px] border-2 border-dashed border-text-muted/50 rounded-[4px] flex-shrink-0" />
              <input
                type="text"
                placeholder="Add a task..."
                value={newTodoText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addTodo()}
                className="flex-1 bg-transparent border-none outline-none sans-regular text-sm text-text-dark placeholder:text-text-muted/50"
              />
            </div>
          )}
        </div>

        {todos.length >= 5 && (
          <p className="text-xs text-text-muted mt-2 italic">Maximum 5 tasks</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="flex justify-center gap-4 mt-5 sm:mt-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
        {/* YouTube */}
        <button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-2",
            widgetLinks.youtube
              ? "bg-[#FF0000]/10 border-[#FF0000]/30 hover:bg-[#FF0000]/20"
              : "bg-white border-dashed border-text-muted/30 hover:border-[#FF0000]/50"
          )}
          onClick={() => handleWidgetClick('youtube')}
          onContextMenu={(e) => { e.preventDefault(); handleWidgetLongPress('youtube') }}
        >
          <svg viewBox="0 0 24 24" fill={widgetLinks.youtube ? "#FF0000" : "#9ca3af"} className="w-6 h-6">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </button>

        {/* Spotify */}
        <button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-2",
            widgetLinks.spotify
              ? "bg-[#1DB954]/10 border-[#1DB954]/30 hover:bg-[#1DB954]/20"
              : "bg-white border-dashed border-text-muted/30 hover:border-[#1DB954]/50"
          )}
          onClick={() => handleWidgetClick('spotify')}
          onContextMenu={(e) => { e.preventDefault(); handleWidgetLongPress('spotify') }}
        >
          <svg viewBox="0 0 24 24" fill={widgetLinks.spotify ? "#1DB954" : "#9ca3af"} className="w-6 h-6">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </button>

        {/* Notion */}
        <button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-2",
            widgetLinks.notion
              ? "bg-text-dark/10 border-text-dark/30 hover:bg-text-dark/20"
              : "bg-white border-dashed border-text-muted/30 hover:border-text-dark/50"
          )}
          onClick={() => handleWidgetClick('notion')}
          onContextMenu={(e) => { e.preventDefault(); handleWidgetLongPress('notion') }}
        >
          <svg viewBox="0 0 24 24" fill={widgetLinks.notion ? "#000000" : "#9ca3af"} className="w-6 h-6">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
          </svg>
        </button>
      </div>

      {/* Edit Widget Modal */}
      {editingWidget && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-fadeIn p-4" onClick={() => setEditingWidget(null)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-[300px] animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h3 className="sans-bold text-lg text-text-dark mb-3 capitalize">{editingWidget} Link</h3>
            <input
              type="url"
              placeholder={`Paste ${editingWidget} URL...`}
              value={editingUrl}
              onChange={(e) => setEditingUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveWidgetLink()}
              className="w-full px-3 py-2 border border-text-muted/30 rounded-lg sans-regular text-sm text-text-dark placeholder:text-text-muted/50 outline-none focus:border-primary-blue mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              {widgetLinks[editingWidget] && (
                <button
                  className="flex-1 py-2 px-3 bg-accent-red/10 text-accent-red rounded-lg sans-bold text-sm hover:bg-accent-red/20 transition-colors"
                  onClick={clearWidgetLink}
                >
                  Clear
                </button>
              )}
              <button
                className="flex-1 py-2 px-3 bg-primary-blue text-white rounded-lg sans-bold text-sm hover:bg-primary-blue/90 transition-colors"
                onClick={saveWidgetLink}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
