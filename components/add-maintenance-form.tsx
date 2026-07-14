"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addMaintenanceAction } from "@/app/maintenance/actions";
import { initialMaintenanceFormState } from "@/app/maintenance/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { STANDARD_SERVICE_TITLES } from "@/lib/service-catalog";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";
import { Field, FieldGrid, Fieldset, FormStack } from "@/components/ui/field";

type VehicleOption = {
  id: string;
  label: string;
};

type AddMaintenanceFormProps = {
  vehicles: VehicleOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Adding..." : "Add service log"}
    </Button>
  );
}

export function AddMaintenanceForm({ vehicles }: AddMaintenanceFormProps) {
  const [state, formAction] = useActionState(addMaintenanceAction, initialMaintenanceFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [providerMode, setProviderMode] = useState<"DIY" | "SHOP">("DIY");
  const [receiptFileName, setReceiptFileName] = useState("");
  const disabled = vehicles.length === 0;
  const today = formatLocalDateForInput(new Date());

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setProviderMode("DIY");
      setReceiptFileName("");
    }
  }, [state.status]);

  return (
    <FormStack ref={formRef} action={formAction} className="add-service-compact-form">
      {disabled ? <FormMessage tone="error">Please add a vehicle to your Garage!</FormMessage> : null}

      <Fieldset disabled={disabled}>
        <Field>
          <span>Vehicle</span>
          <select name="vehicleId" required defaultValue={vehicles[0]?.id ?? ""}>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </Field>

        <FieldGrid columns={2}>
          <Field>
            <span>Service title</span>
            <input
              name="title"
              type="text"
              placeholder="Start typing a service (or enter your own)"
              list="standard-service-titles"
              required
            />
            <datalist id="standard-service-titles">
              {STANDARD_SERVICE_TITLES.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </Field>
          <Field inlineCompact>
            <span>Date</span>
            <div className="date-input-wrap">
              <input name="serviceDate" type="date" required defaultValue={today} />
            </div>
          </Field>
        </FieldGrid>

        <FieldGrid columns={3}>
          <Field inlineCompact>
            <span>Odometer mileage</span>
            <input name="odometer" type="number" min="0" step="1" placeholder="15000" required />
          </Field>
          <Field inlineCompact>
            <span>Cost (USD, optional)</span>
            <input name="cost" type="number" min="0" step="0.01" placeholder="89.99" />
          </Field>
          <Field inlineCompact>
            <span>Provider</span>
            <select
              name="providerMode"
              required
              defaultValue="DIY"
              onChange={(event) => setProviderMode(event.target.value === "SHOP" ? "SHOP" : "DIY")}
            >
              <option value="DIY">DIY</option>
              <option value="SHOP">Repair shop</option>
            </select>
          </Field>
        </FieldGrid>

        <FieldGrid columns={2}>
          <Field>
            <span>Repair shop name {providerMode === "SHOP" ? "" : "(optional unless Repair shop is selected)"}</span>
            <input
              name="providerShopName"
              type="text"
              placeholder="Example: Joe's Auto Care"
              required={providerMode === "SHOP"}
            />
          </Field>

          <Field>
            <span>Notes (optional)</span>
            <textarea name="notes" rows={2} placeholder="Any details you want to keep with this service." />
          </Field>
        </FieldGrid>

        <Field>
          <span>Receipt (optional, PDF, JPEG, PNG, or WebP)</span>
          <input
            ref={receiptInputRef}
            className="screen-reader-only"
            name="receipt"
            type="file"
            accept={DOCUMENT_FILE_ACCEPT}
            onChange={(event) => setReceiptFileName(event.target.files?.[0]?.name ?? "")}
          />
          <div className="receipt-upload-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => receiptInputRef.current?.click()}
            >
              Upload receipt
            </Button>
            <small style={{ color: "var(--muted)" }}>{receiptFileName || "No file selected"}</small>
          </div>
        </Field>

        <SubmitButton disabled={disabled} />
      </Fieldset>

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </FormStack>
  );
}
