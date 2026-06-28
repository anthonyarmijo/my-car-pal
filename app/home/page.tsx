import { remindAlertLaterAction, toggleAlertReadAction } from "@/app/home/actions";
import { ActivationChecklistCard } from "@/components/activation-setup";
import { MailboxStatusButton } from "@/components/app-nav";
import { HomeGreeting } from "@/components/home-greeting";
import { OdometerUpdateForm } from "@/components/odometer-update-form";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
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

type HomeIconName = "star" | "calendar" | "clock" | "dollar" | "document" | "warning" | "gauge" | "wrench" | "garage" | "chevron" | "lightbulb";

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

function HomeIcon({ name }: { name: HomeIconName }) {
  const paths: Record<HomeIconName, ReactNode> = {
    star: <path d="m12 3.8 2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7L12 3.8Z" />,
    calendar: <><rect x="4.4" y="5.8" width="15.2" height="14" rx="2.2" /><path d="M8 3.8v4M16 3.8v4M4.8 10h14.4" /></>,
    clock: <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.8v4.7l3.2 2" /></>,
    dollar: <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.2v9.6M14.4 9.2c-.6-.6-1.5-1-2.6-1-1.3 0-2.3.7-2.3 1.8 0 2.6 5 1.3 5 4 0 1.1-1 1.9-2.6 1.9-1.2 0-2.1-.4-2.8-1.1" /></>,
    document: <><path d="M7 4.5h6.2l3.8 3.8v11.2H7z" /><path d="M13 4.8V9h4M9.6 12h4.8M9.6 15.4h4.8" /></>,
    warning: <><path d="M12 4.3 21 19H3z" /><path d="M12 9v4.2M12 16.4h.01" /></>,
    gauge: <><path d="M4.8 16.9a8.2 8.2 0 1 1 14.4 0" /><path d="m12 14.6 3.4-4.2" /><path d="M8 17h8" /></>,
    wrench: <path d="M15.7 4.6a3.7 3.7 0 0 0-4.3 4.8l-6.5 6.5 3.2 3.2 6.5-6.5a3.7 3.7 0 0 0 4.8-4.3l-2.5 2.5-2.4-2.4 2.5-2.5Z" />,
    garage: <><path d="M4 19V8.7L12 4l8 4.7V19" /><path d="M7.3 19v-6.2h9.4V19M9.4 15.2h5.2" /></>,
    chevron: <path d="m9.5 5.5 6 6.5-6 6.5" />,
    lightbulb: <><path d="M8.3 14.2a5.3 5.3 0 1 1 7.4 0c-.8.7-1.2 1.5-1.3 2.5H9.6c-.1-1-.5-1.8-1.3-2.5Z" /><path d="M9.7 19h4.6" /></>,
  };

  return (
    <span className={`home-icon home-icon-${name}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
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

  const [vehicleCount, reminderCount, maintenanceCount, maintenanceTotals, rawVehicles, alerts, profile, activation] = await Promise.all([
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
    prisma.maintenance.count({
      where: {
        vehicle: { userId: user.id },
      },
    }),
    prisma.maintenance.aggregate({
      where: {
        vehicle: { userId: user.id },
      },
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
  const primaryVehicle = vehicles[0] ?? null;
  const nextMaintenanceAlert = alerts.find((alert) => alert.category === "maintenance") ?? null;
  const nextAlert = alerts[0] ?? null;
  const totalSpent = maintenanceTotals._sum.cost ?? 0;

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
  const primaryVehicleMeta = primaryVehicle
    ? [primaryVehicle.trim, primaryVehicle.drivetrain, primaryVehicle.licensePlate]
        .filter((item): item is string => Boolean(item))
    : [];

  const vehicleStats = [
    {
      icon: "calendar" as const,
      label: "Next Service",
      value: nextMaintenanceAlert?.title ?? "No service due",
      note: nextMaintenanceAlert ? getDueLabel(nextMaintenanceAlert.detail) : "Schedule is clear",
    },
    {
      icon: "clock" as const,
      label: "Next Due",
      value: nextAlert ? formatDateOnlyLabel(nextAlert.dueAt) : "All clear",
      note: nextAlert ? getDueLabel(nextAlert.detail) : "No active due items",
    },
    {
      icon: "dollar" as const,
      label: "Total Spent",
      value: formatMoney(totalSpent),
      note: "Across service logs",
    },
    {
      icon: "document" as const,
      label: "Ownership",
      value: primaryVehicle ? formatOwnershipDuration(primaryVehicle.createdAt) : "New",
      note: "In My Car Pal",
    },
  ];

  return (
    <div className="home-dashboard">
      <div className="home-top-grid">
        <HomeGreeting displayName={profile?.displayName ?? user.name ?? user.email ?? null} />
        {!activation.isComplete ? <ActivationChecklistCard state={activation} welcome={params.welcome === "1"} /> : null}
      </div>

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

          {primaryVehicle ? (
            <Card as="section" className="section-card home-primary-vehicle-card">
            <div className="home-primary-vehicle-card-header">
              <Badge className="badge home-primary-vehicle-eyebrow">
                <HomeIcon name="star" />
                Primary vehicle
              </Badge>
              <Link href={`/vehicle/${primaryVehicle.id}`} className={getButtonClassName({ variant: "secondary", className: "home-garage-link" })}>
                View in Garage
                <HomeIcon name="chevron" />
              </Link>
            </div>
            <div className="home-primary-vehicle-body">
              <div className="home-primary-vehicle-copy">
                <h2 className="section-title home-primary-vehicle-title">{formatVehicleLabel(primaryVehicle)}</h2>
                <p className="section-subtitle home-primary-vehicle-subtitle">
                  {primaryVehicleMeta.length > 0 ? primaryVehicleMeta.join(" • ") : "Vehicle profile"}
                </p>
                <div className="home-current-odometer">
                  <span>Current odometer</span>
                  <strong>
                    {formatMileage(primaryVehicle.currentOdometer)}
                    {primaryVehicle.currentOdometer !== null && primaryVehicle.currentOdometer !== undefined ? <small> mi</small> : null}
                  </strong>
                  <small>{primaryVehicle.updatedAt ? `Last updated ${formatDateOnlyLabel(primaryVehicle.updatedAt)}` : "Keep this current for reminders"}</small>
                </div>
                <Link href="/home#quick-odometer-update" className={getButtonClassName({ className: "home-primary-odometer-link" })}>
                  <HomeIcon name="gauge" />
                  Update odometer
                </Link>
              </div>
              <div className="home-primary-vehicle-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryVehicle.displayImage.url}
                  alt={formatVehicleLabel(primaryVehicle)}
                  className={`home-primary-vehicle-image${primaryVehicle.displayImage.source !== "upload" ? " home-primary-vehicle-image-default" : ""}`}
                />
              </div>
            </div>
            <div className="home-vehicle-stat-strip">
              {vehicleStats.map((item) => (
                <article key={item.label} className="home-vehicle-stat">
                  <HomeIcon name={item.icon} />
                  <span>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                    <em>{item.note}</em>
                  </span>
                </article>
              ))}
            </div>
            </Card>
          ) : null}

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

        <div className="home-content-side-stack">
          <Card as="section" className="section-card home-alerts-card">
          <div className="alerts-heading-inline">
            <SectionTitle>Alerts</SectionTitle>
            <div className="home-alerts-actions">
              <MailboxStatusButton iconOnly className="alerts-mailbox-button" linked={false} />
              <Link href="/glovebox" className="auth-inline-link home-view-all-link">View all</Link>
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
                    {!alert.read ? <span className="home-due-badge">Due Soon</span> : null}
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
          <Link href="/glovebox" className="home-card-footer-link">View all alerts</Link>
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
