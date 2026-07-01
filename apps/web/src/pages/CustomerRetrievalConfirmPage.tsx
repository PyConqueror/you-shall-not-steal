import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { confirmCustomerRetrieval } from "@/lib/api/customer-retrieval/api";
import { RetrievalConfirmStep } from "@/feature/customer-retrieval/RetrievalConfirmStep";
import { useFlowState } from "@/state/useFlowState";

export function CustomerRetrievalConfirmPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { retrievalPackage, retrievalChargePreview, selectRetrievalPackage } =
    useFlowState();

  if (!retrievalPackage) {
    return <Navigate to="/customer/form" replace />;
  }

  if (retrievalPackage.status === "retrieved") {
    return <Navigate to="/customer/success" replace />;
  }

  if (!retrievalChargePreview) {
    return <Navigate to="/customer/form" replace />;
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await confirmCustomerRetrieval({
        lockerId: retrievalPackage.lockerId,
        pickupCode: retrievalPackage.pickupCode,
      });

      selectRetrievalPackage(response.package);
      navigate("/customer/success");
    } catch (confirmError) {
      setErrorMessage(
        confirmError instanceof Error
          ? confirmError.message
          : "Unable to complete the retrieval right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RetrievalConfirmStep
      packageRecord={retrievalPackage}
      chargePreview={retrievalChargePreview}
      onConfirm={handleConfirm}
      onBack={() => {
        setErrorMessage(null);
        navigate("/customer/form");
      }}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
}
