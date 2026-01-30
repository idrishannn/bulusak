import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, ChatIcon } from './Icons';
import { useAuth, useUI, useData, useTheme } from '../context';
import Logo from './Logo';
import Wordmark from './Wordmark';

const Header = () => {
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { setModalAcik, bildirimler } = useUI();
  const { konusmalar } = useData();
  const { themeClasses, isDark } = useTheme();

  const okunmamisBildirim = bildirimler?.filter(b => !b.okundu).length || 0;
  const okunmamisMesaj = konusmalar?.filter(k => k.okunmamis > 0).length || 0;

  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className={`${themeClasses.glass} border-b ${themeClasses.border}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <Wordmark size="sm" className="mb-0.5" />
              <h1 className={`${themeClasses.text} font-semibold`}>
                {kullanici?.isim?.split(' ')[0] || 'Kullanıcı'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mesajlar')}
              className={`relative w-10 h-10 rounded-xl ${isDark ? 'bg-dark-700/50 hover:bg-dark-600/50' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <ChatIcon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              {okunmamisMesaj > 0 && (
                <span className="absolute -top-1 -right-1 badge-red text-[10px]">
                  {okunmamisMesaj > 9 ? '9+' : okunmamisMesaj}
                </span>
              )}
            </button>

            <button
              onClick={() => setModalAcik('bildirimler')}
              className={`relative w-10 h-10 rounded-xl ${isDark ? 'bg-dark-700/50 hover:bg-dark-600/50' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <BellIcon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              {okunmamisBildirim > 0 && (
                <span className="absolute -top-1 -right-1 badge-red text-[10px]">
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
