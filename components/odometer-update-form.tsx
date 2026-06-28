"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleOdometerAction } from "@/app/home/actions";
import { initialUpdateOdometerState } from "@/app/home/state";
import { Button } from "@my-car-pal/ui";

type OdometerUpdateFormProps = {
  vehicleId: string;
  defaultOdometer: number | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

function formatMileage(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "Mileage not set";
  }
  return `${value.toLocaleString()} mi`;
}

export function OdometerUpdateForm({ vehicleId, defaultOdometer }: OdometerUpdateFormProps) {
  const [state, formAction] = useActionState(updateVehicleOdometerAction, initialUpdateOdometerState);
  const [mileage, setMileage] = useState(defaultOdometer !== null ? String(defaultOdometer) : "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMileage(defaultOdometer !== null ? String(defaultOdometer) : "");
  }, [defaultOdometer]);

  function applyOffset(amount: number) {
    const current = Number.parseInt(mileage, 10);
    const next = Number.isFinite(current) ? current + amount : amount;
    setMileage(String(Math.max(next, 0)));
  }

  if (!expanded) {
    return (
      <div className="odometer-summary">
        <span className="odometer-current">{formatMileage(defaultOdometer)}</span>
        <Button variant="secondary" size="sm" type="button" onClick={() => setExpanded(true)}>
          Update mileage
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="odometer-form">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div className="odometer-input-row">
        <div className="odometer-quick-buttons odometer-quick-buttons-left">
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(-1000)}>
            -1,000 mi
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(-100)}>
            -100 mi
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(-50)}>
            -50 mi
          </Button>
        </div>

        <input
          className="odometer-input"
          name="odometer"
          type="number"
          min="0"
          step="1"
          required
          value={mileage}
          onChange={(event) => setMileage(event.target.value)}
          placeholder="Mileage"
          aria-label="Odometer"
        />

        <div className="odometer-quick-buttons odometer-quick-buttons-right">
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(50)}>
            +50 mi
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(100)}>
            +100 mi
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyOffset(1000)}>
            +1,000 mi
          </Button>
        </div>
      </div>

      <div className="odometer-action-row">
        <SubmitButton />
        <Button variant="secondary" size="sm" type="button" onClick={() => setExpanded(false)}>
          Close
        </Button>
      </div>

      {state.status === "error" ? <small className="odometer-error">{state.message}</small> : null}
    </form>
  );
}
