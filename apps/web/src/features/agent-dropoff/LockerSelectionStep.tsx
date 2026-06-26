import React from 'react';
import { Locker, PackageSize } from '../../types';
import { LockerStation } from '../locker-station/LockerStation';
import { Button } from '../../components/Button';
import { StepHeader } from '../../components/StepHeader';
import { getLockerAvailabilityReason } from '../../utils/lockerRules';

interface LockerSelectionStepProps {
  lockers: Locker[];
  selectedSize: PackageSize;
  selectedLocker: Locker | null;
  onSelectLocker: (locker: Locker) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function LockerSelectionStep({ 
  lockers, 
  selectedSize, 
  selectedLocker, 
  onSelectLocker, 
  onConfirm, 
  onBack 
}: LockerSelectionStepProps) {
  
  const hasAvailableLockers = lockers.some(l => getLockerAvailabilityReason(l, selectedSize) === null);

  return (
    <div>
      <StepHeader 
        title="Pick an available locker." 
        description={`Select a locker for your ${selectedSize} package.`} 
      />

      {!hasAvailableLockers && (
        <div className="error-message" style={{ marginBottom: '2rem' }}>
          No suitable lockers available right now. Please try another package size or come back later.
        </div>
      )}

      <LockerStation 
        lockers={lockers} 
        selectedPackageSize={selectedSize} 
        selectedLockerId={selectedLocker?.id || null}
        onSelectLocker={onSelectLocker}
      />

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="outline" onClick={onBack} fullWidth>Back</Button>
        <Button onClick={onConfirm} disabled={!selectedLocker} fullWidth>Confirm Drop-Off</Button>
      </div>
    </div>
  );
}
