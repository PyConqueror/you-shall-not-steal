import React from 'react';

interface SuccessPanelProps {
  title: string;
  children: React.ReactNode;
}

export function SuccessPanel({ title, children }: SuccessPanelProps) {
  return (
    <div className="success-panel">
      <div className="success-icon">🎉</div>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
