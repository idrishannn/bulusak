import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../context';
import { ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, LockIcon, GlobeIcon, XIcon } from './Icons';
import { THEMES, PROFILE_PRIVACY } from '../constants';
import { profilGuncelle } from '../services/userService';

const Ayarlar = () => {
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { theme, setTheme, isDark, themeClasses } = useTheme();

  // Profil gizlilik ayarı
  const [profilGizlilik, setProfilGizlilik] = useState(
    kullanici?.profilGizlilik || PROFILE_PRIVACY.PUBLIC
  );

  const [musaitlikGorunur, setMusaitlikGorunur] = useState(
    kullanici?.musaitlikGorunur !== false
  );

  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (kullanici) {
      setProfilGizlilik(kullanici.profilGizlilik || PROFILE_PRIVACY.PUBLIC);
      setMusaitlikGorunur(kullanici.musaitlikGorunur !== false);
    }
  }, [kullanici]);

  const handleProfilGizlilikDegistir = async (yeniDeger) => {
    setProfilGizlilik(yeniDeger);
    if (kullanici?.odUserId) {
      await profilGuncelle(kullanici.odUserId, { profilGizlilik: yeniDeger });
    }
  };

  const handleMusaitlikGorunurDegistir = async (yeniDeger) => {
    setMusaitlikGorunur(yeniDeger);
    if (kullanici?.odUserId) {
      await profilGuncelle(kullanici.odUserId, { musaitlikGorunur: yeniDeger });
    }
  };

  const SettingSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className={`text-xs font-semibold ${themeClasses.textSecondary} mb-2 px-1`}>{title}</h3>
      <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.bgCard} overflow-hidden`}>
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, description, children, onClick, last }) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 ${!last ? `border-b ${themeClasses.border}` : ''} ${onClick ? `cursor-pointer ${themeClasses.bgHover}` : ''}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-navy-800' : 'bg-slate-100'} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${themeClasses.text}`}>{label}</p>
          {description && (
            <p className={`text-sm ${themeClasses.textMuted}`}>{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onClick && <ChevronRightIcon className={`w-5 h-5 ${themeClasses.textMuted}`} />}
      </div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-gold-500' : isDark ? 'bg-navy-700' : 'bg-slate-300'}`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className={`min-h-screen ${themeClasses.bg} pb-32`}>
      <div className={`sticky top-0 z-10 ${themeClasses.glass} border-b ${themeClasses.border} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profil', { state: { menuAcik: true } })}
              className={`w-10 h-10 rounded-xl ${isDark ? 'bg-navy-800' : 'bg-slate-100'} flex items-center justify-center transition-colors active:scale-95`}
            >
              <ChevronLeftIcon className={`w-5 h-5 ${themeClasses.text}`} />
            </button>
            <h1 className={`text-lg font-semibold ${themeClasses.text}`}>Ayarlar</h1>
          </div>
          <button
            onClick={() => navigate('/profil')}
            className={`w-10 h-10 rounded-xl ${isDark ? 'bg-navy-800' : 'bg-slate-100'} flex items-center justify-center transition-colors active:scale-95`}
          >
            <XIcon className={`w-5 h-5 ${themeClasses.text}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Görünüm Ayarları */}
        <SettingSection title="GÖRÜNÜM">
          <SettingRow
            icon={isDark ? MoonIcon : SunIcon}
            label="Tema"
            description={isDark ? 'Koyu tema aktif' : 'Açık tema aktif'}
            last
          >
            <div className="flex gap-2">
              <button
                onClick={() => setTheme(THEMES.LIGHT)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  !isDark
                    ? 'bg-gold-500 text-navy-950'
                    : isDark ? 'bg-navy-800 text-navy-300' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <SunIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme(THEMES.DARK)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isDark
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <MoonIcon className="w-4 h-4" />
              </button>
            </div>
          </SettingRow>
        </SettingSection>

        {/* Gizlilik Ayarları */}
        <SettingSection title="GİZLİLİK">
          <SettingRow
            icon={profilGizlilik === PROFILE_PRIVACY.PRIVATE ? LockIcon : GlobeIcon}
            label="Profil Görünürlüğü"
            description={profilGizlilik === PROFILE_PRIVACY.PUBLIC ? 'Herkes profilini görebilir' : 'Sadece arkadaşların görebilir'}
          >
            <select
              value={profilGizlilik}
              onChange={(e) => handleProfilGizlilikDegistir(e.target.value)}
              className={`${isDark ? 'bg-navy-800 text-slate-100' : 'bg-slate-100 text-slate-900'} rounded-lg px-3 py-1.5 text-sm border-0 outline-none`}
            >
              <option value={PROFILE_PRIVACY.PUBLIC}>Herkese Açık</option>
              <option value={PROFILE_PRIVACY.PRIVATE}>Gizli</option>
            </select>
          </SettingRow>

          <SettingRow
            icon={null}
            label="Müsaitlik Görünürlüğü"
            description="Arkadaşların müsaitliğini görebilir"
            last
          >
            <Toggle value={musaitlikGorunur} onChange={handleMusaitlikGorunurDegistir} />
          </SettingRow>
        </SettingSection>

        {/* Uygulama Bilgisi */}
        <SettingSection title="HAKKINDA">
          <SettingRow
            label="Uygulama"
            description="Plans v1.0.0"
            last
          />
        </SettingSection>
      </div>
    </div>
  );
};

export default Ayarlar;
