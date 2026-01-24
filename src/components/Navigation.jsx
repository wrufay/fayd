import React from 'react'
import { HomeIcon, StatsIcon } from './Icons'

const Navigation = ({ activeView, onNavigate }) => {
  return (
    <nav className="nav">
      <button
        className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon />
        <span>home</span>
      </button>
      <button
        className={`nav-item ${activeView === 'stats' ? 'active' : ''}`}
        onClick={() => onNavigate('stats')}
      >
        <StatsIcon />
        <span>stats</span>
      </button>
    </nav>
  )
}

export default Navigation
