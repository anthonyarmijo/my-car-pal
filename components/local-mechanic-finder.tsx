"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MechanicResult = {
  id: string;
  name: string;
  address: string;
  distanceMiles: number;
  mapUrl: string;
};

type LookupState =
  | { status: "idle"; error: string | null; results: MechanicResult[] }
  | { status: "loading"; error: string | null; results: MechanicResult[] };

function formatDistance(miles: number): string {
  if (miles < 0.15) {
    return "< 0.2 mi";
  }
  return `${miles.toFixed(1)} mi`;
}

export function LocalMechanicFinder() {
  const ADDRESS_TOGGLE_MIN_LENGTH = 72;
  const [zipCode, setZipCode] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ status: "idle", error: null, results: [] });
  const [visibleCount, setVisibleCount] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [expandedAddressIds, setExpandedAddressIds] = useState<Record<string, boolean>>({});
  const [slowMessageIndex, setSlowMessageIndex] = useState(-1);
  const slowMessageIntervalRef = useRef<number | null>(null);

  const slowMessages = [
    "Hold your horses, almost there...",
    "Still cruising the map, finding good options...",
    "Tightening a few bolts on the search...",
    "One more lap around the block...",
  ];

  const statusLabel = useMemo(() => {
    if (lookup.status === "loading") {
      return "Finding nearby mechanics...";
    }
    return "";
  }, [lookup.status]);

  useEffect(() => {
    if (lookup.status !== "loading") {
      setSlowMessageIndex(-1);
      return;
    }

    let index = 0;
    const firstTimer = window.setTimeout(() => {
      setSlowMessageIndex(0);
      slowMessageIntervalRef.current = window.setInterval(() => {
        index = (index + 1) % slowMessages.length;
        setSlowMessageIndex(index);
      }, 5000);
    }, 5000);

    return () => {
      window.clearTimeout(firstTimer);
      if (slowMessageIntervalRef.current !== null) {
        window.clearInterval(slowMessageIntervalRef.current);
        slowMessageIntervalRef.current = null;
      }
    };
  }, [lookup.status, slowMessages.length]);

  async function findMechanicsByLocation() {
    if (!navigator.geolocation) {
      setLookup({ status: "idle", error: "Geolocation is not supported in this browser.", results: [] });
      return;
    }

    setLookup((previous) => ({ ...previous, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(`/api/mechanics/search?lat=${lat}&lon=${lon}`, { cache: "no-store" });
          if (!response.ok) {
            throw new Error("Unable to load nearby mechanics.");
          }

          const payload = (await response.json()) as { mechanics?: MechanicResult[] };
          const mechanics = Array.isArray(payload.mechanics) ? payload.mechanics : [];
          setLookup({ status: "idle", error: null, results: mechanics });
          setVisibleCount(10);
          setHasSearched(true);
          setResultsExpanded(true);
          setExpandedAddressIds({});
        } catch {
          setLookup({ status: "idle", error: "Could not fetch local mechanic results right now.", results: [] });
          setHasSearched(true);
          setExpandedAddressIds({});
        }
      },
      () => {
        setLookup({
          status: "idle",
          error: "Location access was blocked. Enable location sharing and try again.",
          results: [],
        });
        setHasSearched(true);
        setExpandedAddressIds({});
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 12000,
      },
    );
  }

  async function findMechanicsByZip() {
    const zip = zipCode.trim();
    if (!/^\d{5}(?:-\d{4})?$/.test(zip)) {
      setLookup({ status: "idle", error: "Enter a valid US ZIP code.", results: [] });
      return;
    }

    setLookup((previous) => ({ ...previous, status: "loading", error: null }));
    try {
      const response = await fetch(`/api/mechanics/search?zip=${encodeURIComponent(zip)}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load nearby mechanics.");
      }

      const payload = (await response.json()) as { mechanics?: MechanicResult[] };
      const mechanics = Array.isArray(payload.mechanics) ? payload.mechanics : [];
      setLookup({ status: "idle", error: null, results: mechanics });
      setVisibleCount(10);
      setHasSearched(true);
      setResultsExpanded(true);
      setExpandedAddressIds({});
    } catch {
      setLookup({ status: "idle", error: "Could not fetch local mechanic results right now.", results: [] });
      setHasSearched(true);
      setExpandedAddressIds({});
    }
  }

  const visibleResults = lookup.results.slice(0, Math.min(visibleCount, 50));
  const canShowMore = hasSearched && visibleCount < 50 && lookup.results.length > visibleResults.length;

  return (
    <div className="form-stack">
      <p className="mechanic-helper-text">
        Lookup powered by OpenStreetMap data. Local mechanics/shops are not sponsored and non-affiliated.
      </p>
      <p className="mechanic-helper-text" style={{ marginTop: "0.1rem" }}>
        Your location is used only for this search request and is not sold.
      </p>

      <div className="mechanic-search-controls">
        <button
          className="button-primary button-small mechanic-location-button"
          type="button"
          onClick={findMechanicsByLocation}
          disabled={lookup.status === "loading"}
          aria-label={lookup.status === "loading" ? "Finding nearby mechanics" : "Use my location"}
          aria-busy={lookup.status === "loading"}
          title={lookup.status === "loading" ? "Finding nearby mechanics" : "Use my location"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="2.25" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>

        <label className="field field-compact" style={{ margin: 0 }}>
          <span>ZIP code</span>
          <div className="mechanic-zip-row">
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 85004"
              value={zipCode}
              onChange={(event) => setZipCode(event.target.value)}
            />
            <button
              className="button-chip button-chip-strong"
              type="button"
              onClick={findMechanicsByZip}
              disabled={lookup.status === "loading"}
            >
              Search ZIP
            </button>
          </div>
        </label>
      </div>

      {statusLabel ? <p className="section-subtitle">{statusLabel}</p> : null}
      {lookup.status === "loading" && slowMessageIndex >= 0 ? <p className="mechanic-slow-message">{slowMessages[slowMessageIndex]}</p> : null}
      {lookup.error ? <p className="form-message form-message-error">{lookup.error}</p> : null}

      {hasSearched && lookup.results.length > 0 ? (
        <button className="button-chip button-chip-strong" type="button" onClick={() => setResultsExpanded((value) => !value)}>
          {resultsExpanded ? "Hide results" : "Show results"}
        </button>
      ) : null}

      {hasSearched && lookup.results.length === 0 && !lookup.error && lookup.status !== "loading" ? (
        <p className="section-subtitle">No local mechanics found for that search.</p>
      ) : null}

      {resultsExpanded && visibleResults.length > 0 ? (
        <ul className="list-reset kv">
          {visibleResults.map((item) => {
            const hasLongAddress = item.address.length > ADDRESS_TOGGLE_MIN_LENGTH;
            const addressExpanded = Boolean(expandedAddressIds[item.id]);

            return (
              <li key={item.id} className="kv-row mechanic-row">
                <div className="mechanic-row-top">
                  <strong className="mechanic-row-name">{item.name}</strong>
                  <span className="mechanic-row-right">
                    <small style={{ color: "var(--muted)" }}>{formatDistance(item.distanceMiles)}</small>
                    <a href={item.mapUrl} target="_blank" rel="noreferrer" className="button-chip">
                      Open in Google Maps
                    </a>
                  </span>
                </div>
                <div className="mechanic-address-row">
                  <small className={`mechanic-address ${hasLongAddress && !addressExpanded ? "mechanic-address-collapsed" : ""}`}>
                    {item.address}
                  </small>
                  {hasLongAddress ? (
                    <button
                      className="mechanic-address-toggle"
                      type="button"
                      aria-expanded={addressExpanded}
                      onClick={() =>
                        setExpandedAddressIds((previous) => ({
                          ...previous,
                          [item.id]: !previous[item.id],
                        }))
                      }
                    >
                      {addressExpanded ? "Hide" : "Show"} address
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {resultsExpanded && canShowMore ? (
        <button
          className="button-chip button-chip-strong"
          type="button"
          onClick={() => setVisibleCount((value) => Math.min(value + 7, 50))}
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
