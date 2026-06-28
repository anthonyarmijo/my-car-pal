"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateVehicleImageAction } from "@/app/garage/actions";
import { initialAddVehicleFormState } from "@/app/garage/state";
import { IMAGE_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button } from "@my-car-pal/ui";

type GarageImageUploadFormProps = {
  vehicleId: string;
};

function ChangePhotoButton({ onPick }: { onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="secondary" size="sm" className="garage-photo-button" type="button" onClick={onPick} disabled={pending}>
      {pending ? "Updating..." : "Change photo"}
    </Button>
  );
}

export function GarageImageUploadForm({ vehicleId }: GarageImageUploadFormProps) {
  const [state, formAction] = useActionState(updateVehicleImageAction, initialAddVehicleFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange() {
    if (fileInputRef.current?.files?.length) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="garage-image-upload-form">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input
        ref={fileInputRef}
        className="screen-reader-only"
        name="image"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        onChange={handleFileChange}
      />
      <ChangePhotoButton onPick={handlePickFile} />
      {state.message ? (
        <small className={state.status === "error" ? "odometer-error" : "section-subtitle garage-photo-message"}>{state.message}</small>
      ) : null}
    </form>
  );
}
