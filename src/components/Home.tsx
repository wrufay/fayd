import { useMemo } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon, FireIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import type { Session, Tag } from '../types'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

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
  const { user, login, logout } = useAuth()
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
      <header className="flex justify-between items-start mb-6 animate-slideDown">
        <div>
          <p className="font-pen text-xl text-text-muted mb-1">{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}</p>
          <h1 className="font-serif text-[28px] font-bold text-text-dark">Fayd</h1>
        </div>
        {user ? (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-dark rounded-full font-sans text-[13px] font-medium text-text-dark cursor-pointer transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            onClick={logout}
          >
            <span>Log out</span>
          </button>
        ) : (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-dark rounded-full font-sans text-[13px] font-medium text-text-dark cursor-pointer transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            onClick={login}
          >
            <GoogleIcon />
            <span>Sign in</span>
          </button>
        )}
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
            <p className="font-pen text-lg opacity-90 text-white">let's get things done</p>
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
