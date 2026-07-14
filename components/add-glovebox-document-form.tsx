"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addGloveboxDocumentAction } from "@/app/glovebox/actions";
import { initialGloveboxFormState } from "@/app/glovebox/state";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";
import { Field, FieldGrid, Fieldset, FormStack } from "@/components/ui/field";
import { SectionSubtitle } from "@/components/ui/section-header";

type VehicleOption = {
  id: string;
  label: string;
};

type AddGloveboxDocumentFormProps = {
  vehicles: VehicleOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Adding..." : "Add document"}
    </Button>
  );
}

export function AddGloveboxDocumentForm({ vehicles }: AddGloveboxDocumentFormProps) {
  const [state, formAction] = useActionState(addGloveboxDocumentAction, initialGloveboxFormState);
  const [documentNotVehicleSpecific, setDocumentNotVehicleSpecific] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const noVehicles = vehicles.length === 0;
  const effectiveNotVehicleSpecific = documentNotVehicleSpecific || noVehicles;
  const vehicleFieldDisabled = effectiveNotVehicleSpecific;
  const hasMultipleVehicles = vehicles.length > 1;

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setDocumentNotVehicleSpecific(false);
    }
  }, [state.status]);

  return (
    <FormStack ref={formRef} action={formAction}>
      <Fieldset>
        <Field compact>
          <span>Vehicle</span>
          <select
            name="vehicleId"
            required={!effectiveNotVehicleSpecific}
            defaultValue={hasMultipleVehicles ? "" : vehicles[0]?.id ?? ""}
            disabled={vehicleFieldDisabled}
          >
            {noVehicles ? (
              <option value="">--No vehicles available--</option>
            ) : null}
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
        </Field>
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={effectiveNotVehicleSpecific}
            disabled={noVehicles}
            onChange={(event) => setDocumentNotVehicleSpecific(event.target.checked)}
          />
          <span>Document is not vehicle specific</span>
        </label>
        <input type="hidden" name="documentNotVehicleSpecific" value={effectiveNotVehicleSpecific ? "1" : "0"} />

        <FieldGrid columns={2}>
          <Field>
            <span>Document title</span>
            <input className="glovebox-title-input" name="title" type="text" placeholder="Owner's manual" required />
          </Field>

          <Field>
            <span>Category</span>
            <select name="category" required defaultValue="SERVICE_MANUAL">
              <option value="SERVICE_MANUAL">Service manual</option>
              <option value="WARRANTY">Warranty / coverage</option>
              <option value="INSPECTION_REPORT">Inspection / emissions</option>
              <option value="PURCHASE_FINANCE">Purchase / finance</option>
              <option value="MISC">Miscellaneous</option>
            </select>
          </Field>
        </FieldGrid>

        <Field>
          <span>File (PDF or image)</span>
          <input name="document" type="file" accept={DOCUMENT_FILE_ACCEPT} required />
        </Field>

        <SubmitButton disabled={false} />
      </Fieldset>

      {noVehicles ? (
        <SectionSubtitle>No vehicles yet, so new docs will be saved as not vehicle specific.</SectionSubtitle>
      ) : null}

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </FormStack>
  );
}
