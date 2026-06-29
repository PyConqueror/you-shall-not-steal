import { useNavigate } from "react-router-dom";
import { RetrievalFormStep } from "../api/customer-retrieval/RetrievalFormStep";
import { clearAgentSession } from "../api/agent-auth/session";
import { useFlowState } from "../state/useFlowState";
import type { PackageRecord } from "../types";

export function CustomerRetrievalFormPage() {
  const navigate = useNavigate();
  const { packages, selectRetrievalPackage, resetFlowProgress } = useFlowState();

  const handleNext = (pkg: PackageRecord) => {
    selectRetrievalPackage(pkg);
    navigate("/customer/confirm");
  };

  const handleCancel = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return (
    <RetrievalFormStep
      packages={packages}
      onNext={handleNext}
      onCancel={handleCancel}
    />
  );
}
