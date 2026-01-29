import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { emailIleGiris, emailIleKayitOl, sifreSifirlamaMailiGonder } from '../services/authService';

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

const GirisEkrani = ({ setEkran }) => {
  const { googleIleGirisYap, setIslemYukleniyor, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');

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
      bildirimGoster('Kullanıcı adı veya şifre hatalı!', 'hata');
    }
  };

  const handleGoogleGiris = async () => {
    const result = await googleIleGirisYap();
    
    if (result?.message) {
      bildirimGoster(result.message);
    } else if (result?.error) {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
        <div className="absolute top-[40%] left-[30%] w-72 h-72 bg-yellow-600 rounded-full blur-[100px] opacity-20 orb-3"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 glass-panel rounded-3xl mx-auto flex items-center justify-center border border-white/20">
              <span className="text-4xl">✨</span>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">Buluşak</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-4"></div>
          <p className="text-white/60 text-lg font-semibold">planla, buluş, yaşa</p>
        </div>

        <form onSubmit={handleKullaniciAdiGiris} className="w-full max-w-sm space-y-4">
          <div>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder="Kullanıcı Adı"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <div>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="Şifre"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {islemYukleniyor ? '⏳ Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEkran('sifremiUnuttum')}
          className="mt-3 text-sm text-white/60 hover:text-orange-400 font-semibold transition-colors"
        >
          Şifremi Unuttum
        </button>

        <div className="w-full max-w-sm flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-sm text-white/40 font-semibold uppercase tracking-wide">veya</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        <div className="w-full max-w-sm">
          <button
            onClick={handleGoogleGiris}
            disabled={islemYukleniyor}
            className="w-full glass-panel text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 active:scale-[0.98]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Devam Et
          </button>
        </div>
      </div>

      <div className="p-6 text-center glass-nav border-t border-white/10 relative z-10">
        <p className="text-white/60 text-sm font-medium">
          Hesabın yok mu?{' '}
          <button 
            onClick={() => setEkran('kayitOl')}
            className="text-orange-400 font-bold hover:text-orange-300 transition-colors"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

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

    if (kullaniciAdi.length < 3) {
      bildirimGoster('Kullanıcı adı en az 3 karakter olmalı!', 'hata');
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
    const isim = kullaniciAdi;
    const result = await emailIleKayitOl(email, sifre, isim);
    setIslemYukleniyor(false);

    if (result.success) {
      bildirimGoster('Kayıt başarılı! 🎉');
      setKayitAsamasi('avatar');
    } else {
      if (result.error.includes('already') || result.error.includes('zaten')) {
        bildirimGoster('Bu kullanıcı adı zaten alınmış!', 'hata');
      } else {
        bildirimGoster(result.error, 'hata');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
      </div>

      <div className="p-4 flex items-center glass-nav border-b border-white/10 relative z-10">
        <button 
          onClick={() => setEkran('giris')} 
          className="text-white text-2xl hover:text-orange-400 transition-colors p-2"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Geri</h2>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Kayıt Ol 🎉</h2>
          <p className="text-white/60">Hesabını oluştur</p>
        </div>

        <form onSubmit={handleKayitOl} className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-sm font-bold text-white/60 mb-2 block">Kullanıcı Adı</label>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder="kullaniciadi"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-white/60 mb-2 block">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-white/60 mb-2 block">Şifre Tekrar</label>
            <input
              type="password"
              value={sifreTekrar}
              onChange={(e) => setSifreTekrar(e.target.value)}
              placeholder="Şifreyi tekrar gir"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-6"
          >
            {islemYukleniyor ? '⏳ Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
      </div>
    </div>
  );
};

const SifremiUnuttumEkrani = ({ setEkran }) => {
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  const handleSifirla = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi) {
      bildirimGoster('Kullanıcı adı gerekli!', 'hata');
      return;
    }

    setYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await sifreSifirlamaMailiGonder(email);
    setYukleniyor(false);

    if (result.success) {
      setGonderildi(true);
      bildirimGoster('Şifre sıfırlama bağlantısı gönderildi!');
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
      </div>

      <div className="p-4 flex items-center glass-nav border-b border-white/10 relative z-10">
        <button 
          onClick={() => setEkran('giris')} 
          className="text-white text-2xl hover:text-orange-400 transition-colors p-2"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Geri</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
        {gonderildi ? (
          <div className="text-center">
            <span className="text-6xl">✉️</span>
            <h2 className="text-2xl font-bold text-white mt-4">Mail Gönderildi!</h2>
            <p className="text-white/60 mt-2">Şifre sıfırlama bağlantısı email adresine gönderildi</p>
            <button
              onClick={() => setEkran('giris')}
              className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <span className="text-6xl">🔑</span>
              <h2 className="text-2xl font-bold text-white mt-4">Şifremi Unuttum</h2>
              <p className="text-white/60 mt-2">Kullanıcı adını gir, şifre sıfırlama bağlantısı gönderelim</p>
            </div>

            <form onSubmit={handleSifirla} className="w-full max-w-sm space-y-4">
              <input
                type="text"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value)}
                placeholder="Kullanıcı Adı"
                className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
              />

              <button
                type="submit"
                disabled={yukleniyor}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {yukleniyor ? '⏳ Gönderiliyor...' : 'Şifre Sıfırla'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const AvatarSecimEkrani = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, setKayitAsamasi } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
      </div>

      <div className="p-4 flex items-center glass-nav border-b border-white/10 relative z-10">
        <button 
          onClick={() => setKayitAsamasi('giris')} 
          className="text-white text-2xl hover:text-orange-400 transition-colors p-2"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Geri</h2>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Avatarını Seç 🎨</h2>
          <p className="text-white/60">Seni en iyi yansıtan avatarı bul</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 glass-panel-active border-4 border-orange-500 rounded-3xl flex items-center justify-center text-6xl shadow-lg shadow-orange-500/30">
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
                avatarKategori === kat.key
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'glass-panel text-white border border-white/20'
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-4 border border-white/10">
          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  seciliAvatar === avatar
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg scale-110 ring-4 ring-orange-400/50'
                    : 'glass-input hover:bg-white/20'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 glass-nav border-t border-white/10 relative z-10">
        <button
          onClick={() => setKayitAsamasi('bilgi')}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
};

const BilgiEkrani = () => {
  const { seciliAvatar, setKayitAsamasi, profilTamamla, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  
  const [isim, setIsim] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');

  const handleTamamla = async () => {
    if (!isim.trim()) {
      bildirimGoster('İsim gerekli!', 'hata');
      return;
    }

    if (!kullaniciAdi.trim()) {
      bildirimGoster('Kullanıcı adı gerekli!', 'hata');
      return;
    }

    if (kullaniciAdi.length < 3) {
      bildirimGoster('Kullanıcı adı en az 3 karakter olmalı!', 'hata');
      return;
    }

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
      </div>

      <div className="p-4 flex items-center glass-nav border-b border-white/10 relative z-10">
        <button 
          onClick={() => setKayitAsamasi('avatar')} 
          className="text-white text-2xl hover:text-orange-400 transition-colors p-2"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Geri</h2>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="w-24 h-24 glass-panel-active border-4 border-orange-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg shadow-orange-500/30">
            {seciliAvatar}
          </div>
          <h2 className="text-2xl font-bold text-white">Son Adım! 🚀</h2>
          <p className="text-white/60">Profilini tamamla</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-sm font-bold text-white/60 mb-2 block">İsim Soyisim</label>
            <input
              type="text"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="w-full glass-input text-white rounded-2xl p-4 placeholder-white/40 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-white/60 mb-2 block">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
              <input
                type="text"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value.replace('@', ''))}
                placeholder="ahmetyilmaz"
                className="w-full glass-input text-white rounded-2xl p-4 pl-9 placeholder-white/40 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 glass-nav border-t border-white/10 relative z-10">
        <button
          onClick={handleTamamla}
          disabled={islemYukleniyor}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {islemYukleniyor ? '⏳ Kaydediliyor...' : 'Başlayalım! 🎉'}
        </button>
      </div>
    </div>
  );
};

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
