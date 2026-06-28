import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMaintenanceAction } from "@/app/maintenance/actions";
import { EditMaintenanceForm } from "@/components/edit-maintenance-form";
import { requireCurrentUser } from "@/lib/auth-session";
import { formatDateOnlyForInput } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";

type EditMaintenancePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMaintenancePage({ params }: EditMaintenancePageProps) {
  const user = await requireCurrentUser();

  const { id } = await params;

  const [entry, vehicles] = await Promise.all([
    prisma.maintenance.findFirst({
      where: { id, vehicle: { userId: user.id } },
      include: {
        vehicle: {
          select: { id: true, userId: true, year: true, make: true, model: true, trim: true },
        },
      },
    }),
    prisma.vehicle.findMany({
      where: { userId: user.id },
      select: { id: true, year: true, make: true, model: true, trim: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!entry || entry.vehicle.userId !== user.id) {
    notFound();
  }

  const signedReceiptUrl = entry.receiptUrl ? await getSignedUrl(entry.receiptUrl) : null;

  const vehicleOptions = vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: formatVehicleLabel(vehicle),
  }));

  return (
    <>
      <section className="section-card">
        <p className="badge">Maintenance</p>
        <h2 className="section-title">Edit Service Record</h2>
        <p className="section-subtitle">
          Update details for {entry.title} on {formatVehicleLabel(entry.vehicle)}.
        </p>
        <div className="inline-links" style={{ marginTop: "0.9rem" }}>
          <Link href="/maintenance" className="nav-link nav-link-active">
            Back to maintenance
          </Link>
          <Link href={`/vehicle/${entry.vehicle.id}`} className="nav-link">
            Open vehicle profile
          </Link>
          <form action={deleteMaintenanceAction}>
            <input type="hidden" name="maintenanceId" value={entry.id} />
            <button className="button-danger button-small" type="submit">
              Delete service
            </button>
          </form>
        </div>
      </section>

      <section className="section-card">
        <EditMaintenanceForm
          maintenanceId={entry.id}
          vehicles={vehicleOptions}
          defaultVehicleId={entry.vehicleId}
          defaultTitle={entry.title}
          defaultServiceDate={formatDateOnlyForInput(entry.serviceDate)}
          defaultOdometer={entry.odometer}
          defaultCost={entry.cost}
          defaultProvider={entry.provider}
          defaultNotes={entry.notes ?? ""}
          receiptUrl={signedReceiptUrl}
        />
      </section>
    </>
  );
}
