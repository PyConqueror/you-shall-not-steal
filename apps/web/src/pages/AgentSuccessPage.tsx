import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  sendEmail,
  updateAgentDropoffTime,
} from "@/lib/api/agent-dropoff/api";
import {
  getErrorMessage,
  isUnauthorizedApiError,
} from "@/lib/errors/get-error-message";
import { DropOffSuccessStep } from "@/feature/agent-dropoff/DropOffSuccessStep";
import { clearAgentSession, getAgentSession } from "@/feature/agent-auth/session";
import { useFlowState } from "@/state/useFlowState";

export function AgentSuccessPage() {
  const navigate = useNavigate();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailErrorMessage, setSendEmailErrorMessage] = useState<string | null>(
    null,
  );
  const [sendEmailSuccessMessage, setSendEmailSuccessMessage] = useState<string | null>(
    null,
  );
  const [isUpdatingDropOffTime, setIsUpdatingDropOffTime] = useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
    null,
  );
  const {
    latestDropOffPackage,
    selectedPackageSize,
    recordAgentDropOff,
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

  const clearSendEmailFeedback = () => {
    setSendEmailErrorMessage(null);
    setSendEmailSuccessMessage(null);
  };

  const handleSendEmail = async (customerEmail: string) => {
    if (!latestDropOffPackage || latestDropOffPackage.customerEmail) {
      return;
    }

    const session = getAgentSession();

    if (!session) {
      handleUnauthorized();
      return;
    }

    setIsSendingEmail(true);
    clearSendEmailFeedback();

    try {
      const response = await sendEmail(
        {
          packageId: latestDropOffPackage.packageId,
          customerEmail,
        },
        session.token,
      );
      recordAgentDropOff(response.package);
      setSendEmailSuccessMessage(`Pickup details sent to ${customerEmail}.`);
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        handleUnauthorized();
        return;
      }

      setSendEmailErrorMessage(
        getErrorMessage(
          error,
          "Unable to email the customer right now. Please try again.",
        ),
      );
    } finally {
      setIsSendingEmail(false);
    }
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
      if (isUnauthorizedApiError(error)) {
        handleUnauthorized();
        return;
      }

      setUpdateErrorMessage(
        getErrorMessage(
          error,
          "Unable to update the drop-off time right now. Please try again.",
        ),
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
      onSendEmail={handleSendEmail}
      onClearSendEmailFeedback={clearSendEmailFeedback}
      isSendingEmail={isSendingEmail}
      sendEmailErrorMessage={sendEmailErrorMessage}
      sendEmailSuccessMessage={sendEmailSuccessMessage}
      onUpdateDropOffTime={handleUpdateDropOffTime}
      isUpdatingDropOffTime={isUpdatingDropOffTime}
      updateErrorMessage={updateErrorMessage}
    />
  );
}
