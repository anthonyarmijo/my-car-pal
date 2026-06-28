import type { ReactNode } from "react";
import { AppLogo } from "@/components/app-logo";
import { HeaderNavSlot } from "@/components/header-nav-slot";
import { getCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();
  let avatarUrl: string | null = null;

  if (user?.id) {
    const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });
    avatarUrl = profile?.avatarUrl ? await getSignedUrl(profile.avatarUrl) : null;
  }

  return (
    <div className="app-bg">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="app-shell">
        <header className="app-header">
          <AppLogo />
          <HeaderNavSlot avatarUrl={avatarUrl} />
        </header>
        <main id="main-content" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
