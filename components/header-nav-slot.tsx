"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeIconToggle } from "@/components/theme-toggle";

export function HeaderNavSlot() {
  const pathname = usePathname();
  const [marketingMenuOpen, setMarketingMenuOpen] = useState(false);
  const marketingMenuRef = useRef<HTMLDivElement>(null);
  const isPublicMarketingPage = pathname === "/" || pathname === "/about" || pathname === "/privacy" || pathname === "/terms";

  useEffect(() => {
    setMarketingMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!marketingMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMarketingMenuOpen(false);
        marketingMenuRef.current?.querySelector<HTMLButtonElement>(".landing-menu-toggle")?.focus();
      }
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!marketingMenuRef.current?.contains(event.target as Node)) {
        setMarketingMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [marketingMenuOpen]);

  if (isPublicMarketingPage) {
    return (
      <div className="landing-public-nav-wrap" ref={marketingMenuRef}>
        <nav className="landing-public-nav" aria-label="Marketing">
          <Link href="/#product">Product</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#privacy">Privacy</Link>
          <a href="https://github.com/anthonyarmijo/my-car-pal/" target="_blank" rel="noopener noreferrer">
            Open source <span aria-hidden="true">↗</span>
          </a>
          <Link href="/diy">Resources</Link>
        </nav>
        <div className="landing-login-sign landing-login-sign-actions">
          <ThemeIconToggle />
          <Link href="/login" className="landing-login-text-link">
            Log In
          </Link>
          <Link href="/register" className="landing-try-now-link">
            Start Free
          </Link>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-expanded={marketingMenuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={marketingMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMarketingMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        <nav
          id="landing-mobile-menu"
          className={`landing-mobile-menu${marketingMenuOpen ? " is-open" : ""}`}
          aria-label="Mobile marketing"
          aria-hidden={!marketingMenuOpen}
          inert={!marketingMenuOpen}
        >
          <Link href="/#product" tabIndex={marketingMenuOpen ? 0 : -1}>Product</Link>
          <Link href="/#features" tabIndex={marketingMenuOpen ? 0 : -1}>Features</Link>
          <Link href="/#privacy" tabIndex={marketingMenuOpen ? 0 : -1}>Privacy</Link>
          <a
            href="https://github.com/anthonyarmijo/my-car-pal/"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={marketingMenuOpen ? 0 : -1}
          >
            Open source <span aria-hidden="true">↗</span>
          </a>
          <Link href="/diy" tabIndex={marketingMenuOpen ? 0 : -1}>Resources</Link>
          <div className="landing-mobile-menu-actions">
            <Link href="/login" tabIndex={marketingMenuOpen ? 0 : -1}>Log in</Link>
            <Link href="/register" className="landing-mobile-start" tabIndex={marketingMenuOpen ? 0 : -1}>Start free</Link>
          </div>
        </nav>
      </div>
    );
  }

  if (pathname === "/login" || pathname === "/register" || pathname === "/auth-error") {
    return (
      <div className="landing-login-sign">
        <ThemeIconToggle />
        <p className="landing-login-label">Back to landing</p>
        <Link href="/" className="button-chip button-chip-strong">
          Home
        </Link>
      </div>
    );
  }

  return null;
}
