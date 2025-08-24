import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  variant = 'ghost', 
  size = 'md', 
  className = '', 
  children, 
  tooltip,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700 focus:ring-gray-500',
    danger: 'bg-white hover:bg-red-50 text-red-600 dark:bg-gray-800 dark:hover:bg-red-900/20 dark:text-red-400 shadow-sm border border-gray-200 dark:border-gray-700 focus:ring-red-500',
    ghost: 'hover:bg-gray-100 text-gray-500 hover:text-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;