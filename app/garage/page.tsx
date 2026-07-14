import Link from "next/link";
import { ActivationStepPrompt } from "@/components/activation-setup";
import { AddVehicleForm } from "@/components/add-vehicle-form";
import { GarageImageUploadForm } from "@/components/garage-image-upload-form";
import { getActivationState } from "@/lib/activation";
import { getVehicleAllowance } from "@/lib/billing";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";
import { resolveVehicleImage } from "@/lib/vehicle-images";
import { Card, EmptyState, getButtonClassName } from "@my-car-pal/ui";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";

export default async function GaragePage() {
  const user = await requireCurrentUser();

  const [rawVehicles, activation, allowance] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    getActivationState(user.id),
    getVehicleAllowance(user.id),
  ]);
  const vehicles = await Promise.all(
    rawVehicles.map(async (vehicle) => {
      const uploadedImageUrl = vehicle.imageUrl ? await resolveStoredFileUrl(vehicle.imageUrl) : null;

      return {
        ...vehicle,
        imageUrl: uploadedImageUrl,
        displayImage: await resolveVehicleImage(vehicle, uploadedImageUrl),
      };
    }),
  );
  const showAddVehicleByDefault = vehicles.length === 0;
  const vehicleLimitReached = !allowance.isUnlimited && vehicles.length >= allowance.maxVehicles;

  return (
    <>
      <PageHeader
        eyebrow="Vehicle workspace"
        title="Garage"
        subtitle="Manage your vehicles, keep photos current, and jump into each vehicle profile."
      />

      <ActivationStepPrompt
        state={activation}
        stepIds={["vehicle", "mileage"]}
        badge="Setup"
        title="Build your garage one useful step at a time"
        body="Start with the vehicle itself, then add the details that make reminders and records more helpful."
      />

      <Card as="section" className="section-card" id="add-vehicle">
        <details className="collapsible-panel" open={showAddVehicleByDefault}>
          <summary className="collapsible-summary">
            <span className="section-title collapsible-title">Add Vehicle</span>
            <span className="section-subtitle">
              {showAddVehicleByDefault ? "Start by adding your first vehicle." : "Tap to expand"}
            </span>
          </summary>
          <p className="section-subtitle" style={{ marginTop: "0.75rem" }}>
            {vehicleLimitReached
              ? `${allowance.planLabel} installs include up to ${allowance.maxVehicles} vehicle${allowance.maxVehicles === 1 ? "" : "s"}.`
              : "Year, make, and model are required for manual entry. Cars, motorcycles, and scooters are available in the self-hosted core."}
          </p>
          {!vehicleLimitReached ? (
            <div style={{ marginTop: "1rem" }}>
              <AddVehicleForm allowsMotorcycles={allowance.allowsMotorcycles} />
            </div>
          ) : null}
        </details>
      </Card>

      <Card as="section" className="section-card">
        <SectionHeader title="Your Vehicles" subtitle={`${vehicles.length} vehicle(s) in your Garage.`} />

        {vehicles.length === 0 ? (
          <EmptyState
            title="Start with one vehicle"
            description="Add the vehicle you use most often first. Once that profile exists, the rest of the setup gets much easier."
            style={{ marginTop: "1rem" }}
            actions={
              <div className="inline-links" style={{ marginTop: "0.4rem" }}>
                <Link href="#add-vehicle" className={getButtonClassName()}>
                  Add your first vehicle
                </Link>
                <Link href="/home" className={getButtonClassName({ variant: "secondary" })}>
                  View setup checklist
                </Link>
              </div>
            }
          />
        ) : (
          <ul className="list-reset vehicle-list">
            {vehicles.map((vehicle) => {
              const vehicleLabel = formatVehicleLabel(vehicle);
              return (
                <li key={vehicle.id} className="vehicle-card">
                  <span className="vehicle-card-corner-x" aria-hidden="true">
                    x
                  </span>
                  <div className="vehicle-photo-column">
                    <Link href={`/vehicle/${vehicle.id}`} className="vehicle-image-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicle.displayImage.url}
                        alt={vehicleLabel}
                        className={`vehicle-image${vehicle.displayImage.source !== "upload" ? " vehicle-image-default" : ""}`}
                      />
                    </Link>
                    <GarageImageUploadForm vehicleId={vehicle.id} />
                  </div>

                  <div>
                    <p className="vehicle-title">
                      <Link href={`/vehicle/${vehicle.id}`}>{vehicleLabel}</Link>
                    </p>
                    <p className="vehicle-meta">Added {vehicle.createdAt.toLocaleDateString()}</p>
                    <p className="vehicle-meta">
                      Mileage:{" "}
                      {vehicle.currentOdometer !== null && vehicle.currentOdometer !== undefined
                        ? `${vehicle.currentOdometer.toLocaleString()} mi`
                        : "Not set"}
                    </p>
                    {vehicle.licensePlate ? <p className="vehicle-meta">Plate: {vehicle.licensePlate}</p> : null}
                  </div>

                  <Link href={`/vehicle/${vehicle.id}`} className="nav-link nav-link-active">
                    View vehicle
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
