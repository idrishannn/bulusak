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
              className={`relative w-10 h-10 rounded-xl ${isDark ? 'bg-navy-800/50 hover:bg-navy-700/60' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
            >
              <PlusIcon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>

            <button
              onClick={() => setModalAcik('bildirimler')}
              className={`relative w-10 h-10 rounded-xl ${
                okunmamisBildirim > 0
                  ? 'bg-red-500/10 hover:bg-red-500/20'
                  : isDark ? 'bg-navy-800/50 hover:bg-navy-700/60' : 'bg-slate-100 hover:bg-slate-200'
              } flex items-center justify-center transition-all duration-200 active:scale-95`}
            >
              <HeartIcon
                className={`w-5 h-5 ${okunmamisBildirim > 0 ? 'text-red-500' : themeClasses.textSecondary}`}
                filled={okunmamisBildirim > 0}
              />
              {okunmamisBildirim > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-red-500/30">
                  {okunmamisBildirim > 9 ? '9+' : okunmamisBildirim}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
