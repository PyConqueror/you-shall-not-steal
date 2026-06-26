import { useMemo } from 'react';
import { PackageRecord } from '../../types';
import { Button } from '../../components/Button';
import { StepHeader } from '../../components/StepHeader';
import { Card } from '../../components/Card';
import { calculateStorageCharge, formatCurrency } from '../../utils/storageCharges';

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
          <p><strong>Current Time:</strong> {new Date(currentTime).toLocaleString()}</p>
          <p><strong>Storage Duration:</strong> {charges.chargeableDays === 0 ? 'Less than 24 hours' : `${charges.chargeableDays} day(s)`}</p>
          <p><strong>Chargeable Days:</strong> {charges.chargeableDays}</p>
          <p><strong>Estimated Storage Charge:</strong> {formatCurrency(charges.totalAmount)}</p>
        </div>
      </Card>

      {charges.chargeableDays > 0 && (
        <Card style={{ marginTop: '1rem', backgroundColor: '#fffdf5', border: '1px solid #ffe066' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#b08d00' }}>Storage Charge Breakdown</h4>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>First 5 days: {charges.firstTierDays} x RM2</span>
              <span>{formatCurrency(charges.firstTierAmount)}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Next 5 days: {charges.secondTierDays} x RM4</span>
              <span>{formatCurrency(charges.secondTierAmount)}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #ffe066' }}>
              <span>Additional days: {charges.thirdTierDays} x RM6</span>
              <span>{formatCurrency(charges.thirdTierAmount)}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#4a4a4a', fontSize: '1rem' }}>
              <span>Total:</span>
              <span>{formatCurrency(charges.totalAmount)}</span>
            </li>
          </ul>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Button variant="outline" onClick={onBack} fullWidth>Back</Button>
        <Button onClick={() => onConfirm(currentTime)} fullWidth>Confirm Retrieval</Button>
      </div>
    </div>
  );
}
