import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function Card({ children, onClick, selected, className = '' }: CardProps) {
  const clickableClass = onClick ? 'clickable' : '';
  const selectedClass = selected ? 'selected' : '';
  
  return (
    <div 
      className={`card ${clickableClass} ${selectedClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
