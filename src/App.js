import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
// KORUNAKLI ROUTE (Giriş yapmış kullanıcılar için)
// ============================================
const ProtectedRoute = ({ children }) => {
  const { girisYapildi, yukleniyor } = useAuth();

  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  if (!girisYapildi) {
    return <Navigate to="/giris" replace />;
  }

  return children;
};

// ============================================
// ANA LAYOUT (Header + Content + AltNav)
// ============================================
const MainLayout = ({ children }) => {
  const { tema } = useUI();

  return (
    <div className={`min-h-screen ${tema.bg} transition-colors duration-300`}>
      <Header />
      <main className="custom-scrollbar pb-24">
        {children}
      </main>
      <AppModals />
      <AltNav />
    </div>
  );
};

// ============================================
// UYGULAMA İÇERİĞİ (Routes)
// ============================================
const AppRoutes = () => {
  const { girisYapildi, yukleniyor } = useAuth();

  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route 
        path="/giris" 
        element={girisYapildi ? <Navigate to="/" replace /> : <AuthScreens />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout><Feed /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/takvim" 
        element={
          <ProtectedRoute>
            <MainLayout><Takvim /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/planlar" 
        element={
          <ProtectedRoute>
            <MainLayout><Planlar /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profil" 
        element={
          <ProtectedRoute>
            <MainLayout><Profil /></MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* 404 - Bilinmeyen rotalar ana sayfaya yönlendir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ============================================
// ANA UYGULAMA
// ============================================
export default function BulusakApp() {
  return (
    <BrowserRouter>
      <AppProviders>
        <style>{globalStyles}</style>
        <Bildirim />
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
