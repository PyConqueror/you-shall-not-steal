import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ProtectedAgentRoute } from "../features/agent-auth/ProtectedAgentRoute";
import { AgentIdPage } from "../pages/AgentIdPage";
import { AgentLockerAssignmentPage } from "../pages/AgentLockerAssignmentPage";
import { AgentPackageSizePage } from "../pages/AgentPackageSizePage";
import { AgentSuccessPage } from "../pages/AgentSuccessPage";
import { CustomerRetrievalConfirmPage } from "../pages/CustomerRetrievalConfirmPage";
import { CustomerRetrievalFormPage } from "../pages/CustomerRetrievalFormPage";
import { CustomerRetrievalSuccessPage } from "../pages/CustomerRetrievalSuccessPage";
import { HomePage } from "../pages/HomePage";

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/agent">
          <Route index element={<Navigate to="/agent/id" replace />} />
          <Route path="id" element={<AgentIdPage />} />
          <Route element={<ProtectedAgentRoute />}>
            <Route path="size" element={<AgentPackageSizePage />} />
            <Route path="locker" element={<AgentLockerAssignmentPage />} />
            <Route path="success" element={<AgentSuccessPage />} />
          </Route>
        </Route>

        <Route path="/customer">
          <Route index element={<Navigate to="/customer/form" replace />} />
          <Route path="form" element={<CustomerRetrievalFormPage />} />
          <Route path="confirm" element={<CustomerRetrievalConfirmPage />} />
          <Route path="success" element={<CustomerRetrievalSuccessPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
