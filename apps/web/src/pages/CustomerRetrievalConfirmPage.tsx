import { Navigate, useNavigate } from "react-router-dom";
import { RetrievalConfirmStep } from "../api/customer-retrieval/RetrievalConfirmStep";
import { useFlowState } from "../state/useFlowState";

export function CustomerRetrievalConfirmPage() {
  const navigate = useNavigate();
  const { retrievalPackage, confirmRetrieval } = useFlowState();

  if (!retrievalPackage) {
    return <Navigate to="/customer/form" replace />;
  }

  const handleConfirm = (retrievedAt: string) => {
    const updatedPackage = confirmRetrieval(retrievedAt);
    if (updatedPackage) {
      navigate("/customer/success");
    }
  };

  return (
    <RetrievalConfirmStep
      packageRecord={retrievalPackage}
      onConfirm={handleConfirm}
      onBack={() => navigate("/customer/form")}
    />
  );
}
