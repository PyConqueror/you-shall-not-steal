import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <Link to="/" className="brand-pill">
          📦
            Smart Locker
          </Link>
          <span className="app-header-badge">Station Workspace</span>
        </div>

        <h1 className="app-title">Smart Package Locker</h1>
        <p className="app-subtitle">
          A brighter, more polished station interface for agent drop-offs and
          parcel retrieval.
        </p>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
