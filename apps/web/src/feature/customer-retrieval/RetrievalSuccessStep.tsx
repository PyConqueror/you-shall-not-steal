import type { PackageRecord } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SuccessPanel } from "@/components/SuccessPanel";
import { formatCurrency } from "@/utils/storageCharges";

interface RetrievalSuccessStepProps {
  packageRecord: PackageRecord;
  onRetrieveAnother: () => void;
  onGoHome: () => void;
}

export function RetrievalSuccessStep({ packageRecord, onRetrieveAnother, onGoHome }: RetrievalSuccessStepProps) {
  return (
    <section>
      <SuccessPanel title="Package retrieved successfully!">
        <p className="success-lead">
          Locker {packageRecord.lockerId} is now available again.
        </p>

        <div className="detail-card">
          <div className="detail-list">
            <p>
              <strong>Locker ID:</strong> {packageRecord.lockerId}
            </p>
            <p>
              <strong>Retrieval Time:</strong>{" "}
              {packageRecord.retrievedAt
                ? new Date(packageRecord.retrievedAt).toLocaleString()
                : new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </SuccessPanel>

      <Card className="summary-card">
        <h3 className="summary-card-title">Storage Charge Summary</h3>
        <p className="summary-card-copy">
          <strong>Chargeable Days:</strong> {packageRecord.chargeableDays ?? 0}
        </p>
        <p className="summary-card-total">
          <strong>Total Storage Charge:</strong>{" "}
          {formatCurrency(packageRecord.storageChargeAmount ?? 0)}
        </p>

        <p className="summary-card-note">
          Payment handling is not included in this release yet.
        </p>
      </Card>

      <div className="action-column">
        <Button onClick={onRetrieveAnother}>Retrieve another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </section>
  );
}
