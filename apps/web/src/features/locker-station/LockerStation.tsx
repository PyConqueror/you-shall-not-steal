import React from 'react';
import { Locker, PackageSize } from '../../types';
import { getLockerAvailabilityReason } from '../../utils/lockerRules';
import { LockerCard } from './LockerCard';
import { LockerLegend } from './LockerLegend';

interface LockerStationProps {
  lockers: Locker[];
  selectedPackageSize: PackageSize | null;
  selectedLockerId: string | null;
  onSelectLocker: (locker: Locker) => void;
}

export function LockerStation({ lockers, selectedPackageSize, selectedLockerId, onSelectLocker }: LockerStationProps) {
  return (
    <div className="locker-station">
      <div className="locker-grid">
        {lockers.map((locker) => {
          const reason = getLockerAvailabilityReason(locker, selectedPackageSize);
          const isAvailable = reason === null;
          const isSelected = locker.id === selectedLockerId;

          return (
            <LockerCard
              key={locker.id}
              locker={locker}
              reason={reason}
              isSelected={isSelected}
              isAvailable={isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onSelectLocker(locker);
                }
              }}
            />
          );
        })}
      </div>
      <LockerLegend />
    </div>
  );
}
