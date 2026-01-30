module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fdf9e7',
          100: '#faf0c2',
          200: '#f6e489',
          300: '#f0d44e',
          400: '#e8c026',
          500: '#d4af37',
          600: '#b8942d',
          700: '#927326',
          800: '#785d25',
          900: '#654d24',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#1f1f1f',
          800: '#141414',
          900: '#0a0a0a',
          950: '#050505',
        }
      },
      boxShadow: {
        'gold': '0 4px 20px -4px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 40px -8px rgba(212, 175, 55, 0.4)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.2)',
        'inner-gold': 'inset 0 1px 0 rgba(212, 175, 55, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        // FAZ 1 - Yeni animasyonlar (Mevcut kodlar korundu)
        'logo-glow': 'logoGlow 3s ease-in-out infinite',
        'story-ring-rotate': 'storyRingRotate 4s linear infinite',
        'input-focus-glow': 'inputFocusGlow 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212, 175, 55, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // FAZ 1 - Yeni keyframes (Mevcut kodlar korundu)
        logoGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))' },
        },
        storyRingRotate: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        inputFocusGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
          '100%': { boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.15)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
