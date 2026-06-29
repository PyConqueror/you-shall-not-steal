import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { clearAgentSession } from "../features/agent-auth/session";
import { useFlowState } from "../state/useFlowState";

export function HomePage() {
  const navigate = useNavigate();
  const { resetFlowProgress } = useFlowState();

  const startAgentFlow = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/agent/id");
  };

  const startCustomerFlow = () => {
    resetFlowProgress();
    clearAgentSession();
    navigate("/customer/form");
  };

  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-layout">
          <div className="hero-content">
            <span className="hero-badge">Locker Operations</span>
            <h2 className="hero-title">
              Choose how you want to use the locker station.
            </h2>
            <p className="hero-copy">
              Start an agent drop-off or retrieve a parcel from the two flow
              cards below.
            </p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orb hero-orb-large">📦</div>
            <div className="hero-orb hero-orb-small">🔐</div>
            <div className="hero-mini-card">
              <span className="hero-mini-kicker">Fast Routing</span>
              <strong>Protected drop-off flow</strong>
              <span>Quick parcel retrieval</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <Card onClick={startAgentFlow} className="flow-card flow-card-agent">
          <div className="flow-card-emoji">🚚</div>
          <div className="flow-card-content">
            <span className="flow-card-kicker">Protected Flow</span>
            <h3>Agent Drop-Off</h3>
            <p>
              Validate an agent ID, unlock the protected drop-off journey, and
              auto-assign the best-fit locker.
            </p>
            <div className="flow-card-tags">
              <span>Protected access</span>
              <span>Auto assignment</span>
            </div>
            <div className="flow-card-footer">
              <span className="flow-card-cta">Open Agent Drop-Off</span>
            </div>
          </div>
        </Card>

        <Card
          onClick={startCustomerFlow}
          className="flow-card flow-card-customer"
        >
          <div className="flow-card-emoji">📬</div>
          <div className="flow-card-content">
            <span className="flow-card-kicker">Open Flow</span>
            <h3>Retrieve Parcel</h3>
            <p>
              Enter a locker ID and pickup code, review storage charges, and
              complete package collection.
            </p>
            <div className="flow-card-tags">
              <span>Fast lookup</span>
              <span>Charge summary</span>
            </div>
            <div className="flow-card-footer">
              <span className="flow-card-cta">Open Parcel Retrieval</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
