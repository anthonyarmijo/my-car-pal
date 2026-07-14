"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleRegistrationAction } from "@/app/glovebox/actions";
import { initialGloveboxFormState } from "@/app/glovebox/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage, getButtonClassName } from "@my-car-pal/ui";
import { Field, FormStack } from "@/components/ui/field";
import { SectionSubtitle } from "@/components/ui/section-header";

export type ArchivedDoc = {
  id: string;
  title: string;
  fileUrl: string;
  createdAtLabel: string;
};

export type GloveboxRegistrationFormProps = {
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
  const [state, formAction] = useActionState(
    updateVehicleRegistrationAction,
    initialGloveboxFormState,
  );
  const today = formatLocalDateForInput(new Date());

  return (
    <div className="form-stack">
      <FormStack action={formAction} className="glovebox-registration-form">
        <input type="hidden" name="vehicleId" value={vehicleId} />

        <div className="glovebox-registration-fields">
          <Field compact className="glovebox-registration-date-field">
            <span>Renewal date</span>
            <div className="date-input-wrap">
              <input
                name="registrationExpiresAt"
                type="date"
                defaultValue={registrationExpiresAt || today}
              />
            </div>
          </Field>

          <Field className="glovebox-registration-file-field">
            <span>Registration document (PDF or image)</span>
            <input
              name="registrationDoc"
              type="file"
              accept={DOCUMENT_FILE_ACCEPT}
            />
          </Field>
        </div>

        <div className="glovebox-registration-actions">
          <SubmitButton />
          {registrationDocUrl ? (
            <a
              href={registrationDocUrl}
              target="_blank"
              rel="noreferrer"
              className={getButtonClassName({ variant: "success", size: "sm" })}
            >
              View current registration
            </a>
          ) : null}
        </div>
      </FormStack>

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}

      {archivedDocs.length > 0 ? (
        <div className="archived-docs">
          <SectionSubtitle style={{ marginTop: 0 }}>
            Archived registration docs
          </SectionSubtitle>
          <ul className="list-reset kv" style={{ marginTop: "0.55rem" }}>
            {archivedDocs.map((doc) => (
              <li key={doc.id} className="kv-row">
                <span>
                  <strong>{doc.title}</strong>
                  <br />
                  <small style={{ color: "var(--muted)" }}>
                    Archived {doc.createdAtLabel}
                  </small>
                </span>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
