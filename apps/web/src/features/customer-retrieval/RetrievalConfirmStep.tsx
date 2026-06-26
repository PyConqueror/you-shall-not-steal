import React from 'react';
import { PackageRecord } from '../../types';
import { Button } from '../../components/Button';
import { StepHeader } from '../../components/StepHeader';
import { Card } from '../../components/Card';

interface RetrievalConfirmStepProps {
  packageRecord: PackageRecord;
  onConfirm: () => void;
  onBack: () => void;
}

export function RetrievalConfirmStep({ packageRecord, onConfirm, onBack }: RetrievalConfirmStepProps) {
  const maskedCode = `***${packageRecord.pickupCode.slice(-3)}`;

  return (
    <div>
      <StepHeader 
        title="Confirm Retrieval" 
        description="Please check the package details before opening the locker." 
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p><strong>Locker ID:</strong> {packageRecord.lockerId}</p>
          <p><strong>Package Size:</strong> <span style={{ textTransform: 'capitalize' }}>{packageRecord.packageSize}</span></p>
          <p><strong>Dropped Off At:</strong> {new Date(packageRecord.droppedOffAt).toLocaleString()}</p>
          <p><strong>Pickup Code:</strong> {maskedCode}</p>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Button variant="outline" onClick={onBack} fullWidth>Back</Button>
        <Button onClick={onConfirm} fullWidth>Confirm Retrieval</Button>
      </div>
    </div>
  );
}
