import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "@my-car-pal/ui/styles.css";
import "./globals.css";
import "./porcelain.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "My Car Pal",
  description: "Modern vehicle maintenance tracker",
  icons: {
    icon: "/favicon.svg",
  },
};

const themeBootstrapScript = `
try {
  var storedTheme = window.localStorage.getItem("my-car-pal-theme");
  var theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
  var resolvedTheme = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.resolvedTheme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
} catch {
  document.documentElement.dataset.theme = "system";
  document.documentElement.dataset.resolvedTheme = "light";
}
`;

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="system"
      data-resolved-theme="light"
      data-design-system="porcelain-graphite"
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">{themeBootstrapScript}</Script>
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
