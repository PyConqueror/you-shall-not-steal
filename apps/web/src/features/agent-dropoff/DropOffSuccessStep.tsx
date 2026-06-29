import { useMemo } from "react";
import type { PackageRecord } from "../../types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SuccessPanel } from "../../components/SuccessPanel";

const DROP_OFF_TIME_OFFSETS = [1, 6, 11] as const;
type DropOffTimeOffset = (typeof DROP_OFF_TIME_OFFSETS)[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getSelectedDropOffOffset(droppedOffAt: string): DropOffTimeOffset | null {
  const daysAgo = Math.round(
    (Date.now() - new Date(droppedOffAt).getTime()) / MS_PER_DAY,
  );

  return DROP_OFF_TIME_OFFSETS.includes(daysAgo as DropOffTimeOffset)
    ? (daysAgo as DropOffTimeOffset)
    : null;
}

interface DropOffSuccessStepProps {
  packageRecord: PackageRecord;
  onDropAnother: () => void;
  onGoHome: () => void;
  onUpdateDropOffTime: (newTime: string) => void;
}

export function DropOffSuccessStep({ packageRecord, onDropAnother, onGoHome, onUpdateDropOffTime }: DropOffSuccessStepProps) {
  const selectedOffset = useMemo(
    () => getSelectedDropOffOffset(packageRecord.droppedOffAt),
    [packageRecord.droppedOffAt],
  );

  const setDropOffTimeOffset = (daysAgo: DropOffTimeOffset) => {
    const newTime = new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString();
    onUpdateDropOffTime(newTime);
  };

  return (
    <section>
      <SuccessPanel title="Package safely stored!">
        <p className="success-lead">
          Package dropped off successfully!
          <br />
          <strong>Share this pickup code with the customer.</strong>
        </p>

        <div className="detail-card">
          <div className="detail-list">
            <p>
              <strong>Agent ID:</strong> {packageRecord.agentId}
            </p>
            <p>
              <strong>Package Size:</strong>{" "}
              <span className="text-capitalize">{packageRecord.packageSize}</span>
            </p>
            <p>
              <strong>Locker ID:</strong> {packageRecord.lockerId}
            </p>
            <p>
              <strong>Drop-off Time:</strong>{" "}
              {new Date(packageRecord.droppedOffAt).toLocaleString()}
            </p>
          </div>

          <div className="pickup-code-panel">
            <p className="pickup-code-label">Pickup Code</p>
            <div className="pickup-code-value">{packageRecord.pickupCode}</div>
          </div>
        </div>

        <div className="notice-card">
          <h4 className="notice-card-title">Storage charges may apply</h4>
          <p className="notice-card-copy">
            Packages are free to store for the first 24 hours.
            <br />
            After that, storage charges are calculated daily.
          </p>
          <ul className="bulletless-list">
            <li><strong>First 5 days:</strong> RM2/day</li>
            <li><strong>Next 5 days:</strong> RM4/day</li>
            <li><strong>After 10 days:</strong> RM6/day</li>
          </ul>
        </div>
      </SuccessPanel>

      <Card className="helper-card">
        <h4 className="helper-card-title">Drop-Off Time Tools</h4>
        <div className="action-column">
          {DROP_OFF_TIME_OFFSETS.map((daysAgo) => (
            <Button
              key={daysAgo}
              variant="outline"
              className={selectedOffset === daysAgo ? "is-selected" : ""}
              onClick={() => setDropOffTimeOffset(daysAgo)}
            >
              Set drop-off to {daysAgo} day{daysAgo === 1 ? "" : "s"} ago
            </Button>
          ))}
        </div>
      </Card>

      <div className="action-column success-actions">
        <Button onClick={onDropAnother}>Drop off another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </section>
  );
}
