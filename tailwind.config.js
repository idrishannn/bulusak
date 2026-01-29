/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 40px rgba(245, 158, 11, 0.15)',
        'glow-lg': '0 0 60px rgba(249, 115, 22, 0.2)',
      },
      animation: {
        'float-1': 'float1 20s infinite linear',
        'float-2': 'float2 15s infinite linear',
        'float-3': 'float3 18s infinite linear',
        'pulse-glow': 'pulse-glow 2s infinite',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(100px, -50px) scale(1.2)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-80px, 80px) scale(1.3)' },
        },
        float3: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(60px, 60px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0px rgba(249, 115, 22, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(249, 115, 22, 0)' },
        },
        'bounce-in': {
          '0%': { transform: 'translate(-50%, -100px)', opacity: '0' },
          '50%': { transform: 'translate(-50%, 10px)' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
