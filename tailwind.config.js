module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        handwritten: ['Caveat', 'cursive'],
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
        // Neumorphic Base Colors - Soft, tactile surfaces
        neu: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Warm cream/paper tones for scrapbook feel
        cream: {
          50: '#fffef7',
          100: '#fefcf0',
          200: '#fdf8e3',
          300: '#fbf2d0',
          400: '#f7e8b3',
          500: '#f0db8a',
          600: '#e5c85f',
          700: '#d4af37',
          800: '#b8942d',
          900: '#927326',
        },
        // Soft pastel accents for collage elements
        pastel: {
          pink: '#fce4ec',
          peach: '#ffecb3',
          mint: '#e8f5e9',
          sky: '#e3f2fd',
          lavender: '#ede7f6',
          coral: '#ffccbc',
        },
        // Navy palette for Dark Mode
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
        // Slate Gray for Light Mode
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
        // Neumorphic shadows - Light mode (extruded)
        'neu-sm': '3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff',
        'neu-md': '5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff',
        'neu-lg': '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff',
        'neu-xl': '12px 12px 24px #d1d1d1, -12px -12px 24px #ffffff',
        // Neumorphic shadows - Inset/pressed
        'neu-inset-sm': 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff',
        'neu-inset-md': 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff',
        'neu-inset-lg': 'inset 6px 6px 12px #d1d1d1, inset -6px -6px 12px #ffffff',
        // Neumorphic shadows - Dark mode
        'neu-dark-sm': '3px 3px 6px #0a1f36, -3px -3px 6px #103564',
        'neu-dark-md': '5px 5px 10px #0a1f36, -5px -5px 10px #103564',
        'neu-dark-lg': '8px 8px 16px #0a1f36, -8px -8px 16px #103564',
        'neu-dark-inset': 'inset 4px 4px 8px #0a1f36, inset -4px -4px 8px #103564',
        // Sticker/collage shadows
        'sticker': '0 4px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.15)',
        'sticker-hover': '0 6px 0 rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.2)',
        'paper': '2px 2px 8px rgba(0,0,0,0.08), -1px -1px 4px rgba(255,255,255,0.5)',
        'torn': '3px 3px 0 rgba(0,0,0,0.05)',
        // Gold shadows
        'gold': '0 4px 20px -4px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 8px 40px -8px rgba(212, 175, 55, 0.35)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.15)',
        'inner-gold': 'inset 0 1px 0 rgba(212, 175, 55, 0.1)',
        // Utility shadows
        'navy': '0 4px 20px -4px rgba(13, 42, 77, 0.4)',
        'navy-lg': '0 8px 40px -8px rgba(13, 42, 77, 0.5)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        // Paper/grain textures for scrapbook feel
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        // Gradient for neumorphic surfaces
        'neu-surface': 'linear-gradient(145deg, #ffffff, #e6e6e6)',
        'neu-surface-dark': 'linear-gradient(145deg, #0f3358, #0b2744)',
        // Decorative gradients
        'scrapbook': 'linear-gradient(135deg, #fefcf0 0%, #f5f5f5 50%, #fdf8e3 100%)',
        'collage-warm': 'linear-gradient(120deg, #fce4ec 0%, #ffecb3 50%, #e8f5e9 100%)',
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
        // Collage-specific animations
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'tilt': 'tilt 0.3s ease-out',
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
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        tilt: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-2deg)' },
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
