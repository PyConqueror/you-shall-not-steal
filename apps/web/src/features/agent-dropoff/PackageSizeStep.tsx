import React from 'react';
import { PackageSize } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StepHeader } from '../../components/StepHeader';

interface PackageSizeStepProps {
  selectedSize: PackageSize | null;
  onSelectSize: (size: PackageSize) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PackageSizeStep({ selectedSize, onSelectSize, onNext, onBack }: PackageSizeStepProps) {
  return (
    <div>
      <StepHeader 
        title="Choose a package size." 
        description="Let's find the best locker for this package." 
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <Card 
          onClick={() => onSelectSize('small')} 
          selected={selectedSize === 'small'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>✉️</div>
            <div>
              <h3>Small</h3>
              <p>Fits documents, small parcels, and compact boxes.</p>
            </div>
          </div>
        </Card>

        <Card 
          onClick={() => onSelectSize('medium')} 
          selected={selectedSize === 'medium'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>📦</div>
            <div>
              <h3>Medium</h3>
              <p>Fits normal delivery parcels and medium boxes.</p>
            </div>
          </div>
        </Card>

        <Card 
          onClick={() => onSelectSize('large')} 
          selected={selectedSize === 'large'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>s📦</div>
            <div>
              <h3>Large</h3>
              <p>Fits bulky packages and large boxes.</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="outline" onClick={onBack} fullWidth>Back</Button>
        <Button onClick={onNext} disabled={!selectedSize} fullWidth>Continue</Button>
      </div>
    </div>
  );
}
