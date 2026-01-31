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
      <div className="max-w-lg mx-auto px-4 pb-3">
        {/* Neumorphic navigation bar */}
        <div className={`${themeClasses.card} px-2 py-2.5 flex items-center justify-between`}>
          {tabs.map((tab, index) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setModalAcik('hizliPlan')}
                  className="relative -mt-10 mx-2"
                >
                  {/* Neumorphic gold action button */}
                  <div className="w-14 h-14 btn-gold rounded-2xl flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] rounded-2xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'neu-inset-dark'
                      : 'neu-inset'
                    : ''
                }`}
                style={!isActive ? {
                  background: isDark
                    ? 'linear-gradient(145deg, #163d5a, #122f48)'
                    : 'linear-gradient(145deg, #ffffff, #e6e6e6)',
                  boxShadow: isDark
                    ? '3px 3px 6px #0a1f36, -3px -3px 6px #103564'
                    : '3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff'
                } : {}}
              >
                <Icon className="w-6 h-6" active={isActive} />
                <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                  isActive ? 'text-gold-500' : themeClasses.textMuted
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
