import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../context';

const AltNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { katilimIstekleri, setModalAcik } = useUI();

  const aktifSayfa = location.pathname;

  const menuItems = [
    { id: '/', icon: 'home', label: 'Akış', path: '/' },
    { id: '/takvim', icon: 'calendar', label: 'Takvim', path: '/takvim' },
    { id: 'yeni', icon: 'plus', label: 'Yeni', special: true },
    { id: '/planlar', icon: 'list', label: 'Planlar', path: '/planlar' },
    { id: '/profil', icon: 'user', label: 'Profil', path: '/profil' },
  ];

  const handleClick = (item) => {
    if (item.special) {
      setModalAcik('hizliPlan');
    } else {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    if (item.special) return false;
    if (item.path === '/') return aktifSayfa === '/';
    return aktifSayfa.startsWith(item.path);
  };

  const renderIcon = (icon, isActive, isSpecial) => {
    const color = isSpecial ? 'white' : isActive ? '#f97316' : 'rgba(255,255,255,0.4)';
    
    switch (icon) {
      case 'home':
        return (
          <svg className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'list':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50 safe-area-bottom">
      <div className="glass-nav px-6 py-3 rounded-full flex items-center space-x-6 shadow-2xl">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`relative flex flex-col items-center transition-all active:scale-95 ${
              item.special 
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-full -translate-y-6 shadow-lg shadow-orange-500/50 border-4 border-[#1f1f1f] hover:scale-105 animate-pulse-glow'
                : isActive(item)
                  ? 'text-orange-500' 
                  : 'text-white/40 hover:text-white'
            }`}
          >
            {renderIcon(item.icon, isActive(item), item.special)}
            {item.path === '/planlar' && katilimIstekleri.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {katilimIstekleri.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default AltNav;
