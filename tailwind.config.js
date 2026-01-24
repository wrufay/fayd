/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core colors
        'blue': '#0466c8',
        'crimson': '#ef5f33',
        'yellow': '#f1c40f',
        // Neutrals
        'cream': '#FFFDF8',
        'cream-dark': '#FAF7F2',
        'white': '#FFFFFF',
        'text-dark': '#3D3D3D',
        'text-muted': '#9CA3AF',
        'border': '#E8E4DE',
        // Aliases for compatibility
        'primary': '#ef5f33',
        'primary-light': '#FFF8F0',
        'primary-dark': '#d94e25',
        'primary-blue': '#0466c8',
        'primary-blue-light': '#E8F2FC',
        'accent-yellow': '#f1c40f',
        'accent-yellow-light': '#FEF9E7',
      },
      fontFamily: {
        'serif': ['Nanum Myeongjo', 'Georgia', 'serif'],
        'pen': ['Nanum Pen Script', 'cursive'],
        'sans': ['Nanum Gothic', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Nanum Gothic Coding', 'monospace'],
        'coding': ['Nanum Gothic Coding', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '20px',
        'sm': '12px',
        'lg': '24px',
        'xl': '28px',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 30px rgba(0, 0, 0, 0.06)',
        'button': '0 4px 12px rgba(239, 95, 51, 0.2)',
        'dropdown': '0 10px 50px rgba(0, 0, 0, 0.1)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      width: {
        'extension': '380px',
      },
      minHeight: {
        'extension': '500px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-out',
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
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
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
          '50%': { transform: 'scale(1.02)' },
          '70%': { transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
