"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAvatarAction, type UpdateProfileAvatarState } from "@/app/profile/actions";
import { IMAGE_FILE_ACCEPT } from "@/lib/upload-constants";
import { Button, FormMessage } from "@my-car-pal/ui";

type ProfileAvatarUploadFormProps = {
  hasAvatar: boolean;
};

export function ProfileAvatarUploadForm({ hasAvatar }: ProfileAvatarUploadFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialState: UpdateProfileAvatarState = { status: "idle", message: "" };
  const [state, formAction] = useActionState(updateProfileAvatarAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFileChanged() {
    if (fileInputRef.current?.files?.length) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="profile-avatar-form">
      <input
        ref={fileInputRef}
        className="screen-reader-only"
        name="avatar"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        onChange={onFileChanged}
      />
      <Button variant="secondary" type="button" onClick={openFilePicker}>
        {hasAvatar ? "Update profile picture" : "Upload a profile picture"}
      </Button>
      {state.status !== "idle" ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>{state.message}</FormMessage>
      ) : null}
    </form>
  );
}
