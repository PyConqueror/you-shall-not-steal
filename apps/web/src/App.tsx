import { useState } from 'react';
import { Agent, Locker, PackageRecord, PackageSize } from './types';
import { mockLockers } from './mocks/lockers';
import { generatePickupCode } from './utils/pickupCode';
import { calculateStorageCharge } from './utils/storageCharges';

import { AppShell } from './components/AppShell';
import { Card } from './components/Card';

import { AgentIdStep } from './features/agent-dropoff/AgentIdStep';
import { PackageSizeStep } from './features/agent-dropoff/PackageSizeStep';
import { AutoLockerAssignmentStep } from './features/agent-dropoff/AutoLockerAssignmentStep';
import { DropOffSuccessStep } from './features/agent-dropoff/DropOffSuccessStep';

import { RetrievalFormStep } from './features/customer-retrieval/RetrievalFormStep';
import { RetrievalConfirmStep } from './features/customer-retrieval/RetrievalConfirmStep';
import { RetrievalSuccessStep } from './features/customer-retrieval/RetrievalSuccessStep';

type Mode = 'home' | 'agent' | 'customer';
type AgentStep = 'id' | 'size' | 'locker' | 'success';
type CustomerStep = 'form' | 'confirm' | 'success';

const initialMockPackages: PackageRecord[] = [
  {
    packageId: "pkg_existing_001",
    agentId: "AGT-1001",
    lockerId: "S-02",
    packageSize: "small",
    pickupCode: "111111",
    status: "stored",
    droppedOffAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    retrievedAt: null,
  },
  {
    packageId: "pkg_existing_002",
    agentId: "AGT-1002",
    lockerId: "M-02",
    packageSize: "medium",
    pickupCode: "222222",
    status: "stored",
    droppedOffAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    retrievedAt: null,
  },
];

function App() {
  // Global State
  const [currentMode, setCurrentMode] = useState<Mode>('home');
  const [lockers, setLockers] = useState<Locker[]>(mockLockers);
  const [packages, setPackages] = useState<PackageRecord[]>(initialMockPackages);

  // Agent Flow State
  const [agentStep, setAgentStep] = useState<AgentStep>('id');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedPackageSize, setSelectedPackageSize] = useState<PackageSize | null>(null);
  const [latestDropOffPackage, setLatestDropOffPackage] = useState<PackageRecord | null>(null);

  // Customer Flow State
  const [customerStep, setCustomerStep] = useState<CustomerStep>('form');
  const [retrievalPackage, setRetrievalPackage] = useState<PackageRecord | null>(null);

  // --- Handlers: Home ---
  const goHome = () => {
    setCurrentMode('home');
    
    // Reset Agent State
    setAgentStep('id');
    setSelectedAgent(null);
    setSelectedPackageSize(null);
    setLatestDropOffPackage(null);

    // Reset Customer State
    setCustomerStep('form');
    setRetrievalPackage(null);
  };

  // --- Handlers: Agent Flow ---
  const startAgentFlow = () => {
    setCurrentMode('agent');
    setAgentStep('id');
  };

  const handleAgentIdNext = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentStep('size');
  };

  const handlePackageSizeNext = () => {
    setAgentStep('locker');
  };

  const handleLockerConfirm = (assignedLocker: Locker) => {
    if (!selectedAgent || !selectedPackageSize) return;

    const newPackage: PackageRecord = {
      packageId: `pkg_${Date.now()}`,
      agentId: selectedAgent.agentId,
      lockerId: assignedLocker.lockerId,
      packageSize: selectedPackageSize,
      pickupCode: generatePickupCode(),
      status: 'stored',
      droppedOffAt: new Date().toISOString(),
    };

    // Update Packages
    setPackages([...packages, newPackage]);

    // Update Lockers
    setLockers(lockers.map(l => 
      l.id === assignedLocker.id 
        ? { ...l, status: 'occupied', currentPackageId: newPackage.packageId } 
        : l
    ));

    setLatestDropOffPackage(newPackage);
    setAgentStep('success');
  };

  // --- Handlers: Customer Flow ---
  const startCustomerFlow = () => {
    setCurrentMode('customer');
    setCustomerStep('form');
  };

  const handleRetrievalFormNext = (pkg: PackageRecord) => {
    setRetrievalPackage(pkg);
    setCustomerStep('confirm');
  };

  const handleRetrievalConfirm = (retrievedAt: string) => {
    if (!retrievalPackage) return;

    const charges = calculateStorageCharge(retrievalPackage.droppedOffAt, retrievedAt);

    // Update Packages
    setPackages(packages.map(p => 
      p.packageId === retrievalPackage.packageId 
        ? { 
            ...p, 
            status: 'retrieved', 
            retrievedAt,
            chargeableDays: charges.chargeableDays,
            storageChargeAmount: charges.totalAmount
          } 
        : p
    ));

    // Update Lockers
    setLockers(lockers.map(l => 
      l.lockerId === retrievalPackage.lockerId 
        ? { ...l, status: 'available', currentPackageId: null } 
        : l
    ));

    // Also update the local state so the success screen gets the right values
    setRetrievalPackage({
      ...retrievalPackage,
      status: 'retrieved',
      retrievedAt,
      chargeableDays: charges.chargeableDays,
      storageChargeAmount: charges.totalAmount
    });

    setCustomerStep('success');
  };

  // --- Renderers ---
  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
      <Card onClick={startAgentFlow} className="clickable">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '4rem' }}>🚚</div>
          <div>
            <h2 style={{ color: 'var(--primary-hover)', marginBottom: '0.5rem' }}>Agent Drop-Off</h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>For delivery agents storing packages into lockers.</p>
          </div>
        </div>
      </Card>

      <Card onClick={startCustomerFlow} className="clickable">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '4rem' }}>🧍</div>
          <div>
            <h2 style={{ color: 'var(--secondary-hover)', marginBottom: '0.5rem' }}>Customer Retrieval</h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>For customers retrieving packages using Locker ID and Pickup Code.</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAgentFlow = () => {
    switch (agentStep) {
      case 'id':
        return <AgentIdStep onNext={handleAgentIdNext} onCancel={goHome} />;
      case 'size':
        return (
          <PackageSizeStep 
            selectedSize={selectedPackageSize} 
            onSelectSize={setSelectedPackageSize} 
            onNext={handlePackageSizeNext} 
            onBack={() => setAgentStep('id')} 
          />
        );
      case 'locker':
        return (
          <AutoLockerAssignmentStep 
            lockers={lockers} 
            selectedSize={selectedPackageSize!} 
            onConfirm={handleLockerConfirm} 
            onBack={() => setAgentStep('size')} 
          />
        );
      case 'success':
        return (
          <DropOffSuccessStep 
            packageRecord={latestDropOffPackage!} 
            onDropAnother={() => {
              setAgentStep('id');
              setSelectedAgent(null);
              setSelectedPackageSize(null);
              setLatestDropOffPackage(null);
            }} 
            onGoHome={goHome} 
            onUpdateDropOffTime={(newTime) => {
              if (!latestDropOffPackage) return;
              const updated = { ...latestDropOffPackage, droppedOffAt: newTime };
              setLatestDropOffPackage(updated);
              setPackages(packages.map(p => p.packageId === updated.packageId ? updated : p));
            }}
          />
        );
    }
  };

  const renderCustomerFlow = () => {
    switch (customerStep) {
      case 'form':
        return <RetrievalFormStep packages={packages} onNext={handleRetrievalFormNext} onCancel={goHome} />;
      case 'confirm':
        return (
          <RetrievalConfirmStep 
            packageRecord={retrievalPackage!} 
            onConfirm={handleRetrievalConfirm} 
            onBack={() => setCustomerStep('form')} 
          />
        );
      case 'success':
        return (
          <RetrievalSuccessStep 
            packageRecord={retrievalPackage!} 
            onRetrieveAnother={() => {
              setCustomerStep('form');
              setRetrievalPackage(null);
            }} 
            onGoHome={goHome} 
          />
        );
    }
  };

  return (
    <AppShell>
      {currentMode === 'home' && renderHome()}
      {currentMode === 'agent' && renderAgentFlow()}
      {currentMode === 'customer' && renderCustomerFlow()}
    </AppShell>
  );
}

export default App;
