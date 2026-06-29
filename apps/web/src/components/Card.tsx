import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, onClick, selected, className = '', style }: CardProps) {
  const clickableClass = onClick ? "clickable" : "";
  const selectedClass = selected ? "selected" : "";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`card ${clickableClass} ${selectedClass} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      {children}
    </div>
  );
}
