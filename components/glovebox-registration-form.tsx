"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleRegistrationAction } from "@/app/glovebox/actions";
import { initialGloveboxFormState } from "@/app/glovebox/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage, getButtonClassName } from "@my-car-pal/ui";
import { DateInputIcon } from "@/components/ui/date-input-icon";
import { Field, FormStack } from "@/components/ui/field";
import { SectionSubtitle } from "@/components/ui/section-header";

type ArchivedDoc = {
  id: string;
  title: string;
  fileUrl: string;
  createdAtLabel: string;
};

type GloveboxRegistrationFormProps = {
  vehicleId: string;
  registrationExpiresAt: string;
  registrationDocUrl: string | null;
  archivedDocs: ArchivedDoc[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save registration"}
    </Button>
  );
}

export function GloveboxRegistrationForm({
  vehicleId,
  registrationExpiresAt,
  registrationDocUrl,
  archivedDocs,
}: GloveboxRegistrationFormProps) {
  const [state, formAction] = useActionState(updateVehicleRegistrationAction, initialGloveboxFormState);
  const today = formatLocalDateForInput(new Date());

  return (
    <div className="form-stack">
      <FormStack action={formAction}>
        <input type="hidden" name="vehicleId" value={vehicleId} />

        <Field compact>
          <span>Registration renewal date</span>
          <div className="date-input-wrap">
            <input name="registrationExpiresAt" type="date" defaultValue={registrationExpiresAt || today} />
            <DateInputIcon />
          </div>
        </Field>

        <Field>
          <span>Registration document (PDF, JPEG, PNG, or WebP)</span>
          <input name="registrationDoc" type="file" accept={DOCUMENT_FILE_ACCEPT} />
          {registrationDocUrl ? (
            <a href={registrationDocUrl} target="_blank" rel="noreferrer" className={getButtonClassName({ variant: "success", size: "sm" })}>
              View registration (new tab)
            </a>
          ) : null}
        </Field>

        <SubmitButton />
      </FormStack>

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}

      <div className="archived-docs">
        <SectionSubtitle style={{ marginTop: 0 }}>
          Archived registration docs
        </SectionSubtitle>
        {archivedDocs.length === 0 ? (
          <SectionSubtitle>No archived registration docs yet.</SectionSubtitle>
        ) : (
          <ul className="list-reset kv" style={{ marginTop: "0.55rem" }}>
            {archivedDocs.map((doc) => (
              <li key={doc.id} className="kv-row">
                <span>
                  <strong>{doc.title}</strong>
                  <br />
                  <small style={{ color: "var(--muted)" }}>Archived {doc.createdAtLabel}</small>
                </span>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
