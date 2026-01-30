import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { emailIleGiris, emailIleKayitOl, sifreSifirlamaMailiGonder } from '../services/authService';
import Logo from './Logo';
import Wordmark from './Wordmark';
import { ChevronLeftIcon, CheckIcon, EyeIcon, EyeOffIcon, AppleIcon, SpinnerIcon } from './Icons';
import { USERNAME_RULES, AVATAR_CATEGORIES } from '../constants';

const avatarlar = AVATAR_CATEGORIES;

// Kullanıcı adı doğrulama fonksiyonu
const validateUsername = (username) => {
  if (!username) return { valid: false, error: 'Kullanıcı adı gerekli' };

  const clean = username.toLowerCase().trim();

  if (clean.length < USERNAME_RULES.MIN_LENGTH) {
    return { valid: false, error: `En az ${USERNAME_RULES.MIN_LENGTH} karakter olmalı` };
  }

  if (clean.length > USERNAME_RULES.MAX_LENGTH) {
    return { valid: false, error: `En fazla ${USERNAME_RULES.MAX_LENGTH} karakter olabilir` };
  }

  if (!USERNAME_RULES.PATTERN.test(clean)) {
    return { valid: false, error: 'Sadece küçük harf, rakam ve alt çizgi kullanılabilir' };
  }

  const forbidden = USERNAME_RULES.FORBIDDEN_WORDS.find(word => clean.includes(word));
  if (forbidden) {
    return { valid: false, error: `"${forbidden}" kullanılamaz` };
  }

  return { valid: true, error: null };
};

// FAZ 1 - Şifre gücü hesaplama fonksiyonu
const calculatePasswordStrength = (password) => {
  if (!password) return { level: 0, label: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Zayıf', color: 'weak' };
  if (score <= 3) return { level: 2, label: 'Orta', color: 'medium' };
  return { level: 3, label: 'Güçlü', color: 'strong' };
};

// FAZ 1 - Şifre Input Bileşeni (Göster/Gizle özellikli)
const PasswordInput = ({ value, onChange, placeholder, error, showStrength = false, className = '' }) => {
  const [sifreGoster, setSifreGoster] = useState(false);
  const strength = showStrength ? calculatePasswordStrength(value) : null;

  return (
    <div className="space-y-1">
      <div className="password-input-wrapper">
        <input
          type={sifreGoster ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-enhanced ${error ? 'input-error' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setSifreGoster(!sifreGoster)}
          className="password-toggle-btn"
          tabIndex={-1}
        >
          {sifreGoster ? (
            <EyeOffIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Şifre gücü göstergesi */}
      {showStrength && value && (
        <div className="space-y-1">
          <div className="password-strength">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`password-strength-bar ${
                  level <= strength.level ? strength.color : ''
                }`}
              />
            ))}
          </div>
          <p className={`text-xs ${
            strength.color === 'weak' ? 'text-red-400' :
            strength.color === 'medium' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            Şifre gücü: {strength.label}
          </p>
        </div>
      )}
    </div>
  );
};

// FAZ 1 - Geliştirilmiş Giriş Ekranı
const GirisEkrani = ({ setEkran }) => {
  const { googleIleGirisYap, setIslemYukleniyor, islemYukleniyor } = useAuth();
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [formHatalari, setFormHatalari] = useState({});
  const [formShake, setFormShake] = useState(false);

  // FAZ 1 - Şifremi unuttum modal state
  const [sifremiUnuttumAcik, setSifremiUnuttumAcik] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetYukleniyor, setResetYukleniyor] = useState(false);

  const validateForm = () => {
    const hatalar = {};
    if (!kullaniciAdi.trim()) {
      hatalar.kullaniciAdi = 'Kullanıcı adı gerekli';
    }
    if (!sifre) {
      hatalar.sifre = 'Şifre gerekli';
    }
    setFormHatalari(hatalar);
    return Object.keys(hatalar).length === 0;
  };

  const handleGiris = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      return;
    }

    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase().replace('@', '')}@bulusak.local`;
    const result = await emailIleGiris(email, sifre);
    setIslemYukleniyor(false);

    if (!result.success) {
      setFormHatalari({ genel: 'Kullanıcı adı veya şifre hatalı' });
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
    }
  };

  const handleGoogleGiris = async () => {
    const result = await googleIleGirisYap();
    if (result?.error) {
      bildirimGoster(result.error, 'error');
    }
  };

  // FAZ 1 - Apple ile giriş (placeholder - gerçek implementasyon için Firebase Apple Auth gerekli)
  const handleAppleGiris = async () => {
    bildirimGoster('Apple ile giriş yakında aktif olacak', 'warning');
  };

  // FAZ 1 - Şifre sıfırlama
  const handleSifreSifirla = async () => {
    if (!resetEmail.trim()) {
      bildirimGoster('E-posta adresi gerekli', 'error');
      return;
    }

    setResetYukleniyor(true);
    const result = await sifreSifirlamaMailiGonder(resetEmail);
    setResetYukleniyor(false);

    if (result.success) {
      bildirimGoster('Şifre sıfırlama maili gönderildi', 'success');
      setSifremiUnuttumAcik(false);
      setResetEmail('');
    } else {
      bildirimGoster(result.error || 'Bir hata oluştu', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* FAZ 1 - Geliştirilmiş arka plan efektleri */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-gold-500/3 to-transparent rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center w-full">
          {/* FAZ 1 - Logo'ya glow efekti eklendi */}
          <div className="logo-glow mb-6">
            <Logo size="xl" />
          </div>
          <Wordmark size="xl" className="mb-1" />
          <p className="text-dark-400 text-sm mb-12 text-center">planla, buluş, yaşa</p>
        </div>

        {/* FAZ 1 - Genel hata mesajı */}
        {formHatalari.genel && (
          <div className="w-full max-w-sm mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm text-center">{formHatalari.genel}</p>
          </div>
        )}

        <form onSubmit={handleGiris} className={`w-full max-w-sm space-y-4 ${formShake ? 'shake-error' : ''}`}>
          {/* Kullanıcı adı input */}
          <div>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={(e) => {
                setKullaniciAdi(e.target.value);
                if (formHatalari.kullaniciAdi) {
                  setFormHatalari(prev => ({ ...prev, kullaniciAdi: null }));
                }
              }}
              placeholder="Kullanıcı adı"
              className={`input-enhanced ${formHatalari.kullaniciAdi ? 'input-error' : ''}`}
            />
            {formHatalari.kullaniciAdi && (
              <p className="validation-error">{formHatalari.kullaniciAdi}</p>
            )}
          </div>

          {/* FAZ 1 - Şifre input (göster/gizle özellikli) */}
          <div>
            <PasswordInput
              value={sifre}
              onChange={(e) => {
                setSifre(e.target.value);
                if (formHatalari.sifre) {
                  setFormHatalari(prev => ({ ...prev, sifre: null }));
                }
              }}
              placeholder="Şifre"
              error={formHatalari.sifre}
            />
            {formHatalari.sifre && (
              <p className="validation-error">{formHatalari.sifre}</p>
            )}
          </div>

          {/* FAZ 1 - Şifremi unuttum linki */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setSifremiUnuttumAcik(true)}
              className="text-gold-500 text-sm hover:text-gold-400 transition-colors"
            >
              Şifremi unuttum
            </button>
          </div>

          {/* FAZ 1 - Geliştirilmiş giriş butonu */}
          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full btn-gold-enhanced py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {islemYukleniyor ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div className="w-full max-w-sm my-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-500 text-xs">veya şununla devam et</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>
        </div>

        {/* FAZ 1 - Sosyal giriş butonları */}
        <div className="w-full max-w-sm space-y-3">
          {/* Google ile giriş */}
          <button
            onClick={handleGoogleGiris}
            disabled={islemYukleniyor}
            className="btn-google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile devam et
          </button>

          {/* FAZ 1 - Apple ile giriş butonu */}
          <button
            onClick={handleAppleGiris}
            disabled={islemYukleniyor}
            className="btn-apple"
          >
            <AppleIcon className="w-5 h-5" />
            Apple ile devam et
          </button>
        </div>
      </div>

      <div className="p-6 text-center glass border-t border-dark-700/50">
        <p className="text-dark-400 text-sm">
          Hesabın yok mu?{' '}
          <button onClick={() => setEkran('kayit')} className="text-gold-500 font-semibold hover:text-gold-400 transition-colors">
            Kayıt ol
          </button>
        </p>
      </div>

      {/* FAZ 1 - Şifremi Unuttum Modal */}
      {sifremiUnuttumAcik && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSifremiUnuttumAcik(false)} />
          <div className="relative w-full max-w-sm bg-dark-900 rounded-2xl p-6 border border-dark-700 animate-scale-in">
            <h3 className="text-lg font-semibold text-white mb-2">Şifremi Unuttum</h3>
            <p className="text-dark-400 text-sm mb-4">
              E-posta adresini gir, şifre sıfırlama bağlantısı gönderelim.
            </p>

            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="E-posta adresi"
              className="input-enhanced mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSifremiUnuttumAcik(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSifreSifirla}
                disabled={resetYukleniyor}
                className="flex-1 btn-gold-enhanced py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {resetYukleniyor ? (
                  <SpinnerIcon className="w-5 h-5" />
                ) : (
                  'Gönder'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// FAZ 1 - Geliştirilmiş Kayıt Ekranı
const KayitEkrani = ({ setEkran }) => {
  const { setIslemYukleniyor, islemYukleniyor, setKayitAsamasi } = useAuth();
  const { bildirimGoster } = useUI();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [formHatalari, setFormHatalari] = useState({});

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setKullaniciAdi(value);
    if (value) {
      const validation = validateUsername(value);
      setUsernameError(validation.error || '');
    } else {
      setUsernameError('');
    }
  };

  const handleKayit = async (e) => {
    e.preventDefault();
    const hatalar = {};

    if (!kullaniciAdi) {
      hatalar.kullaniciAdi = 'Kullanıcı adı gerekli';
    }
    if (!sifre) {
      hatalar.sifre = 'Şifre gerekli';
    }
    if (!sifreTekrar) {
      hatalar.sifreTekrar = 'Şifre tekrarı gerekli';
    }

    if (Object.keys(hatalar).length > 0) {
      setFormHatalari(hatalar);
      bildirimGoster('Tüm alanları doldur', 'error');
      return;
    }

    // Kullanıcı adı doğrulama
    const usernameValidation = validateUsername(kullaniciAdi);
    if (!usernameValidation.valid) {
      bildirimGoster(usernameValidation.error, 'error');
      return;
    }

    if (sifre !== sifreTekrar) {
      setFormHatalari({ sifreTekrar: 'Şifreler eşleşmiyor' });
      bildirimGoster('Şifreler eşleşmiyor', 'error');
      return;
    }

    // FAZ 1 - Geliştirilmiş şifre kontrolü
    const sifreGucu = calculatePasswordStrength(sifre);
    if (sifreGucu.level < 2) {
      setFormHatalari({ sifre: 'Daha güçlü bir şifre seç' });
      bildirimGoster('Şifre çok zayıf', 'error');
      return;
    }

    setIslemYukleniyor(true);
    const email = `${kullaniciAdi.toLowerCase()}@bulusak.local`;
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
        <button onClick={() => setEkran('giris')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-dark-700 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Kayıt Ol</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="logo-glow mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-dark-400 text-sm">Hesabını oluştur</p>
        </div>

        <form onSubmit={handleKayit} className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Kullanıcı Adı</label>
            <input
              type="text"
              value={kullaniciAdi}
              onChange={handleUsernameChange}
              placeholder="kullaniciadi"
              maxLength={USERNAME_RULES.MAX_LENGTH}
              className={`input-enhanced ${usernameError || formHatalari.kullaniciAdi ? 'input-error' : kullaniciAdi && !usernameError ? 'input-success' : ''}`}
            />
            {usernameError && (
              <p className="validation-error">{usernameError}</p>
            )}
            {kullaniciAdi && !usernameError && (
              <p className="validation-success">
                <CheckIcon className="w-3 h-3" /> Kullanılabilir
              </p>
            )}
          </div>

          {/* FAZ 1 - Şifre alanı (göster/gizle ve güç göstergesi ile) */}
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Şifre</label>
            <PasswordInput
              value={sifre}
              onChange={(e) => {
                setSifre(e.target.value);
                if (formHatalari.sifre) {
                  setFormHatalari(prev => ({ ...prev, sifre: null }));
                }
              }}
              placeholder="En az 6 karakter"
              error={formHatalari.sifre}
              showStrength={true}
            />
            {formHatalari.sifre && (
              <p className="validation-error">{formHatalari.sifre}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Şifre Tekrar</label>
            <PasswordInput
              value={sifreTekrar}
              onChange={(e) => {
                setSifreTekrar(e.target.value);
                if (formHatalari.sifreTekrar) {
                  setFormHatalari(prev => ({ ...prev, sifreTekrar: null }));
                }
              }}
              placeholder="Şifreyi tekrar gir"
              error={formHatalari.sifreTekrar}
            />
            {formHatalari.sifreTekrar && (
              <p className="validation-error">{formHatalari.sifreTekrar}</p>
            )}
            {sifreTekrar && sifre === sifreTekrar && (
              <p className="validation-success">
                <CheckIcon className="w-3 h-3" /> Şifreler eşleşiyor
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={islemYukleniyor}
            className="w-full btn-gold-enhanced py-4 rounded-xl font-semibold mt-6 flex items-center justify-center gap-2"
          >
            {islemYukleniyor ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              'Kayıt Ol'
            )}
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
        <button onClick={() => setKayitAsamasi('giris')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-dark-700 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Avatar Seç</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          {/* FAZ 1 - Avatar önizleme animasyonu */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-5xl transition-all duration-300 hover:scale-110">
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
                  ? 'btn-gold-enhanced'
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
                  seciliAvatar === avatar
                    ? 'bg-gold-500/20 border-2 border-gold-500 scale-110 shadow-gold'
                    : 'bg-dark-700 border border-dark-600 hover:bg-dark-600 hover:scale-105'
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
          className="w-full btn-gold-enhanced py-4 rounded-xl font-semibold"
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
  const [usernameError, setUsernameError] = useState('');

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setKullaniciAdi(value);
    if (value) {
      const validation = validateUsername(value);
      setUsernameError(validation.error || '');
    } else {
      setUsernameError('');
    }
  };

  const handleTamamla = async () => {
    if (!isim.trim() || !kullaniciAdi.trim()) {
      bildirimGoster('Tüm alanları doldur', 'error');
      return;
    }

    // Kullanıcı adı doğrulama
    const usernameValidation = validateUsername(kullaniciAdi);
    if (!usernameValidation.valid) {
      bildirimGoster(usernameValidation.error, 'error');
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
        <button onClick={() => setKayitAsamasi('avatar')} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-dark-700 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Profil Bilgileri</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-5xl transition-all duration-300 hover:scale-110">
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
              className="input-enhanced"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">@</span>
              <input
                type="text"
                value={kullaniciAdi}
                onChange={handleUsernameChange}
                placeholder="kullaniciadi"
                maxLength={USERNAME_RULES.MAX_LENGTH}
                className={`input-enhanced pl-8 ${usernameError ? 'input-error' : kullaniciAdi && !usernameError ? 'input-success' : ''}`}
              />
            </div>
            {usernameError && (
              <p className="validation-error">{usernameError}</p>
            )}
            {kullaniciAdi && !usernameError && (
              <p className="validation-success">
                <CheckIcon className="w-3 h-3" /> Kullanılabilir
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 glass border-t border-dark-700/50">
        <button
          onClick={handleTamamla}
          disabled={islemYukleniyor}
          className="w-full btn-gold-enhanced py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          {islemYukleniyor ? (
            <>
              <SpinnerIcon className="w-5 h-5" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            'Başlayalım'
          )}
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
