import type { ReactNode } from 'react';

interface StepHeaderProps {
  title: string;
  description: ReactNode;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="step-header">
      <span className="step-eyebrow">Locker Flow</span>
      <h2 className="step-title">{title}</h2>
      <div className="step-description">{description}</div>
    </div>
  );
}
