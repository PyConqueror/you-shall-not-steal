import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { StepHeader } from "@/components/StepHeader";

interface AgentIdStepProps {
  onNext: (agentId: string) => Promise<void>;
  onCancel: () => void;
}

export function AgentIdStep({ onNext, onCancel }: AgentIdStepProps) {
  const [agentId, setAgentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedAgentId = agentId.trim();

    if (!normalizedAgentId) {
      setError("Please enter an Agent ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onNext(normalizedAgentId);
      setError(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to log in right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
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
          onChange={(e) => {
            setAgentId(e.target.value);
            if (error) {
              setError(null);
            }
          }}
          disabled={isSubmitting}
        />
        <ErrorMessage message={error} />
        <div className="action-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </div>
      </form>
    </section>
  );
}
