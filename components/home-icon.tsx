import type { ReactNode } from "react";

export type HomeIconName =
  | "star"
  | "calendar"
  | "clock"
  | "dollar"
  | "document"
  | "warning"
  | "gauge"
  | "wrench"
  | "garage"
  | "chevron"
  | "lightbulb";

export function HomeIcon({ name }: { name: HomeIconName }) {
  const paths: Record<HomeIconName, ReactNode> = {
    star: <path d="m12 3.8 2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7L12 3.8Z" />,
    calendar: <><rect x="4.4" y="5.8" width="15.2" height="14" rx="2.2" /><path d="M8 3.8v4M16 3.8v4M4.8 10h14.4" /></>,
    clock: <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.8v4.7l3.2 2" /></>,
    dollar: <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.2v9.6M14.4 9.2c-.6-.6-1.5-1-2.6-1-1.3 0-2.3.7-2.3 1.8 0 2.6 5 1.3 5 4 0 1.1-1 1.9-2.6 1.9-1.2 0-2.1-.4-2.8-1.1" /></>,
    document: <><path d="M7 4.5h6.2l3.8 3.8v11.2H7z" /><path d="M13 4.8V9h4M9.6 12h4.8M9.6 15.4h4.8" /></>,
    warning: <><path d="M12 4.3 21 19H3z" /><path d="M12 9v4.2M12 16.4h.01" /></>,
    gauge: <><path d="M4.8 16.9a8.2 8.2 0 1 1 14.4 0" /><path d="m12 14.6 3.4-4.2" /><path d="M8 17h8" /></>,
    wrench: <path d="M15.7 4.6a3.7 3.7 0 0 0-4.3 4.8l-6.5 6.5 3.2 3.2 6.5-6.5a3.7 3.7 0 0 0 4.8-4.3l-2.5 2.5-2.4-2.4 2.5-2.5Z" />,
    garage: <><path d="M4 19V8.7L12 4l8 4.7V19" /><path d="M7.3 19v-6.2h9.4V19M9.4 15.2h5.2" /></>,
    chevron: <path d="m9.5 5.5 6 6.5-6 6.5" />,
    lightbulb: <><path d="M8.3 14.2a5.3 5.3 0 1 1 7.4 0c-.8.7-1.2 1.5-1.3 2.5H9.6c-.1-1-.5-1.8-1.3-2.5Z" /><path d="M9.7 19h4.6" /></>,
  };

  return (
    <span className={`home-icon home-icon-${name}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  );
}
