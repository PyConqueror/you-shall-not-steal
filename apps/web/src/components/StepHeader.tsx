import React from 'react';

interface StepHeaderProps {
  title: string;
  description: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="step-header">
      <h2 className="step-title">{title}</h2>
      <p className="step-description">{description}</p>
    </div>
  );
}
