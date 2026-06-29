import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidAgentSession } from "./session";

export function ProtectedAgentRoute() {
  const location = useLocation();

  if (!hasValidAgentSession()) {
    return (
      <Navigate
        to="/agent/id"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
