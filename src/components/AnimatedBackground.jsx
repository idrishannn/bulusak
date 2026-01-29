import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-35 orb-1"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-30 orb-2"></div>
      <div className="absolute top-[40%] left-[30%] w-72 h-72 bg-yellow-600 rounded-full blur-[100px] opacity-20 orb-3"></div>
    </div>
  );
};

export default AnimatedBackground;
