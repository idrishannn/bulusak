import React from 'react';
import Logo from './Logo';
import Wordmark from './Wordmark';

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        {/* Clean logo container */}
        <div className="w-24 h-24 flex items-center justify-center mb-4">
          <Logo size="xl" />
        </div>

        <div className="mt-2">
          <Wordmark size="xl" />
        </div>

        {/* Clean tagline */}
        <p className="mt-3 text-dark-300 text-sm tracking-wide">
          planla, buluş, yaşa
        </p>

        {/* Instagram-style loading animation */}
        <div className="mt-12">
          <div className="w-6 h-6 border-2 border-dark-400 border-t-dark-50 rounded-full animate-spin" />
        </div>
      </div>

      {/* From Meta branding at bottom */}
      <div className="absolute bottom-8 flex flex-col items-center">
        <span className="text-dark-400 text-xs">from</span>
        <span className="text-dark-200 text-sm font-medium tracking-wide mt-0.5">BULUSAK</span>
      </div>
    </div>
  );
};

export default SplashScreen;
