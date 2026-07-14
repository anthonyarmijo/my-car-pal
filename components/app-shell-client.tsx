"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { AppLogo } from "@/components/app-logo";
import { AppNav, MailboxStatusButton } from "@/components/app-nav";
import { HeaderNavSlot } from "@/components/header-nav-slot";
import { ThemeIconToggle } from "@/components/theme-toggle";
import styles from "@/components/app-shell.module.css";

type AppShellProfile = {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
};

type AppShellClientProps = {
  children: ReactNode;
  diyEnabled: boolean;
  profile: AppShellProfile | null;
};

type AlertCounts = {
  active: number;
  unread: number;
};

const publicPaths = new Set(["/", "/about", "/privacy", "/terms", "/login", "/register", "/auth-error"]);

function ProfileMark({ profile }: { profile: AppShellProfile }) {
  const fallback = (profile.displayName ?? profile.email ?? "My Car Pal").trim().charAt(0).toUpperCase() || "M";

  if (profile.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatarUrl} alt="" className={styles.profileImage} />;
  }

  return <span aria-hidden="true">{fallback}</span>;
}

function NavigationContents({
  activeAlertCount,
  onNavigate,
  variant,
  diyEnabled,
}: {
  activeAlertCount: number;
  onNavigate?: () => void;
  variant: "desktop" | "drawer";
  diyEnabled: boolean;
}) {
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className={styles.navigationContents}>
      <div className={styles.primaryNavigation}>
        <AppNav
          activeAlertCount={activeAlertCount}
          className={styles.primaryNav}
          linkClassName={styles.primaryNavLink}
          activeLinkClassName={styles.primaryNavLinkActive}
          diyEnabled={diyEnabled}
          onNavigate={onNavigate}
        />
        <nav className={styles.utilityNav} aria-label="Help and information">
          <Link href="/about" onClick={onNavigate}>About</Link>
          <Link href="/contact" onClick={onNavigate}>Contact</Link>
        </nav>
      </div>

      <div className={styles.sidebarUtilities} aria-label="Display and application settings">
        <ThemeIconToggle className={styles.sidebarUtilityButton} />
        <button
          type="button"
          className={styles.sidebarUtilityButton}
          aria-label="App settings"
          title="App settings"
          onClick={() => settingsDialogRef.current?.showModal()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.1" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.55v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.3V9.55h.1A1.7 1.7 0 0 0 4.1 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.56 3.7l.06.06A1.7 1.7 0 0 0 8.5 4.1a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1v-.1h4.05v.1A1.7 1.7 0 0 0 15 4.1a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.5a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4.05h-.1A1.7 1.7 0 0 0 19.4 15Z" />
          </svg>
        </button>
        <dialog
          ref={settingsDialogRef}
          className={styles.settingsDialog}
          aria-labelledby={`app-settings-title-${variant}`}
          aria-describedby={`app-settings-description-${variant}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              event.currentTarget.close();
            }
          }}
        >
          <div className={styles.settingsDialogContent}>
            <span className={styles.settingsDialogIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.1" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.55-2-3.45-2.45 1A7 7 0 0 0 14.4 5.6L14 3h-4l-.4 2.6a7 7 0 0 0-2.05 1.2l-2.45-1-2 3.45 2 1.55A7 7 0 0 0 5 12c0 .4.03.8.1 1.2l-2 1.55 2 3.45 2.45-1a7 7 0 0 0 2.05 1.2L10 21h4l.4-2.6a7 7 0 0 0 2.05-1.2l2.45 1 2-3.45-2-1.55c.07-.4.1-.8.1-1.2Z" /></svg>
            </span>
            <p className={styles.settingsDialogEyebrow}>App settings</p>
            <h2 id={`app-settings-title-${variant}`}>Coming soon...</h2>
            <p id={`app-settings-description-${variant}`}>
              More workspace preferences will live here as the application evolves.
            </p>
            <form method="dialog">
              <button type="submit">Got it</button>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
}

function AccountMenu({ profile }: { profile: AppShellProfile }) {
  const userLabel = profile.displayName ?? profile.email ?? "My Car Pal driver";
  const userMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const menu = userMenuRef.current;
      if (!menu?.open || event.composedPath().includes(menu)) {
        return;
      }

      menu.open = false;
    }

    function handleEscape(event: KeyboardEvent) {
      const menu = userMenuRef.current;
      if (event.key !== "Escape" || !menu?.open) {
        return;
      }

      menu.open = false;
      menu.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <details ref={userMenuRef} className={styles.accountMenu}>
      <summary
        aria-controls="account-menu-product-bar"
        aria-label={`Account menu for ${userLabel}`}
      >
        <span className={styles.profileMark}><ProfileMark profile={profile} /></span>
      </summary>
      <div className={styles.accountMenuPanel} id="account-menu-product-bar">
        <div className={styles.accountMenuIdentity}>
          <span className={styles.profileMark}><ProfileMark profile={profile} /></span>
          <span className={styles.userCopy}>
            <strong>{userLabel}</strong>
            <small>Personal garage</small>
          </span>
        </div>
        <Link href="/profile" onClick={() => { if (userMenuRef.current) userMenuRef.current.open = false; }}>
          Profile settings
        </Link>
        <form action={logoutAction}>
          <button type="submit">Log out</button>
        </form>
      </div>
    </details>
  );
}

function AuthenticatedNavigation({
  activeAlertCount,
  profile,
  diyEnabled,
}: {
  activeAlertCount: number;
  profile: AppShellProfile;
  diyEnabled: boolean;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("a, button, summary")?.focus();

    const handleDrawerKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), summary, [tabindex='0']"),
        );
        const first = focusable[0];
        const last = focusable.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleDrawerKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDrawerKeyboard);
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <aside className={styles.desktopSidebar} aria-label="Application sidebar">
        <div className={styles.sidebarBrand}><AppLogo /></div>
        <NavigationContents activeAlertCount={activeAlertCount} variant="desktop" diyEnabled={diyEnabled} />
      </aside>

      <header className={styles.mobileHeader}>
        <AppLogo />
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={drawerOpen}
          aria-controls="authenticated-navigation-drawer"
          aria-label={drawerOpen ? "Close application menu" : "Open application menu"}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </header>

      <button
        type="button"
        className={`${styles.drawerBackdrop}${drawerOpen ? ` ${styles.drawerBackdropOpen}` : ""}`}
        aria-label="Close application menu"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeDrawer}
      />
      <aside
        ref={drawerRef}
        id="authenticated-navigation-drawer"
        className={`${styles.drawer}${drawerOpen ? ` ${styles.drawerOpen}` : ""}`}
        aria-label="Application menu"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className={styles.drawerHeading}>
          <strong>Navigate</strong>
          <button type="button" onClick={closeDrawer} aria-label="Close application menu">×</button>
        </div>
        <NavigationContents
          activeAlertCount={activeAlertCount}
          variant="drawer"
          onNavigate={closeDrawer}
          diyEnabled={diyEnabled}
        />
      </aside>
    </>
  );
}

export function AppShellClient({ children, diyEnabled, profile }: AppShellClientProps) {
  const pathname = usePathname();
  const useAuthenticatedShell = Boolean(profile && !publicPaths.has(pathname));
  const [alertCounts, setAlertCounts] = useState<AlertCounts>({ active: 0, unread: 0 });

  useEffect(() => {
    if (!useAuthenticatedShell) {
      return;
    }

    let cancelled = false;

    async function loadAlertCounts() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { activeCount?: number; count?: number };
        if (!cancelled) {
          const active = Number(payload.activeCount ?? 0);
          const unread = Number(payload.count ?? 0);
          setAlertCounts({
            active: Number.isFinite(active) ? Math.max(0, active) : 0,
            unread: Number.isFinite(unread) ? Math.max(0, unread) : 0,
          });
        }
      } catch {
        // Keep the navigation usable when live alert status is unavailable.
      }
    }

    void loadAlertCounts();
    const intervalId = window.setInterval(() => {
      void loadAlertCounts();
    }, 4000);
    window.addEventListener("focus", loadAlertCounts);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadAlertCounts);
    };
  }, [pathname, useAuthenticatedShell]);

  if (!useAuthenticatedShell || !profile) {
    return (
      <div className="app-bg">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="app-shell">
          <header className="app-header">
            <AppLogo />
            <HeaderNavSlot />
          </header>
          <main id="main-content" className="app-main">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className={styles.shell} data-app-shell data-shell-palette="porcelain">
        <AuthenticatedNavigation
          activeAlertCount={alertCounts.active}
          profile={profile}
          diyEnabled={diyEnabled}
        />
        <div className={`${styles.workspace} product-workspace`}>
          <div className={styles.productBar} aria-label="Application tools">
            <div className={styles.searchPlaceholder} aria-label="Search cars and records, coming soon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.2" /><path d="m15.4 15.4 4.2 4.2" /></svg>
              <span>Search cars &amp; records</span>
              <small>Coming soon</small>
            </div>
            <div className={styles.productBarActions}>
              <MailboxStatusButton
                iconOnly
                className={styles.mailboxButton}
                unreadCount={alertCounts.unread}
              />
              <AccountMenu profile={profile} />
            </div>
          </div>
          <main id="main-content" className={`${styles.main} product-main`} data-page={pathname.split("/")[1] || "home"}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
