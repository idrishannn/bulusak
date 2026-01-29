import React from 'react';

const YuklemeEkrani = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
        <div className="absolute top-[40%] left-[30%] w-72 h-72 bg-yellow-600 rounded-full blur-[100px] opacity-20 orb-3"></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="w-20 h-20 glass-panel rounded-3xl mx-auto flex items-center justify-center mb-6 animate-pulse">
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Buluşak</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-4"></div>
        <p className="text-white/60 font-medium">Yükleniyor...</p>
        
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default YuklemeEkrani;
