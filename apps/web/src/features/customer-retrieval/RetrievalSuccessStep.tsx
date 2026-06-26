import React from 'react';
import { PackageRecord } from '../../types';
import { SuccessPanel } from '../../components/SuccessPanel';
import { Button } from '../../components/Button';

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
          <p><strong>Retrieval Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </SuccessPanel>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <Button onClick={onRetrieveAnother}>Retrieve another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </div>
  );
}
