import type { PackageSize } from "@/types";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";

interface PackageSizeStepProps {
  selectedSize: PackageSize | null;
  onSelectSize: (size: PackageSize) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PackageSizeStep({ selectedSize, onSelectSize, onNext, onBack }: PackageSizeStepProps) {
  return (
    <section>
      <StepHeader
        title="Choose a package size."
        description="Pick the parcel size first, then we'll recommend the best-fit locker."
      />

      <div className="size-options">
        <Card
          onClick={() => onSelectSize("small")}
          selected={selectedSize === "small"}
          className="size-card"
        >
          <div className="size-card-content">
            <div className="size-card-emoji">✉️</div>
            <div>
              <h3>Small</h3>
              <p>Fits documents, small parcels, and compact boxes.</p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => onSelectSize("medium")}
          selected={selectedSize === "medium"}
          className="size-card"
        >
          <div className="size-card-content">
            <div className="size-card-emoji">📦</div>
            <div>
              <h3>Medium</h3>
              <p>Fits normal delivery parcels and medium boxes.</p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => onSelectSize("large")}
          selected={selectedSize === "large"}
          className="size-card"
        >
          <div className="size-card-content">
            <div className="size-card-emoji">🧳</div>
            <div>
              <h3>Large</h3>
              <p>Fits bulky packages and large boxes.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="action-row">
        <Button variant="outline" onClick={onBack} fullWidth>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedSize} fullWidth>
          Continue
        </Button>
      </div>
    </section>
  );
}
