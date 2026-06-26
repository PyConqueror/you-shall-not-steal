import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">📦 Smart Package Locker</h1>
        <p className="app-subtitle">A friendly locker station for package drop-off and retrieval.</p>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
