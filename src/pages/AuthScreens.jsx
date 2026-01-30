import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { emailIleGiris, emailIleKayitOl, sifreSifirlamaMailiGonder } from '../services/authService';
import { Logo, Wordmark } from '../components';

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

// ============================================
// GLASSMORPHISM GİRİŞ EKRANI
// ============================================
const GirisEkrani = ({ setEkran }) => {
  const { googleIleGirisYap, setIslemYukleniyor, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);

  const handleKullaniciAdiGiris = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi || !sifre) {
      bildirimGoster('Kullanıcı adı ve şifre gerekli!', 'hata');
      return;
    }

    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await emailIleGiris(email, sifre);
    setIslemYukleniyor(false);

    if (result.success) {
      bildirimGoster('Hoş geldin! 🎉');
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  const handleGoogleGiris = async () => {
    const result = await googleIleGirisYap();
    if (result?.message) bildirimGoster(result.message);
    else if (result?.error) bildirimGoster(result.error, 'hata');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-20 animate-float-1"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-400 rounded-full blur-3xl opacity-20 animate-float-2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-15 animate-float-3"></div>
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500 rounded-3xl blur-lg opacity-40"></div>
        
        <div className="relative glass-panel rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <div className="flex justify-center mb-2">
              <Wordmark size="lg" />
            </div>
            <p className="text-white/60">Hesabınıza giriş yapın</p>
          </div>

          {/* Social */}
          <button
            onClick={handleGoogleGiris}
            disabled={islemYukleniyor}
            className="w-full glass-panel-hover p-4 rounded-xl mb-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white font-semibold">Google ile Giriş</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-sm">veya</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleKullaniciAdiGiris} className="space-y-4">
            <div className="glass-input-group">
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="glass-input-group">
              <input
                type={sifreGoster ? 'text' : 'password'}
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                className="glass-input pr-12"
              />
              <button
                type="button"
                onClick={() => setSifreGoster(!sifreGoster)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {sifreGoster ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEkran('sifremiUnuttum')}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Şifremi unuttum
            </button>

            <button
              type="submit"
              disabled={islemYukleniyor}
              className="w-full glass-button"
            >
              {islemYukleniyor ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span className="text-white/50">Hesabınız yok mu?</span>
            <button onClick={() => setEkran('kayitOl')} className="ml-2 text-orange-400 font-semibold hover:text-orange-300">
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// KAYIT OL EKRANI
// ============================================
const KayitOlEkrani = ({ setEkran }) => {
  const { setIslemYukleniyor, islemYukleniyor, setKayitAsamasi } = useAuth();
  const { bildirimGoster } = useUI();
  
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');

  const handleKayitOl = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi || !sifre || !sifreTekrar) {
      bildirimGoster('Tüm alanları doldur!', 'hata');
      return;
    }
    if (sifre !== sifreTekrar) {
      bildirimGoster('Şifreler eşleşmiyor!', 'hata');
      return;
    }
    if (sifre.length < 6) {
      bildirimGoster('Şifre en az 6 karakter olmalı!', 'hata');
      return;
    }

    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await emailIleKayitOl(email, sifre, kullaniciAdi);
    setIslemYukleniyor(false);

    if (result.success) {
      bildirimGoster('Kayıt başarılı! 🎉');
      setKayitAsamasi('avatar');
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-20 animate-float-1"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8">
          <button onClick={() => setEkran('giris')} className="text-white/70 hover:text-white mb-6">← Geri</button>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h2>
            <p className="text-white/60">bulusaq'a katıl!</p>
          </div>

          <form onSubmit={handleKayitOl} className="space-y-4">
            <div className="glass-input-group">
              <input type="text" placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} className="glass-input" />
            </div>
            <div className="glass-input-group">
              <input type="password" placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)} className="glass-input" />
            </div>
            <div className="glass-input-group">
              <input type="password" placeholder="Şifre Tekrar" value={sifreTekrar} onChange={(e) => setSifreTekrar(e.target.value)} className="glass-input" />
            </div>
            <button type="submit" disabled={islemYukleniyor} className="w-full glass-button">
              {islemYukleniyor ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ŞİFREMİ UNUTTUM
// ============================================
const SifremiUnuttumEkrani = ({ setEkran }) => {
  const { setIslemYukleniyor, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [gonderildi, setGonderildi] = useState(false);

  const handleSifirla = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi) {
      bildirimGoster('Kullanıcı adını gir!', 'hata');
      return;
    }
    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await sifreSifirlamaMailiGonder(email);
    setIslemYukleniyor(false);
    if (result.success) {
      setGonderildi(true);
      bildirimGoster('Talep alındı!');
    } else {
      bildirimGoster('Kullanıcı bulunamadı!', 'hata');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8">
          <button onClick={() => setEkran('giris')} className="text-white/70 hover:text-white mb-6">← Geri</button>
          {!gonderildi ? (
            <>
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">🔐</span>
                <h2 className="text-3xl font-bold text-white mb-2">Şifremi Unuttum</h2>
              </div>
              <form onSubmit={handleSifirla} className="space-y-4">
                <div className="glass-input-group">
                  <input type="text" placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} className="glass-input" />
                </div>
                <button type="submit" disabled={islemYukleniyor} className="w-full glass-button">
                  {islemYukleniyor ? 'Gönderiliyor...' : 'Şifremi Sıfırla'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <span className="text-6xl mb-6 block">✅</span>
              <h2 className="text-3xl font-bold text-white mb-4">Talep Alındı!</h2>
              <button onClick={() => setEkran('giris')} className="text-orange-400 font-semibold">← Giriş ekranına dön</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// AVATAR SEÇİMİ
// ============================================
const AvatarSecimEkrani = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, setKayitAsamasi } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => setKayitAsamasi('giris')} className="text-white/70 hover:text-white mb-6">← Geri</button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Avatarını Seç 🎨</h2>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center text-6xl shadow-lg">
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
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                avatarKategori === kat.key ? 'bg-orange-500 text-white' : 'glass-panel text-white/70'
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-4">
          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  seciliAvatar === avatar ? 'bg-orange-500 scale-110 ring-4 ring-orange-300' : 'glass-panel-hover'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setKayitAsamasi('bilgi')} className="w-full glass-button mt-6">
          Devam Et →
        </button>
      </div>
    </div>
  );
};

// ============================================
// BİLGİ EKRANI
// ============================================
const BilgiEkrani = () => {
  const { seciliAvatar, setKayitAsamasi, profilTamamla, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  const [isim, setIsim] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');

  const handleTamamla = async () => {
    if (!isim.trim() || !kullaniciAdi.trim()) {
      bildirimGoster('Tüm alanları doldur!', 'hata');
      return;
    }
    const result = await profilTamamla(isim, kullaniciAdi);
    if (result.success) {
      bildirimGoster(result.message);
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => setKayitAsamasi('avatar')} className="text-white/70 hover:text-white mb-6">← Geri</button>
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4">
            {seciliAvatar}
          </div>
          <h2 className="text-2xl font-bold text-white">Son Adım! 🚀</h2>
        </div>

        <div className="space-y-4">
          <div className="glass-input-group">
            <input type="text" placeholder="İsim Soyisim" value={isim} onChange={(e) => setIsim(e.target.value)} className="glass-input" />
          </div>
          <div className="glass-input-group">
            <input type="text" placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} className="glass-input" />
          </div>
        </div>

        <button onClick={handleTamamla} disabled={islemYukleniyor} className="w-full glass-button mt-6">
          {islemYukleniyor ? 'Kaydediliyor...' : 'Başlayalım! 🎉'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// ANA BİLEŞEN
// ============================================
const AuthScreens = () => {
  const { kayitAsamasi } = useAuth();
  const [ekran, setEkran] = useState('giris');

  if (kayitAsamasi === 'avatar') return <AvatarSecimEkrani />;
  if (kayitAsamasi === 'bilgi') return <BilgiEkrani />;
  if (ekran === 'kayitOl') return <KayitOlEkrani setEkran={setEkran} />;
  if (ekran === 'sifremiUnuttum') return <SifremiUnuttumEkrani setEkran={setEkran} />;
  return <GirisEkrani setEkran={setEkran} />;
};

export default AuthScreens;
