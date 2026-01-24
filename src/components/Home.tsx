import { useMemo } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon, FireIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import type { Session, Tag } from '../types'

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
        // Today hasn't had a session yet, that's okay
        checkDate = new Date(checkDate.getTime() - dayMs)
      } else {
        break
      }
    }
    return count
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
    <div className="container pb-20">
      <header className="mb-6 animate-slideDown">
        <p className="font-serif text-base italic text-text-muted mb-1">{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''},</p>
        <h1 className="font-serif text-xl font-normal text-text-dark">time to <span className="font-bold">f</span>orget <span className="font-bold">a</span>bout <span className="font-bold">y</span>our <span className="font-bold">d</span>istractions.</h1>
      </header>

      <div className="card bg-gradient-to-br from-white to-cream animate-slideUp">
        <div className="flex items-center gap-4 mb-5">
          <DonutChart
            data={[{ value: todayStats.focusMinutes, color: '#ef5f33' }]}
            size={80}
            strokeWidth={12}
          />
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-1">today</p>
            <p className="text-xl text-text-dark">
              <strong className="font-semibold">{todayStats.focusMinutes}m</strong>
            </p>
          </div>
          <div className="flex items-center gap-1 bg-accent-yellow-light px-3 py-2 rounded-full text-sm font-semibold text-text-dark animate-scaleIn" style={{ animationDelay: '0.3s' }}>
            <span>{streak}d</span>
            <FireIcon className="w-4 h-4 text-accent-yellow animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between gap-2">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full text-xs bg-cream animate-scaleIn transition-all duration-200",
                day.completed ? "bg-primary text-white" : "text-text-muted",
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
        className="card !bg-gradient-to-br from-primary to-[#f57c54] !text-white border-none cursor-pointer text-left w-full transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-card-hover active:-translate-y-0.5 active:scale-[0.98] animate-slideUp"
        style={{ animationDelay: '0.2s' }}
        onClick={onStartSession}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans text-xl font-bold mb-1 text-white">Start focusing</h3>
            <p className="font-serif text-base italic opacity-90 text-white">let's get things done</p>
          </div>
          <div className="w-[50px] h-[50px] bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <PlayIcon className="w-5 h-5 ml-[3px] text-white" />
          </div>
        </div>
      </button>
    </div>
  )
}

export default Home
