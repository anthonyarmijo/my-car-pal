import Link from "next/link";
import type { Route } from "next";

type FooterLink = { label: string; href: Route | `${string}#${string}` | `https://${string}` };

const columns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Product",
    links: [
      { label: "Product", href: "/#product" },
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#product" },
      { label: "DIY learning center", href: "/diy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "GitHub / Self-host ↗", href: "https://github.com/anthonyarmijo/my-car-pal/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="lp-footer" aria-label="Site footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <strong>My Car Pal</strong>
          <p>Take care of your car. We&rsquo;ll handle the rest.</p>
        </div>
        <nav className="lp-footer-columns" aria-label="Footer">
          {columns.map((col) => (
            <div key={col.title} className="lp-footer-col">
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) =>
                  link.href.startsWith("http") ? (
                    <li key={link.label}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link href={link.href as Route}>{link.label}</Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <p className="lp-footer-fineprint">
        © {new Date().getFullYear()} My Car Pal · Privacy-forward, ad-free, and yours to keep.
      </p>
    </footer>
  );
}
