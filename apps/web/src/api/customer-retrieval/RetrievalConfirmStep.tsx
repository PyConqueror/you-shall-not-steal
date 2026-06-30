import type { PackageRecord, StorageChargePreview } from "../../types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StepHeader } from "../../components/StepHeader";
import { formatCurrency } from "../../utils/storageCharges";

interface RetrievalConfirmStepProps {
  packageRecord: PackageRecord;
  chargePreview: StorageChargePreview;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function RetrievalConfirmStep({
  packageRecord,
  chargePreview,
  onConfirm,
  onBack,
  isSubmitting,
  errorMessage,
}: RetrievalConfirmStepProps) {
  const storageDurationLabel =
    chargePreview.chargeableDays === 0
      ? "Less than 24 hours"
      : `${chargePreview.chargeableDays} day(s)`;

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
            {new Date(chargePreview.retrievedAt).toLocaleString()}
          </p>
          <p>
            <strong>Storage Duration:</strong> {storageDurationLabel}
          </p>
          <p>
            <strong>Chargeable Days:</strong> {chargePreview.chargeableDays}
          </p>
          <p>
            <strong>Estimated Storage Charge:</strong>{" "}
            {formatCurrency(chargePreview.totalAmount)}
          </p>
        </div>
      </Card>

      <ErrorMessage message={errorMessage} />

      {chargePreview.chargeableDays > 0 && (
        <Card className="charge-card">
          <h4 className="charge-card-title">Storage Charge Breakdown</h4>
          <ul className="charge-list">
            <li className="charge-row">
              <span>First 5 days: {chargePreview.firstTierDays} x RM2</span>
              <span>{formatCurrency(chargePreview.firstTierAmount)}</span>
            </li>
            <li className="charge-row">
              <span>Next 5 days: {chargePreview.secondTierDays} x RM4</span>
              <span>{formatCurrency(chargePreview.secondTierAmount)}</span>
            </li>
            <li className="charge-row charge-row-divider">
              <span>Additional days: {chargePreview.thirdTierDays} x RM6</span>
              <span>{formatCurrency(chargePreview.thirdTierAmount)}</span>
            </li>
            <li className="charge-row charge-row-total">
              <span>Total:</span>
              <span>{formatCurrency(chargePreview.totalAmount)}</span>
            </li>
          </ul>
        </Card>
      )}

      <div className="action-row action-row-spaced">
        <Button
          variant="outline"
          onClick={onBack}
          fullWidth
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button onClick={onConfirm} fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm Retrieval"}
        </Button>
      </div>
    </section>
  );
}
