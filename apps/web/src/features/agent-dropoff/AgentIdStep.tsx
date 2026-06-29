import { useState, type FormEvent } from "react";
import type { Agent } from "../../types";
import { mockAgents } from "shared";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StepHeader } from "../../components/StepHeader";

interface AgentIdStepProps {
  onNext: (agent: Agent) => void;
  onCancel: () => void;
}

export function AgentIdStep({ onNext, onCancel }: AgentIdStepProps) {
  const [agentId, setAgentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!agentId.trim()) {
      setError("Please enter an Agent ID.");
      return;
    }

    const foundAgent = mockAgents.find((a) => a.agentId === agentId.trim());
    if (foundAgent) {
      setError(null);
      onNext(foundAgent);
    } else {
      setError("Invalid Agent ID. Please check your ID and try again.");
    }
  };

  return (
    <section>
      <StepHeader
        title="Welcome back, agent!"
        description="Enter your Agent ID to unlock the protected drop-off flow."
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
        <div className="action-row">
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Continue
          </Button>
        </div>
      </form>
    </section>
  );
}
