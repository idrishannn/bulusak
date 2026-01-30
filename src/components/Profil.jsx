import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI, useTheme } from '../context';
import { ChevronRightIcon, BellIcon, UsersIcon, LogoutIcon, EditIcon, ClipboardIcon, SettingsIcon } from './Icons';
import Logo from './Logo';

const Profil = () => {
  const navigate = useNavigate();
  const { kullanici, cikisYapFunc } = useAuth();
  const { gruplar, etkinlikler, arkadaslar } = useData();
  const { setModalAcik, bildirimGoster } = useUI();
  const { isDark, themeClasses } = useTheme();

  const handleCikis = async () => {
    const result = await cikisYapFunc();
    if (result.success) {
      bildirimGoster('Görüşürüz!', 'success');
    }
  };

  const bekleyenIstekler = kullanici?.arkadasIstekleri?.filter(i => i.durum === 'bekliyor').length || 0;

  const menuItems = [
    { icon: UsersIcon, label: 'Arkadaşlarım', badge: arkadaslar?.length, action: () => setModalAcik('arkadaslar') },
    { icon: BellIcon, label: 'Bildirimler', badge: bekleyenIstekler, action: () => setModalAcik('bildirimler') },
    { icon: ClipboardIcon, label: 'Bucket List', action: () => setModalAcik('bucketList') },
    { icon: SettingsIcon, label: 'Ayarlar', action: () => navigate('/ayarlar') },
  ];

  return (
    <div className="pb-32 p-4">
      <div className="card p-6 text-center mb-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/30 flex items-center justify-center mx-auto">
            {kullanici?.avatar ? (
              <span className="text-5xl">{kullanici.avatar}</span>
            ) : (
              <Logo size="lg" className="opacity-50" />
            )}
          </div>
          <button
            onClick={() => setModalAcik('avatarDegistir')}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 rounded-xl flex items-center justify-center"
          >
            <EditIcon className="w-4 h-4 text-dark-900" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mt-4">{kullanici?.isim || 'Kullanıcı'}</h2>
        <p className="text-dark-400 text-sm">@{kullanici?.kullaniciAdi || 'kullanici'}</p>

        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-500">{etkinlikler?.length || 0}</div>
            <div className="text-xs text-dark-400">Plan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-500">{gruplar?.length || 0}</div>
            <div className="text-xs text-dark-400">Grup</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-500">{arkadaslar?.length || 0}</div>
            <div className="text-xs text-dark-400">Arkadaş</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 hover:bg-dark-700/50 transition-colors border-b border-dark-700/50 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-dark-300" />
              </div>
              <span className="text-white font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge > 0 && (
                <span className="badge-gold">{item.badge}</span>
              )}
              <ChevronRightIcon className="w-5 h-5 text-dark-500" />
            </div>
          </button>
        ))}

        <button
          onClick={handleCikis}
          className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogoutIcon className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Çıkış Yap</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profil;
