import type { ReactNode } from 'react';

interface StepHeaderProps {
  title: string;
  description: ReactNode;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="step-header">
      <h2 className="step-title">{title}</h2>
      <p className="step-description">{description}</p>
    </div>
  );
}
