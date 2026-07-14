import { remindAlertLaterAction, toggleAlertReadAction } from "@/app/alerts/actions";
import { ActivationChecklistCard } from "@/components/activation-setup";
import { HomeGreeting } from "@/components/home-greeting";
import { HomeIcon } from "@/components/home-icon";
import { HomeVehicleCarousel, type HomeVehicleCarouselItem } from "@/components/home-vehicle-carousel";
import { OdometerUpdateForm } from "@/components/odometer-update-form";
import Link from "next/link";
import type { Route } from "next";
import { getActivationState } from "@/lib/activation";
import { requireCurrentUser } from "@/lib/auth-session";
import { getUserAlerts } from "@/lib/alerts";
import { formatDateOnlyLabel } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";
import { resolveVehicleImage } from "@/lib/vehicle-images";
import { Badge, Button, Card, getButtonClassName } from "@my-car-pal/ui";
import { SectionHeader, SectionTitle } from "@/components/ui/section-header";
import styles from "./home-dashboard.module.css";

function AlertDetail({ detail }: { detail: string }) {
  const marker = "Due now";
  const markerIndex = detail.indexOf(marker);
  if (markerIndex === -1) {
    return <small style={{ color: "var(--muted)" }}>{detail}</small>;
  }

  const before = detail.slice(0, markerIndex);
  const after = detail.slice(markerIndex + marker.length);
  return (
    <small style={{ color: "var(--muted)" }}>
      {before}
      <span className="alert-due-now-text">{marker}</span>
      {after}
    </small>
  );
}

function formatMoney(value: number | null | undefined) {
  if (!value) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMileage(value: number | null | undefined) {
  return value === null || value === undefined ? "Mileage not set" : value.toLocaleString();
}

function formatOwnershipDuration(createdAt: Date | null | undefined) {
  if (!createdAt) {
    return "New";
  }
  const now = new Date();
  let months = (now.getFullYear() - createdAt.getFullYear()) * 12 + now.getMonth() - createdAt.getMonth();
  if (now.getDate() < createdAt.getDate()) {
    months -= 1;
  }
  if (months <= 0) {
    return "New";
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) {
    return `${remainingMonths} mo`;
  }
  if (remainingMonths === 0) {
    return `${years} yr`;
  }
  return `${years} yr, ${remainingMonths} mo`;
}

function getDueLabel(detail: string) {
  const parts = detail.split("•").map((part) => part.trim()).filter(Boolean);
  return parts[1] ?? detail;
}

type HomePageProps = {
  searchParams?: Promise<{ welcome?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireCurrentUser();
  const params = (await searchParams) ?? {};

  const [vehicleCount, reminderCount, maintenanceByVehicle, rawVehicles, alerts, profile, activation] = await Promise.all([
    prisma.vehicle.count({
      where: { userId: user.id },
    }),
    prisma.reminder.count({
      where: {
        completedAt: null,
        dueDate: {
          gte: new Date(),
        },
        vehicle: { userId: user.id },
      },
    }),
    prisma.maintenance.groupBy({
      by: ["vehicleId"],
      where: {
        vehicle: { userId: user.id },
      },
      _count: { _all: true },
      _sum: { cost: true },
    }),
    prisma.vehicle.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        drivetrain: true,
        currentOdometer: true,
        imageUrl: true,
        licensePlate: true,
        registrationExpiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserAlerts(user.id, 30),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { displayName: true },
    }),
    getActivationState(user.id),
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
  const maintenanceSummaryByVehicle = new Map(
    maintenanceByVehicle.map((item) => [
      item.vehicleId,
      { count: item._count._all, total: item._sum.cost ?? 0 },
    ]),
  );
  const maintenanceCount = maintenanceByVehicle.reduce((sum, item) => sum + item._count._all, 0);
  const totalSpent = maintenanceByVehicle.reduce((sum, item) => sum + (item._sum.cost ?? 0), 0);

  const highlights: Array<{ label: string; value: string; note: string; href: Route }> = [
    { label: "Services completed", value: String(maintenanceCount), note: "View history", href: "/maintenance" },
    {
      label: "Upcoming services",
      value: String(reminderCount),
      note: "View schedule",
      href: "/maintenance#upcoming-maintenance",
    },
    { label: "Total spent", value: formatMoney(totalSpent), note: "View expenses", href: "/maintenance" },
    { label: "Vehicles tracked", value: String(vehicleCount), note: "View garage", href: "/garage" },
  ];
  const carouselVehicles: HomeVehicleCarouselItem[] = vehicles.map((vehicle) => {
    const vehicleAlerts = alerts.filter(
      (alert) => alert.vehicleIds === null || alert.vehicleIds.includes(vehicle.id),
    );
    const nextMaintenanceAlert = vehicleAlerts.find((alert) => alert.category === "maintenance") ?? null;
    const nextAlert = vehicleAlerts[0] ?? null;
    const maintenanceSummary = maintenanceSummaryByVehicle.get(vehicle.id);
    const meta = [vehicle.trim, vehicle.drivetrain, vehicle.licensePlate]
      .filter((item): item is string => Boolean(item))
      .join(" • ");

    return {
      id: vehicle.id,
      label: formatVehicleLabel(vehicle),
      meta: meta || "Vehicle profile",
      currentOdometer: formatMileage(vehicle.currentOdometer),
      hasOdometer: vehicle.currentOdometer !== null && vehicle.currentOdometer !== undefined,
      updatedLabel: vehicle.updatedAt
        ? `Last updated ${formatDateOnlyLabel(vehicle.updatedAt)}`
        : "Keep this current for reminders",
      imageUrl: vehicle.displayImage.url,
      imageIsDefault: vehicle.displayImage.source !== "upload",
      stats: [
        {
          icon: "calendar",
          label: "Next Service",
          value: nextMaintenanceAlert?.title ?? "No service due",
          note: nextMaintenanceAlert ? getDueLabel(nextMaintenanceAlert.detail) : "Schedule is clear",
        },
        {
          icon: "clock",
          label: "Next Due",
          value: nextAlert ? formatDateOnlyLabel(nextAlert.dueAt) : "All clear",
          note: nextAlert ? getDueLabel(nextAlert.detail) : "No active due items",
        },
        {
          icon: "dollar",
          label: "Total Spent",
          value: formatMoney(maintenanceSummary?.total),
          note: `${maintenanceSummary?.count ?? 0} service ${maintenanceSummary?.count === 1 ? "entry" : "entries"}`,
        },
        {
          icon: "document",
          label: "Ownership",
          value: formatOwnershipDuration(vehicle.createdAt),
          note: "In My Car Pal",
        },
      ],
    };
  });

  const priorityPanel = (
    <div className="home-content-side-stack">
      <Card as="section" className="section-card home-alerts-card">
        <div className="alerts-heading-inline">
          <SectionTitle>Alerts</SectionTitle>
          <div className="home-alerts-actions">
            <Link href="/alerts" className="auth-inline-link home-view-all-link">View all</Link>
          </div>
        </div>
        {alerts.length === 0 ? (
          <p className="home-empty-copy">No active alerts right now.</p>
        ) : (
          <ul className="list-reset home-alert-list">
            {alerts.slice(0, 3).map((alert) => (
              <li key={alert.key} className={`alert-row home-alert-row${alert.read ? " alert-row-read" : ""}`}>
                <HomeIcon name={alert.category === "maintenance" ? "warning" : "document"} />
                <span className="home-alert-copy">
                  {alert.category === "maintenance" ? (
                    <strong>
                      <Link href="/maintenance#upcoming-maintenance">{alert.title}</Link>
                    </strong>
                  ) : (
                    <strong>{alert.title}</strong>
                  )}
                  <AlertDetail detail={alert.detail} />
                </span>
                <span className="alert-action-row">
                  <form action={toggleAlertReadAction}>
                    <input type="hidden" name="alertKey" value={alert.key} />
                    <input type="hidden" name="markRead" value={alert.read ? "0" : "1"} />
                    <Button variant="secondary" size="sm" type="submit">
                      {alert.read ? "Mark unread" : "Mark read"}
                    </Button>
                  </form>
                  {!alert.read ? (
                    <form action={remindAlertLaterAction}>
                      <input type="hidden" name="alertKey" value={alert.key} />
                      <Button variant="secondary" size="sm" type="submit">
                        Later
                      </Button>
                    </form>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/alerts" className="home-card-footer-link">View all alerts</Link>
      </Card>

      <Card as="section" className="section-card home-odometer-card" id="quick-odometer-update">
        <div className="home-side-card-title">
          <HomeIcon name="gauge" />
          <div>
            <SectionHeader title="Quick odometer update" subtitle="Keep your maintenance accurate and on track." />
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="home-empty-copy">
            No vehicles yet. Start in{" "}
            <Link href="/garage#add-vehicle" className="auth-inline-link">
              Garage
            </Link>
            .
          </p>
        ) : (
          <ul className="list-reset odometer-list">
            {vehicles.slice(0, 2).map((vehicle) => (
              <li key={vehicle.id} className="odometer-row">
                <span>
                  <strong>{formatVehicleLabel(vehicle)}</strong>
                </span>
                <OdometerUpdateForm vehicleId={vehicle.id} defaultOdometer={vehicle.currentOdometer} />
              </li>
            ))}
          </ul>
        )}
        <Link href="/maintenance" className="home-card-footer-link">View odometer history</Link>
      </Card>
    </div>
  );

  return (
    <div className={`home-dashboard ${styles.dashboard}`}>
      <div className="home-top-grid">
        <HomeGreeting
          displayName={profile?.displayName ?? user.name ?? user.email ?? null}
          statusLabel={reminderCount > 0 ? `${reminderCount} reminder${reminderCount === 1 ? "" : "s"} due soon` : "All clear"}
        />
        {!activation.isComplete ? <ActivationChecklistCard state={activation} welcome={params.welcome === "1"} /> : null}
      </div>

      {priorityPanel}

      <div className="home-content-grid">
        <div className="home-content-main-stack">
          {vehicleCount === 0 ? (
            <Card as="section" className="section-card first-vehicle-callout">
              <Badge className="badge">Start here</Badge>
              <SectionTitle style={{ marginTop: "0.65rem" }}>
                Welcome to your garage.
              </SectionTitle>
              <p className="section-subtitle" style={{ marginTop: "0.55rem" }}>
                Add your first vehicle to unlock maintenance tracking, reminders, glovebox docs, and your personalized home dashboard.
              </p>
              <div className="first-vehicle-step-row" aria-hidden="true">
                <span className="first-vehicle-step-pill">1. Add a vehicle</span>
                <span className="first-vehicle-step-pill">2. Set mileage</span>
                <span className="first-vehicle-step-pill">3. Start logging care</span>
              </div>
              <div className="first-vehicle-action-row">
                <Link href="/garage#add-vehicle" className={getButtonClassName()}>
                  Add your first vehicle
                </Link>
                <span className="first-vehicle-hint">Tip: VIN is the fastest way to fill in the details.</span>
              </div>
            </Card>
          ) : null}

          <HomeVehicleCarousel vehicles={carouselVehicles} />

          <Card as="section" className="section-card dashboard-overview-card">
            <div className="section-title-action-row">
              <SectionTitle>Dashboard overview</SectionTitle>
              <Link href="/garage" className={getButtonClassName({ variant: "secondary" })}>
                This vehicle
              </Link>
            </div>
            <div className="dashboard-stat-grid">
              {highlights.map((item) => (
                <Link key={item.label} href={item.href} className="dashboard-stat-card">
                  <HomeIcon name={item.label === "Total spent" ? "dollar" : item.label === "Services completed" ? "wrench" : item.label === "Upcoming services" ? "calendar" : "garage"} />
                  <span>
                    <strong>{item.value}</strong>
                    <small>{item.label}</small>
                    <em>{item.note}</em>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

      </div>

      <section className="home-pro-tip-strip">
        <span className="home-pro-tip-icon">
          <HomeIcon name="lightbulb" />
        </span>
        <p>
          <strong>Pro tip:</strong> Add all your vehicles to get personalized maintenance schedules and smarter reminders.
        </p>
        <Link href="/garage#add-vehicle">
          Add another vehicle
          <HomeIcon name="chevron" />
        </Link>
      </section>
    </div>
  );
}
