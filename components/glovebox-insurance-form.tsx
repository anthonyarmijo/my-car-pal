"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleInsuranceAction } from "@/app/glovebox/actions";
import { initialGloveboxFormState } from "@/app/glovebox/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";
import { Field, FormStack } from "@/components/ui/field";

type GloveboxInsuranceFormProps = {
  vehicleId: string;
  insuranceExpiresAt: string;
  insuranceDocUrl: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save insurance"}
    </Button>
  );
}

export function GloveboxInsuranceForm({
  vehicleId,
  insuranceExpiresAt,
  insuranceDocUrl,
}: GloveboxInsuranceFormProps) {
  const [state, formAction] = useActionState(updateVehicleInsuranceAction, initialGloveboxFormState);
  const today = formatLocalDateForInput(new Date());

  return (
    <div className="form-stack">
      <FormStack action={formAction}>
        <input type="hidden" name="vehicleId" value={vehicleId} />

        <Field compact>
          <span>Insurance renewal date</span>
          <div className="date-input-wrap">
            <input name="insuranceExpiresAt" type="date" defaultValue={insuranceExpiresAt || today} />
          </div>
        </Field>

        <Field>
          <span>Insurance document (PDF, JPEG, PNG, or WebP)</span>
          <input name="insuranceDoc" type="file" accept={DOCUMENT_FILE_ACCEPT} />
          {insuranceDocUrl ? (
            <small>
              Current:{" "}
              <a href={insuranceDocUrl} target="_blank" rel="noreferrer">
                View in new tab
              </a>
            </small>
          ) : null}
        </Field>

        <SubmitButton />
      </FormStack>

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </div>
  );
}
