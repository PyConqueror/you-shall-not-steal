import type { Locker, PackageSize } from "../../types";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StepHeader } from "../../components/StepHeader";
import { LockerStation } from "../locker-station/LockerStation";

interface AutoLockerAssignmentStepProps {
  lockers: Locker[];
  selectedSize: PackageSize;
  recommendedLocker: Locker | null;
  isLoading: boolean;
  isSubmitting: boolean;
  hasLoadError: boolean;
  errorMessage: string | null;
  onConfirm: (assignedLocker: Locker) => void;
  onBack: () => void;
}

export function AutoLockerAssignmentStep({
  lockers,
  selectedSize,
  recommendedLocker,
  isLoading,
  isSubmitting,
  hasLoadError,
  errorMessage,
  onConfirm,
  onBack,
}: AutoLockerAssignmentStepProps) {
  const showNoLockerMessage =
    !isLoading && !errorMessage && recommendedLocker === null;

  return (
    <section>
      {isLoading ? (
        <StepHeader
          title="Finding recommended locker"
          description={`Checking the best available locker for your ${selectedSize} package.`}
        />
      ) : hasLoadError ? (
        <StepHeader
          title="Unable to load lockers"
          description="We couldn't load locker availability right now."
        />
      ) : recommendedLocker ? (
        <StepHeader
          title="Recommended Locker"
          description={
            <>
              <strong>{recommendedLocker.lockerId}</strong>
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

      <ErrorMessage message={errorMessage} />

      {showNoLockerMessage && (
        <ErrorMessage message="No suitable locker is available right now. Please try again later." />
      )}

      <LockerStation
        lockers={lockers}
        selectedPackageSize={selectedSize}
        autoAssignedLockerId={recommendedLocker?.id ?? null}
      />

      <div className="action-row action-row-spaced">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          fullWidth
        >
          Back
        </Button>
        <Button
          onClick={() => recommendedLocker && onConfirm(recommendedLocker)}
          disabled={isLoading || isSubmitting || !recommendedLocker}
          fullWidth
        >
          {isSubmitting ? "Confirming..." : "Confirm Drop-Off"}
        </Button>
      </div>
    </section>
  );
}
