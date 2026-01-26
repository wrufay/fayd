import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, StatsIcon } from './Icons'
import { cn } from '../lib/utils'
import QuickLinksWidget from './QuickLinksWidget'

const Navigation = () => {
  const location = useLocation()
  const activeView = location.pathname === '/stats' ? 'stats' : 'home'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      {/* Quick Links - Only show on home, floating without background */}
      {activeView === 'home' && (
        <QuickLinksWidget className="py-3" />
      )}

      {/* Navigation - with white background */}
      <nav className="flex justify-around py-2 sm:py-3 px-3 sm:px-5 bg-white border-t border-border">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 border-none bg-transparent cursor-pointer text-text-muted coding-regular text-[10px] sm:text-[11px] transition-all duration-300 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-[22px] sm:[&_svg]:h-[22px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-translate-y-0.5 active:scale-95 no-underline",
            activeView === 'home' && "text-blue"
          )}
        >
          <HomeIcon />
          <span>home</span>
        </Link>
        <Link
          to="/stats"
          className={cn(
            "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 border-none bg-transparent cursor-pointer text-text-muted coding-regular text-[10px] sm:text-[11px] transition-all duration-300 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-[22px] sm:[&_svg]:h-[22px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-translate-y-0.5 active:scale-95 no-underline",
            activeView === 'stats' && "text-blue"
          )}
        >
          <StatsIcon />
          <span>stats</span>
        </Link>
      </nav>
    </div>
  )
}

export default Navigation
