import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth = false, className = '', children, ...props }: ButtonProps) {
  const baseClass = `btn btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button className={`${baseClass} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
