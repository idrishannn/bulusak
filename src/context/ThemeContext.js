import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, STORAGE_KEYS } from '../constants';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // localStorage'dan tema tercihini al
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme;
      }
    }
    return THEMES.DARK; // Varsayılan tema
  });

  // Tema değiştiğinde body class'ını güncelle
  useEffect(() => {
    const root = document.documentElement;

    if (theme === THEMES.LIGHT) {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    // localStorage'a kaydet
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  }, []);

  const isDark = theme === THEMES.DARK;
  const isLight = theme === THEMES.LIGHT;

  // Modern UI Design System - Navy & Slate Theme Classes
  const themeClasses = {
    // Arka plan
    bg: isDark ? 'bg-navy-950' : 'bg-slate-100',
    bgSecondary: isDark ? 'bg-navy-900' : 'bg-white',
    bgTertiary: isDark ? 'bg-navy-800' : 'bg-slate-50',
    bgCard: isDark ? 'bg-navy-900/50' : 'bg-white',
    bgHover: isDark ? 'hover:bg-navy-800/50' : 'hover:bg-slate-100',
    bgActive: isDark ? 'bg-navy-800/60' : 'bg-slate-100',
    bgInput: isDark ? 'bg-navy-900/60' : 'bg-slate-50',
    bgOverlay: isDark ? 'bg-navy-950/85' : 'bg-white/95',
    bgSubtle: isDark ? 'bg-navy-800/40' : 'bg-slate-100/80',

    // Metin renkleri
    text: isDark ? 'text-slate-100' : 'text-slate-900',
    textPrimary: isDark ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDark ? 'text-navy-300' : 'text-slate-600',
    textMuted: isDark ? 'text-navy-400' : 'text-slate-500',
    textTertiary: isDark ? 'text-navy-500' : 'text-slate-400',
    textInverse: isDark ? 'text-navy-950' : 'text-white',

    // Başlık hiyerarşisi
    headingPrimary: isDark ? 'text-slate-100 font-bold' : 'text-slate-900 font-bold',
    headingSecondary: isDark ? 'text-slate-200 font-semibold' : 'text-slate-800 font-semibold',
    headingTertiary: isDark ? 'text-navy-300 font-medium' : 'text-slate-700 font-medium',

    // Border
    border: isDark ? 'border-navy-700/40' : 'border-slate-200',
    borderInput: isDark ? 'border-navy-700/50' : 'border-slate-200',
    borderSubtle: isDark ? 'border-navy-800/30' : 'border-slate-100',
    borderStrong: isDark ? 'border-navy-600' : 'border-slate-300',

    // Glass effect
    glass: isDark
      ? 'bg-navy-900/70 backdrop-blur-xl border-navy-700/40'
      : 'bg-white/85 backdrop-blur-xl border-slate-200/80 shadow-soft',

    // Card
    card: isDark
      ? 'bg-navy-900/50 border-navy-700/40'
      : 'bg-white border-slate-200/80 shadow-card',
    cardHover: isDark
      ? 'hover:bg-navy-800/60 hover:border-navy-600/50'
      : 'hover:bg-slate-50 hover:border-slate-300 hover:shadow-card-hover',
    cardActive: isDark
      ? 'bg-navy-800/70 border-navy-600'
      : 'bg-slate-100 border-slate-300',

    // Button
    btnGhost: isDark
      ? 'border-navy-600/60 text-slate-200 hover:bg-navy-800/50'
      : 'border-slate-300 text-slate-700 hover:bg-slate-100',
    btnDark: isDark
      ? 'bg-navy-800 text-slate-200 hover:bg-navy-700'
      : 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    btnSubtle: isDark
      ? 'bg-navy-800/40 text-navy-300 hover:bg-navy-700/50'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',

    // Icon renkleri
    iconPrimary: isDark ? 'text-slate-100' : 'text-slate-800',
    iconSecondary: isDark ? 'text-navy-400' : 'text-slate-500',
    iconMuted: isDark ? 'text-navy-500' : 'text-slate-400',
    iconActive: 'text-gold-500',

    // Özel durumlar
    menuItem: isDark
      ? 'hover:bg-navy-800/50 border-navy-700/40'
      : 'hover:bg-slate-100 border-slate-100',
    divider: isDark ? 'bg-navy-700/40' : 'bg-slate-200',

    // Modal
    modalBg: isDark ? 'bg-navy-900' : 'bg-white',
    modalOverlay: isDark ? 'bg-navy-950/80' : 'bg-slate-900/60',

    // Input
    input: isDark
      ? 'bg-navy-900/60 border-navy-700/50 text-slate-100 placeholder:text-navy-400'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
    inputFocus: 'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',

    // Shadow
    shadow: isDark ? 'shadow-navy' : 'shadow-soft',
    shadowLg: isDark ? 'shadow-navy-lg' : 'shadow-soft-lg',

    // Ring (focus states)
    ring: 'ring-gold-500/20',
    ringOffset: isDark ? 'ring-offset-navy-900' : 'ring-offset-white',
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
    themeClasses,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
