import type { Locker } from "../../types";

interface LockerCardProps {
  locker: Locker;
  reason: string;
  onClick?: () => void;
}

export function LockerCard({ locker, reason, onClick }: LockerCardProps) {
  let statusClass: string = locker.status;

  if (reason === 'Auto assigned') {
    statusClass = 'auto-assigned';
  } else if (reason === 'Too small') {
    statusClass = 'disabled';
  } else if (reason === 'Occupied') {
    statusClass = 'occupied';
  } else if (reason === 'Under maintenance') {
    statusClass = 'maintenance';
  } else if (reason === 'Available') {
    statusClass = 'available';
  }

  const icon = reason === 'Auto assigned' || reason === 'Available' ? '🔓' : reason === 'Occupied' ? '🔒' : '🚧';
  const isClickable = !!onClick && (reason === 'Available' || reason === 'Auto assigned');

  return (
    <div
      className={`locker-card ${statusClass} ${isClickable ? "is-clickable" : ""}`}
      onClick={isClickable ? onClick : undefined}
    >
      {reason === 'Auto assigned' && <div className="locker-badge">Best Fit</div>}
      <div className="locker-icon">{icon}</div>
      <div className="locker-id">{locker.lockerId}</div>
      <div className="locker-size">{locker.size}</div>
      {reason && reason !== 'Available' && <div className="locker-reason">{reason}</div>}
    </div>
  );
}
