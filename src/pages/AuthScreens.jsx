import React, { useState } from 'react';
import { useAuth, useUI } from '../context';

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

// Giriş Ekranı
const GirisEkrani = () => {
  const { googleIleGirisYap, islemYukleniyor } = useAuth();
  const { bildirimGoster, tema } = useUI();

  const handleGiris = async () => {
    const result = await googleIleGirisYap();
    if (result.message) {
      bildirimGoster(result.message);
    } else if (result.error) {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className={`min-h-screen ${tema.bg} flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 mb-2 tracking-tight">
            Buluşak
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-3"></div>
          <p className={`${tema.textSecondary} text-lg`}>planla, buluş, yaşa ✨</p>
        </div>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            { emoji: '📅', text: 'Arkadaşlarınla takvim paylaş' },
            { emoji: '⚡', text: 'Ortak müsait zamanı anında bul' },
            { emoji: '🎉', text: 'Tek tıkla plan oluştur' },
          ].map((item, i) => (
            <div key={i} className={`${tema.bgCard} ${tema.cardShadow} rounded-2xl p-4 flex items-center gap-4 border ${tema.border}`}>
              <span className="text-3xl">{item.emoji}</span>
              <span className={`${tema.text} font-medium`}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-3">
        <button
          onClick={handleGiris}
          disabled={islemYukleniyor}
          className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 border border-gray-200 disabled:opacity-50"
        >
          {islemYukleniyor ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile Devam Et
            </>
          )}
        </button>
        <p className={`text-center text-sm ${tema.textMuted} mt-4`}>
          Devam ederek <span className="text-orange-500 font-medium">Kullanım Koşulları</span>'nı kabul ediyorsun
        </p>
      </div>
    </div>
  );
};

// Avatar Seçim Ekranı
const AvatarSecimEkrani = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, setKayitAsamasi } = useAuth();
  const { tema } = useUI();

  return (
    <div className={`min-h-screen ${tema.bg} flex flex-col`}>
      <div className="p-4 flex items-center">
        <button onClick={() => setKayitAsamasi('giris')} className={`${tema.text} text-2xl`}>←</button>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-black ${tema.text}`}>Avatarını Seç 🎨</h2>
          <p className={tema.textSecondary}>Seni en iyi yansıtan avatarı bul</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl flex items-center justify-center text-6xl shadow-2xl animate-bounce-slow">
            {seciliAvatar}
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {[
            { key: 'erkek', label: '👨 Erkek' },
            { key: 'kadin', label: '👩 Kadın' },
            { key: 'fantastik', label: '🦄 Fantastik' },
          ].map(kat => (
            <button
              key={kat.key}
              onClick={() => setAvatarKategori(kat.key)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                avatarKategori === kat.key
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : `${tema.bgCard} ${tema.text} border ${tema.border}`
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <div className={`${tema.bgCard} rounded-3xl p-4 border ${tema.border} ${tema.cardShadow}`}>
          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  seciliAvatar === avatar
                    ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110 ring-4 ring-orange-300'
                    : `${tema.inputBg} ${tema.bgHover}`
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={() => setKayitAsamasi('bilgi')}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
};

// Profil Bilgi Ekranı
const BilgiEkrani = () => {
  const { seciliAvatar, setKayitAsamasi, profilTamamla, islemYukleniyor } = useAuth();
  const { bildirimGoster, tema } = useUI();
  
  const [isim, setIsim] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');

  const handleTamamla = async () => {
    const result = await profilTamamla(isim, kullaniciAdi);
    if (result.success) {
      bildirimGoster(result.message);
    } else {
      bildirimGoster(result.error, 'hata');
      if (result.error === 'Önce giriş yapmalısın!') {
        setKayitAsamasi('giris');
      }
    }
  };

  return (
    <div className={`min-h-screen ${tema.bg} flex flex-col`}>
      <div className="p-4 flex items-center">
        <button onClick={() => setKayitAsamasi('avatar')} className={`${tema.text} text-2xl`}>←</button>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl">
            {seciliAvatar}
          </div>
          <h2 className={`text-2xl font-black ${tema.text}`}>Son Adım! 🚀</h2>
          <p className={tema.textSecondary}>Profilini tamamla</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>İsmin</label>
            <input
              type="text"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              placeholder="Ahmet"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kullanıcı Adı</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${tema.textMuted}`}>@</span>
              <input
                type="text"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value.replace('@', ''))}
                placeholder="ahmet"
                className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 pl-8 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleTamamla}
          disabled={islemYukleniyor}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
        >
          {islemYukleniyor ? '⏳ Kaydediliyor...' : 'Başlayalım! 🎉'}
        </button>
      </div>
    </div>
  );
};

// Ana Auth Screens bileşeni
const AuthScreens = () => {
  const { kayitAsamasi } = useAuth();

  return (
    <>
      {kayitAsamasi === 'giris' && <GirisEkrani />}
      {kayitAsamasi === 'avatar' && <AvatarSecimEkrani />}
      {kayitAsamasi === 'bilgi' && <BilgiEkrani />}
    </>
  );
};

export default AuthScreens;
