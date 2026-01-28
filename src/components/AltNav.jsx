import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../context';

const AltNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { katilimIstekleri, setModalAcik, tema } = useUI();

  // Aktif sayfa kontrolü
  const aktifSayfa = location.pathname;

  const menuItems = [
    { id: '/', icon: '🏠', label: 'Akış', path: '/' },
    { id: '/takvim', icon: '📅', label: 'Takvim', path: '/takvim' },
    { id: 'yeni', icon: '➕', label: 'Yeni', special: true },
    { id: '/planlar', icon: '📋', label: 'Planlar', path: '/planlar' },
    { id: '/profil', icon: '👤', label: 'Profil', path: '/profil' },
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

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${tema.bgCard} border-t ${tema.border} shadow-2xl z-40`}>
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${
              item.special 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg -mt-4 scale-110'
                : isActive(item)
                  ? 'text-orange-500 bg-orange-100 scale-105' 
                  : `${tema.textSecondary} ${tema.bgHover}`
            }`}
          >
            <span className={item.special ? 'text-2xl' : 'text-xl'}>{item.icon}</span>
            <span className="text-xs mt-1 font-semibold">{item.label}</span>
            {item.path === '/planlar' && katilimIstekleri.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
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
