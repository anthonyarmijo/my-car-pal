"use client";

import { useEffect, useState, type FormEvent } from "react";

type WeatherState =
  | { status: "idle" | "loading" | "unavailable" }
  | { status: "ready"; temperature: number; label: string; cityLabel: string; source: "approximate" | "zip"; zipCode?: string };

type LocationPoint = {
  latitude: number;
  longitude: number;
  cityLabel: string;
  source: "approximate" | "zip";
  zipCode?: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

type ApproximateLocationResponse = {
  city?: string;
  region?: string;
  region_code?: string;
  country_name?: string;
  latitude?: number | string;
  longitude?: number | string;
  loc?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    country_code?: string;
    admin1?: string;
    admin1_code?: string;
    postcodes?: string[];
  }>;
};

const WEATHER_ZIP_STORAGE_KEY = "my-car-pal-weather-zip";

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatCityLabel(city: string | undefined, region: string | undefined, fallback = "Approximate area"): string {
  const safeCity = city?.trim();
  const safeRegion = region?.trim();

  if (safeCity && safeRegion) {
    return `${safeCity}, ${safeRegion}`;
  }
  return safeCity || safeRegion || fallback;
}

function normalizeZip(raw: string): string {
  return raw.trim().slice(0, 5);
}

function isValidZip(raw: string): boolean {
  return /^\d{5}(?:-\d{4})?$/.test(raw.trim());
}

async function getApproximateLocation(): Promise<LocationPoint> {
  const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Approximate location unavailable.");
  }

  const payload = (await response.json()) as ApproximateLocationResponse;
  const locParts = typeof payload.loc === "string" ? payload.loc.split(",") : [];
  const latitude = Number(payload.latitude ?? locParts[0]);
  const longitude = Number(payload.longitude ?? locParts[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Approximate location response was incomplete.");
  }

  return {
    latitude: roundCoordinate(latitude),
    longitude: roundCoordinate(longitude),
    cityLabel: formatCityLabel(payload.city, payload.region_code || payload.region, payload.country_name),
    source: "approximate",
  };
}

async function getZipLocation(rawZip: string): Promise<LocationPoint> {
  const zipCode = normalizeZip(rawZip);
  const params = new URLSearchParams({
    name: zipCode,
    count: "10",
    language: "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("ZIP lookup unavailable.");
  }

  const payload = (await response.json()) as OpenMeteoGeocodingResponse;
  const candidates = payload.results ?? [];
  const location =
    candidates.find((candidate) => candidate.country_code === "US" && candidate.postcodes?.includes(zipCode)) ??
    candidates.find((candidate) => candidate.country_code === "US");

  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new Error("ZIP code was not found.");
  }

  return {
    latitude: roundCoordinate(Number(location.latitude)),
    longitude: roundCoordinate(Number(location.longitude)),
    cityLabel: formatCityLabel(location.name, location.admin1_code || location.admin1, zipCode),
    source: "zip",
    zipCode,
  };
}

function weatherLabel(code: number | undefined): string {
  if (code === undefined) {
    return "Weather";
  }
  if (code === 0) {
    return "Clear";
  }
  if ([1, 2, 3].includes(code)) {
    return "Clouds";
  }
  if ([45, 48].includes(code)) {
    return "Fog";
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "Rain";
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "Snow";
  }
  if (code >= 95) {
    return "Storm";
  }
  return "Weather";
}

async function getWeather(location: LocationPoint): Promise<WeatherState> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,weather_code",
    temperature_unit: "fahrenheit",
    forecast_days: "1",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Weather unavailable.");
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  const temperature = payload.current?.temperature_2m;
  if (temperature === undefined || !Number.isFinite(temperature)) {
    throw new Error("Weather response was incomplete.");
  }

  return {
    status: "ready",
    temperature: Math.round(temperature),
    label: weatherLabel(payload.current?.weather_code),
    cityLabel: location.cityLabel,
    source: location.source,
    zipCode: location.zipCode,
  };
}

export function HomeWeatherBadge() {
  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });
  const [isEditing, setIsEditing] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather(zipOverride?: string | null) {
      setWeather({ status: "loading" });
      setZipError(null);
      try {
        const savedZip = zipOverride ?? window.localStorage.getItem(WEATHER_ZIP_STORAGE_KEY);
        let location: LocationPoint;

        if (savedZip && isValidZip(savedZip)) {
          try {
            location = await getZipLocation(savedZip);
          } catch {
            window.localStorage.removeItem(WEATHER_ZIP_STORAGE_KEY);
            location = await getApproximateLocation();
            if (!cancelled) {
              setZipError("Saved ZIP could not be found.");
            }
          }
        } else {
          location = await getApproximateLocation();
        }

        const nextWeather = await getWeather(location);
        if (!cancelled) {
          setWeather(nextWeather);
          setZipInput(location.zipCode ?? "");
        }
      } catch (error) {
        if (!cancelled) {
          setWeather({ status: "unavailable" });
          setZipError(error instanceof Error ? error.message : "Weather unavailable.");
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleZipSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextZip = zipInput.trim();

    if (!isValidZip(nextZip)) {
      setZipError("Enter a 5-digit ZIP code.");
      return;
    }

    setIsEditing(false);
    setWeather({ status: "loading" });
    setZipError(null);
    try {
      const location = await getZipLocation(nextZip);
      setWeather(await getWeather(location));
      setZipInput(location.zipCode ?? normalizeZip(nextZip));
      window.localStorage.setItem(WEATHER_ZIP_STORAGE_KEY, location.zipCode ?? normalizeZip(nextZip));
    } catch (error) {
      try {
        const location = await getApproximateLocation();
        setWeather(await getWeather(location));
      } catch {
        setWeather({ status: "unavailable" });
      }
      setZipError(error instanceof Error ? error.message : "Weather unavailable.");
    }
  }

  async function handleUseApproximateLocation() {
    window.localStorage.removeItem(WEATHER_ZIP_STORAGE_KEY);
    setIsEditing(false);
    setWeather({ status: "loading" });
    setZipError(null);
    try {
      const location = await getApproximateLocation();
      setWeather(await getWeather(location));
      setZipInput("");
    } catch (error) {
      setWeather({ status: "unavailable" });
      setZipError(error instanceof Error ? error.message : "Weather unavailable.");
    }
  }

  const canUseApproximateLocation = weather.status === "ready" && weather.source === "zip";
  const zipForm = isEditing ? (
    <form className="home-weather-zip-form" onSubmit={handleZipSubmit}>
      <label className="home-weather-zip-label">
        <span>ZIP</span>
        <input
          value={zipInput}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          placeholder="90210"
          onChange={(event) => setZipInput(event.target.value)}
        />
      </label>
      <button type="submit">Save</button>
      {canUseApproximateLocation ? (
        <button type="button" onClick={handleUseApproximateLocation}>
          Auto
        </button>
      ) : null}
    </form>
  ) : null;

  if (weather.status !== "ready") {
    return (
      <div className="home-weather-stack">
        {weather.status === "unavailable" ? (
          <button
            type="button"
            className="home-weather-empty-button"
            aria-expanded={isEditing}
            onClick={() => {
              setIsEditing((current) => !current);
              setZipError(null);
            }}
          >
            Set ZIP
          </button>
        ) : null}
        {zipForm}
        {zipError ? <p className="home-weather-error">{zipError}</p> : null}
      </div>
    );
  }

  return (
    <div className="home-weather-stack">
      <span className="home-weather-row">
        <span className="home-weather-badge" title={weather.source === "zip" ? "Weather for saved ZIP code" : "Approximate local weather"}>
          <span className="home-weather-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.3" />
              <path d="M12 2.8v2.1M12 19.1v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
            </svg>
          </span>
          <span className="home-weather-temp">{weather.temperature}°</span>
          <span className="home-weather-label">{weather.label}</span>
        </span>
        <button
          type="button"
          className="home-weather-edit-button"
          aria-expanded={isEditing}
          aria-label="Set weather ZIP code"
          title="Set weather ZIP code"
          onClick={() => {
            setIsEditing((current) => !current);
            setZipError(null);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
            <path d="m14 7 3 3" />
          </svg>
        </button>
      </span>
      <span className="home-weather-city">{weather.cityLabel}</span>
      {zipForm}
      {zipError ? <p className="home-weather-error">{zipError}</p> : null}
    </div>
  );
}
