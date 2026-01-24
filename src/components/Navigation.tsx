import { HomeIcon, StatsIcon } from './Icons'
import { cn } from '../lib/utils'
import type { ViewType } from '../types'

interface NavigationProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const Navigation = ({ activeView, onNavigate }: NavigationProps) => {
  return (
    <nav className="nav">
      <button
        className={cn("nav-item", activeView === 'home' && "active")}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon />
        <span>home</span>
      </button>
      <button
        className={cn("nav-item", activeView === 'stats' && "active")}
        onClick={() => onNavigate('stats')}
      >
        <StatsIcon />
        <span>stats</span>
      </button>
    </nav>
  )
}

export default Navigation
