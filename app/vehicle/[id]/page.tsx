import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMaintenanceAction } from "@/app/maintenance/actions";
import { EditVehicleProfileForm } from "@/components/edit-vehicle-profile-form";
import { OdometerUpdateForm } from "@/components/odometer-update-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireCurrentUser } from "@/lib/auth-session";
import { formatDateOnlyForInput, formatDateOnlyLabel } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";

type VehiclePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  return {
    title: "Vehicle | My Car Pal",
  };
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const user = await requireCurrentUser();

  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
    include: {
      maintenances: {
        orderBy: { serviceDate: "desc" },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const [signedRegistrationDocUrl, signedMaintenances] = await Promise.all([
    vehicle.registrationDocUrl ? getSignedUrl(vehicle.registrationDocUrl) : Promise.resolve(null),
    Promise.all(
      vehicle.maintenances.map(async (m) => ({
        ...m,
        receiptUrl: m.receiptUrl ? await getSignedUrl(m.receiptUrl) : null,
      })),
    ),
  ]);
  const vehicleForRender = {
    ...vehicle,
    registrationDocUrl: signedRegistrationDocUrl,
    maintenances: signedMaintenances,
  };

  return (
    <>
      <PageHeader
        eyebrow="Vehicle profile"
        title={formatVehicleLabel(vehicleForRender)}
        subtitle="Update vehicle details, mileage, registration, and maintenance history from one workspace."
        actions={
          vehicleForRender.registrationDocUrl ? (
            <a href={vehicleForRender.registrationDocUrl} target="_blank" rel="noreferrer" className="button-chip button-chip-success">
              View registration (new tab)
            </a>
          ) : null
        }
      />

      <section className="section-card">
        <h2 className="section-title">Quick Odometer Update</h2>
        <p className="section-subtitle">Update this vehicle&apos;s mileage without leaving the profile page.</p>
        <div style={{ marginTop: "0.85rem" }}>
          <OdometerUpdateForm vehicleId={vehicleForRender.id} defaultOdometer={vehicleForRender.currentOdometer} />
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title">Registration & Vehicle Info</h2>
        <div style={{ marginTop: "1rem" }}>
          <EditVehicleProfileForm
            vehicleId={vehicleForRender.id}
            vin={vehicleForRender.vin ?? ""}
            licensePlate={vehicleForRender.licensePlate ?? ""}
            registrationExpiresAt={formatDateOnlyForInput(vehicleForRender.registrationExpiresAt)}
            registrationDocUrl={vehicleForRender.registrationDocUrl}
          />
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title">Maintenance History</h2>
        <p className="section-subtitle">Service entries for this vehicle.</p>

        {vehicleForRender.maintenances.length === 0 ? (
          <p style={{ marginTop: "1rem", color: "var(--muted)" }}>No service records yet.</p>
        ) : (
          <ul className="list-reset kv" style={{ marginTop: "1rem" }}>
            {vehicleForRender.maintenances.map((entry) => (
              <li key={entry.id} className="kv-row">
                <span>
                  <strong>{entry.title}</strong>
                  <br />
                  <small style={{ color: "var(--muted)" }}>
                    {formatDateOnlyLabel(entry.serviceDate)} • {entry.odometer.toLocaleString()} mi • {entry.provider}
                  </small>
                  {entry.notes ? (
                    <>
                      <br />
                      <small style={{ color: "var(--muted)" }}>{entry.notes}</small>
                    </>
                  ) : null}
                  {entry.receiptUrl ? (
                    <>
                      <br />
                      <a href={entry.receiptUrl}>View receipt</a>
                    </>
                  ) : null}
                  <br />
                  <Link href={`/maintenance/${entry.id}`}>Edit service</Link>
                </span>
                <span className="service-row-actions">
                  <span>{entry.cost !== null ? `$${entry.cost.toFixed(2)}` : "—"}</span>
                  <form action={deleteMaintenanceAction}>
                    <input type="hidden" name="maintenanceId" value={entry.id} />
                    <button className="button-danger button-small" type="submit">
                      Delete
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
