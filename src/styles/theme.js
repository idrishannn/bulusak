// ============================================
// BULUŞAK - Soft Minimal Tema
// ============================================

export const tema = {
  // Arka planlar - Soft gri tonları
  bg: 'bg-gray-50',
  bgSecondary: 'bg-white',
  bgCard: 'bg-white',
  bgHover: 'hover:bg-gray-50',
  
  // Text renkler - Koyu gri tonları
  text: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-400',
  
  // Border - Hafif gri
  border: 'border-gray-200',
  
  // Input alanları
  inputBg: 'bg-gray-50',
  inputText: 'text-gray-900 placeholder-gray-400',
  
  // Gradient - Turuncu vurgu
  gradient: 'from-orange-500 via-orange-600 to-orange-500',
  gradientButton: 'bg-gradient-to-r from-orange-500 to-orange-600',
  gradientCard: 'bg-gradient-to-br from-orange-500 to-orange-600',
  
  // Shadow - Soft gölgeler
  cardShadow: 'shadow-soft',
  
  // Renk paleti
  primary: 'orange-500',
  secondary: 'orange-600',
  success: 'green-500',
  warning: 'yellow-500',
  danger: 'red-500',
  
  // Özel turuncu tonlar
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c',
  },
  
  // Özel gri tonlar
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
    600: '#4b5563',
    800: '#1f2937',
    900: '#111827',
  }
};

export const temaDark = {
  bg: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  bgCard: 'bg-gray-800',
  bgHover: 'hover:bg-gray-700',
  text: 'text-gray-100',
  textSecondary: 'text-gray-300',
  textMuted: 'text-gray-500',
  border: 'border-gray-700',
  inputBg: 'bg-gray-700',
  inputText: 'text-gray-100 placeholder-gray-500',
  gradient: 'from-orange-500 via-orange-600 to-orange-500',
  gradientButton: 'bg-gradient-to-r from-orange-500 to-orange-600',
  gradientCard: 'bg-gradient-to-br from-orange-500 to-orange-600',
  cardShadow: 'shadow-lg shadow-black/30',
  primary: 'orange-500',
  secondary: 'orange-600',
  success: 'green-500',
  warning: 'yellow-500',
  danger: 'red-500',
};

export const getTheme = (isDark = false) => isDark ? temaDark : tema;
export default tema;
