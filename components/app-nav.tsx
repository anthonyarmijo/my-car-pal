"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/home", label: "Home" },
  { href: "/alerts", label: "Alerts" },
  { href: "/garage", label: "Garage" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/glovebox", label: "Glovebox" },
  { href: "/diy", label: "DIY" },
];

function HomeIcon() {
  return (
    <span className="nav-icon-wrap" aria-hidden="true">
      <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
        <path d="M4 10.7 12 4l8 6.7v8.8H4v-8.8Z" />
        <path d="M9.3 19.5v-5.4h5.4v5.4" />
      </svg>
    </span>
  );
}

function GloveboxDocumentsIcon({ hasNotifications }: { hasNotifications: boolean }) {
  return (
    <span className="mailbox-icon-wrap" aria-hidden="true">
      <svg suppressHydrationWarning viewBox="0 0 24 24" className="mailbox-icon">
        <rect x="5" y="4.5" width="14" height="15" rx="2" />
        <path d="M8 8.2h8M8 12h8M8 15.8h5" />
      </svg>
      {hasNotifications ? <span className="mailbox-notification-dot" /> : null}
    </span>
  );
}

function NavIcon({ label }: { label: string }) {
  if (label === "Home") {
    return <HomeIcon />;
  }

  if (label === "Alerts") {
    return (
      <span className="nav-icon-wrap" aria-hidden="true">
        <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
          <path d="M6.7 10.1a5.3 5.3 0 0 1 10.6 0c0 5 2.2 5.6 2.2 7H4.5c0-1.4 2.2-2 2.2-7Z" />
          <path d="M9.8 20h4.4" />
        </svg>
      </span>
    );
  }

  if (label === "Garage") {
    return (
      <span className="nav-icon-wrap" aria-hidden="true">
        <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
          <path d="M4 19V8.6L12 4l8 4.6V19" />
          <path d="M7.5 19v-6.1h9V19" />
          <path d="M9.2 15h5.6" />
        </svg>
      </span>
    );
  }

  if (label === "Maintenance") {
    return (
      <span className="nav-icon-wrap" aria-hidden="true">
        <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
          <path d="M15.6 4.2a3.4 3.4 0 0 0-4.2 4.6L5.2 15l3.8 3.8 6.2-6.2a3.4 3.4 0 0 0 4.6-4.2l-2.2 2.2-2.4-2.4 2.2-2.2Z" />
        </svg>
      </span>
    );
  }

  if (label === "DIY") {
    return (
      <span className="nav-icon-wrap" aria-hidden="true">
        <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
          <path d="M6.2 18.2 15.7 8.7" />
          <path d="M14.4 4.8 19.2 9.6" />
          <path d="M16.9 7.3 8.1 16.1l-3.2 1 1-3.2 8.8-8.8" />
        </svg>
      </span>
    );
  }

  return (
    <span className="nav-icon-wrap" aria-hidden="true">
      <svg suppressHydrationWarning viewBox="0 0 24 24" className="nav-icon">
        <rect x="5" y="4.5" width="14" height="15" rx="2" />
        <path d="M8 8.2h8M8 12h8M8 15.8h5" />
      </svg>
    </span>
  );
}

type AppNavProps = {
  activeAlertCount?: number;
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  diyEnabled?: boolean;
  onNavigate?: () => void;
};

export function AppNav({
  activeAlertCount = 0,
  className = "",
  linkClassName = "",
  activeLinkClassName = "",
  diyEnabled = true,
  onNavigate,
}: AppNavProps = {}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={`app-nav${className ? ` ${className}` : ""}`}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isHome = item.label === "Home";
        const isAlerts = item.href === "/alerts";
        const isComingSoon = item.href === "/diy" && !diyEnabled;
        const classes = [
          "nav-link",
          isActive ? "nav-link-active" : "",
          isHome ? "nav-link-home" : "",
          linkClassName,
          isActive ? activeLinkClassName : "",
        ].filter(Boolean).join(" ");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={classes}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
          >
            <NavIcon label={item.label} />
            <span>{item.label}</span>
            {isAlerts && activeAlertCount > 0 ? (
              <span
                className="nav-alert-count"
                aria-label={`${activeAlertCount} active alert${activeAlertCount === 1 ? "" : "s"}`}
              >
                {activeAlertCount > 99 ? "99+" : activeAlertCount}
              </span>
            ) : null}
            {isComingSoon ? <small className="nav-coming-soon-badge">Coming soon</small> : null}
          </Link>
        );
      })}
    </nav>
  );
}

type MailboxStatusButtonProps = {
  iconOnly?: boolean;
  className?: string;
  linked?: boolean;
  unreadCount?: number;
};

export function MailboxStatusButton({
  iconOnly = false,
  className = "",
  linked = true,
  unreadCount = 0,
}: MailboxStatusButtonProps) {
  const count = Math.max(0, unreadCount);
  const hasNotifications = count > 0;

  const classes = `mailbox-status-button${hasNotifications ? " mailbox-status-button-alert" : ""}${
    iconOnly ? " mailbox-status-button-icon-only" : ""
  }${className ? ` ${className}` : ""}`;
  const accessibleLabel = hasNotifications
    ? `Glovebox documents, ${count} unread alert${count === 1 ? "" : "s"}`
    : "Glovebox documents";
  const tooltip = hasNotifications
    ? `Open Glovebox — ${count} unread alert${count === 1 ? "" : "s"}`
    : "Open Glovebox documents";

  if (!linked) {
    return (
      <span className={classes} aria-label={accessibleLabel} title={iconOnly ? tooltip : undefined}>
        <GloveboxDocumentsIcon hasNotifications={hasNotifications} />
        {!iconOnly ? <span className="mailbox-status-text">{hasNotifications ? `${count} unread` : "Glovebox"}</span> : null}
        {iconOnly ? <span className="screen-reader-only">{accessibleLabel}</span> : null}
      </span>
    );
  }

  return (
    <Link href="/glovebox" className={classes} aria-label={accessibleLabel} title={iconOnly ? tooltip : undefined}>
      <GloveboxDocumentsIcon hasNotifications={hasNotifications} />
      {!iconOnly ? <span className="mailbox-status-text">{hasNotifications ? `${count} unread` : "Glovebox"}</span> : null}
      {iconOnly ? <span className="screen-reader-only">{accessibleLabel}</span> : null}
    </Link>
  );
}

export function AppInfoNav() {
  const pathname = usePathname();
  const infoItems: Array<{ href: Route; label: string }> = [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav aria-label="Company" className="aux-nav">
      {infoItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={`aux-nav-link${isActive ? " aux-nav-link-active" : ""}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
