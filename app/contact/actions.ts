"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export type ContactMessageState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialContactMessageState: ContactMessageState = {
  status: "idle",
  message: "",
};

export async function sendContactMessageAction(
  _prevState: ContactMessageState,
  formData: FormData,
): Promise<ContactMessageState> {
  const user = await requireCurrentUser();
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return { status: "error", message: "Please enter a message before sending." };
  }
  if (message.length < 8) {
    return { status: "error", message: "Please add a bit more detail so we can help." };
  }
  if (message.length > 4000) {
    return { status: "error", message: "Message is too long. Keep it under 4,000 characters." };
  }

  await prisma.contactMessage.create({
    data: {
      userId: user.id,
      email: user.email,
      message,
    },
  });

  revalidatePath("/contact");
  return { status: "success", message: "Message sent. Thanks for reaching out." };
}
