import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  lookupCustomerRetrieval,
  type CustomerRetrievalCredentials,
} from "@/lib/api/customer-retrieval/api";
import { RetrievalFormStep } from "@/feature/customer-retrieval/RetrievalFormStep";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { clearAgentSession } from "@/feature/agent-auth/session";
import { useFlowState } from "@/state/useFlowState";

export function CustomerRetrievalFormPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectRetrievalPackage, resetFlowProgress } = useFlowState();

  const handleNext = async ({
    lockerId,
    pickupCode,
  }: CustomerRetrievalCredentials) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await lookupCustomerRetrieval({
        lockerId,
        pickupCode,
      });

      selectRetrievalPackage(response.package, response.chargePreview);
      navigate("/customer/confirm");
    } catch (lookupError) {
      setErrorMessage(
        getErrorMessage(
          lookupError,
          "Unable to find the package right now. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/");
  };

  return (
    <RetrievalFormStep
      onNext={handleNext}
      onCancel={handleCancel}
      onClearError={() => setErrorMessage(null)}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
}
