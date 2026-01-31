import React from 'react';
import { PlusIcon, HeartIcon } from './Icons';
import { useAuth, useUI, useTheme } from '../context';
import Logo from './Logo';
import Wordmark from './Wordmark';

const Header = () => {
  const { kullanici } = useAuth();
  const { setModalAcik, bildirimler } = useUI();
  const { themeClasses, isDark } = useTheme();

  const okunmamisBildirim = bildirimler?.filter(b => !b.okundu).length || 0;

  const davetBildirimleri = bildirimler?.filter(b =>
    !b.okundu && (
      b.tip === 'PLAN_DAVET' ||
      b.tip === 'PLAN_KATILIM_ISTEGI' ||
      b.tip === 'GRUP_DAVET'
    )
  ).length || 0;

  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className={`${themeClasses.glass} border-b ${themeClasses.border}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <Wordmark size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalAcik('kullaniciEkle')}
              className={`relative w-10 h-10 rounded-xl ${isDark ? 'bg-dark-700/50 hover:bg-dark-600/50' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <PlusIcon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>

            <button
              onClick={() => setModalAcik('bildirimler')}
              className={`relative w-10 h-10 rounded-xl ${
                okunmamisBildirim > 0
                  ? 'bg-pink-500/10 hover:bg-pink-500/20'
                  : isDark ? 'bg-dark-700/50 hover:bg-dark-600/50' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors`}
            >
              <HeartIcon
                className={`w-5 h-5 ${okunmamisBildirim > 0 ? 'text-pink-500' : themeClasses.textSecondary}`}
                filled={okunmamisBildirim > 0}
              />
              {okunmamisBildirim > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-pink-500/30 animate-pulse">
                  {okunmamisBildirim > 9 ? '9+' : okunmamisBildirim}
                </span>
              )}
              {davetBildirimleri > 0 && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gold-500 rounded-full border-2 border-dark-900" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
