"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addReminderAction } from "@/app/maintenance/actions";
import { initialMaintenanceFormState } from "@/app/maintenance/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { Button, FormMessage } from "@my-car-pal/ui";
import { Field, FieldGrid, Fieldset, FormStack } from "@/components/ui/field";

type VehicleOption = {
  id: string;
  label: string;
};

type AddReminderFormProps = {
  vehicles: VehicleOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Adding..." : "Add reminder"}
    </Button>
  );
}

export function AddReminderForm({ vehicles }: AddReminderFormProps) {
  const [state, formAction] = useActionState(addReminderAction, initialMaintenanceFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const disabled = vehicles.length === 0;
  const today = formatLocalDateForInput(new Date());

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <FormStack ref={formRef} action={formAction}>
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
            <span>Reminder title</span>
            <input name="title" type="text" placeholder="Rotate tires" required />
          </Field>
          <Field>
            <span>Due date</span>
            <div className="date-input-wrap">
              <input name="dueDate" type="date" required defaultValue={today} />
            </div>
          </Field>
        </FieldGrid>

        <Field>
          <span>Notes (optional)</span>
          <textarea name="notes" rows={3} placeholder="Optional context for this reminder." />
        </Field>

        <SubmitButton disabled={disabled} />
      </Fieldset>

      {disabled ? <FormMessage tone="error">Add a vehicle in Garage first.</FormMessage> : null}

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </FormStack>
  );
}
