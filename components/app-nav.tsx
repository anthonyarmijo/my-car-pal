"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/home", label: "Home" },
  { href: "/garage", label: "Garage" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/diy", label: "DIY" },
  { href: "/glovebox", label: "Glovebox" },
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

function MailboxIcon({ hasNotifications }: { hasNotifications: boolean }) {
  return (
    <span className="mailbox-icon-wrap" aria-hidden="true">
      <svg suppressHydrationWarning viewBox="0 0 24 24" className="mailbox-icon">
        <path d="M4.5 19.5V8.2a4.2 4.2 0 0 1 4.2-4.2h3.7a4.2 4.2 0 0 1 4.2 4.2v7.2H4.5" />
        <path d="M16.6 8.3h2.9v11.2" />
        <path d="M7.1 8.8h6.2" />
        <path d={hasNotifications ? "M18.9 4.2v4.2l2.7-1-2.7-1" : "M18.9 4.2v4.2"} />
      </svg>
      {hasNotifications ? <span className="mailbox-notification-dot" /> : null}
    </span>
  );
}

function NavIcon({ label }: { label: string }) {
  if (label === "Home") {
    return <HomeIcon />;
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

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="app-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isHome = item.label === "Home";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive ? " nav-link-active" : ""}${isHome ? " nav-link-home" : ""}`}
          >
            <NavIcon label={item.label} />
            <span>{item.label}</span>
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
};

export function MailboxStatusButton({ iconOnly = false, className = "", linked = true }: MailboxStatusButtonProps) {
  const pathname = usePathname();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { hasNotifications?: boolean };
        if (!cancelled) {
          setHasNotifications(Boolean(payload.hasNotifications));
          setCount(Number((payload as { count?: number }).count ?? 0));
        }
      } catch {
        // Keep default false on network issues.
      }
    }

    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 4000);
    window.addEventListener("focus", loadNotifications);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [pathname]);

  const classes = `mailbox-status-button${hasNotifications ? " mailbox-status-button-alert" : ""}${
    iconOnly ? " mailbox-status-button-icon-only" : ""
  }${className ? ` ${className}` : ""}`;

  if (!linked) {
    return (
      <span className={classes} aria-label={hasNotifications ? `Mailbox, ${count} unread alerts` : "Mailbox"}>
        <MailboxIcon hasNotifications={hasNotifications} />
        {!iconOnly ? <span className="mailbox-status-text">{hasNotifications ? `${count} unread` : "Mailbox"}</span> : null}
        {iconOnly ? <span className="screen-reader-only">{hasNotifications ? `${count} unread alerts` : "Mailbox"}</span> : null}
      </span>
    );
  }

  return (
    <Link href="/glovebox" className={classes} aria-label={hasNotifications ? `Mailbox, ${count} unread alerts` : "Mailbox"}>
      <MailboxIcon hasNotifications={hasNotifications} />
      {!iconOnly ? <span className="mailbox-status-text">{hasNotifications ? `${count} unread` : "Mailbox"}</span> : null}
      {iconOnly ? <span className="screen-reader-only">{hasNotifications ? `${count} unread alerts` : "Mailbox"}</span> : null}
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
