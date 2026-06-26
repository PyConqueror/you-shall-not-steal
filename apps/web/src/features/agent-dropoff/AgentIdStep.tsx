import React, { useState } from 'react';
import { Agent } from '../../types';
import { mockAgents } from '../../mocks/agents';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StepHeader } from '../../components/StepHeader';

interface AgentIdStepProps {
  onNext: (agent: Agent) => void;
  onCancel: () => void;
}

export function AgentIdStep({ onNext, onCancel }: AgentIdStepProps) {
  const [agentId, setAgentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId.trim()) {
      setError('Please enter an Agent ID.');
      return;
    }

    const foundAgent = mockAgents.find((a) => a.agentId === agentId.trim());
    if (foundAgent) {
      setError(null);
      onNext(foundAgent);
    } else {
      setError('Invalid Agent ID. Please check your ID and try again.');
    }
  };

  return (
    <div>
      <StepHeader 
        title="Welcome back, agent!" 
        description="Please enter your Agent ID to continue." 
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. AGT-1001"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        />
        <ErrorMessage message={error} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>Cancel</Button>
          <Button type="submit" fullWidth>Continue</Button>
        </div>
      </form>
    </div>
  );
}
