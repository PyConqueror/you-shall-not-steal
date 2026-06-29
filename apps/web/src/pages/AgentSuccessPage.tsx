import { Navigate, useNavigate } from "react-router-dom";
import { DropOffSuccessStep } from "../api/agent-dropoff/DropOffSuccessStep";
import { clearAgentSession } from "../api/agent-auth/session";
import { useFlowState } from "../state/useFlowState";

export function AgentSuccessPage() {
  const navigate = useNavigate();
  const {
    latestDropOffPackage,
    selectedPackageSize,
    updateLatestDropOffTime,
    resetAgentFlow,
    resetFlowProgress,
  } = useFlowState();

  if (!latestDropOffPackage) {
    return (
      <Navigate
        to={selectedPackageSize ? "/agent/locker" : "/agent/size"}
        replace
      />
    );
  }

  const handleDropAnother = () => {
    resetAgentFlow();
    clearAgentSession();
    navigate("/agent/id");
  };

  const handleGoHome = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return (
    <DropOffSuccessStep
      packageRecord={latestDropOffPackage}
      onDropAnother={handleDropAnother}
      onGoHome={handleGoHome}
      onUpdateDropOffTime={updateLatestDropOffTime}
    />
  );
}
