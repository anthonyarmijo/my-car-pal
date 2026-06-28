"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { initialContactMessageState, sendContactMessageAction } from "@/app/contact/actions";
import { Button, Field, FormMessage, Textarea } from "@my-car-pal/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send message"}
    </Button>
  );
}

export function ContactMessageForm() {
  const [state, formAction] = useActionState(sendContactMessageAction, initialContactMessageState);
  const formRef = useRef<HTMLFormElement>(null);
  const stateMessage = typeof state?.message === "string" ? state.message : "";

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="form-stack">
      <Field label="Your message" htmlFor="contact-message" required>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us what you need help with, feature ideas, or feedback."
          required
        />
      </Field>
      <SubmitButton />

      {state.status !== "idle" && stateMessage.trim().length > 0 ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"}>{stateMessage}</FormMessage>
      ) : null}
    </form>
  );
}
