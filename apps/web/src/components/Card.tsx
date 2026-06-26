import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, onClick, selected, className = '', style }: CardProps) {
  const clickableClass = onClick ? 'clickable' : '';
  const selectedClass = selected ? 'selected' : '';
  
  return (
    <div 
      className={`card ${clickableClass} ${selectedClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
