import { useMemo } from "react";
import type { PackageRecord } from "../../types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { StepHeader } from "../../components/StepHeader";
import {
  calculateStorageCharge,
  formatCurrency,
} from "../../utils/storageCharges";

interface RetrievalConfirmStepProps {
  packageRecord: PackageRecord;
  onConfirm: (retrievedAt: string) => void;
  onBack: () => void;
}

export function RetrievalConfirmStep({ packageRecord, onConfirm, onBack }: RetrievalConfirmStepProps) {
  const currentTime = useMemo(() => new Date().toISOString(), []);

  const charges = useMemo(() => {
    return calculateStorageCharge(packageRecord.droppedOffAt, currentTime);
  }, [packageRecord.droppedOffAt, currentTime]);

  const storageDurationLabel =
    charges.chargeableDays === 0
      ? "Less than 24 hours"
      : `${charges.chargeableDays} day(s)`;

  return (
    <section>
      <StepHeader
        title="Confirm Retrieval"
        description="Check the package details and storage charges before opening the locker."
      />

      <Card className="detail-card">
        <div className="detail-list">
          <p>
            <strong>Locker ID:</strong> {packageRecord.lockerId}
          </p>
          <p>
            <strong>Package Size:</strong>{" "}
            <span className="text-capitalize">{packageRecord.packageSize}</span>
          </p>
          <p>
            <strong>Dropped Off At:</strong>{" "}
            {new Date(packageRecord.droppedOffAt).toLocaleString()}
          </p>
          <p>
            <strong>Current Time:</strong>{" "}
            {new Date(currentTime).toLocaleString()}
          </p>
          <p>
            <strong>Storage Duration:</strong> {storageDurationLabel}
          </p>
          <p>
            <strong>Chargeable Days:</strong> {charges.chargeableDays}
          </p>
          <p>
            <strong>Estimated Storage Charge:</strong>{" "}
            {formatCurrency(charges.totalAmount)}
          </p>
        </div>
      </Card>

      {charges.chargeableDays > 0 && (
        <Card className="charge-card">
          <h4 className="charge-card-title">Storage Charge Breakdown</h4>
          <ul className="charge-list">
            <li className="charge-row">
              <span>First 5 days: {charges.firstTierDays} x RM2</span>
              <span>{formatCurrency(charges.firstTierAmount)}</span>
            </li>
            <li className="charge-row">
              <span>Next 5 days: {charges.secondTierDays} x RM4</span>
              <span>{formatCurrency(charges.secondTierAmount)}</span>
            </li>
            <li className="charge-row charge-row-divider">
              <span>Additional days: {charges.thirdTierDays} x RM6</span>
              <span>{formatCurrency(charges.thirdTierAmount)}</span>
            </li>
            <li className="charge-row charge-row-total">
              <span>Total:</span>
              <span>{formatCurrency(charges.totalAmount)}</span>
            </li>
          </ul>
        </Card>
      )}

      <div className="action-row action-row-spaced">
        <Button variant="outline" onClick={onBack} fullWidth>
          Back
        </Button>
        <Button onClick={() => onConfirm(currentTime)} fullWidth>
          Confirm Retrieval
        </Button>
      </div>
    </section>
  );
}
