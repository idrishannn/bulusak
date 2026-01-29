import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <img 
        src="/logo.png" 
        alt="Buluşak" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
