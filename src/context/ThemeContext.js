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

  // Instagram-style Design System - Flat, Clean, Modern
  const themeClasses = {
    // Arka plan - Instagram style surfaces
    bg: isDark ? 'bg-surface-primary' : 'bg-slate-50',
    bgSecondary: isDark ? 'bg-surface-secondary' : 'bg-white',
    bgTertiary: isDark ? 'bg-surface-tertiary' : 'bg-slate-100',
    bgCard: isDark ? 'bg-surface-secondary' : 'bg-white',
    bgHover: isDark ? 'hover:bg-surface-tertiary' : 'hover:bg-slate-100',
    bgActive: isDark ? 'bg-surface-elevated' : 'bg-slate-100',
    bgInput: isDark ? 'bg-surface-tertiary' : 'bg-slate-100',
    bgOverlay: isDark ? 'bg-black/80' : 'bg-white/95',
    bgSubtle: isDark ? 'bg-surface-tertiary/50' : 'bg-slate-50',

    // Metin renkleri - Instagram hierarchy
    text: isDark ? 'text-dark-50' : 'text-slate-900',
    textPrimary: isDark ? 'text-dark-50' : 'text-slate-900',
    textSecondary: isDark ? 'text-dark-100' : 'text-slate-600',
    textMuted: isDark ? 'text-dark-200' : 'text-slate-500',
    textTertiary: isDark ? 'text-dark-300' : 'text-slate-400',
    textInverse: isDark ? 'text-black' : 'text-white',

    // Başlık hiyerarşisi - Clean Instagram style
    headingPrimary: isDark ? 'text-dark-50 font-semibold' : 'text-slate-900 font-semibold',
    headingSecondary: isDark ? 'text-dark-50 font-medium' : 'text-slate-800 font-medium',
    headingTertiary: isDark ? 'text-dark-100 font-medium' : 'text-slate-700 font-medium',

    // Border - Subtle Instagram style
    border: isDark ? 'border-surface-border' : 'border-slate-200',
    borderInput: isDark ? 'border-surface-borderLight' : 'border-slate-300',
    borderSubtle: isDark ? 'border-surface-border/50' : 'border-slate-100',
    borderStrong: isDark ? 'border-surface-borderLight' : 'border-slate-300',

    // Glass effect
    glass: isDark
      ? 'bg-surface-secondary/90 backdrop-blur-xl border-surface-border rounded-ig-md'
      : 'bg-white/90 backdrop-blur-xl border-slate-200 rounded-ig-md',

    // Flat Card - Instagram style
    card: 'card',
    cardFlat: 'card-flat',
    cardHover: isDark ? 'hover:bg-surface-tertiary' : 'hover:bg-slate-50',
    cardActive: isDark ? 'bg-surface-elevated' : 'bg-slate-100',

    // Buttons - Instagram style
    btnPrimary: 'btn-primary',
    btnSecondary: 'btn-secondary',
    btnGhost: 'btn-ghost',
    btnDanger: 'btn-danger',

    // Icon renkleri - Instagram style
    iconPrimary: isDark ? 'text-dark-50' : 'text-slate-900',
    iconSecondary: isDark ? 'text-dark-200' : 'text-slate-500',
    iconMuted: isDark ? 'text-dark-300' : 'text-slate-400',
    iconActive: isDark ? 'text-dark-50' : 'text-slate-900',

    // Özel durumlar
    menuItem: 'menu-item',
    divider: 'divider',

    // Modal - Instagram style
    modalBg: 'modal-content',
    modalOverlay: 'modal-overlay',

    // Input - Instagram style
    input: 'input-field',
    inputFocus: 'focus:border-ig-blue focus:ring-1 focus:ring-ig-blue/20',

    // Shadow - Minimal
    shadow: isDark ? 'shadow-none' : 'shadow-card-light',
    shadowLg: isDark ? 'shadow-ig' : 'shadow-ig-md',

    // Ring (focus states)
    ring: 'ring-ig-blue/30',
    ringOffset: isDark ? 'ring-offset-surface-primary' : 'ring-offset-white',

    // Empty state
    emptyState: 'empty-state',
    emptyStateIcon: 'empty-state-icon',
    emptyStateTitle: 'empty-state-title',
    emptyStateDesc: 'empty-state-desc',

    // Section headers
    sectionHeader: 'section-header',
    sectionHeaderLabel: 'section-header-label',

    // List items
    listItem: 'list-item',
    listItemBorder: 'list-item-border',

    // Icon button
    iconBtn: 'icon-btn',
    iconBtnGhost: 'icon-btn-ghost',

    // Tabs - Instagram style
    tabItem: 'tab-item',
    tabItemActive: 'tab-item-active',
    tabItemInactive: 'tab-item-inactive',

    // Chips - Instagram style
    chip: 'chip',
    chipActive: 'chip-active',
    chipInactive: 'chip-inactive',

    // Toast
    toast: 'toast',

    // Toggle - Instagram style
    toggleTrack: 'toggle-track',
    toggleThumb: 'toggle-thumb',

    // Follow button
    followBtn: 'follow-btn',
    followBtnSecondary: 'follow-btn-secondary',
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
