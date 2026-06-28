"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  autoCalculateReminderDueDateAction,
  autoCalculateScheduleOverrideDueDateAction,
  recalculateAllUpcomingAction,
  updateReminderDueDateAction,
  updateScheduleOverrideDueDateAction,
} from "@/app/maintenance/actions";
import { initialRecalculateAllState } from "@/app/maintenance/state";
import { formatDateOnlyLabel, formatLocalDateForInput, parseDateOnly } from "@/lib/date-only";

type UpcomingMaintenanceItem = {
  id: string;
  title: string;
  vehicleId: string;
  vehicleLabel: string;
  dueDateIso: string;
  detail: string;
  source: "manual" | "recommended";
  reminderId?: string;
  serviceKey?: string;
};

type UpcomingMaintenanceListProps = {
  items: UpcomingMaintenanceItem[];
  vehicles: Array<{ id: string; label: string }>;
};

function toDateOnly(dateIso: string): string {
  return dateIso;
}

function formatDate(iso: string): string {
  return formatDateOnlyLabel(parseDateOnly(iso));
}

function PendingButton({ className, text }: { className?: string; text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Saving..." : text}
    </button>
  );
}

function RecalculateAllButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button-chip button-chip-strong upcoming-recalculate-button" type="submit" disabled={pending}>
      {pending ? "Re-calculating..." : "Re-calculate All Dates"}
    </button>
  );
}

export function UpcomingMaintenanceList({ items, vehicles }: UpcomingMaintenanceListProps) {
  const [recalculateState, recalculateAction] = useActionState(recalculateAllUpcomingAction, initialRecalculateAllState);
  const [showBeyondThreeMonths, setShowBeyondThreeMonths] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  const today = useMemo(() => formatLocalDateForInput(new Date()), []);

  const sorted = useMemo(() => [...items].sort((a, b) => a.dueDateIso.localeCompare(b.dueDateIso)), [items]);

  const filteredByVehicle = useMemo(() => {
    if (vehicleFilter === "ALL") {
      return sorted;
    }
    return sorted.filter((item) => item.vehicleId === vehicleFilter);
  }, [sorted, vehicleFilter]);

  const threeMonthsOut = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() + 3);
    return formatLocalDateForInput(cutoff);
  }, []);

  const withinThreeMonths = filteredByVehicle.filter((item) => item.dueDateIso <= threeMonthsOut);
  const allWithinThreeMonths = sorted.filter((item) => item.dueDateIso <= threeMonthsOut);
  const beyondThreeMonths = filteredByVehicle.filter((item) => item.dueDateIso > threeMonthsOut);
  const visibleItems = showBeyondThreeMonths ? filteredByVehicle : withinThreeMonths;

  if (sorted.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No upcoming services yet.</p>;
  }

  const hasUpcomingInThreeMonths = allWithinThreeMonths.length > 0;

  return (
    <div className="form-stack">
      {hasUpcomingInThreeMonths ? (
        <div className="upcoming-toolbar">
          <label className="field field-compact" style={{ margin: 0 }}>
            <span>Vehicle filter</span>
            <select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
              <option value="ALL">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </label>

          <form action={recalculateAction}>
            <RecalculateAllButton />
          </form>
        </div>
      ) : null}

      {recalculateState.status === "success" && recalculateState.message ? (
        <p className="section-subtitle upcoming-recalculate-feedback">{recalculateState.message}</p>
      ) : null}

      {!showBeyondThreeMonths && withinThreeMonths.length === 0 ? (
        <p className="upcoming-empty-next-window">
          <span className="upcoming-empty-check" aria-hidden="true">
            ✓
          </span>
          <strong>No upcoming services in the next 3 months!</strong>
        </p>
      ) : null}

      {visibleItems.length > 0 ? (
        <ul className="list-reset kv">
          {visibleItems.map((item) => {
            const isDueNow = item.dueDateIso <= today;
            const isEditing = editingItemId === item.id;

            return (
              <li key={item.id} className="kv-row upcoming-item-row">
                <span className="upcoming-item-main">
                  <span className="service-entry-title">{item.title}</span>{" "}
                  <span className={`schedule-source-tag ${item.source === "recommended" ? "schedule-source-tag-recommended" : ""}`}>
                    {item.source === "recommended" ? "Recommended" : "Manual"}
                  </span>
                  <br />
                  <small style={{ color: "var(--muted)" }}>{item.vehicleLabel}</small>
                  <br />
                  <small className="upcoming-item-detail" style={{ color: "var(--muted)" }}>
                    {item.detail}
                  </small>
                </span>

                <span className="upcoming-date-actions">
                  {isDueNow ? (
                    <span className="due-now-label">
                      <span className="due-now-icon">!</span>
                      Due now
                    </span>
                  ) : (
                    <span>{formatDate(item.dueDateIso)}</span>
                  )}
                  {isDueNow ? (
                    <small className="upcoming-original-date">Original due: {formatDate(item.dueDateIso)}</small>
                  ) : null}

                  <button className="upcoming-inline-link" type="button" onClick={() => setEditingItemId(isEditing ? null : item.id)}>
                    Modify due date
                  </button>

                  {isEditing ? (
                    <form
                      action={item.source === "manual" ? updateReminderDueDateAction : updateScheduleOverrideDueDateAction}
                      className="upcoming-date-form"
                    >
                      {item.source === "manual" ? <input type="hidden" name="reminderId" value={item.reminderId} /> : null}
                      {item.source === "recommended" ? <input type="hidden" name="vehicleId" value={item.vehicleId} /> : null}
                      {item.source === "recommended" ? <input type="hidden" name="serviceKey" value={item.serviceKey} /> : null}
                      <input name="dueDate" type="date" defaultValue={toDateOnly(item.dueDateIso)} required />
                      <PendingButton className="button-chip" text="Save date" />
                    </form>
                  ) : null}

                  <form action={item.source === "manual" ? autoCalculateReminderDueDateAction : autoCalculateScheduleOverrideDueDateAction}>
                    {item.source === "manual" ? <input type="hidden" name="reminderId" value={item.reminderId} /> : null}
                    {item.source === "recommended" ? <input type="hidden" name="vehicleId" value={item.vehicleId} /> : null}
                    {item.source === "recommended" ? <input type="hidden" name="serviceKey" value={item.serviceKey} /> : null}
                    <PendingButton className="button-chip upcoming-auto-button" text="Auto-calculate due date" />
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {beyondThreeMonths.length > 0 ? (
        <button className="button-chip button-chip-strong" type="button" onClick={() => setShowBeyondThreeMonths((value) => !value)}>
          {showBeyondThreeMonths ? "Show less..." : "Show more..."}
        </button>
      ) : null}
    </div>
  );
}
