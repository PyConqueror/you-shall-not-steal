import { Navigate, useNavigate } from "react-router-dom";
import { PackageSizeStep } from "../features/agent-dropoff/PackageSizeStep";
import { useFlowState } from "../state/useFlowState";

export function AgentPackageSizePage() {
  const navigate = useNavigate();
  const { selectedAgent, selectedPackageSize, setSelectedPackageSize } =
    useFlowState();

  if (!selectedAgent) {
    return <Navigate to="/agent/id" replace />;
  }

  return (
    <PackageSizeStep
      selectedSize={selectedPackageSize}
      onSelectSize={setSelectedPackageSize}
      onNext={() => navigate("/agent/locker")}
      onBack={() => navigate("/agent/id")}
    />
  );
}
