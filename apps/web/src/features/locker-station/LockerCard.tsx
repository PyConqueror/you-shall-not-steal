import React from 'react';
import { Locker } from '../../types';

interface LockerCardProps {
  locker: Locker;
  reason: string | null;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
}

export function LockerCard({ locker, reason, isSelected, isAvailable, onClick }: LockerCardProps) {
  let statusClass = locker.status;
  if (reason === 'Too Small') {
    statusClass = 'disabled';
  } else if (isSelected) {
    statusClass = 'selected';
  }

  const icon = locker.status === 'available' ? '🔓' : locker.status === 'occupied' ? '🔒' : '🚧';

  return (
    <div 
      className={`locker-card ${statusClass}`}
      onClick={onClick}
    >
      <div className="locker-icon">{icon}</div>
      <div className="locker-id">{locker.lockerId}</div>
      <div className="locker-size">{locker.size}</div>
      {reason && <div className="locker-reason">{reason}</div>}
    </div>
  );
}
