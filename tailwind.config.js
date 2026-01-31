module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Premium Gold Accent
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
        // Navy palette for Dark Mode - Deep, premium lacivert
        navy: {
          50: '#e8eff7',
          100: '#c3d3e8',
          200: '#9bb4d4',
          300: '#7295c0',
          400: '#547db0',
          500: '#3666a0',
          600: '#2d5a8f',
          700: '#1e4a7a',
          800: '#143a65',
          900: '#0d2a4d',
          950: '#081a33',
        },
        // Slate Gray for Light Mode - Soft, premium gray
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Legacy dark colors (kept for compatibility)
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#1e4a7a',
          800: '#143a65',
          900: '#0d2a4d',
          950: '#081a33',
        }
      },
      boxShadow: {
        'gold': '0 4px 20px -4px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 8px 40px -8px rgba(212, 175, 55, 0.35)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.15)',
        'inner-gold': 'inset 0 1px 0 rgba(212, 175, 55, 0.1)',
        'navy': '0 4px 20px -4px rgba(13, 42, 77, 0.4)',
        'navy-lg': '0 8px 40px -8px rgba(13, 42, 77, 0.5)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
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
        'logo-glow': 'logoGlow 3s ease-in-out infinite',
        'story-ring-rotate': 'storyRingRotate 4s linear infinite',
        'input-focus-glow': 'inputFocusGlow 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'press': 'press 0.15s ease-out',
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
        logoGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))' },
        },
        storyRingRotate: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        inputFocusGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
          '100%': { boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.12)' },
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
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
