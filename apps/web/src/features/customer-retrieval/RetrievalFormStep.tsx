import React, { useState } from 'react';
import { PackageRecord } from '../../types';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StepHeader } from '../../components/StepHeader';

interface RetrievalFormStepProps {
  packages: PackageRecord[];
  onNext: (pkg: PackageRecord) => void;
  onCancel: () => void;
}

export function RetrievalFormStep({ packages, onNext, onCancel }: RetrievalFormStepProps) {
  const [lockerId, setLockerId] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockerId.trim() || !pickupCode.trim()) {
      setError('Please enter both Locker ID and Pickup Code.');
      return;
    }

    const foundPackage = packages.find(
      (p) => 
        p.lockerId.toLowerCase() === lockerId.trim().toLowerCase() && 
        p.pickupCode === pickupCode.trim() &&
        p.status === 'stored'
    );

    if (foundPackage) {
      setError(null);
      onNext(foundPackage);
    } else {
      setError('Invalid Locker ID or Pickup Code.');
    }
  };

  return (
    <div>
      <StepHeader 
        title="Ready to open your locker?" 
        description="Enter your Locker ID and Pickup Code." 
      />
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Locker ID</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. M-01"
            value={lockerId}
            onChange={(e) => setLockerId(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Pickup Code</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 847392"
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value)}
          />
        </div>
        <ErrorMessage message={error} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>Cancel</Button>
          <Button type="submit" fullWidth>Continue</Button>
        </div>
      </form>
    </div>
  );
}
