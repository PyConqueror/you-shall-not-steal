import React, { useState } from 'react';
import { Agent, Locker, PackageRecord, PackageSize } from './types';
import { mockLockers } from './mocks/lockers';
import { generatePickupCode } from './utils/pickupCode';

import { AppShell } from './components/AppShell';
import { Card } from './components/Card';

import { AgentIdStep } from './features/agent-dropoff/AgentIdStep';
import { PackageSizeStep } from './features/agent-dropoff/PackageSizeStep';
import { LockerSelectionStep } from './features/agent-dropoff/LockerSelectionStep';
import { DropOffSuccessStep } from './features/agent-dropoff/DropOffSuccessStep';

import { RetrievalFormStep } from './features/customer-retrieval/RetrievalFormStep';
import { RetrievalConfirmStep } from './features/customer-retrieval/RetrievalConfirmStep';
import { RetrievalSuccessStep } from './features/customer-retrieval/RetrievalSuccessStep';

type Mode = 'home' | 'agent' | 'customer';
type AgentStep = 'id' | 'size' | 'locker' | 'success';
type CustomerStep = 'form' | 'confirm' | 'success';

function App() {
  // Global State
  const [currentMode, setCurrentMode] = useState<Mode>('home');
  const [lockers, setLockers] = useState<Locker[]>(mockLockers);
  const [packages, setPackages] = useState<PackageRecord[]>([]);

  // Agent Flow State
  const [agentStep, setAgentStep] = useState<AgentStep>('id');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedPackageSize, setSelectedPackageSize] = useState<PackageSize | null>(null);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
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
    setSelectedLocker(null);
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

  const handleLockerConfirm = () => {
    if (!selectedAgent || !selectedPackageSize || !selectedLocker) return;

    const newPackage: PackageRecord = {
      packageId: `pkg_${Date.now()}`,
      agentId: selectedAgent.agentId,
      lockerId: selectedLocker.lockerId,
      packageSize: selectedPackageSize,
      pickupCode: generatePickupCode(),
      status: 'stored',
      droppedOffAt: new Date().toISOString(),
    };

    // Update Packages
    setPackages([...packages, newPackage]);

    // Update Lockers
    setLockers(lockers.map(l => 
      l.id === selectedLocker.id 
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

  const handleRetrievalConfirm = () => {
    if (!retrievalPackage) return;

    // Update Packages
    setPackages(packages.map(p => 
      p.packageId === retrievalPackage.packageId 
        ? { ...p, status: 'retrieved', retrievedAt: new Date().toISOString() } 
        : p
    ));

    // Update Lockers
    setLockers(lockers.map(l => 
      l.lockerId === retrievalPackage.lockerId 
        ? { ...l, status: 'available', currentPackageId: null } 
        : l
    ));

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
          <LockerSelectionStep 
            lockers={lockers} 
            selectedSize={selectedPackageSize!} 
            selectedLocker={selectedLocker} 
            onSelectLocker={setSelectedLocker} 
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
              setSelectedLocker(null);
              setLatestDropOffPackage(null);
            }} 
            onGoHome={goHome} 
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
