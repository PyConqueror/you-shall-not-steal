import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { PackageRecord } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SuccessPanel } from "@/components/SuccessPanel";

const DROP_OFF_TIME_OFFSETS = [1, 6, 11] as const;
type DropOffTimeOffset = (typeof DROP_OFF_TIME_OFFSETS)[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  onSendEmail: (customerEmail: string) => void | Promise<void>;
  onClearSendEmailFeedback: () => void;
  isSendingEmail: boolean;
  sendEmailErrorMessage: string | null;
  sendEmailSuccessMessage: string | null;
  onUpdateDropOffTime: (newTime: string) => void | Promise<void>;
  isUpdatingDropOffTime: boolean;
  updateErrorMessage: string | null;
}

export function DropOffSuccessStep({
  packageRecord,
  onDropAnother,
  onGoHome,
  onSendEmail,
  onClearSendEmailFeedback,
  isSendingEmail,
  sendEmailErrorMessage,
  sendEmailSuccessMessage,
  onUpdateDropOffTime,
  isUpdatingDropOffTime,
  updateErrorMessage,
}: DropOffSuccessStepProps) {
  const selectedOffset = useMemo(
    () => getSelectedDropOffOffset(packageRecord.droppedOffAt),
    [packageRecord.droppedOffAt],
  );
  const [customerEmail, setCustomerEmail] = useState(
    packageRecord.customerEmail ?? "",
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const sentCustomerEmail = packageRecord.customerEmail?.trim() ?? "";
  const isEmailLocked = sentCustomerEmail.length > 0;
  const emailSuccessMessage =
    sendEmailSuccessMessage ??
    (isEmailLocked
      ? `Pickup details already sent to ${sentCustomerEmail}.`
      : null);

  useEffect(() => {
    setCustomerEmail(packageRecord.customerEmail ?? "");
  }, [packageRecord.customerEmail]);

  const setDropOffTimeOffset = (daysAgo: DropOffTimeOffset) => {
    const newTime = new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString();
    void onUpdateDropOffTime(newTime);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isEmailLocked) {
      return;
    }

    const normalizedCustomerEmail = customerEmail.trim();

    if (!normalizedCustomerEmail) {
      setEmailError("Please enter the customer's email address.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedCustomerEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError(null);
    await onSendEmail(normalizedCustomerEmail);
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
          <h4 className="notice-card-title">Email pickup details</h4>
          <p className="notice-card-copy">
            {isEmailLocked
              ? "Pickup details have already been emailed for this package."
              : "Send the pickup code and locker details straight to the customer."}
          </p>
          <form onSubmit={handleEmailSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="customer-email">
                Customer Email
              </label>
              <input
                id="customer-email"
                type="email"
                className="input-field"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (emailError) {
                    setEmailError(null);
                  }
                  if (sendEmailErrorMessage || sendEmailSuccessMessage) {
                    onClearSendEmailFeedback();
                  }
                }}
                disabled={isSendingEmail || isEmailLocked}
                autoComplete="email"
              />
            </div>
            <ErrorMessage message={emailError ?? sendEmailErrorMessage} />
            {emailSuccessMessage ? (
              <p className="notice-card-copy">
                <strong>{emailSuccessMessage}</strong>
              </p>
            ) : null}
            <Button
              type="submit"
              fullWidth
              disabled={isSendingEmail || isEmailLocked}
            >
              {isEmailLocked
                ? "Email Sent"
                : isSendingEmail
                  ? "Sending..."
                  : "Send Pickup Details"}
            </Button>
          </form>
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
              disabled={isUpdatingDropOffTime}
              className={selectedOffset === daysAgo ? "is-selected" : ""}
              onClick={() => setDropOffTimeOffset(daysAgo)}
            >
              Set drop-off to {daysAgo} day{daysAgo === 1 ? "" : "s"} ago
            </Button>
          ))}
        </div>
        <ErrorMessage message={updateErrorMessage} />
      </Card>

      <div className="action-column success-actions">
        <Button onClick={onDropAnother}>Drop off another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </section>
  );
}
