import type { Locker, PackageSize } from "@/types";
import { getLockerDisplayReason } from "@/utils/lockerRules";
import { LockerCard } from "@/feature/locker-station/LockerCard";
import { LockerLegend } from "@/feature/locker-station/LockerLegend";

interface LockerStationProps {
  lockers: Locker[];
  selectedPackageSize: PackageSize | null;
  autoAssignedLockerId?: string | null;
}

export function LockerStation({ lockers, selectedPackageSize, autoAssignedLockerId }: LockerStationProps) {
  return (
    <div className="locker-station">
      <div className="locker-station-header">
        <h3>Locker Station Map</h3>
        <p>Available lockers are highlighted so the best fit stands out instantly.</p>
      </div>
      <div className="locker-grid">
        {lockers.map((locker) => {
          const reason = getLockerDisplayReason(locker, selectedPackageSize, autoAssignedLockerId);

          return (
            <LockerCard
              key={locker.id}
              locker={locker}
              reason={reason}
            />
          );
        })}
      </div>
      <LockerLegend />
    </div>
  );
}
