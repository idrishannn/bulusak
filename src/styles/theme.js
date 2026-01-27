// ============================================
// BULUŞAK - Tema Yapılandırması
// ============================================

export const tema = {
  bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
  bgSecondary: 'bg-white/60',
  bgCard: 'bg-white',
  bgHover: 'hover:bg-orange-50',
  text: 'text-gray-800',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  border: 'border-orange-100',
  inputBg: 'bg-gray-50',
  inputText: 'text-gray-800 placeholder-gray-400',
  gradient: 'from-orange-500 via-amber-500 to-orange-400',
  gradientButton: 'bg-gradient-to-r from-orange-500 to-amber-500',
  gradientCard: 'bg-gradient-to-br from-orange-400 to-amber-400',
  cardShadow: 'shadow-lg shadow-orange-100/50',
  primary: 'orange-500',
  secondary: 'amber-500',
  success: 'green-500',
  warning: 'yellow-500',
  danger: 'red-500',
};

export const temaDark = {
  bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
  bgSecondary: 'bg-gray-800/60',
  bgCard: 'bg-gray-800',
  bgHover: 'hover:bg-gray-700',
  text: 'text-gray-100',
  textSecondary: 'text-gray-300',
  textMuted: 'text-gray-400',
  border: 'border-gray-700',
  inputBg: 'bg-gray-700',
  inputText: 'text-gray-100 placeholder-gray-500',
  gradient: 'from-orange-500 via-amber-500 to-orange-400',
  gradientButton: 'bg-gradient-to-r from-orange-500 to-amber-500',
  gradientCard: 'bg-gradient-to-br from-orange-400 to-amber-400',
  cardShadow: 'shadow-lg shadow-black/30',
  primary: 'orange-500',
  secondary: 'amber-500',
  success: 'green-500',
  warning: 'yellow-500',
  danger: 'red-500',
};

export const getTheme = (isDark = false) => isDark ? temaDark : tema;
export default tema;
