import { AddMaintenanceForm } from "@/components/add-maintenance-form";
import { ActivationStepPrompt } from "@/components/activation-setup";
import { LocalMechanicFinder } from "@/components/local-mechanic-finder";
import { AddServiceScheduleForm } from "@/components/add-service-schedule-form";
import { ServiceHistoryList } from "@/components/service-history-list";
import { UpcomingMaintenanceList } from "@/components/upcoming-maintenance-list";
import { getActivationState } from "@/lib/activation";
import { requireCurrentUser } from "@/lib/auth-session";
import { getVehicleAllowance } from "@/lib/billing";
import { formatDateOnlyForInput } from "@/lib/date-only";
import { computeImportedScheduleForVehicle } from "@/lib/maintenance-schedule";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";
import { Card, EmptyState } from "@my-car-pal/ui";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader, SectionSubtitle, SectionTitle } from "@/components/ui/section-header";

export default async function MaintenancePage() {
  const user = await requireCurrentUser();

  const [vehicles, reminders, serviceHistory, scheduleImports, scheduleOverrides, activation, allowance] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, kind: true, year: true, make: true, model: true, trim: true, drivetrain: true, currentOdometer: true },
    }),
    prisma.reminder.findMany({
      where: { completedAt: null, vehicle: { userId: user.id } },
      include: {
        vehicle: {
          select: { id: true, year: true, make: true, model: true, trim: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.maintenance.findMany({
      where: {
        vehicle: { userId: user.id },
      },
      include: {
        vehicle: {
          select: { id: true, year: true, make: true, model: true, trim: true },
        },
      },
      orderBy: { serviceDate: "desc" },
      take: 200,
    }),
    prisma.serviceScheduleImport.findMany({
      where: { vehicle: { userId: user.id } },
      select: { vehicleId: true },
    }),
    prisma.serviceScheduleOverride.findMany({
      where: { vehicle: { userId: user.id } },
      select: { vehicleId: true, serviceKey: true, dueDate: true },
    }),
    getActivationState(user.id),
    getVehicleAllowance(user.id),
  ]);

  const vehicleOptions = vehicles.map((vehicle) => ({
    id: vehicle.id,
    kind: vehicle.kind,
    label: formatVehicleLabel(vehicle),
    make: vehicle.make,
    model: vehicle.model,
    drivetrain: vehicle.drivetrain,
  }));
  const importedVehicleIds = new Set(scheduleImports.map((item) => item.vehicleId));
  const overrideMap = new Map(scheduleOverrides.map((item) => [`${item.vehicleId}:${item.serviceKey}`, item.dueDate]));
  const setupFirstMode = vehicles.length > 0 && !activation.hasReminderSetup && !activation.hasServiceLog;

  const historyByVehicle = serviceHistory.reduce<Record<string, Array<{ title: string; odometer: number; serviceDate: Date }>>>(
    (acc, entry) => {
      if (!acc[entry.vehicle.id]) {
        acc[entry.vehicle.id] = [];
      }

      acc[entry.vehicle.id].push({
        title: entry.title,
        odometer: entry.odometer,
        serviceDate: entry.serviceDate,
      });
      return acc;
    },
    {},
  );

  const autoUpcomingItems = vehicles
    .filter((vehicle) => importedVehicleIds.has(vehicle.id))
    .flatMap((vehicle) =>
      computeImportedScheduleForVehicle(
        {
          id: vehicle.id,
          kind: vehicle.kind,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          drivetrain: vehicle.drivetrain,
          currentOdometer: vehicle.currentOdometer,
        },
        historyByVehicle[vehicle.id] ?? [],
      ).map((item) => {
        return {
          id: `recommended-${item.id}`,
          title: item.title,
          vehicleId: vehicle.id,
          vehicleLabel: formatVehicleLabel(vehicle),
          dueDateIso: formatDateOnlyForInput(overrideMap.get(`${vehicle.id}:${item.serviceKey}`) ?? item.dueDate),
          detail: item.detail,
          source: "recommended" as const,
          serviceKey: item.serviceKey,
        };
      }),
    );

  const manualUpcomingItems = reminders.map((item) => ({
    id: `manual-${item.id}`,
    title: item.title,
    vehicleId: item.vehicle.id,
    vehicleLabel: formatVehicleLabel(item.vehicle),
    dueDateIso: formatDateOnlyForInput(item.dueDate),
    detail:
      item.frequencyYears || item.frequencyMiles
        ? `Repeats ${item.frequencyYears ? `every ${item.frequencyYears} year${item.frequencyYears > 1 ? "s" : ""}` : ""}${
            item.frequencyYears && item.frequencyMiles ? " or " : ""
          }${item.frequencyMiles ? `every ${item.frequencyMiles.toLocaleString()} miles` : ""} (whichever comes first)`
        : item.notes?.trim()
          ? item.notes
          : "Manual reminder",
    source: "manual" as const,
    reminderId: item.id,
  }));

  const upcomingItems = [...manualUpcomingItems, ...autoUpcomingItems];
  const serviceHistoryForDisplay = await Promise.all(
    serviceHistory.slice(0, 40).map(async (entry) => ({
      ...entry,
      vehicleId: entry.vehicle.id,
      receiptUrl: entry.receiptUrl ? await getSignedUrl(entry.receiptUrl) : null,
    })),
  );

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Track services, set reminders, and keep an upcoming maintenance plan for every vehicle in your garage."
      />

      <ActivationStepPrompt
        state={activation}
        stepIds={["reminder", "service"]}
        badge="Setup"
        title="Build your maintenance rhythm"
        body="Start with reminders or an imported schedule, then log service as you go so the history stays useful."
      />

      <Card as="section" className="section-card" id="setup-reminders">
        <details className="collapsible-panel maintenance-toggle" open={setupFirstMode}>
          <summary className="maintenance-toggle-summary">
            <span className="maintenance-toggle-plus">+</span>
            <SectionTitle as="span" className="maintenance-strong-header">
              Add Service reminders <small className="maintenance-start-here">(Start here)</small>
            </SectionTitle>
          </summary>
          <SectionSubtitle style={{ marginTop: "0.65rem" }}>
            Import industry-recommended intervals or add a manual reminder.
          </SectionSubtitle>
          <div style={{ marginTop: "1rem" }}>
            <AddServiceScheduleForm
              vehicles={vehicleOptions}
              importedVehicleIds={[...importedVehicleIds]}
              allowsMotorcycles={allowance.allowsMotorcycles}
            />
          </div>
        </details>
      </Card>

      <Card as="section" className="section-card" id="add-service-log">
        <details className="collapsible-panel maintenance-toggle" open={vehicles.length > 0 && activation.hasReminderSetup && !activation.hasServiceLog}>
          <summary className="maintenance-toggle-summary">
            <span className="maintenance-toggle-plus">+</span>
            <SectionTitle as="span" className="maintenance-strong-header">
              Add a Service log
            </SectionTitle>
          </summary>
          <SectionSubtitle style={{ marginTop: "0.65rem" }}>
            Log maintenance records with mileage, optional cost, provider, date, and optional receipt.
          </SectionSubtitle>
          <div style={{ marginTop: "1rem" }}>
            <AddMaintenanceForm vehicles={vehicleOptions} />
          </div>
        </details>
      </Card>

      <Card as="section" className="section-card" id="upcoming-maintenance">
        <details className="collapsible-panel maintenance-toggle" open>
          <summary className="maintenance-toggle-summary">
            <span className="maintenance-toggle-plus">+</span>
            <SectionTitle as="span" className="maintenance-strong-header">
              Upcoming Maintenance
            </SectionTitle>
          </summary>
          <SectionSubtitle style={{ marginTop: "0.65rem", fontSize: "0.82rem" }}>
            See upcoming services for the next 3 months. Click toggle to see more.
          </SectionSubtitle>
          <div style={{ marginTop: "1rem" }}>
            <UpcomingMaintenanceList items={upcomingItems} vehicles={vehicleOptions} />
          </div>
        </details>
      </Card>

      <Card as="section" className="section-card">
        <SectionHeader
          title="Service History"
          subtitle="Recent services are shown first."
          titleClassName="maintenance-strong-header"
          subtitleStyle={{ marginTop: "0.65rem" }}
        />
        {vehicles.length > 0 && serviceHistoryForDisplay.length === 0 ? (
          <EmptyState
            title="No service history yet"
            description="Start with one reminder or one completed service. Either gives My Car Pal enough context to be useful right away."
            style={{ marginTop: "1rem" }}
          />
        ) : null}
        <ServiceHistoryList
          entries={serviceHistoryForDisplay.map((entry) => ({
            id: entry.id,
            title: entry.title,
            cost: entry.cost,
            provider: entry.provider,
            notes: entry.notes,
            receiptUrl: entry.receiptUrl,
            odometer: entry.odometer,
            serviceDateIso: formatDateOnlyForInput(entry.serviceDate),
            vehicleId: entry.vehicleId || entry.vehicle.id,
            vehicleLabel: formatVehicleLabel(entry.vehicle),
          }))}
          vehicles={vehicleOptions}
        />
      </Card>

      <Card as="section" className="section-card">
        <SectionHeader title="Find a Local Mechanic" />
        <div style={{ marginTop: "0.8rem" }}>
          <LocalMechanicFinder />
        </div>
      </Card>
    </>
  );
}
