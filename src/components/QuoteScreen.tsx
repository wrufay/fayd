import { useState } from 'react'
import { QuoteIcon } from './Icons'
import type { Tag, Quote } from '../types'

const quotes: Quote[] = [
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

interface QuoteScreenProps {
  tag: Tag | null
  timerMode: 'stopwatch' | 'countdown'
}

const QuoteScreen = ({ tag, timerMode }: QuoteScreenProps) => {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  return (
    <div className="min-h-extension flex flex-col justify-center items-center px-[30px] py-10 text-center animate-fadeIn-slow">
      <div className="flex-1 flex flex-col justify-center items-center max-w-[320px]">
        <QuoteIcon className="w-10 h-10 text-primary-blue mb-6 opacity-60 animate-bounceIn-fast" />
        <p className="font-sans text-xl italic leading-relaxed text-text-dark mb-4 animate-fadeIn-delay">
          {quote.text}
        </p>
        <p className="font-sans text-base text-primary-blue font-medium" style={{ animation: 'fadeIn 0.6s ease-out 0.4s both' }}>
          — {quote.author}
        </p>
      </div>

      <div className="py-10" style={{ animation: 'slideUp 0.5s ease-out 0.6s both' }}>
        <div className="w-8 h-8 border-[3px] border-primary-blue-light border-t-primary-blue rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-text-dark mb-4">Starting #{tag?.name} {timerMode}...</p>
        <button className="bg-transparent border-none text-text-muted text-sm font-semibold tracking-wide cursor-pointer underline hover:text-text-dark transition-colors">
          CANCEL
        </button>
      </div>
    </div>
  )
}

export default QuoteScreen
