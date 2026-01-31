import React from 'react';
import Logo from './Logo';
import { useTheme } from '../context';

const EmptyState = ({
  title,
  description,
  action,
  actionLabel,
  icon
}) => {
  const { themeClasses, isDark } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-navy-800' : 'bg-slate-200'} flex items-center justify-center mb-4`}>
        {icon || <Logo size="md" className="opacity-30" />}
      </div>

      <h3 className={`text-lg font-semibold ${themeClasses.text} mb-1`}>
        {title}
      </h3>

      <p className={`${themeClasses.textMuted} text-sm mb-6 max-w-xs`}>
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
