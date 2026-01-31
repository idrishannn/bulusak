import React from 'react';
import { CheckIcon, XIcon } from './Icons';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-fade-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-xl ${
        isSuccess 
          ? 'bg-navy-800/90 border border-gold-500/30' 
          : 'bg-navy-800/90 border border-red-500/30'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-gold-500/20' : 'bg-red-500/20'
        }`}>
          {isSuccess 
            ? <CheckIcon className="w-4 h-4 text-gold-500" />
            : <XIcon className="w-4 h-4 text-red-500" />
          }
        </div>
        <span className={`font-medium ${isSuccess ? 'text-white' : 'text-white'}`}>
          {toast.message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
