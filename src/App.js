import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, DataProvider, UIProvider, useUI } from './context';
import {
  AnimatedBackground,
  Header,
  AltNav,
  Bildirim,
  YuklemeEkrani,
  Feed,
  Planlar,
  Takvim,
  Profil,
  AuthScreens,
  AppModals
} from './components';

const AppContent = () => {
  const { girisYapildi, yukleniyor } = useAuth();

  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  if (!girisYapildi) {
    return <AuthScreens />;
  }

  return (
    <DataProvider>
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto hide-scrollbar">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/takvim" element={<Takvim />} />
              <Route path="/planlar" element={<Planlar />} />
              <Route path="/profil" element={<Profil />} />
            </Routes>
          </main>
          <AltNav />
        </div>
        <AppModals />
        <Bildirim />
      </div>
    </DataProvider>
  );
};

const App = () => {
  return (
    <Router>
      <UIProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </UIProvider>
    </Router>
  );
};

export default App;
