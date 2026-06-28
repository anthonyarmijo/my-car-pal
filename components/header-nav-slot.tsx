"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppInfoNav, AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/login/actions";

type HeaderNavSlotProps = {
  avatarUrl?: string | null;
};

export function HeaderNavSlot({ avatarUrl = null }: HeaderNavSlotProps) {
  const pathname = usePathname();
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(avatarUrl);
  const isPublicMarketingPage = pathname === "/" || pathname === "/about";

  useEffect(() => {
    setResolvedAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    if (avatarUrl || isPublicMarketingPage || pathname === "/login" || pathname === "/register") {
      return;
    }

    let cancelled = false;

    async function loadProfileSummary() {
      try {
        const response = await fetch("/api/profile/summary", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { avatarUrl?: string | null };
        if (!cancelled) {
          setResolvedAvatarUrl(payload.avatarUrl ?? null);
        }
      } catch {
        // Keep fallback icon when profile fetch fails.
      }
    }

    void loadProfileSummary();

    return () => {
      cancelled = true;
    };
  }, [avatarUrl, isPublicMarketingPage, pathname]);

  if (isPublicMarketingPage) {
    return (
      <div className="landing-public-nav-wrap">
        <nav className="landing-public-nav" aria-label="Marketing">
          <Link href="/#how-it-works">Features</Link>
          <Link href="/privacy">Security &amp; Privacy</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/diy">Resources</Link>
        </nav>
        <div className="landing-login-sign landing-login-sign-actions">
          <ThemeToggle />
          <Link href="/login" className="landing-login-text-link">
            Log In
          </Link>
          <Link href="/register" className="landing-try-now-link">
            Start Free
          </Link>
        </div>
      </div>
    );
  }

  if (pathname === "/login" || pathname === "/register") {
    return (
      <div className="landing-login-sign">
        <ThemeToggle />
        <p className="landing-login-label">Back to landing</p>
        <Link href="/" className="button-chip button-chip-strong">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="header-nav-area">
      <div className="header-nav-actions">
        <AppNav />
        <AppInfoNav />
      </div>
      <div className="header-account-corner">
        <ThemeToggle />
        <Link href="/profile" className="profile-circle" aria-label="Profile">
          {resolvedAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvedAvatarUrl} alt="" className="profile-circle-image" />
          ) : (
            <span className="profile-icon" aria-hidden="true">
              <svg suppressHydrationWarning viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4.1" fill="#D4C0A5" stroke="#6B5D4D" strokeWidth="1.4" />
                <path d="M5 20c.8-3.5 3.8-5.6 7-5.6S18.2 16.5 19 20" fill="#D4C0A5" stroke="#6B5D4D" strokeWidth="1.4" />
              </svg>
            </span>
          )}
        </Link>
        <form action={logoutAction}>
          <button className="button-chip logout-button" type="submit">
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
