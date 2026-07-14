import type { ReactNode } from "react";
import { AppShellClient } from "@/components/app-shell-client";
import { getCurrentUser } from "@/lib/auth-session";
import { isDiyFeatureEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();
  let avatarUrl: string | null = null;
  let displayName: string | null = user?.name ?? user?.email ?? null;

  if (user?.id) {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true, displayName: true },
    });
    avatarUrl = profile?.avatarUrl ? await getSignedUrl(profile.avatarUrl) : null;
    displayName = profile?.displayName ?? displayName;
  }

  return (
    <AppShellClient
      diyEnabled={isDiyFeatureEnabled()}
      profile={user?.id ? { avatarUrl, displayName, email: user.email ?? null } : null}
    >
      {children}
    </AppShellClient>
  );
}
