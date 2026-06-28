"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addReminderAction, importRecommendedScheduleAction } from "@/app/maintenance/actions";
import { initialMaintenanceFormState } from "@/app/maintenance/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import {
  getScheduleRowsForVehicle,
  importedScheduleFallbackMessage,
  isImportedScheduleSupported,
} from "@/lib/maintenance-schedule";
import { VehicleKindValue } from "@/lib/vehicle-kind";
import { Button, FormMessage } from "@my-car-pal/ui";

type VehicleOption = {
  id: string;
  kind: VehicleKindValue;
  label: string;
  make: string;
  model: string;
  drivetrain?: string | null;
};

type AddServiceScheduleFormProps = {
  vehicles: VehicleOption[];
  importedVehicleIds: string[];
  allowsMotorcycles: boolean;
};

function ImportButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="schedule-import-button" type="submit" disabled={disabled || pending}>
      {pending ? "Importing..." : "Import recommended service schedule (Recommended)"}
    </Button>
  );
}

function ReminderSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Adding..." : "Add manual reminder"}
    </Button>
  );
}

export function AddServiceScheduleForm({ vehicles, importedVehicleIds, allowsMotorcycles }: AddServiceScheduleFormProps) {
  const [importState, importAction] = useActionState(importRecommendedScheduleAction, initialMaintenanceFormState);
  const [reminderState, reminderAction] = useActionState(addReminderAction, initialMaintenanceFormState);
  const importFormRef = useRef<HTMLFormElement>(null);
  const reminderFormRef = useRef<HTMLFormElement>(null);
  const [showReferenceIntervals, setShowReferenceIntervals] = useState(false);
  const disabled = vehicles.length === 0;
  const hasMultipleVehicles = vehicles.length > 1;
  const defaultVehicleId = hasMultipleVehicles ? "" : vehicles[0]?.id ?? "";
  const [selectedImportVehicleId, setSelectedImportVehicleId] = useState(defaultVehicleId);
  const today = formatLocalDateForInput(new Date());
  const importedSet = useMemo(() => new Set(importedVehicleIds), [importedVehicleIds]);
  const selectedImportVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedImportVehicleId) ?? null,
    [selectedImportVehicleId, vehicles],
  );
  const visibleIntervalRows = useMemo(() => {
    if (!selectedImportVehicle) {
      return [];
    }

    return getScheduleRowsForVehicle({
      id: selectedImportVehicle.id,
      kind: selectedImportVehicle.kind,
      year: new Date().getFullYear(),
      make: selectedImportVehicle.make,
      model: selectedImportVehicle.model,
      drivetrain: selectedImportVehicle.drivetrain,
      currentOdometer: null,
    });
  }, [selectedImportVehicle]);
  const selectedAlreadyImported = Boolean(selectedImportVehicleId) && importedSet.has(selectedImportVehicleId);
  const selectedImportSupported = selectedImportVehicle
    ? (selectedImportVehicle.kind !== "MOTORCYCLE" || allowsMotorcycles) &&
      isImportedScheduleSupported({
        id: selectedImportVehicle.id,
        kind: selectedImportVehicle.kind,
        year: new Date().getFullYear(),
        make: selectedImportVehicle.make,
        model: selectedImportVehicle.model,
        drivetrain: selectedImportVehicle.drivetrain,
        currentOdometer: null,
      })
    : false;

  useEffect(() => {
    if (importState.status === "success") {
      importFormRef.current?.reset();
    }
  }, [importState.status]);

  useEffect(() => {
    if (reminderState.status === "success") {
      reminderFormRef.current?.reset();
    }
  }, [reminderState.status]);

  return (
    <div className="form-stack">
      <form ref={importFormRef} action={importAction} className="form-stack">
        <fieldset className="fieldset-reset" disabled={disabled}>
          <label className="field field-compact">
            <span>Vehicle</span>
            <select
              name="vehicleId"
              required
              value={selectedImportVehicleId}
              onChange={(event) => setSelectedImportVehicleId(event.target.value)}
            >
              {hasMultipleVehicles ? (
                <option value="" disabled>
                  --Select your Vehicle--
                </option>
              ) : null}
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </label>

          {selectedAlreadyImported ? (
            <div className="subsection-card" style={{ marginTop: 0 }}>
              <p className="section-subtitle" style={{ marginTop: 0 }}>
                Service schedule has already been imported for this vehicle.
              </p>
              <button
                type="button"
                className="upcoming-inline-link"
                onClick={() => setShowReferenceIntervals((value) => !value)}
                style={{ width: "fit-content" }}
              >
                {showReferenceIntervals ? "Hide industry-recommended intervals" : "View industry-recommended intervals"}
              </button>
            </div>
          ) : (
            <p className="section-subtitle" style={{ marginTop: 0 }}>
              {selectedImportVehicle?.kind === "MOTORCYCLE"
                ? "These intervals are normalized from official owner-manual guidance for supported motorcycle brands."
                : "These are industry-recommended intervals and not specific to your exact vehicle."}
            </p>
          )}

          {!selectedAlreadyImported && selectedImportVehicle?.kind === "MOTORCYCLE" && !selectedImportSupported ? (
            <div className="subsection-card" style={{ marginTop: 0 }}>
              <p className="section-subtitle" style={{ marginTop: 0 }}>
                {allowsMotorcycles
                  ? importedScheduleFallbackMessage({
                      id: selectedImportVehicle.id,
                      kind: selectedImportVehicle.kind,
                      year: new Date().getFullYear(),
                      make: selectedImportVehicle.make,
                      model: selectedImportVehicle.model,
                      drivetrain: selectedImportVehicle.drivetrain,
                      currentOdometer: null,
                    })
                  : "Motorcycle schedule imports are not enabled in this install."}
              </p>
            </div>
          ) : null}

          {!selectedAlreadyImported || showReferenceIntervals ? (
            <div className="recommended-schedule-grid">
              {visibleIntervalRows.map((row) => (
                <div key={row.service} className="recommended-schedule-row">
                  <strong>{row.service}</strong>
                  <span>{row.typicalDefault}</span>
                  {row.sourceLabel && row.sourceUrl ? (
                    <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="upcoming-inline-link">
                      {row.sourceLabel}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {!selectedAlreadyImported ? <ImportButton disabled={disabled || !selectedImportSupported} /> : null}
        </fieldset>
      </form>

      {importState.message ? (
        <FormMessage tone={importState.status === "error" ? "error" : "success"}>
          {importState.message}
        </FormMessage>
      ) : null}

      <hr className="section-divider" />

      <details className="collapsible-panel">
        <summary className="collapsible-summary">
          <span className="section-subtitle manual-reminder-toggle-title">Or add a manual reminder</span>
          <span className="section-subtitle">Tap to expand</span>
        </summary>
        <form ref={reminderFormRef} action={reminderAction} className="form-stack" style={{ marginTop: "0.75rem" }}>
          <fieldset className="fieldset-reset" disabled={disabled}>
            <label className="field field-compact">
              <span>Vehicle</span>
              <select name="vehicleId" required defaultValue={hasMultipleVehicles ? "" : vehicles[0]?.id ?? ""}>
                {hasMultipleVehicles ? (
                  <option value="" disabled>
                    --Select your Vehicle--
                  </option>
                ) : null}
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-grid field-grid-two">
              <label className="field">
                <span>Reminder title</span>
                <input name="title" type="text" placeholder="Rotate tires" required />
              </label>
              <label className="field">
                <span>Due date</span>
                <div className="date-input-wrap">
                  <input name="dueDate" type="date" required defaultValue={today} />
                  <span className="date-input-icon" aria-hidden="true">
                    <svg suppressHydrationWarning viewBox="0 0 24 24" role="presentation" focusable="false">
                      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" />
                    </svg>
                  </span>
                </div>
              </label>
            </div>

            <label className="field">
              <span>Notes (optional)</span>
              <textarea name="notes" rows={3} placeholder="Optional context for this reminder." />
            </label>

            <div className="field-grid field-grid-two">
              <label className="field">
                <span>Frequency years (optional)</span>
                <input name="frequencyYears" type="number" min="1" step="1" placeholder="e.g. 2" />
              </label>
              <label className="field">
                <span>Frequency miles (optional)</span>
                <input name="frequencyMiles" type="number" min="1" step="1" placeholder="e.g. 2000" />
              </label>
            </div>
            <p className="section-subtitle" style={{ marginTop: "-0.25rem", fontSize: "0.82rem" }}>
              If both are set, alerts use whichever comes first.
            </p>

            <ReminderSubmitButton disabled={disabled} />
          </fieldset>
        </form>
      </details>

      {disabled ? <FormMessage tone="error">Please add a vehicle to your Garage!</FormMessage> : null}

      {reminderState.message ? (
        <FormMessage tone={reminderState.status === "error" ? "error" : "success"}>
          {reminderState.message}
        </FormMessage>
      ) : null}
    </div>
  );
}
