/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fayd warm color palette
        'cream': '#FDF8F3',
        'cream-dark': '#F5EDE4',
        'warm-white': '#FFFBF8',
        'primary': '#ef5f33', // crimson/coral
        'primary-light': '#FFF0EB',
        'primary-dark': '#d94e25',
        'secondary': '#0466c8', // aritzia blue
        'secondary-light': '#E8F2FC',
        'accent-yellow': '#f1c40f',
        'accent-yellow-light': '#FEF9E7',
        'text-dark': '#3D3D3D',
        'text-muted': '#7A7A7A',
        'text-light': '#A3A3A3',
        'accent-green': '#48BB78',
        'accent-red': '#E74C3C',
        'accent-teal': '#4FD1C5',
        'accent-pink': '#F687B3',
        'accent-orange': '#F6AD55',
        // Keep legacy color names for compatibility during transition
        'primary-blue': '#ef5f33',
        'primary-blue-light': '#FFF0EB',
        'primary-blue-dark': '#d94e25',
        'background': '#FDF8F3',
        'background-card': '#FFFFFF',
      },
      fontFamily: {
        'serif': ['Nanum Myeongjo', 'Libre Baskerville', 'Georgia', 'serif'],
        'pen': ['Nanum Pen Script', 'cursive'],
        'sans': ['Nanum Gothic', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['Nanum Gothic Coding', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '16px',
        'sm': '8px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(61, 61, 61, 0.08)',
        'card-hover': '0 8px 32px rgba(61, 61, 61, 0.12)',
        'button': '0 4px 12px rgba(239, 95, 51, 0.25)',
        'dropdown': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'soft': '0 2px 8px rgba(61, 61, 61, 0.06)',
      },
      width: {
        'extension': '380px',
      },
      minHeight: {
        'extension': '500px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'fadeIn-slow': 'fadeIn 0.5s ease-out',
        'fadeIn-delay': 'fadeIn 0.6s ease-out 0.2s both',
        'slideUp': 'slideUp 0.4s ease-out both',
        'slideUp-fast': 'slideUp 0.3s ease-out both',
        'slideUp-delay': 'slideUp 0.5s ease-out 0.2s both',
        'slideDown': 'slideDown 0.4s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out both',
        'scaleIn-slow': 'scaleIn 0.5s ease-out',
        'scaleIn-delay': 'scaleIn 0.4s ease-out 0.3s both',
        'pulse-custom': 'pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slideInRight': 'slideInRight 0.8s ease-out 0.5s both',
        'bounceIn': 'bounceIn 0.5s ease-out 0.3s both',
        'bounceIn-fast': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'modal': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fadeInBounce': 'fadeInBounce 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1.02)' },
        },
        fadeInBounce: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '60%': { opacity: '1', transform: 'translateY(-3px) scale(1.02)' },
          '80%': { transform: 'translateY(1px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
