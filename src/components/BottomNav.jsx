import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, CalendarIcon, ClipboardIcon, UserIcon, PlusIcon } from './Icons';
import { useUI, useTheme } from '../context';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setModalAcik } = useUI();
  const { themeClasses } = useTheme();

  const tabs = [
    { path: '/', icon: HomeIcon, label: 'Ana Sayfa' },
    { path: '/takvim', icon: CalendarIcon, label: 'Takvim' },
    { path: 'add', icon: PlusIcon, label: 'Ekle', isAction: true },
    { path: '/planlar', icon: ClipboardIcon, label: 'Planlar' },
    { path: '/profil', icon: UserIcon, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto px-4 pb-2">
        {/* İyileştirilmiş aralık ve hizalama - butonlar birbirine değmiyor */}
        <div className={`${themeClasses.glass} rounded-2xl px-3 py-2 flex items-center justify-between`}>
          {tabs.map((tab, index) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setModalAcik('hizliPlan')}
                  className="relative -mt-8 mx-2"
                >
                  <div className="w-14 h-14 btn-gold rounded-2xl flex items-center justify-center animate-pulse-gold shadow-lg shadow-gold-500/30">
                    <Icon className="w-7 h-7" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] rounded-xl transition-all ${
                  isActive ? 'bg-gold-500/10' : ''
                }`}
              >
                <Icon className="w-6 h-6" active={isActive} />
                <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
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
