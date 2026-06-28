import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      avatarUrl: true,
      displayName: true,
      email: true,
    },
  });

  const avatarUrl = profile?.avatarUrl ? await getSignedUrl(profile.avatarUrl) : null;

  return NextResponse.json({
    avatarUrl,
    displayName: profile?.displayName ?? null,
    email: profile?.email ?? user.email,
  });
}
