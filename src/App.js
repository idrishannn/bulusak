import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, DataProvider, UIProvider, useUI } from './context';
import { SplashScreen, Header, BottomNav, Toast, Feed, Takvim, Planlar, Profil, Mesajlar, AuthScreens, AppModals } from './components';

const AppContent = () => {
  const { girisYapildi, yukleniyor } = useAuth();
  const { toast } = useUI();

  if (yukleniyor) return <SplashScreen />;
  if (!girisYapildi) return <AuthScreens />;

  return (
    <DataProvider>
      <div className="min-h-screen bg-dark-900">
        <div className="max-w-lg mx-auto min-h-screen flex flex-col relative">
          <Header />
          <main className="flex-1 overflow-y-auto hide-scrollbar">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/takvim" element={<Takvim />} />
              <Route path="/planlar" element={<Planlar />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/mesajlar" element={<Mesajlar />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
        <AppModals />
        <Toast toast={toast} />
      </div>
    </DataProvider>
  );
};

const App = () => (
  <Router>
    <UIProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </UIProvider>
  </Router>
);

export default App;
