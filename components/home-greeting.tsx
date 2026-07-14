import { HomeWeatherBadge } from "@/components/home-weather-badge";

type HomeGreetingProps = {
  displayName: string | null;
  statusLabel?: string;
};

const GREETINGS = [
  "Steady as you go",
  "All set",
  "Easy does it",
  "Everything looks calm",
  "Smooth start",
  "In good shape",
  "Ready when you are",
  "Nice and steady",
];

function firstNameFromDisplayName(displayName: string | null): string {
  const safeName = displayName?.trim() ?? "";
  if (!safeName) {
    return "";
  }

  const firstToken = safeName.split(/\s+/)[0] ?? "";
  const emailName = firstToken.includes("@") ? firstToken.split("@")[0] : firstToken;
  const firstName = emailName.split(/[._-]+/)[0] ?? emailName;

  return firstName ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}` : "";
}

function randomGreeting(firstName: string): string {
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)] ?? GREETINGS[0];
  return firstName ? `${greeting}, ${firstName}.` : `${greeting}.`;
}

export function HomeGreeting({ displayName, statusLabel }: HomeGreetingProps) {
  const message = randomGreeting(firstNameFromDisplayName(displayName));

  return (
    <section className="home-welcome-card">
      <div className="home-welcome-copy">
        <div className="home-welcome-heading-row">
          <HomeWeatherBadge />
          <h1 className="home-welcome-title">{message}</h1>
        </div>
        <p className="section-subtitle">Here&apos;s what&apos;s happening with your vehicles.</p>
      </div>
      {statusLabel ? <span className="home-welcome-status">{statusLabel}</span> : null}
    </section>
  );
}
