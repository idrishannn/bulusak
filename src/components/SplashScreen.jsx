import React from 'react';
import Logo from './Logo';
import Wordmark from './Wordmark';

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center relative overflow-hidden texture-grain">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Neumorphic logo container */}
        <div
          className="w-32 h-32 rounded-3xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(145deg, #0f3358, #0b2744)',
            boxShadow: '12px 12px 24px #0a1f36, -12px -12px 24px #103564'
          }}
        >
          <Logo size="xl" className="glow-gold" />
        </div>

        <div className="mt-4">
          <Wordmark size="xl" />
        </div>

        {/* Handwritten-style tagline */}
        <p className="mt-3 text-navy-400 text-lg label-handwritten tracking-wide">
          planla, buluş, yaşa
        </p>

        {/* Neumorphic loading dots */}
        <div className="mt-12 flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                background: 'linear-gradient(145deg, #e8c026, #d4af37)',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
