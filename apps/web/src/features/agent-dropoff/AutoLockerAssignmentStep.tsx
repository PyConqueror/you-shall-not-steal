import { useMemo } from "react";
import type { Locker, PackageSize } from "../../types";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StepHeader } from "../../components/StepHeader";
import { getSmallestAvailableLocker } from "../../utils/lockerRules";
import { LockerStation } from "../locker-station/LockerStation";

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
    <section>
      {assignedLocker ? (
        <StepHeader
          title="Recommended Locker"
          description={
            <>
              <strong>{assignedLocker.lockerId}</strong>
              <br />
              This is the smallest available locker that can fit your{" "}
              <span className="text-capitalize">{selectedSize}</span> package.
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
        <ErrorMessage message="No suitable locker is available right now. Please try again later." />
      )}

      <LockerStation
        lockers={lockers}
        selectedPackageSize={selectedSize}
        autoAssignedLockerId={assignedLocker?.id || null}
      />

      <div className="action-row action-row-spaced">
        <Button variant="outline" onClick={onBack} fullWidth>
          Back
        </Button>
        <Button
          onClick={() => assignedLocker && onConfirm(assignedLocker)}
          disabled={!assignedLocker}
          fullWidth
        >
          Confirm Drop-Off
        </Button>
      </div>
    </section>
  );
}
