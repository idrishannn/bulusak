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

  // Tema bazlı CSS class'ları
  const themeClasses = {
    // Arka plan
    bg: isDark ? 'bg-dark-900' : 'bg-gray-50',
    bgSecondary: isDark ? 'bg-dark-800' : 'bg-white',
    bgCard: isDark ? 'bg-dark-800/60' : 'bg-white',
    bgHover: isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-100',
    bgInput: isDark ? 'bg-dark-800/80' : 'bg-gray-100',

    // Metin
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-dark-400' : 'text-gray-500',
    textMuted: isDark ? 'text-dark-500' : 'text-gray-400',

    // Border
    border: isDark ? 'border-dark-700/50' : 'border-gray-200',
    borderInput: isDark ? 'border-dark-700' : 'border-gray-300',

    // Glass effect
    glass: isDark ? 'bg-dark-800/60 backdrop-blur-xl border-dark-700/50' : 'bg-white/80 backdrop-blur-xl border-gray-200',

    // Card
    card: isDark ? 'bg-dark-800/60 border-dark-700/50' : 'bg-white border-gray-200 shadow-sm',
    cardHover: isDark ? 'hover:bg-dark-700/60 hover:border-dark-600/50' : 'hover:bg-gray-50 hover:border-gray-300',

    // Button
    btnGhost: isDark ? 'border-dark-600 text-white hover:bg-dark-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-100',
    btnDark: isDark ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
