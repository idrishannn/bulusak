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

  // Tactile Scrapbook Design System - Neumorphism + Collage
  const themeClasses = {
    // Arka plan - Neumorphic surfaces
    bg: isDark ? 'bg-navy-950' : 'bg-neu-100',
    bgSecondary: isDark ? 'bg-navy-900' : 'bg-white',
    bgTertiary: isDark ? 'bg-navy-800' : 'bg-neu-50',
    bgCard: isDark ? 'bg-navy-900/50' : 'bg-white',
    bgHover: isDark ? 'hover:bg-navy-800/50' : 'hover:bg-neu-100',
    bgActive: isDark ? 'bg-navy-800/60' : 'bg-neu-100',
    bgInput: isDark ? 'bg-navy-900/60' : 'bg-neu-50',
    bgOverlay: isDark ? 'bg-navy-950/85' : 'bg-white/95',
    bgSubtle: isDark ? 'bg-navy-800/40' : 'bg-neu-100/80',

    // Metin renkleri
    text: isDark ? 'text-slate-100' : 'text-slate-900',
    textPrimary: isDark ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDark ? 'text-navy-300' : 'text-slate-600',
    textMuted: isDark ? 'text-navy-400' : 'text-neu-500',
    textTertiary: isDark ? 'text-navy-500' : 'text-neu-400',
    textInverse: isDark ? 'text-navy-950' : 'text-white',

    // Başlık hiyerarşisi - Collage style mixed fonts
    headingPrimary: isDark ? 'text-slate-100 font-bold heading-display' : 'text-slate-900 font-bold heading-display',
    headingSecondary: isDark ? 'text-slate-200 font-semibold' : 'text-slate-800 font-semibold',
    headingTertiary: isDark ? 'text-navy-300 font-medium' : 'text-slate-700 font-medium',

    // Border
    border: isDark ? 'border-navy-700/40' : 'border-neu-200',
    borderInput: isDark ? 'border-navy-700/50' : 'border-neu-200',
    borderSubtle: isDark ? 'border-navy-800/30' : 'border-neu-100',
    borderStrong: isDark ? 'border-navy-600' : 'border-neu-300',

    // Glass effect with neumorphic touch
    glass: isDark
      ? 'bg-navy-900/70 backdrop-blur-xl border-navy-700/40 rounded-2xl'
      : 'bg-white/85 backdrop-blur-xl border-cream-200/80 rounded-2xl',

    // Neumorphic Card
    card: 'card',
    cardHover: 'card-hover',
    cardActive: isDark
      ? 'bg-navy-800/70 border-navy-600'
      : 'bg-neu-100 border-neu-300',

    // Neumorphic Buttons
    btnGhost: 'btn-ghost',
    btnDark: 'btn-dark',
    btnSubtle: 'btn-subtle',
    btnNeu: isDark ? 'btn-neu-dark' : 'btn-neu',

    // Icon renkleri
    iconPrimary: isDark ? 'text-slate-100' : 'text-slate-800',
    iconSecondary: isDark ? 'text-navy-400' : 'text-neu-500',
    iconMuted: isDark ? 'text-navy-500' : 'text-neu-400',
    iconActive: 'text-gold-500',

    // Neumorphic surfaces
    neuSurface: isDark ? 'neu-surface-dark' : 'neu-surface',
    neuInset: isDark ? 'neu-inset-dark' : 'neu-inset',

    // Özel durumlar
    menuItem: 'menu-item',
    divider: 'divider',

    // Modal - Neumorphic
    modalBg: 'modal-content',
    modalOverlay: 'modal-overlay',

    // Neumorphic Input
    input: 'input-dark',
    inputEnhanced: 'input-enhanced',
    inputFocus: 'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',

    // Shadow
    shadow: isDark ? 'shadow-neu-dark-md' : 'shadow-neu-md',
    shadowLg: isDark ? 'shadow-neu-dark-lg' : 'shadow-neu-lg',

    // Ring (focus states)
    ring: 'ring-gold-500/20',
    ringOffset: isDark ? 'ring-offset-navy-900' : 'ring-offset-white',

    // Collage/Scrapbook elements
    sticker: 'sticker',
    stickerGold: 'sticker-gold',
    collageTilt: 'collage-tilt',
    collageTiltRight: 'collage-tilt-right',
    photoFrame: 'photo-frame',
    polaroid: 'polaroid',
    paperTorn: 'paper-torn',
    labelHandwritten: 'label-handwritten',

    // Empty state
    emptyState: 'empty-state',
    emptyStateIcon: 'empty-state-icon',
    emptyStateTitle: 'empty-state-title',
    emptyStateDesc: 'empty-state-desc',

    // Section headers
    sectionHeader: 'section-header',
    sectionHeaderLabel: 'section-header-label',
    sectionHeaderLine: 'section-header-line',

    // List items
    listItem: 'list-item',
    listItemBorder: 'list-item-border',

    // Icon button
    iconBtn: 'icon-btn',
    iconBtnGhost: 'icon-btn-ghost',

    // Tabs
    tabItem: 'tab-item',
    tabItemActive: 'tab-item-active',
    tabItemInactive: 'tab-item-inactive',

    // Category chips
    categoryChip: 'category-chip',
    categoryChipActive: 'category-chip-active',
    categoryChipInactive: 'category-chip-inactive',

    // Toast
    toast: 'toast',

    // Toggle
    toggleTrack: 'toggle-track',
    toggleThumb: 'toggle-thumb',

    // Textures
    texturePaper: 'texture-paper',
    textureGrain: 'texture-grain',
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
