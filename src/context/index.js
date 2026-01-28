import React from 'react';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';
import { UIProvider } from './UIContext';

// Context Exports
export { AuthProvider, useAuth } from './AuthContext';
export { DataProvider, useData } from './DataContext';
export { UIProvider, useUI, tema } from './UIContext';

// Combined Provider - Tüm provider'ları tek bir yerde birleştir
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </UIProvider>
    </AuthProvider>
  );
};
