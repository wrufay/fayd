import React, { useState, useEffect } from 'react'
import { QuoteIcon } from './Icons'
import './QuoteScreen.css'

const quotes = [
  {
    text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
    author: "Oprah Winfrey"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell"
  },
  {
    text: "Where focus goes, energy flows.",
    author: "Tony Robbins"
  },
]

const QuoteScreen = ({ tag, timerMode }) => {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  return (
    <div className="quote-screen">
      <div className="quote-content">
        <QuoteIcon className="quote-icon" />
        <p className="quote-text">{quote.text}</p>
        <p className="quote-author">— {quote.author}</p>
      </div>

      <div className="loading-section">
        <div className="loading-spinner" />
        <p>Starting #{tag?.name} {timerMode}...</p>
        <button className="cancel-link">CANCEL</button>
      </div>
    </div>
  )
}

export default QuoteScreen
