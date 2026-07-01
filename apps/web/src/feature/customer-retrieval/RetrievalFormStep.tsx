import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { StepHeader } from "@/components/StepHeader";
import type { CustomerRetrievalCredentials } from "@/lib/api/customer-retrieval/api";

interface RetrievalFormStepProps {
  onNext: (input: CustomerRetrievalCredentials) => Promise<void>;
  onCancel: () => void;
  onClearError: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function RetrievalFormStep({
  onNext,
  onCancel,
  onClearError,
  isSubmitting,
  errorMessage,
}: RetrievalFormStepProps) {
  const [lockerId, setLockerId] = useState("");
  const [pickupCode, setPickupCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedLockerId = lockerId.trim();
    const normalizedPickupCode = pickupCode.trim();

    if (!normalizedLockerId || !normalizedPickupCode) {
      setLocalError("Please enter both Locker ID and Pickup Code.");
      return;
    }

    setLocalError(null);
    await onNext({
      lockerId: normalizedLockerId,
      pickupCode: normalizedPickupCode,
    });
  };

  return (
    <section>
      <StepHeader
        title="Ready to open your locker?"
        description="Enter your Locker ID and pickup code to review the retrieval details."
      />
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label">Locker ID</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. M-01"
            value={lockerId}
            onChange={(e) => {
              setLockerId(e.target.value);
              if (localError) {
                setLocalError(null);
              }
              if (errorMessage) {
                onClearError();
              }
            }}
            disabled={isSubmitting}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Pickup Code</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 847392"
            value={pickupCode}
            onChange={(e) => {
              setPickupCode(e.target.value);
              if (localError) {
                setLocalError(null);
              }
              if (errorMessage) {
                onClearError();
              }
            }}
            disabled={isSubmitting}
          />
        </div>
        <ErrorMessage message={localError ?? errorMessage} />
        <div className="action-row action-row-spaced">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Looking up..." : "Continue"}
          </Button>
        </div>
      </form>
    </section>
  );
}
