"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateMaintenanceAction } from "@/app/maintenance/actions";
import { initialMaintenanceFormState } from "@/app/maintenance/state";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";

type VehicleOption = {
  id: string;
  label: string;
};

type EditMaintenanceFormProps = {
  maintenanceId: string;
  vehicles: VehicleOption[];
  defaultVehicleId: string;
  defaultTitle: string;
  defaultServiceDate: string;
  defaultOdometer: number;
  defaultCost: number | null;
  defaultProvider: string;
  defaultNotes: string;
  receiptUrl: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function EditMaintenanceForm({
  maintenanceId,
  vehicles,
  defaultVehicleId,
  defaultTitle,
  defaultServiceDate,
  defaultOdometer,
  defaultCost,
  defaultProvider,
  defaultNotes,
  receiptUrl,
}: EditMaintenanceFormProps) {
  const [state, formAction] = useActionState(updateMaintenanceAction, initialMaintenanceFormState);
  const initialProviderMode = defaultProvider === "DIY" ? "DIY" : "SHOP";
  const [providerMode, setProviderMode] = useState<"DIY" | "SHOP">(initialProviderMode);

  const selectedVehicleExists = useMemo(
    () => vehicles.some((vehicle) => vehicle.id === defaultVehicleId),
    [defaultVehicleId, vehicles],
  );

  const disabled = vehicles.length === 0 || !selectedVehicleExists;

  return (
    <form action={formAction} className="form-stack">
      <input type="hidden" name="maintenanceId" value={maintenanceId} />

      <fieldset className="fieldset-reset" disabled={disabled}>
        <label className="field">
          <span>Vehicle</span>
          <select name="vehicleId" required defaultValue={defaultVehicleId}>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field-grid field-grid-two">
          <label className="field">
            <span>Service title</span>
            <input name="title" type="text" required defaultValue={defaultTitle} />
          </label>
          <label className="field">
            <span>Date</span>
            <div className="date-input-wrap">
              <input name="serviceDate" type="date" required defaultValue={defaultServiceDate} />
            </div>
          </label>
        </div>

        <div className="field-grid field-grid-three">
          <label className="field">
            <span>Odometer mileage</span>
            <input name="odometer" type="number" min="0" step="1" required defaultValue={defaultOdometer} />
          </label>
          <label className="field">
            <span>Cost (USD, optional)</span>
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={defaultCost !== null ? String(defaultCost) : ""}
            />
          </label>
          <label className="field">
            <span>Provider</span>
            <select
              name="providerMode"
              required
              defaultValue={initialProviderMode}
              onChange={(event) => setProviderMode(event.target.value === "SHOP" ? "SHOP" : "DIY")}
            >
              <option value="DIY">DIY</option>
              <option value="SHOP">Repair shop</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Repair shop name {providerMode === "SHOP" ? "" : "(optional unless Repair shop is selected)"}</span>
          <input
            name="providerShopName"
            type="text"
            placeholder="Example: Joe's Auto Care"
            required={providerMode === "SHOP"}
            defaultValue={initialProviderMode === "SHOP" ? defaultProvider : ""}
          />
        </label>

        <label className="field">
          <span>Notes (optional)</span>
          <textarea name="notes" rows={3} defaultValue={defaultNotes} />
        </label>

        <label className="field">
          <span>Replace receipt (optional, PDF, JPEG, PNG, or WebP)</span>
          <input name="receipt" type="file" accept={DOCUMENT_FILE_ACCEPT} />
        </label>

        {receiptUrl ? (
          <p className="section-subtitle" style={{ marginTop: 0 }}>
            Current receipt: <a href={receiptUrl}>View upload</a>
          </p>
        ) : null}

        <SubmitButton />
      </fieldset>

      {disabled ? <FormMessage tone="error">Add a vehicle in Garage first.</FormMessage> : null}

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </form>
  );
}
