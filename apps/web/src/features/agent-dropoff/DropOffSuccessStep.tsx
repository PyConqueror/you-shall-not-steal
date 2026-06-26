import React from 'react';
import { PackageRecord } from '../../types';
import { SuccessPanel } from '../../components/SuccessPanel';
import { Button } from '../../components/Button';

interface DropOffSuccessStepProps {
  packageRecord: PackageRecord;
  onDropAnother: () => void;
  onGoHome: () => void;
}

export function DropOffSuccessStep({ packageRecord, onDropAnother, onGoHome }: DropOffSuccessStepProps) {
  return (
    <div>
      <SuccessPanel title="Package safely stored!">
        <p style={{ marginBottom: '1.5rem' }}>
          Package dropped off successfully!<br/>
          <strong>Share this pickup code with the customer.</strong>
        </p>
        
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
          <p><strong>Agent ID:</strong> {packageRecord.agentId}</p>
          <p><strong>Package Size:</strong> {packageRecord.packageSize}</p>
          <p><strong>Locker ID:</strong> {packageRecord.lockerId}</p>
          <p><strong>Drop-off Time:</strong> {new Date(packageRecord.droppedOffAt).toLocaleString()}</p>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>PICKUP CODE</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '0.2rem', color: '#ffb703' }}>
              {packageRecord.pickupCode}
            </div>
          </div>
        </div>
      </SuccessPanel>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <Button onClick={onDropAnother}>Drop off another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </div>
  );
}
