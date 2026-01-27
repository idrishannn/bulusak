import React from 'react';

// Context
import { AppProviders, useAuth, useUI } from './context';

// Pages
import { Feed, Takvim, Planlar, Profil } from './pages';
import AuthScreens from './pages/AuthScreens';

// Modals
import AppModals from './modals/AppModals';

// Components
import { Header, AltNav, Bildirim, YuklemeEkrani } from './components';

// Styles
import { globalStyles } from './styles/globalStyles';

// ============================================
// ANA UYGULAMA İÇERİĞİ
// ============================================
const AppContent = () => {
  const { girisYapildi, yukleniyor } = useAuth();
  const { aktifSayfa, tema } = useUI();

  // Yükleniyor
  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  // Giriş yapılmamış
  if (!girisYapildi) {
    return (
      <div>
        <style>{globalStyles}</style>
        <Bildirim />
        <AuthScreens />
      </div>
    );
  }

  // Ana uygulama
  return (
    <div className={`min-h-screen ${tema.bg} transition-colors duration-300`}>
      <style>{globalStyles}</style>
      <Bildirim />
      <Header />
      
      <main className="custom-scrollbar">
        {aktifSayfa === 'feed' && <Feed />}
        {aktifSayfa === 'takvim' && <Takvim />}
        {aktifSayfa === 'planlar' && <Planlar />}
        {aktifSayfa === 'profil' && <Profil />}
      </main>

      <AppModals />
      <AltNav />
    </div>
  );
};

// ============================================
// ANA UYGULAMA (Provider'larla sarılmış)
// ============================================
export default function BulusakApp() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
