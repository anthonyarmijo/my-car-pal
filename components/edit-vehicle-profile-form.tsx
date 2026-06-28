"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleProfileAction } from "@/app/vehicle/actions";
import { initialUpdateVehicleProfileState } from "@/app/vehicle/state";
import { formatLocalDateForInput } from "@/lib/date-only";
import { DOCUMENT_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";

type EditVehicleProfileFormProps = {
  vehicleId: string;
  vin: string;
  licensePlate: string;
  registrationExpiresAt: string;
  registrationDocUrl: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save vehicle"}
    </Button>
  );
}

export function EditVehicleProfileForm({
  vehicleId,
  vin,
  licensePlate,
  registrationExpiresAt,
  registrationDocUrl,
}: EditVehicleProfileFormProps) {
  const [state, formAction] = useActionState(updateVehicleProfileAction, initialUpdateVehicleProfileState);
  const today = formatLocalDateForInput(new Date());
  const [showReplaceRegistration, setShowReplaceRegistration] = useState(false);
  const registrationDocName = useMemo(() => {
    if (!registrationDocUrl) {
      return "";
    }

    return decodeURIComponent(registrationDocUrl.split("/").at(-1) ?? "registration-document");
  }, [registrationDocUrl]);

  return (
    <form action={formAction} className="form-stack">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="replaceRegistration" value={showReplaceRegistration ? "1" : "0"} />

      <div className="field-grid field-grid-two">
        <label className="field">
          <span>VIN (optional)</span>
          <input
            name="vin"
            type="text"
            maxLength={17}
            defaultValue={vin}
            placeholder="1HGCM82633A123456"
            style={{ textTransform: "uppercase" }}
          />
        </label>

        <label className="field">
          <span>License plate (optional)</span>
          <input name="licensePlate" type="text" maxLength={20} defaultValue={licensePlate} placeholder="ABC-1234" />
        </label>
      </div>

      <label className="field field-compact">
        <span>Registration expiration</span>
        <div className="date-input-wrap">
          <input name="registrationExpiresAt" type="date" defaultValue={registrationExpiresAt || today} />
          <span className="date-input-icon" aria-hidden="true">
            <svg suppressHydrationWarning viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" />
            </svg>
          </span>
        </div>
      </label>

      <p className="section-subtitle" style={{ marginTop: 0 }}>
        VIN must be 17 characters and cannot include I, O, or Q.
      </p>

      {registrationDocUrl ? (
        <div className="registration-doc-box">
          <p className="section-subtitle" style={{ marginTop: 0 }}>
            Current registration document
          </p>
          <div className="form-stack" style={{ gap: "0.3rem", marginTop: "0.45rem" }}>
            <a href={registrationDocUrl} target="_blank" rel="noreferrer" className="button-chip button-chip-success">
              View registration (new tab)
            </a>
            <small style={{ color: "var(--muted)" }}>{registrationDocName}</small>
          </div>

          {!showReplaceRegistration ? (
            <button className="button-chip" type="button" onClick={() => setShowReplaceRegistration(true)}>
              Replace registration
            </button>
          ) : (
            <div className="form-stack" style={{ marginTop: "0.5rem" }}>
              <fieldset className="fieldset-reset">
                <label className="field">
                  <span>When replacing current registration doc</span>
                  <div className="replace-doc-actions">
                    <Button type="submit" name="registrationDocAction" value="ARCHIVE" className="button-small">
                      Replace and archive existing document
                    </Button>
                    <Button type="submit" name="registrationDocAction" value="DELETE" variant="danger" className="button-small">
                      Replace and delete existing document
                    </Button>
                  </div>
                </label>

                <label className="field">
                  <span>New registration document (optional, PDF, JPEG, PNG, or WebP)</span>
                  <input name="registrationDoc" type="file" accept={DOCUMENT_FILE_ACCEPT} />
                </label>
              </fieldset>

              <button className="button-chip" type="button" onClick={() => setShowReplaceRegistration(false)}>
                Cancel replace
              </button>
            </div>
          )}
        </div>
      ) : null}

      {!registrationDocUrl ? (
        <label className="field">
          <span>Registration document (optional, PDF, JPEG, PNG, or WebP)</span>
          <input name="registrationDoc" type="file" accept={DOCUMENT_FILE_ACCEPT} />
        </label>
      ) : null}

      <SubmitButton />

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormMessage>
      ) : null}
    </form>
  );
}
