import { useMemo } from 'react';
import { Locker, PackageSize } from '../../types';
import { LockerStation } from '../locker-station/LockerStation';
import { Button } from '../../components/Button';
import { StepHeader } from '../../components/StepHeader';
import { getSmallestAvailableLocker } from '../../utils/lockerRules';

interface AutoLockerAssignmentStepProps {
  lockers: Locker[];
  selectedSize: PackageSize;
  onConfirm: (assignedLocker: Locker) => void;
  onBack: () => void;
}

export function AutoLockerAssignmentStep({ 
  lockers, 
  selectedSize, 
  onConfirm, 
  onBack 
}: AutoLockerAssignmentStepProps) {
  
  const assignedLocker = useMemo(() => {
    return getSmallestAvailableLocker(lockers, selectedSize);
  }, [lockers, selectedSize]);

  return (
    <div>
      {assignedLocker ? (
        <StepHeader 
          title="Recommended Locker" 
          description={
            <>
              <strong>{assignedLocker.lockerId}</strong><br/>
              This is the smallest available locker that can fit your <span style={{ textTransform: 'capitalize' }}>{selectedSize}</span> package.
            </>
          } 
        />
      ) : (
        <StepHeader 
          title="No locker available" 
          description="We couldn't find a suitable locker for this package size right now." 
        />
      )}

      {!assignedLocker && (
        <div className="error-message" style={{ marginBottom: '2rem' }}>
          No suitable locker is available right now. Please try again later.
        </div>
      )}

      <LockerStation 
        lockers={lockers} 
        selectedPackageSize={selectedSize} 
        autoAssignedLockerId={assignedLocker?.id || null}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Button variant="outline" onClick={onBack} fullWidth>Back</Button>
        <Button 
          onClick={() => assignedLocker && onConfirm(assignedLocker)} 
          disabled={!assignedLocker} 
          fullWidth
        >
          Confirm Drop-Off
        </Button>
      </div>
    </div>
  );
}
