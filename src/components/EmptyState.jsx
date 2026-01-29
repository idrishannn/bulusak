import React from 'react';
import Logo from './Logo';

const EmptyState = ({ 
  title, 
  description, 
  action, 
  actionLabel,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
        {icon || <Logo size="md" className="opacity-30" />}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-1">
        {title}
      </h3>
      
      <p className="text-dark-400 text-sm mb-6 max-w-xs">
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          className="btn-gold px-6 py-3 rounded-xl font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
