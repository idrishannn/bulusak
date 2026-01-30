import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { emailIleGiris, emailIleKayitOl } from '../services/authService';
import Logo from './Logo';
import Wordmark from './Wordmark';
import { ChevronLeftIcon, CheckIcon } from './Icons';

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '🧔', '👱‍♂️', '👨‍🎓', '👨‍💼', '🤵', '👲'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👰', '🧕', '👧'],
  fantastik: ['🤖', '👽', '👻', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐲']
};

const GirisEkrani = ({ setEkran }) => {
  const { googleIleGirisYap, setIslemYukleniyor, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');

  const handleGiris = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi || !sifre) {
      bildirimGoster('Kullanıcı adı ve şifre gerekli', 'error');
      return;
    }
    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await emailIleGiris(email, sifre);
    setIslemYukleniyor(false);
    if (!result.success) {
      bildirimGoster('Giriş başarısız', 'error');
    }
  };

  const handleGoogleGiris = async () => {
    const result = await googleIleGirisYap();
    if (result?.error) {
      bildirimGoster(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center w-full">
          <Logo size="xl" className="mb-6" />
          <Wordmark size="xl" className="mb-1" />
          <p className="text-dark-400 text-sm mb-12 text-center">planla, buluş, yaşa</p>
        </div>

        <form onSubmit={handleGiris} className="w-full max-w-sm space-y-4">
          <input
            type="text"
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value)}
            placeholder="Kullanıcı adı"
            className="input-dark"
          />
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            placeholder="Şifre"
            className="input-dark"
          />
          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full btn-gold py-4 rounded-xl font-semibold"
          >
            {islemYukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="w-full max-w-sm my-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-500 text-xs">veya</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>
        </div>

        <button
          onClick={handleGoogleGiris}
          disabled={islemYukleniyor}
          className="w-full max-w-sm btn-ghost py-4 rounded-xl font-semibold flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile devam et
        </button>
      </div>

      <div className="p-6 text-center glass border-t border-dark-700/50">
        <p className="text-dark-400 text-sm">
          Hesabın yok mu?{' '}
          <button onClick={() => setEkran('kayit')} className="text-gold-500 font-semibold">
            Kayıt ol
          </button>
        </p>
      </div>
    </div>
  );
};

const KayitEkrani = ({ setEkran }) => {
  const { setIslemYukleniyor, islemYukleniyor, setKayitAsamasi } = useAuth();
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');

  const handleKayit = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi || !sifre || !sifreTekrar) {
      bildirimGoster('Tüm alanları doldur', 'error');
      return;
    }
    if (sifre !== sifreTekrar) {
      bildirimGoster('Şifreler eşleşmiyor', 'error');
      return;
    }
    if (sifre.length < 6) {
      bildirimGoster('Şifre en az 6 karakter olmalı', 'error');
      return;
    }
    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await emailIleKayitOl(email, sifre, kullaniciAdi);
    setIslemYukleniyor(false);
    if (result.success) {
      bildirimGoster('Kayıt başarılı!', 'success');
      setKayitAsamasi('avatar');
    } else {
      bildirimGoster(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <div className="p-4 flex items-center gap-4 glass border-b border-dark-700/50">
        <button onClick={() => setEkran('giris')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Kayıt Ol</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-4" />
          <p className="text-dark-400 text-sm">Hesabını oluştur</p>
        </div>

        <form onSubmit={handleKayit} className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Kullanıcı Adı</label>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder="kullaniciadi"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="En az 6 karakter"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Şifre Tekrar</label>
            <input
              type="password"
              value={sifreTekrar}
              onChange={(e) => setSifreTekrar(e.target.value)}
              placeholder="Şifreyi tekrar gir"
              className="input-dark"
            />
          </div>
          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full btn-gold py-4 rounded-xl font-semibold mt-6"
          >
            {islemYukleniyor ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AvatarSecimEkrani = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, setKayitAsamasi } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <div className="p-4 flex items-center gap-4 glass border-b border-dark-700/50">
        <button onClick={() => setKayitAsamasi('giris')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Avatar Seç</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-5xl">
            {seciliAvatar}
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[
            { key: 'erkek', label: 'Erkek' },
            { key: 'kadin', label: 'Kadın' },
            { key: 'fantastik', label: 'Fantastik' },
          ].map(kat => (
            <button
              key={kat.key}
              onClick={() => setAvatarKategori(kat.key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                avatarKategori === kat.key
                  ? 'btn-gold'
                  : 'btn-ghost'
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <div className="card p-4">
          <div className="grid grid-cols-5 gap-3">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  seciliAvatar === avatar
                    ? 'bg-gold-500/20 border-2 border-gold-500 scale-110'
                    : 'bg-dark-700 border border-dark-600 hover:bg-dark-600'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 glass border-t border-dark-700/50">
        <button
          onClick={() => setKayitAsamasi('bilgi')}
          className="w-full btn-gold py-4 rounded-xl font-semibold"
        >
          Devam Et
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
    if (!isim.trim() || !kullaniciAdi.trim()) {
      bildirimGoster('Tüm alanları doldur', 'error');
      return;
    }
    const result = await profilTamamla(isim, kullaniciAdi);
    if (result.success) {
      bildirimGoster('Hoş geldin!', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <div className="p-4 flex items-center gap-4 glass border-b border-dark-700/50">
        <button onClick={() => setKayitAsamasi('avatar')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Profil Bilgileri</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-5xl">
            {seciliAvatar}
          </div>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">İsim</label>
            <input
              type="text"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              placeholder="Adın Soyadın"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">@</span>
              <input
                type="text"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value.replace('@', ''))}
                placeholder="kullaniciadi"
                className="input-dark pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 glass border-t border-dark-700/50">
        <button
          onClick={handleTamamla}
          disabled={islemYukleniyor}
          className="w-full btn-gold py-4 rounded-xl font-semibold"
        >
          {islemYukleniyor ? 'Kaydediliyor...' : 'Başlayalım'}
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
  if (ekran === 'kayit') return <KayitEkrani setEkran={setEkran} />;
  return <GirisEkrani setEkran={setEkran} />;
};

export default AuthScreens;
