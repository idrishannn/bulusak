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
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Clean icon container */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        isDark ? 'bg-surface-tertiary' : 'bg-slate-100'
      }`}>
        {icon || <Logo size="md" className="opacity-50" />}
      </div>

      {/* Clean heading */}
      <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text}`}>
        {title}
      </h3>

      <p className={`text-sm max-w-xs ${themeClasses.textMuted}`}>
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          className="btn-primary px-6 py-2.5 rounded-ig mt-6 text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
