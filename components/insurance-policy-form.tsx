"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addInsurancePolicyAction } from "@/app/glovebox/actions";
import { initialGloveboxFormState } from "@/app/glovebox/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";
import { Field, FieldGrid, Fieldset, FormStack } from "@/components/ui/field";
import { SectionSubtitle } from "@/components/ui/section-header";

type VehicleOption = {
  id: string;
  label: string;
};

type InsurancePolicyFormProps = {
  vehicles: VehicleOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving..." : "Add policy"}
    </Button>
  );
}

export function InsurancePolicyForm({ vehicles }: InsurancePolicyFormProps) {
  const [state, formAction] = useActionState(addInsurancePolicyAction, initialGloveboxFormState);
  const [appliesMode, setAppliesMode] = useState<"ALL" | "SINGLE">("ALL");
  const formRef = useRef<HTMLFormElement>(null);
  const hasVehicles = vehicles.length > 0;
  const today = formatLocalDateForInput(new Date());

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setAppliesMode("ALL");
    }
  }, [state.status]);

  useEffect(() => {
    if (!hasVehicles && appliesMode === "SINGLE") {
      setAppliesMode("ALL");
    }
  }, [appliesMode, hasVehicles]);

  return (
    <div className="form-stack">
      <FormStack ref={formRef} action={formAction}>
        <Fieldset>
          <FieldGrid columns={2}>
            <Field>
              <span>Insurance provider</span>
              <input name="providerName" type="text" placeholder="Progressive" required />
            </Field>
            <Field>
              <span>Policy ID</span>
              <input name="policyId" type="text" placeholder="POL-123456" required />
            </Field>
            <Field compact>
              <span>Expiration date</span>
              <div className="date-input-wrap">
                <input name="expiresAt" type="date" required defaultValue={today} />
              </div>
            </Field>
          </FieldGrid>

          <Field as="div">
            <span>Applies to</span>
            <div className="policy-apply-options">
              <label className="policy-radio-option">
                <input
                  type="radio"
                  name="appliesMode"
                  value="ALL"
                  checked={appliesMode === "ALL"}
                  onChange={() => setAppliesMode("ALL")}
                />
                All vehicles
              </label>
              <label className="policy-radio-option">
                <input
                  type="radio"
                  name="appliesMode"
                  value="SINGLE"
                  disabled={!hasVehicles}
                  checked={appliesMode === "SINGLE"}
                  onChange={() => setAppliesMode("SINGLE")}
                />
                One vehicle
              </label>
            </div>
          </Field>

          {appliesMode === "SINGLE" ? (
            <Field compact>
              <span>Vehicle</span>
              <select name="vehicleId" required defaultValue={vehicles[0]?.id ?? ""}>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field>
            <span>Policy document (optional)</span>
            <input name="policyDoc" type="file" accept={DOCUMENT_FILE_ACCEPT} />
          </Field>

          <SubmitButton disabled={false} />
        </Fieldset>
      </FormStack>

      {!hasVehicles ? (
        <SectionSubtitle>No vehicles yet, so new policies will apply to all vehicles by default.</SectionSubtitle>
      ) : null}

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </div>
  );
}
