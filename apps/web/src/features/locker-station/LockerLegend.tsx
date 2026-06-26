export function LockerLegend() {
  return (
    <div className="locker-legend">
      <div className="legend-item">
        <div className="legend-color available"></div>
        <span>Available</span>
      </div>
      <div className="legend-item">
        <div className="legend-color occupied"></div>
        <span>Occupied</span>
      </div>
      <div className="legend-item">
        <div className="legend-color auto-assigned"></div>
        <span>Auto Assigned</span>
      </div>
      <div className="legend-item">
        <div className="legend-color disabled"></div>
        <span>Too Small</span>
      </div>
      <div className="legend-item">
        <div className="legend-color maintenance"></div>
        <span>Maintenance</span>
      </div>
    </div>
  );
}
