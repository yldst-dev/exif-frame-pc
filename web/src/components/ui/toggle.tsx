import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false,
  size = 'md'
}) => {
  const toggleSizes = {
    sm: {
      switch: 'w-8 h-5',
      thumb: 'w-3 h-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5'
    },
    md: {
      switch: 'w-10 h-6',
      thumb: 'w-4 h-4',
      translate: checked ? 'translate-x-5' : 'translate-x-1'
    }
  };

  const currentSize = toggleSizes[size];

  return (
    <div className="flex items-start space-x-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2 mt-0.5
          ${checked 
            ? 'bg-blue-600' 
            : 'bg-gray-200 dark:bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${currentSize.switch}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-lg 
            transform ring-0 transition duration-200 ease-in-out mt-0.5
            ${currentSize.thumb} ${currentSize.translate}
          `}
        />
      </button>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;