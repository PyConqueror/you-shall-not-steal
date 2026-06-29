import { useNavigate } from "react-router-dom";
import { AgentIdStep } from "../features/agent-dropoff/AgentIdStep";
import { clearAgentSession, createAgentSession } from "../features/agent-auth/session";
import { useFlowState } from "../state/useFlowState";
import type { Agent } from "../types";

export function AgentIdPage() {
  const navigate = useNavigate();
  const { beginAgentFlow, resetFlowProgress } = useFlowState();

  const handleNext = (agent: Agent) => {
    createAgentSession(agent);
    beginAgentFlow(agent);
    navigate("/agent/size");
  };

  const handleCancel = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return <AgentIdStep onNext={handleNext} onCancel={handleCancel} />;
}
