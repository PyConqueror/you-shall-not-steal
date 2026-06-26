import { PackageRecord } from '../../types';
import { SuccessPanel } from '../../components/SuccessPanel';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

interface DropOffSuccessStepProps {
  packageRecord: PackageRecord;
  onDropAnother: () => void;
  onGoHome: () => void;
  onUpdateDropOffTime: (newTime: string) => void;
}

export function DropOffSuccessStep({ packageRecord, onDropAnother, onGoHome, onUpdateDropOffTime }: DropOffSuccessStepProps) {
  
  const setDemoTime = (daysAgo: number) => {
    const newTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    onUpdateDropOffTime(newTime);
  };

  return (
    <div>
      <SuccessPanel title="Package safely stored!">
        <p style={{ marginBottom: '1.5rem' }}>
          Package dropped off successfully!<br/>
          <strong>Share this pickup code with the customer.</strong>
        </p>
        
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
          <p><strong>Agent ID:</strong> {packageRecord.agentId}</p>
          <p><strong>Package Size:</strong> <span style={{ textTransform: 'capitalize' }}>{packageRecord.packageSize}</span></p>
          <p><strong>Locker ID:</strong> {packageRecord.lockerId}</p>
          <p><strong>Drop-off Time:</strong> {new Date(packageRecord.droppedOffAt).toLocaleString()}</p>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>PICKUP CODE</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '0.2rem', color: '#ffb703' }}>
              {packageRecord.pickupCode}
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', textAlign: 'left', fontSize: '0.9rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#e76f51' }}>Storage charges may apply</h4>
          <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
            Packages are free to store for the first 24 hours.<br/>
            After that, storage charges are calculated daily.
          </p>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>First 5 days:</strong> RM2/day</li>
            <li><strong>Next 5 days:</strong> RM4/day</li>
            <li><strong>After 10 days:</strong> RM6/day</li>
          </ul>
        </div>
      </SuccessPanel>

      <Card style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px dashed #dee2e6' }}>
        <h4 style={{ color: '#6c757d', marginBottom: '1rem', textAlign: 'center' }}>Demo Testing Tools</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => setDemoTime(1)}>Set drop-off to 1 day ago</Button>
          <Button variant="outline" onClick={() => setDemoTime(6)}>Set drop-off to 6 days ago</Button>
          <Button variant="outline" onClick={() => setDemoTime(11)}>Set drop-off to 11 days ago</Button>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <Button onClick={onDropAnother}>Drop off another package</Button>
        <Button variant="outline" onClick={onGoHome}>Go Home</Button>
      </div>
    </div>
  );
}
