"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const storageKey = "my-car-pal-theme";
const themeOptions: Array<{ value: ThemePreference; label: string; shortLabel: string }> = [
  { value: "system", label: "Use system theme", shortLabel: "Auto" },
  { value: "light", label: "Use light theme", shortLabel: "Light" },
  { value: "dark", label: "Use dark theme", shortLabel: "Dark" },
];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function applyTheme(theme: ThemePreference) {
  const resolvedTheme =
    theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.resolvedTheme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

/**
 * Single sun/moon icon toggle. Defaults to the system theme; the icon shows
 * the theme you would switch TO (moon while light, sun while dark), and
 * clicking moves from system-following to an explicit manual theme.
 */
export function ThemeIconToggle({ className = "theme-icon-toggle" }: { className?: string }) {
  const [resolved, setResolved] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const initialTheme = isThemePreference(storedTheme) ? storedTheme : "system";
    applyTheme(initialTheme);
    setResolved(document.documentElement.dataset.resolvedTheme === "dark" ? "dark" : "light");

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (document.documentElement.dataset.theme === "system") {
        applyTheme("system");
        setResolved(document.documentElement.dataset.resolvedTheme === "dark" ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  function toggle() {
    const next = resolved === "dark" ? "light" : "dark";
    window.localStorage.setItem(storageKey, next);
    applyTheme(next);
    setResolved(next);
  }

  // Render a stable placeholder until mounted to avoid hydration mismatch.
  const showMoon = resolved !== "dark";

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={showMoon ? "Switch to dark theme" : "Switch to light theme"}
      title={showMoon ? "Switch to dark theme" : "Switch to light theme"}
    >
      {resolved === null ? (
        <span className="theme-icon-toggle-placeholder" aria-hidden="true" />
      ) : showMoon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.2 8.2 0 1 0 20 14.2Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.4" />
          <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
        </svg>
      )}
    </button>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const initialTheme = isThemePreference(storedTheme) ? storedTheme : "system";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (document.documentElement.dataset.theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  function selectTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`theme-toggle-option${theme === option.value ? " theme-toggle-option-active" : ""}`}
          aria-pressed={theme === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => selectTheme(option.value)}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}
