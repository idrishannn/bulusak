import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, CalendarIcon, ClipboardIcon, UserIcon, PlusIcon } from './Icons';
import { useUI, useTheme } from '../context';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setModalAcik } = useUI();
  const { themeClasses, isDark } = useTheme();

  const tabs = [
    { path: '/', icon: HomeIcon, label: 'Ana Sayfa' },
    { path: '/takvim', icon: CalendarIcon, label: 'Takvim' },
    { path: 'add', icon: PlusIcon, label: 'Ekle', isAction: true },
    { path: '/planlar', icon: ClipboardIcon, label: 'Planlar' },
    { path: '/profil', icon: UserIcon, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto">
        {/* Instagram-style flat navigation bar */}
        <div className={`
          ${isDark ? 'bg-surface-primary border-surface-border' : 'bg-white border-slate-200'}
          border-t px-2 py-1.5 flex items-center justify-around
        `}>
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setModalAcik('hizliPlan')}
                  className="p-2 transition-transform active:scale-90"
                >
                  {/* Instagram-style create button */}
                  <div className={`
                    w-7 h-7 rounded-ig flex items-center justify-center
                    ${isDark ? 'border-2 border-dark-50' : 'border-2 border-slate-900'}
                  `}>
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  flex flex-col items-center justify-center p-2 min-w-[56px]
                  transition-all duration-150 active:opacity-60
                  ${isActive
                    ? isDark ? 'text-dark-50' : 'text-slate-900'
                    : isDark ? 'text-dark-300' : 'text-slate-400'
                  }
                `}
              >
                <Icon className="w-6 h-6" active={isActive} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
