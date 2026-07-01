import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AutoLockerAssignmentStep } from "@/feature/agent-dropoff/AutoLockerAssignmentStep";
import {
  confirmAgentDropoff,
  getAgentDropoffLockers,
} from "@/lib/api/agent-dropoff/api";
import { ApiError } from "@/lib/api/errors";
import {
  getErrorMessage,
  isUnauthorizedApiError,
} from "@/lib/errors/get-error-message";
import {
  clearAgentSession,
  getAgentSession,
} from "@/feature/agent-auth/session";
import { useFlowState } from "@/state/useFlowState";
import type { Locker } from "@/types";

export function AgentLockerAssignmentPage() {
  const navigate = useNavigate();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [recommendedLocker, setRecommendedLocker] = useState<Locker | null>(null);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedAgent,
    selectedPackageSize,
    recordAgentDropOff,
  } = useFlowState();

  const handleUnauthorized = useCallback(() => {
    clearAgentSession();
    navigate("/agent/id", { replace: true });
  }, [navigate]);

  const loadLockers = useCallback(async () => {
    if (!selectedPackageSize) {
      return;
    }

    const session = getAgentSession();

    if (!session) {
      handleUnauthorized();
      return;
    }

    setIsLoading(true);
    setLoadErrorMessage(null);

    try {
      const response = await getAgentDropoffLockers(
        selectedPackageSize,
        session.token,
      );
      setLockers(response.lockers);
      setRecommendedLocker(response.recommendedLocker);
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        handleUnauthorized();
        return;
      }

      setLockers([]);
      setRecommendedLocker(null);
      setLoadErrorMessage(
        getErrorMessage(
          error,
          "Unable to load lockers right now. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, selectedPackageSize]);

  useEffect(() => {
    void loadLockers();
  }, [loadLockers]);

  const handleConfirm = async (locker: Locker) => {
    if (!selectedPackageSize) {
      return;
    }

    const session = getAgentSession();

    if (!session) {
      handleUnauthorized();
      return;
    }

    setIsSubmitting(true);
    setConfirmErrorMessage(null);

    try {
      const response = await confirmAgentDropoff(
        {
          packageSize: selectedPackageSize,
          lockerId: locker.lockerId,
        },
        session.token,
      );

      recordAgentDropOff(response.package);
      navigate("/agent/success");
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        handleUnauthorized();
        return;
      }

      setConfirmErrorMessage(
        getErrorMessage(
          error,
          "Unable to complete the drop-off right now. Please try again.",
        ),
      );

      if (
        error instanceof ApiError &&
        (error.code === "LOCKER_NOT_FOUND" ||
          error.code === "NO_SUITABLE_LOCKER" ||
          error.code === "LOCKER_RECOMMENDATION_CHANGED" ||
          error.code === "LOCKER_UNAVAILABLE" ||
          error.code === "LOCKER_SIZE_MISMATCH")
      ) {
        await loadLockers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedAgent) {
    return <Navigate to="/agent/id" replace />;
  }

  if (!selectedPackageSize) {
    return <Navigate to="/agent/size" replace />;
  }

  const errorMessage = loadErrorMessage ?? confirmErrorMessage;

  return (
    <AutoLockerAssignmentStep
      lockers={lockers}
      selectedSize={selectedPackageSize}
      recommendedLocker={recommendedLocker}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      hasLoadError={loadErrorMessage !== null}
      errorMessage={errorMessage}
      onConfirm={handleConfirm}
      onBack={() => navigate("/agent/size")}
    />
  );
}
