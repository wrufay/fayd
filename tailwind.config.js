/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4B6EF5',
        'primary-blue-light': '#E8EDFF',
        'primary-blue-dark': '#3D5BD9',
        'background': '#F5F7FF',
        'background-card': '#FFFFFF',
        'text-dark': '#2D3748',
        'text-muted': '#718096',
        'accent-orange': '#F6AD55',
        'accent-green': '#48BB78',
        'accent-red': '#FC8181',
        'accent-pink': '#F687B3',
        'accent-teal': '#4FD1C5',
      },
      fontFamily: {
        'serif': ['Libre Baskerville', 'Georgia', 'serif'],
        'sans': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(75, 110, 245, 0.15)',
        'card-hover': '0 12px 32px rgba(75, 110, 245, 0.4)',
        'button': '0 4px 12px rgba(75, 110, 245, 0.3)',
        'dropdown': '0 8px 24px rgba(0, 0, 0, 0.15)',
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
          '0%': { opacity: '0', transform: 'scale(0.9)' },
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
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

