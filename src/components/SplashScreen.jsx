import React from 'react';
import Logo from './Logo';

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-pulse">
          <Logo size="xl" className="glow-gold" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-white tracking-tight">
          Buluşak
        </h1>
        
        <p className="mt-2 text-dark-400 text-sm font-medium tracking-wide">
          planla, buluş, yaşa
        </p>

        <div className="mt-12 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
