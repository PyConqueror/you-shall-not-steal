import { PackageRecord } from '../../types';
import { SuccessPanel } from '../../components/SuccessPanel';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { formatCurrency } from '../../utils/storageCharges';

interface RetrievalSuccessStepProps {
  packageRecord: PackageRecord;
  onRetrieveAnother: () => void;
  onGoHome: () => void;
}

export function RetrievalSuccessStep({ packageRecord, onRetrieveAnother, onGoHome }: RetrievalSuccessStepProps) {
  return (
    <div>
      <SuccessPanel title="Package retrieved successfully!">
        <p style={{ marginBottom: '1.5rem' }}>
          Locker {packageRecord.lockerId} is now available again.
        </p>
        
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
          <p><strong>Locker ID:</strong> {packageRecord.lockerId}</p>
          <p><strong>Retrieval Time:</strong> {packageRecord.retrievedAt ? new Date(packageRecord.retrievedAt).toLocaleString() : new Date().toLocaleString()}</p>
        </div>
      </SuccessPanel>

      <Card style={{ marginBottom: '2rem', padding: '1.5rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2b2d42' }}>Storage Charge Summary</h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          <strong>Chargeable Days:</strong> {packageRecord.chargeableDays ?? 0}
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e76f51', marginBottom: '1.5rem' }}>
          <strong>Total Storage Charge:</strong> {formatCurrency(packageRecord.storageChargeAmount ?? 0)}
        </p>
        
        <p style={{ fontSize: '0.85rem', color: '#adb5bd', fontStyle: 'italic' }}>
          Payment handling is not implemented in this frontend demo.
        </p>
      </Card>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <Button onClick={onRetrieveAnother}>Retrieve another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </div>
  );
}
