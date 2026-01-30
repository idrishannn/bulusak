import React from 'react';
import { ReactComponent as WordmarkSvg } from '../assets/brand/wordmark.svg';

const Wordmark = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <WordmarkSvg className="h-full w-auto" />
    </div>
  );
};

export default Wordmark;
