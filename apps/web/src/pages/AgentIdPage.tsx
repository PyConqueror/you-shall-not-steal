import { useNavigate } from "react-router-dom";
import { AgentIdStep } from "../api/agent-dropoff/AgentIdStep";
import { loginAgent } from "../api/agent-auth/api";
import { clearAgentSession, createAgentSession } from "../api/agent-auth/session";
import { useFlowState } from "../state/useFlowState";

export function AgentIdPage() {
  const navigate = useNavigate();
  const { beginAgentFlow, resetFlowProgress } = useFlowState();

  const handleNext = async (agentId: string) => {
    const session = await loginAgent(agentId);
    createAgentSession(session);
    beginAgentFlow(session.agent);
    navigate("/agent/size");
  };

  const handleCancel = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return <AgentIdStep onNext={handleNext} onCancel={handleCancel} />;
}
