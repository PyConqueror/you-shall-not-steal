import { Locker, PackageSize } from '../../types';
import { getLockerDisplayReason } from '../../utils/lockerRules';
import { LockerCard } from './LockerCard';
import { LockerLegend } from './LockerLegend';

interface LockerStationProps {
  lockers: Locker[];
  selectedPackageSize: PackageSize | null;
  autoAssignedLockerId?: string | null;
}

export function LockerStation({ lockers, selectedPackageSize, autoAssignedLockerId }: LockerStationProps) {
  return (
    <div className="locker-station">
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
