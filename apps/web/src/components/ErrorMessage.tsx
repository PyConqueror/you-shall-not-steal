import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="error-message">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}
