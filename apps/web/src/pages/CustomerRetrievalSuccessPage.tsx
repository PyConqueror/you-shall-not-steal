import { Navigate, useNavigate } from "react-router-dom";
import { RetrievalSuccessStep } from "../api/customer-retrieval/RetrievalSuccessStep";
import { clearAgentSession } from "../api/agent-auth/session";
import { useFlowState } from "../state/useFlowState";

export function CustomerRetrievalSuccessPage() {
  const navigate = useNavigate();
  const { retrievalPackage, resetCustomerFlow, resetFlowProgress } =
    useFlowState();

  if (!retrievalPackage) {
    return <Navigate to="/customer/form" replace />;
  }

  if (retrievalPackage.status !== "retrieved") {
    return <Navigate to="/customer/confirm" replace />;
  }

  const handleRetrieveAnother = () => {
    resetCustomerFlow();
    navigate("/customer/form");
  };

  const handleGoHome = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return (
    <RetrievalSuccessStep
      packageRecord={retrievalPackage}
      onRetrieveAnother={handleRetrieveAnother}
      onGoHome={handleGoHome}
    />
  );
}
