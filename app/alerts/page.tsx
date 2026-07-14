import type { Metadata } from "next";
import Link from "next/link";
import { remindAlertLaterAction, toggleAlertReadAction } from "@/app/alerts/actions";
import { PageHeader } from "@/components/ui/page-header";
import { requireCurrentUser } from "@/lib/auth-session";
import { getUserAlerts, type UserAlertItem } from "@/lib/alerts";
import { formatDateOnlyLabel } from "@/lib/date-only";
import { Button, Card, getButtonClassName } from "@my-car-pal/ui";
import styles from "./alerts.module.css";

export const metadata: Metadata = {
  title: "Alerts | My Car Pal",
};

function categoryLabel(category: UserAlertItem["category"]) {
  if (category === "maintenance") return "Maintenance";
  if (category === "registration") return "Registration";
  return "Insurance";
}

function destinationForAlert(alert: UserAlertItem) {
  return alert.category === "maintenance" ? "/maintenance#upcoming-maintenance" : "/glovebox";
}

function AlertIcon({ category }: { category: UserAlertItem["category"] }) {
  return (
    <span className={styles.alertIcon} aria-hidden="true">
      {category === "maintenance" ? (
        <svg viewBox="0 0 24 24">
          <path d="M12 3.8 21 20H3L12 3.8Z" />
          <path d="M12 9v5.2M12 17.3v.2" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" />
        </svg>
      )}
    </span>
  );
}

export default async function AlertsPage() {
  const user = await requireCurrentUser();
  const alerts = await getUserAlerts(user.id, 365);
  const unreadCount = alerts.filter((alert) => !alert.read).length;
  const dueNowCount = alerts.filter((alert) => alert.detail.includes("Due now")).length;
  const categoryCount = new Set(alerts.map((alert) => alert.category)).size;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Vehicle attention center"
        title="Alerts"
        subtitle="Review maintenance, registration, and insurance items across your garage in one place."
      />

      <section className={styles.summaryGrid} aria-label="Alert summary">
        <Card className={styles.summaryCard}>
          <span>Needs attention</span>
          <strong>{unreadCount}</strong>
          <small>Unread alert{unreadCount === 1 ? "" : "s"}</small>
        </Card>
        <Card className={styles.summaryCard}>
          <span>Due now</span>
          <strong>{dueNowCount}</strong>
          <small>Immediate item{dueNowCount === 1 ? "" : "s"}</small>
        </Card>
        <Card className={styles.summaryCard}>
          <span>Coverage</span>
          <strong>{alerts.length}</strong>
          <small>{categoryCount} active categor{categoryCount === 1 ? "y" : "ies"}</small>
        </Card>
      </section>

      <Card as="section" className={styles.alertsCard}>
        <div className={styles.listHeader}>
          <div>
            <h2>All active alerts</h2>
            <p>Ordered by due date, with the most urgent items first.</p>
          </div>
          <span className={styles.countBadge}>{alerts.length} total</span>
        </div>

        {alerts.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M6.7 10.1a5.3 5.3 0 0 1 10.6 0c0 5 2.2 5.6 2.2 7H4.5c0-1.4 2.2-2 2.2-7Z" /><path d="M9.8 20h4.4" /></svg>
            </span>
            <h2>You&apos;re all caught up.</h2>
            <p>No maintenance, registration, or insurance alerts need attention right now.</p>
            <Link href="/maintenance" className={getButtonClassName({ variant: "secondary" })}>
              Review maintenance
            </Link>
          </div>
        ) : (
          <ul className={styles.alertList}>
            {alerts.map((alert) => (
              <li key={alert.key} className={`${styles.alertItem}${alert.read ? ` ${styles.alertItemRead}` : ""}`}>
                <AlertIcon category={alert.category} />
                <div className={styles.alertCopy}>
                  <div className={styles.alertTitleRow}>
                    <h3>{alert.title}</h3>
                    <span className={alert.read ? styles.readBadge : styles.unreadBadge}>
                      {alert.read ? "Read" : "Needs attention"}
                    </span>
                  </div>
                  <p>{alert.detail}</p>
                  <div className={styles.alertMeta}>
                    <span>{categoryLabel(alert.category)}</span>
                    <span>Due {formatDateOnlyLabel(alert.dueAt)}</span>
                    <Link href={destinationForAlert(alert)}>Open details</Link>
                  </div>
                </div>
                <div className={styles.alertActions}>
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
                      <Button variant="secondary" size="sm" type="submit">Remind me later</Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
