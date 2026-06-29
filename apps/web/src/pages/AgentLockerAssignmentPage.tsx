import { Navigate, useNavigate } from "react-router-dom";
import { AutoLockerAssignmentStep } from "../api/agent-dropoff/AutoLockerAssignmentStep";
import { useFlowState } from "../state/useFlowState";
import type { Locker } from "../types";

export function AgentLockerAssignmentPage() {
  const navigate = useNavigate();
  const {
    lockers,
    selectedAgent,
    selectedPackageSize,
    confirmLockerDropOff,
  } = useFlowState();

  if (!selectedAgent) {
    return <Navigate to="/agent/id" replace />;
  }

  if (!selectedPackageSize) {
    return <Navigate to="/agent/size" replace />;
  }

  const handleConfirm = (locker: Locker) => {
    const dropOffPackage = confirmLockerDropOff(locker);
    if (dropOffPackage) {
      navigate("/agent/success");
    }
  };

  return (
    <AutoLockerAssignmentStep
      lockers={lockers}
      selectedSize={selectedPackageSize}
      onConfirm={handleConfirm}
      onBack={() => navigate("/agent/size")}
    />
  );
}
