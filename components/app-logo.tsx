"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type CarLogoMarkProps = {
  className?: string;
};

export function CarLogoMark({ className = "app-logo" }: CarLogoMarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-hidden="true">
      <ellipse cx="32" cy="52.4" rx="21.4" ry="3.2" fill="#e7dfd0" />
      <path
        d="M11.2 35.3c0-7.7 5.8-12.2 17.3-13.7l7.7-1c6.2 0 11.5 3.1 15.9 9.2l3.1 4.4c2.7 1.3 4.5 3.7 5.2 7.1l-2.6 9.3H13.5l-2.3-15.3Z"
        fill="#D4C5B2"
        stroke="#2D2218"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        d="M20.7 26.6c4-4.4 8.7-6.6 14-6.6h3.2c4.1 1.2 7.8 4.3 10.9 9.3l2.2 3.6H16.8l3.9-6.3Z"
        fill="#fff7df"
        stroke="#2D2218"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M27.6 20.3c-1.1 4.2-1.7 8.4-2 12.6M38.7 20.8l3.1 12.1" stroke="#2D2218" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6.2 28.4H1.8M8.9 35.9H3.2M11.4 43.4H6.7" stroke="#f4bc4f" strokeWidth="3.3" strokeLinecap="round" />
      <path d="M8.7 22.6c-3.3-1.6-4.8-3.8-4.5-6.6" stroke="#f47d6b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="21.5" cy="47.5" r="5.6" fill="#2D2218" />
      <circle cx="21.5" cy="47.5" r="2.2" fill="#fff7df" />
      <circle cx="48.7" cy="47.5" r="5.6" fill="#2D2218" />
      <circle cx="48.7" cy="47.5" r="2.2" fill="#fff7df" />
      <circle cx="28.4" cy="37.3" r="1.8" fill="#2D2218" />
      <circle cx="41.2" cy="37.3" r="1.8" fill="#2D2218" />
      <path d="M31.7 42c2.5 2 6.3 2 8.8 0" stroke="#2D2218" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function AppLogo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMarketingOrAuthPage = ["/", "/about", "/privacy", "/terms", "/login", "/register", "/auth-error"].includes(pathname);

  // Render SVG only after mount — prevents Noir/Dark Reader browser extensions
  // from injecting attributes into server HTML and causing hydration mismatches.
  const logoSvg = mounted ? (
    <CarLogoMark />
  ) : (
    <span className="app-logo app-logo-placeholder" aria-hidden="true" />
  );

  const logoContent = (
    <>
      {logoSvg}
      <div>
        <p className="brand-name">My Car Pal</p>
        <p className="brand-slogan">Vehicle care, in your control.</p>
      </div>
    </>
  );

  return (
    onMarketingOrAuthPage ? (
      <Link href="/" className="brand-lockup" aria-label="Go to landing page">
        {logoContent}
      </Link>
    ) : (
      <Link href="/home" className="brand-lockup" aria-label="Go to home">
        {logoContent}
      </Link>
    )
  );
}
