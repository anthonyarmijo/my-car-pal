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
