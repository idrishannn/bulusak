import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI, useTheme } from '../context';
import {
  ChevronRightIcon, BellIcon, UsersIcon, LogoutIcon, EditIcon,
  ClipboardIcon, SettingsIcon, MenuIcon, LockIcon, LocationIcon,
  SunIcon, MoonIcon, XIcon, PlusIcon
} from './Icons';
import Logo from './Logo';

const Profil = () => {
  const navigate = useNavigate();
  const { kullanici, cikisYapFunc } = useAuth();
  const { gruplar, etkinlikler, arkadaslar, benimHikayelerim } = useData();
  const { setModalAcik, bildirimGoster, setSeciliEtkinlik } = useUI();
  const { isDark, themeClasses, toggleTheme } = useTheme();
  const [menuAcik, setMenuAcik] = useState(false);
  const [aktifTab, setAktifTab] = useState('planlar');
  const [cikisDialogAcik, setCikisDialogAcik] = useState(false);
  const [cikisYukleniyor, setCikisYukleniyor] = useState(false);
  const cikisDebounceRef = useRef(false);

  const temizKullaniciAdi = (kullaniciAdi) => {
    if (!kullaniciAdi) return '';
    return kullaniciAdi.replace(/@/g, '');
  };

  const handleCikisDialogAc = useCallback(() => {
    if (cikisDebounceRef.current) return;
    cikisDebounceRef.current = true;
    setMenuAcik(false);
    setTimeout(() => {
      setCikisDialogAcik(true);
      cikisDebounceRef.current = false;
    }, 100);
  }, []);

  const handleCikisOnayla = async () => {
    if (cikisYukleniyor) return;
    setCikisYukleniyor(true);
    try {
      const result = await cikisYapFunc();
      if (result.success) {
        bildirimGoster('Görüşürüz!', 'success');
      }
    } finally {
      setCikisYukleniyor(false);
      setCikisDialogAcik(false);
    }
  };

  const bekleyenIstekler = kullanici?.arkadasIstekleri?.filter(i => i.durum === 'bekliyor').length || 0;

  // Kullanıcının katıldığı planlar
  const katildigimPlanlar = etkinlikler?.filter(e =>
    e.katilimcilar?.some(k => k.odUserId === kullanici?.odUserId) ||
    e.olusturanId === kullanici?.odUserId
  ) || [];

  // Menü öğeleri - Instagram tarzı
  const menuItems = [
    { icon: SettingsIcon, label: 'Ayarlar', action: () => { setMenuAcik(false); navigate('/ayarlar'); } },
    { icon: LockIcon, label: 'Hesap Gizliliği', action: () => { setMenuAcik(false); setModalAcik('gizlilikAyarlari'); } },
    { icon: LocationIcon, label: 'Konum Ayarları', action: () => { setMenuAcik(false); setModalAcik('konumAyarlari'); } },
    { icon: isDark ? SunIcon : MoonIcon, label: isDark ? 'Açık Mod' : 'Koyu Mod', action: () => { toggleTheme(); } },
    { icon: BellIcon, label: 'Bildirim Ayarları', action: () => { setMenuAcik(false); setModalAcik('bildirimAyarlari'); } },
    { icon: UsersIcon, label: 'Arkadaşlarım', badge: arkadaslar?.length, action: () => { setMenuAcik(false); setModalAcik('arkadaslar'); } },
    { icon: ClipboardIcon, label: 'Bucket List', action: () => { setMenuAcik(false); setModalAcik('bucketList'); } },
  ];

  // Plan kartı komponenti - Instagram post tarzı
  const PlanKarti = ({ plan }) => {
    const katilimcilar = plan.katilimcilar || [];
    const planSahibi = katilimcilar.find(k => k.odUserId === plan.olusturanId) || {};
    const digerKatilimcilar = katilimcilar.filter(k => k.odUserId !== plan.olusturanId).slice(0, 3);

    return (
      <button
        onClick={() => {
          setSeciliEtkinlik(plan);
          setModalAcik('detay');
        }}
        className={`w-full rounded-2xl overflow-hidden ${isDark ? 'bg-dark-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-dark-700' : 'border-gray-100'} text-left transition-all hover:shadow-md`}
      >
        {/* Plan Header - Instagram post header tarzı */}
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {plan.olusturanAvatar || planSahibi?.avatar || plan.baslik?.charAt(0) || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${themeClasses.text} truncate`}>
              {planSahibi?.isim || plan.olusturanIsim || 'Anonim'}
            </p>
            <p className={`text-xs ${themeClasses.textMuted} truncate`}>
              {plan.konum || 'Konum belirtilmedi'}
            </p>
          </div>
          <span className="text-lg">{plan.emoji || '📅'}</span>
        </div>

        {/* Plan Content - Post body */}
        <div className={`px-3 pb-2`}>
          <h3 className={`font-semibold ${themeClasses.text}`}>{plan.baslik}</h3>
          {plan.aciklama && (
            <p className={`text-sm ${themeClasses.textMuted} mt-1 line-clamp-2`}>{plan.aciklama}</p>
          )}
        </div>

        {/* Tarih ve Katılımcılar */}
        <div className={`px-3 pb-3 flex items-center justify-between`}>
          <div className={`text-xs ${themeClasses.textMuted}`}>
            {plan.tarih ? new Date(plan.startAt || plan.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
            {plan.saat && ` · ${plan.saat}`}
          </div>

          {/* Overlapping Avatars */}
          {katilimcilar.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {katilimcilar.slice(0, 4).map((k, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${isDark ? 'border-dark-800 bg-dark-700' : 'border-white bg-gray-100'}`}
                    style={{ zIndex: 4 - i }}
                  >
                    {k.avatar || k.isim?.charAt(0) || '?'}
                  </div>
                ))}
                {katilimcilar.length > 4 && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${isDark ? 'border-dark-800 bg-dark-600 text-dark-300' : 'border-white bg-gray-200 text-gray-600'}`}
                    style={{ zIndex: 0 }}
                  >
                    +{katilimcilar.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="pb-32">
      {/* Instagram Tarzı Üst Bar */}
      <div className={`sticky top-0 z-30 ${themeClasses.glass} border-b ${themeClasses.border} safe-top`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className={`text-lg font-bold ${themeClasses.text}`}>
            {temizKullaniciAdi(kullanici?.kullaniciAdi) || 'kullanici'}
          </h1>
          <button
            onClick={() => setMenuAcik(true)}
            className={`w-10 h-10 rounded-xl ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'} flex items-center justify-center transition-colors`}
          >
            <MenuIcon className={`w-6 h-6 ${themeClasses.text}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Profil Üst Kısmı - Instagram tarzı */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar - Hikaye özellikli */}
          <div className="relative">
            {/* Hikaye varsa gradient ring */}
            <button
              onClick={() => {
                if (benimHikayelerim?.length > 0) {
                  setModalAcik('hikayeGoruntule');
                }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                benimHikayelerim?.length > 0
                  ? 'p-0.5 bg-gradient-to-tr from-gold-500 via-orange-500 to-pink-500'
                  : 'bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/50'
              }`}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                benimHikayelerim?.length > 0
                  ? (isDark ? 'bg-dark-900' : 'bg-white') + ' p-0.5'
                  : ''
              }`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center ${
                  benimHikayelerim?.length > 0
                    ? 'bg-gradient-to-br from-gold-500/30 to-gold-600/20'
                    : ''
                }`}>
                  {kullanici?.avatar ? (
                    <span className="text-4xl">{kullanici.avatar}</span>
                  ) : (
                    <Logo size="md" className="opacity-50" />
                  )}
                </div>
              </div>
            </button>
            {/* Hikaye Ekleme Butonu - Sol Alt */}
            <button
              onClick={() => setModalAcik('hikayeEkle')}
              className="absolute -bottom-1 -left-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-dark-900"
            >
              <PlusIcon className="w-4 h-4 text-white" />
            </button>
            {/* Avatar Düzenleme Butonu - Sağ Alt */}
            <button
              onClick={() => setModalAcik('avatarDegistir')}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <EditIcon className="w-3.5 h-3.5 text-dark-900" />
            </button>
          </div>

          {/* Stats - Instagram tarzı */}
          <div className="flex-1 flex justify-around text-center pt-2">
            <div>
              <div className={`text-xl font-bold ${themeClasses.text}`}>{katildigimPlanlar.length}</div>
              <div className={`text-xs ${themeClasses.textMuted}`}>Plan</div>
            </div>
            <button onClick={() => setModalAcik('takipciListesi')} className="text-center">
              <div className={`text-xl font-bold ${themeClasses.text}`}>{arkadaslar?.length || 0}</div>
              <div className={`text-xs ${themeClasses.textMuted}`}>Takipçi</div>
            </button>
            <button onClick={() => setModalAcik('takipciListesi')} className="text-center">
              <div className={`text-xl font-bold ${themeClasses.text}`}>{arkadaslar?.length || 0}</div>
              <div className={`text-xs ${themeClasses.textMuted}`}>Takip</div>
            </button>
          </div>
        </div>

        {/* İsim ve Bio */}
        <div className="mb-4">
          <h2 className={`font-bold ${themeClasses.text}`}>{kullanici?.isim || 'Kullanıcı'}</h2>
          {kullanici?.bio && (
            <p className={`text-sm ${themeClasses.textMuted} mt-1`}>{kullanici.bio}</p>
          )}
        </div>

        {/* Profil Düzenle Butonu */}
        <button
          onClick={() => setModalAcik('profilDuzenle')}
          className={`w-full py-2 rounded-lg font-medium text-sm mb-6 ${isDark ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors`}
        >
          Profili Düzenle
        </button>

        {/* Tab Bar - Planlar / Gruplar */}
        <div className={`flex border-b ${themeClasses.border} mb-4`}>
          <button
            onClick={() => setAktifTab('planlar')}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors relative ${
              aktifTab === 'planlar' ? themeClasses.text : themeClasses.textMuted
            }`}
          >
            Planlarım
            {aktifTab === 'planlar' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
          <button
            onClick={() => setAktifTab('gruplar')}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors relative ${
              aktifTab === 'gruplar' ? themeClasses.text : themeClasses.textMuted
            }`}
          >
            Gruplarım
            {aktifTab === 'gruplar' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
        </div>

        {/* Tab İçeriği */}
        {aktifTab === 'planlar' && (
          <div className="space-y-3">
            {katildigimPlanlar.length > 0 ? (
              katildigimPlanlar.map(plan => (
                <PlanKarti key={plan.id} plan={plan} />
              ))
            ) : (
              <div className={`text-center py-12 ${themeClasses.textMuted}`}>
                <p className="text-4xl mb-3">📅</p>
                <p className="font-medium">Henüz plan yok</p>
                <p className="text-sm mt-1">Planlar oluştur veya davetleri kabul et</p>
              </div>
            )}
          </div>
        )}

        {aktifTab === 'gruplar' && (
          <div className="space-y-2">
            {gruplar?.length > 0 ? (
              gruplar.map(grup => (
                <div
                  key={grup.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-dark-800' : 'bg-white'} border ${isDark ? 'border-dark-700' : 'border-gray-100'} flex items-center gap-3`}
                >
                  <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-100'} flex items-center justify-center text-xl`}>
                    {grup.emoji || '👥'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${themeClasses.text}`}>{grup.isim}</p>
                    <p className={`text-xs ${themeClasses.textMuted}`}>{grup.uyeler?.length || 1} kişi</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 ${themeClasses.textMuted}`}>
                <p className="text-4xl mb-3">👥</p>
                <p className="font-medium">Henüz grup yok</p>
                <p className="text-sm mt-1">Arkadaşlarınla gruplar oluştur</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hamburger Menü - Sağ Üst 3 Çizgi */}
      {menuAcik && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuAcik(false)} />
          <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] ${isDark ? 'bg-dark-900' : 'bg-white'} shadow-2xl animate-slide-left safe-top`}>
            {/* Menü Header */}
            <div className={`p-4 border-b ${themeClasses.border} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${themeClasses.text}`}>Menü</h2>
              <button
                onClick={() => setMenuAcik(false)}
                className={`w-10 h-10 rounded-xl ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'} flex items-center justify-center`}
              >
                <XIcon className={`w-5 h-5 ${themeClasses.text}`} />
              </button>
            </div>

            {/* Kullanıcı Bilgisi */}
            <div className={`p-4 border-b ${themeClasses.border}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/30 flex items-center justify-center">
                  {kullanici?.avatar ? (
                    <span className="text-2xl">{kullanici.avatar}</span>
                  ) : (
                    <Logo size="sm" className="opacity-50" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${themeClasses.text}`}>{kullanici?.isim}</p>
                  <p className={`text-sm ${themeClasses.textMuted}`}>{temizKullaniciAdi(kullanici?.kullaniciAdi)}</p>
                </div>
              </div>
            </div>

            {/* Menü Öğeleri */}
            <div className="p-2">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-3 rounded-xl ${isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-100'} flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${themeClasses.iconSecondary}`} />
                    </div>
                    <span className={`${themeClasses.text} font-medium`}>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="badge-gold">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Çıkış Yap */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${themeClasses.border} safe-bottom`}>
              <button
                onClick={handleCikisDialogAc}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <LogoutIcon className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-red-400 font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {cikisDialogAcik && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCikisDialogAcik(false)} />
          <div className={`relative w-full max-w-sm ${isDark ? 'bg-dark-900' : 'bg-white'} rounded-2xl p-6 border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} text-center mb-2`}>Çıkış Yap?</h3>
            <p className={`text-sm ${themeClasses.textMuted} text-center mb-6`}>
              Hesabınızdan çıkış yapmak istiyor musunuz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCikisDialogAcik(false)}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              >
                İptal
              </button>
              <button
                onClick={handleCikisOnayla}
                disabled={cikisYukleniyor}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cikisYukleniyor ? 'Çıkılıyor...' : 'Çıkış Yap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
