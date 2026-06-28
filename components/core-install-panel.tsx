type CoreInstallPanelProps = {
  allowsMotorcycles: boolean;
  isUnlimited: boolean;
};

export function CoreInstallPanel({ allowsMotorcycles, isUnlimited }: CoreInstallPanelProps) {
  return (
    <div className="subsection-card" style={{ marginTop: "1rem" }}>
      <h3 className="section-title">Self-hosted core</h3>
      <p className="section-subtitle">
        This install runs with local account data, local file storage by default, and no managed-cloud billing gate.
      </p>
      <p className="section-subtitle" style={{ marginTop: "0.45rem" }}>
        Vehicle allowance: <strong>{isUnlimited ? "unlimited" : "configured"}</strong>.{" "}
        {allowsMotorcycles ? "Cars, motorcycles, and scooters are enabled." : "Cars are enabled."}
      </p>
    </div>
  );
}
