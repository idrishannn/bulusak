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
    <div className={themeClasses.emptyState}>
      {/* Collage-style tilted icon container with neumorphic shadow */}
      <div className={themeClasses.emptyStateIcon}>
        {icon || <Logo size="md" className="opacity-50" />}
      </div>

      {/* Display heading with serif font */}
      <h3 className={`${themeClasses.emptyStateTitle} ${themeClasses.text}`}>
        {title}
      </h3>

      <p className={themeClasses.emptyStateDesc}>
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          className="btn-gold px-6 py-3.5 rounded-2xl font-semibold mt-6"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
