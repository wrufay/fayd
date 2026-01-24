import { HomeIcon, StatsIcon } from './Icons'
import { cn } from '../lib/utils'
import type { ViewType } from '../types'

interface NavigationProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const Navigation = ({ activeView, onNavigate }: NavigationProps) => {
  return (
    <nav className="flex justify-around py-2 sm:py-3 px-3 sm:px-5 bg-white border-t border-border fixed bottom-0 left-0 right-0 w-full z-[100]">
      <button
        className={cn(
          "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 border-none bg-transparent cursor-pointer text-text-muted coding-regular text-[10px] sm:text-[11px] transition-all duration-300 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-[22px] sm:[&_svg]:h-[22px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-translate-y-0.5 active:scale-95",
          activeView === 'home' && "text-blue"
        )}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon />
        <span>home</span>
      </button>
      <button
        className={cn(
          "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 border-none bg-transparent cursor-pointer text-text-muted coding-regular text-[10px] sm:text-[11px] transition-all duration-300 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-[22px] sm:[&_svg]:h-[22px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-translate-y-0.5 active:scale-95",
          activeView === 'stats' && "text-blue"
        )}
        onClick={() => onNavigate('stats')}
      >
        <StatsIcon />
        <span>stats</span>
      </button>
    </nav>
  )
}

export default Navigation
