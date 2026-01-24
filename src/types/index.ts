// Tag types
export interface Tag {
  id: string
  name: string
  color: string
}

// Session types
export interface Session {
  id: string
  tag: Tag
  timerMode: 'stopwatch' | 'countdown'
  countdownMinutes: number | null
  startTime: number
  endTime?: number | null
  focusTime: number
  breakTime: number
  isPaused?: boolean
  isOnBreak?: boolean
  lastUpdateTime?: number
}

// User types
export interface User {
  id: string
  name: string
  email: string
  picture?: string
}

// Chart data types
export interface ChartDataItem {
  id?: string
  label?: string
  value: number
  color: string
}

// API types
export interface ApiMethods {
  createTag: (name: string, color: string) => Promise<Tag>
  deleteTag: (tagId: string) => Promise<void>
  createSession: (sessionData: Partial<Session>) => Promise<Session>
  deleteSession: (sessionId: string) => Promise<void>
}

// Auth context types
export interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  getToken: () => string | null
  sessions: Session[]
  tags: Tag[]
  dataLoaded: boolean
  api: ApiMethods
  refreshData: () => Promise<void>
}

// View types
export type ViewType = 'home' | 'startSession' | 'quote' | 'active' | 'summary' | 'stats'

// Icon props
export interface IconProps {
  className?: string
  color?: string
}

// Quote type
export interface Quote {
  text: string
  author: string
}
