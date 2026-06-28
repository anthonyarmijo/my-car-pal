"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteMaintenanceAction } from "@/app/maintenance/actions";
import { formatDateOnlyLabel, parseDateOnly } from "@/lib/date-only";
import { Button } from "@my-car-pal/ui";
import { Field } from "@/components/ui/field";

type ServiceHistoryEntry = {
  id: string;
  title: string;
  cost: number | null;
  provider: string;
  notes: string | null;
  receiptUrl: string | null;
  odometer: number;
  serviceDateIso: string;
  vehicleId: string;
  vehicleLabel: string;
};

type ServiceHistoryListProps = {
  entries: ServiceHistoryEntry[];
  vehicles: Array<{ id: string; label: string }>;
};

const INITIAL_VISIBLE = 8;

export function ServiceHistoryList({ entries, vehicles }: ServiceHistoryListProps) {
  const [showAll, setShowAll] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  const filtered = useMemo(() => {
    if (vehicleFilter === "ALL") return entries;
    return entries.filter((entry) => entry.vehicleId === vehicleFilter);
  }, [entries, vehicleFilter]);

  const visibleEntries = useMemo(
    () => (showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)),
    [filtered, showAll],
  );

  if (entries.length === 0) {
    return <p style={{ marginTop: "1rem", color: "var(--muted)" }}>No service history yet.</p>;
  }

  return (
    <>
      {vehicles.length > 1 ? (
        <Field compact style={{ marginTop: "1rem" }}>
          <span>Vehicle filter</span>
          <select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
            <option value="ALL">All vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {filtered.length === 0 && vehicleFilter !== "ALL" ? (
        <p style={{ marginTop: "1rem", color: "var(--muted)" }}>No service history for this vehicle.</p>
      ) : (
        <ul className="list-reset kv" style={{ marginTop: "1rem" }}>
          {visibleEntries.map((entry) => (
            <li key={entry.id} className="kv-row">
              <span>
                <span className="service-entry-title">{entry.title}</span>
                <br />
                <small style={{ color: "var(--muted)" }}>
                  {entry.vehicleLabel} • {formatDateOnlyLabel(parseDateOnly(entry.serviceDateIso))} • {entry.odometer.toLocaleString()} mi • {entry.provider}
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
                  <Button variant="danger" size="sm" type="submit">
                    Delete
                  </Button>
                </form>
              </span>
            </li>
          ))}
      </ul>
      )}

      {filtered.length > INITIAL_VISIBLE ? (
        <Button
          variant="secondary"
          type="button"
          style={{ marginTop: "0.7rem" }}
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Show less..." : "Show more..."}
        </Button>
      ) : null}
    </>
  );
}
