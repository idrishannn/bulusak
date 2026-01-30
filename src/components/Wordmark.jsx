import React from 'react';
import wordmarkPng from '../assets/brand/wordmark.png';
import { APP_NAME } from '../constants';

const Wordmark = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10'
  };

  return (
    <img
      src={wordmarkPng}
      alt={APP_NAME}
      className={`${sizes[size]} w-auto ${className}`}
    />
  );
};

export default Wordmark;
