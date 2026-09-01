import { useMemo } from 'react'
import DonutChart from './DonutChart'
import { PlayIcon } from './Icons'
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

// GitHub-style contribution graph component (10 weeks)
const ContributionGraph = ({ sessions }: { sessions: Session[] }) => {
  const contributionData = useMemo(() => {
    const weeks = 8
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const currentDayOfWeek = today.getDay()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (weeks * 7) + (7 - currentDayOfWeek))

    // Sum focus time per day (in minutes)
    const focusTimePerDay: Map<string, number> = new Map()
    sessions.forEach(session => {
      const date = new Date(session.startTime)
      date.setHours(0, 0, 0, 0)
      const key = date.toISOString().split('T')[0]
      const minutes = Math.floor((session.focusTime || 0) / 60000)
      focusTimePerDay.set(key, (focusTimePerDay.get(key) || 0) + minutes)
    })

    // Find max time for scaling
    let maxTime = 0
    focusTimePerDay.forEach(time => {
      if (time > maxTime) maxTime = time
    })

    // Generate grid data (weeks as columns, days as rows)
    const grid: { date: Date; minutes: number; level: number }[][] = []
    const currentDate = new Date(startDate)

    for (let week = 0; week < weeks; week++) {
      const weekData: { date: Date; minutes: number; level: number }[] = []
      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split('T')[0]
        const minutes = focusTimePerDay.get(dateKey) || 0
        let level = 0
        if (minutes > 0 && maxTime > 0) {
          level = Math.min(4, Math.ceil((minutes / maxTime) * 4))
        }
        weekData.push({ date: new Date(currentDate), minutes, level })
        currentDate.setDate(currentDate.getDate() + 1)
      }
      grid.push(weekData)
    }

    // Get month labels
    const months: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    grid.forEach((week, weekIndex) => {
      const month = week[0].date.getMonth()
      if (month !== lastMonth) {
        months.push({
          label: week[0].date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex
        })
        lastMonth = month
      }
    })

    return { grid, months }
  }, [sessions])

  const getLevelColor = (level: number): string => {
    const opacities = [0.1, 0.3, 0.5, 0.7, 0.9]
    return `rgba(4, 102, 200, ${opacities[level]})`
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Month labels */}
      <div className="flex mb-1">
        {contributionData.months.map((month, i) => (
          <span
            key={i}
            className="text-[10px] text-text-muted"
            style={{
              marginLeft: i === 0 ? 0 : `${(month.weekIndex - (contributionData.months[i-1]?.weekIndex || 0)) * 11 - 20}px`,
              minWidth: '20px'
            }}
          >
            {month.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-[2px]">
        {contributionData.grid.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[2px]">
            {week.map((day, dayIndex) => {
              const hours = Math.floor(day.minutes / 60)
              const mins = day.minutes % 60
              const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
              return (
                <div
                  key={dayIndex}
                  className="w-[8px] h-[8px] rounded-[2px]"
                  style={{ backgroundColor: getLevelColor(day.level) }}
                  title={`${day.date.toLocaleDateString()}: ${timeStr}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = ({ sessions, onStartSession }: HomeProps) => {
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
    <div className="p-3 sm:p-5 relative z-[1] animate-fadeIn pb-32">
      <header className="mb-4 sm:mb-6 animate-slideDown">
        <p className="serif-regular text-sm sm:text-base italic text-text-muted mb-1">{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''},</p>
        <h1 className="serif-regular text-lg sm:text-xl text-text-dark">time to <span className="serif-bold">s</span>top <span className="serif-bold">t</span>hinking <span className="serif-bold">a</span>bout <span className="serif-bold">y</span>our <span className="serif-bold">d</span>istractons.</h1>
      </header>


      {/* front top container */}
      <div className="bg-white rounded-md p-3 sm:p-5 shadow-md mb-3 sm:mb-4 transition-all duration-300 hover:shadow-card-hover bg-gradient-to-br from-white to-cream animate-slideUp">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <DonutChart
            data={[{ value: todayStats.focusMinutes, color: '#0466c8' }]}
            size={80}
            strokeWidth={12}
          />
          <div>
            <p className="text-sm text-text-muted mb-1">today</p>
            <p className="text-xl text-text-dark">
              <strong className="sans-bold">
                {todayStats.focusMinutes >= 60
                  ? `${Math.floor(todayStats.focusMinutes / 60)}h ${todayStats.focusMinutes % 60}m`
                  : `${todayStats.focusMinutes}m`}
              </strong>
            </p>
          </div>
          {/* Contribution graph - right aligned */}
          <div className="ml-auto">
            <ContributionGraph sessions={sessions} />
          </div>
        </div>

        {/* Weekly day indicators */}
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

      {/* note: idk why the scale and translate for both active and hover don't work. i want it to have a moving down interaction like yeah the hovering is just weird lol*/}
      {/* note: on the start working page we could definitely have a cooler interaction animation for the timer/stopwatch change. + everything can be formatted better */}
      <button
        className="rounded-md p-3 sm:p-5 shadow-md mb-5 sm:mb-6 transition-all duration-300 bg-primary-blue/70 text-white border-none cursor-pointer text-left w-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-none active:-translate-y-0.5 active:scale-[0.98] animate-slideUp"
        style={{ animationDelay: '0.2s' }}
        onClick={onStartSession}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="sans-bold text-lg sm:text-xl mb-1 text-white">Start a session</h3>
            <p className="serif-regular text-sm sm:text-base italic opacity-90 text-white">go get things done.</p>
          </div>
          <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <PlayIcon className="w-5 h-5 ml-[3px] text-white" />
          </div>
        </div>
      </button>
    </div>
  )
}

export default Home
