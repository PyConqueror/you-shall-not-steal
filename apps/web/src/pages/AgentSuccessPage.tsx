import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AgentDropoffApiError,
  updateAgentDropoffTime,
} from "../api/agent-dropoff/api";
import { DropOffSuccessStep } from "../api/agent-dropoff/DropOffSuccessStep";
import { clearAgentSession, getAgentSession } from "../api/agent-auth/session";
import { useFlowState } from "../state/useFlowState";

export function AgentSuccessPage() {
  const navigate = useNavigate();
  const [isUpdatingDropOffTime, setIsUpdatingDropOffTime] = useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
    null,
  );
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

  const handleUnauthorized = () => {
    clearAgentSession();
    navigate("/agent/id", { replace: true });
  };

  const handleUpdateDropOffTime = async (newTime: string) => {
    if (!latestDropOffPackage) {
      return;
    }

    const session = getAgentSession();

    if (!session) {
      handleUnauthorized();
      return;
    }

    setIsUpdatingDropOffTime(true);
    setUpdateErrorMessage(null);

    try {
      const response = await updateAgentDropoffTime(
        {
          packageId: latestDropOffPackage.packageId,
          droppedOffAt: newTime,
        },
        session.token,
      );
      updateLatestDropOffTime(response.package.droppedOffAt);
    } catch (error) {
      if (
        error instanceof AgentDropoffApiError &&
        error.statusCode === 401
      ) {
        handleUnauthorized();
        return;
      }

      setUpdateErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the drop-off time right now. Please try again.",
      );
    } finally {
      setIsUpdatingDropOffTime(false);
    }
  };

  return (
    <DropOffSuccessStep
      packageRecord={latestDropOffPackage}
      onDropAnother={handleDropAnother}
      onGoHome={handleGoHome}
      onUpdateDropOffTime={handleUpdateDropOffTime}
      isUpdatingDropOffTime={isUpdatingDropOffTime}
      updateErrorMessage={updateErrorMessage}
    />
  );
}
