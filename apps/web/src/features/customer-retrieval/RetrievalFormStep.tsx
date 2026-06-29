import { useState, type FormEvent } from "react";
import type { PackageRecord } from "../../types";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StepHeader } from "../../components/StepHeader";

interface RetrievalFormStepProps {
  packages: PackageRecord[];
  onNext: (pkg: PackageRecord) => void;
  onCancel: () => void;
}

export function RetrievalFormStep({ packages, onNext, onCancel }: RetrievalFormStepProps) {
  const [lockerId, setLockerId] = useState("");
  const [pickupCode, setPickupCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!lockerId.trim() || !pickupCode.trim()) {
      setError("Please enter both Locker ID and Pickup Code.");
      return;
    }

    const foundPackage = packages.find(
      (p) => 
        p.lockerId.toLowerCase() === lockerId.trim().toLowerCase() && 
        p.pickupCode === pickupCode.trim() &&
        p.status === 'stored'
    );

    if (foundPackage) {
      setError(null);
      onNext(foundPackage);
    } else {
      setError("Invalid Locker ID or Pickup Code.");
    }
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
            onChange={(e) => setLockerId(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Pickup Code</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 847392"
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value)}
          />
        </div>
        <ErrorMessage message={error} />
        <div className="action-row action-row-spaced">
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Continue
          </Button>
        </div>
      </form>
    </section>
  );
}
