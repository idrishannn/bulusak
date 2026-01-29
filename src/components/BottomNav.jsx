import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, CalendarIcon, ClipboardIcon, UserIcon, PlusIcon } from './Icons';
import { useUI } from '../context';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setModalAcik } = useUI();

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
        <div className="glass rounded-2xl p-2 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setModalAcik('hizliPlan')}
                  className="relative -mt-8"
                >
                  <div className="w-14 h-14 btn-gold rounded-2xl flex items-center justify-center animate-pulse-gold">
                    <Icon className="w-7 h-7" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${
                  isActive ? 'bg-gold-500/10' : ''
                }`}
              >
                <Icon className="w-6 h-6" active={isActive} />
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-gold-500' : 'text-dark-400'
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
