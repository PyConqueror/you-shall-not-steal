import type { ReactNode } from "react";

interface SuccessPanelProps {
  title: string;
  children: ReactNode;
}

export function SuccessPanel({ title, children }: SuccessPanelProps) {
  return (
    <div className="success-panel">
      <div className="success-icon">🎉</div>
      <p className="success-kicker">Success</p>
      <h2 className="success-title">{title}</h2>
      <div className="success-content">{children}</div>
    </div>
  );
}
