import { NextRequest, NextResponse } from "next/server";
import { AuthRateLimitAction } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth-session";
import { consumeAuthRateLimit, createAuthRateLimitContext } from "@/lib/auth-rate-limit";

const MECHANIC_SEARCH_RATE_LIMIT_MAX_ATTEMPTS = 20;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type MechanicResult = {
  id: string;
  name: string;
  address: string;
  distanceMiles: number;
  mapUrl: string;
};

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
  name?: string;
};

function parseNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function clampRadius(value: number): number {
  return Math.min(Math.max(Math.round(value), 2500), 30000);
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function addressFromTags(tags: Record<string, string>): string | null {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const locality = [tags["addr:city"] ?? tags.town ?? tags.village, tags["addr:state"]].filter(Boolean).join(", ");
  const postcode = tags["addr:postcode"] ?? "";
  const pieces = [street, locality, postcode].filter(Boolean);
  const address = pieces.join(" ").trim();
  return address.length > 0 ? address : null;
}

function toGoogleMapsUrl(name: string, address: string, lat: number, lon: number): string {
  const queryWithAddress = `${name} ${address}`.trim();
  if (queryWithAddress.length > 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryWithAddress)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

async function reverseLookupAddress(lat: number, lon: number): Promise<string | null> {
  const query = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lon),
    zoom: "18",
    addressdetails: "1",
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "my-car-pal/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as { display_name?: string };
    return payload.display_name?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function mechanicsFromOverpass(elements: OverpassElement[], lat: number, lon: number): Promise<MechanicResult[]> {
  const dedupe = new Set<string>();
  const candidates = elements
    .map((element) => {
      const pointLat = element.lat ?? element.center?.lat;
      const pointLon = element.lon ?? element.center?.lon;
      if (pointLat === undefined || pointLon === undefined) {
        return null;
      }

      const tags = element.tags ?? {};
      const rawName = tags.name?.trim();
      const name = rawName && rawName.length > 0 ? rawName : "Local mechanic";

      const dedupeKey = `${name.toLowerCase()}-${pointLat.toFixed(5)}-${pointLon.toFixed(5)}`;
      if (dedupe.has(dedupeKey)) {
        return null;
      }
      dedupe.add(dedupeKey);

      return {
        id: `${element.type}-${element.id}`,
        name,
        lat: pointLat,
        lon: pointLon,
        address: addressFromTags(tags),
        distanceMiles: haversineMiles(lat, lon, pointLat, pointLon),
      };
    })
    .filter(
      (value): value is { id: string; name: string; lat: number; lon: number; address: string | null; distanceMiles: number } =>
        Boolean(value),
    )
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  const output: MechanicResult[] = [];
  for (const candidate of candidates) {
    if (output.length >= 50) {
      break;
    }

    let address = candidate.address;
    if (!address) {
      address = await reverseLookupAddress(candidate.lat, candidate.lon);
    }
    if (!address) {
      continue;
    }

    output.push({
      id: candidate.id,
      name: candidate.name,
      address,
      distanceMiles: candidate.distanceMiles,
      mapUrl: toGoogleMapsUrl(candidate.name, address, candidate.lat, candidate.lon),
    });
  }

  return output;
}

async function geocodeZip(zip: string): Promise<{ lat: number; lon: number } | null> {
  const attempts = [
    new URLSearchParams({
      format: "jsonv2",
      countrycodes: "us",
      postalcode: zip,
      limit: "1",
    }),
    new URLSearchParams({
      q: `${zip}, USA`,
      format: "jsonv2",
      countrycodes: "us",
      limit: "1",
    }),
  ];

  for (const query of attempts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${query.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "my-car-pal/1.0",
        },
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        continue;
      }
      const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
      const first = payload[0];
      if (!first?.lat || !first?.lon) {
        continue;
      }
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        continue;
      }
      return { lat, lon };
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

async function fetchOverpassMechanics(lat: number, lon: number, radiusMeters: number): Promise<MechanicResult[]> {
  const query = `
[out:json][timeout:20];
(
  node["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
  way["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
  relation["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
  node["craft"="mechanic"](around:${radiusMeters},${lat},${lon});
  way["craft"="mechanic"](around:${radiusMeters},${lat},${lon});
  relation["craft"="mechanic"](around:${radiusMeters},${lat},${lon});
  node["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
  way["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
  relation["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
  node["shop"="tyres"](around:${radiusMeters},${lat},${lon});
  way["shop"="tyres"](around:${radiusMeters},${lat},${lon});
  relation["shop"="tyres"](around:${radiusMeters},${lat},${lon});
);
out center tags 60;
`;

  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "application/json",
        },
        body: query.trim(),
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as { elements?: OverpassElement[] };
      const elements = Array.isArray(payload.elements) ? payload.elements : [];
      const mechanics = await mechanicsFromOverpass(elements, lat, lon);
      if (mechanics.length > 0) {
        return mechanics;
      }
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  return [];
}

async function fetchNominatimMechanicsFallback(lat: number, lon: number): Promise<MechanicResult[]> {
  const delta = 0.25;
  const query = new URLSearchParams({
    q: "auto repair",
    format: "jsonv2",
    limit: "50",
    addressdetails: "1",
    bounded: "1",
    viewbox: `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${query.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "my-car-pal/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as NominatimSearchResult[];
    return payload
      .map((item, index) => {
        const itemLat = Number(item.lat);
        const itemLon = Number(item.lon);
        const address = item.display_name?.trim() ?? "";
        if (!Number.isFinite(itemLat) || !Number.isFinite(itemLon) || !address) {
          return null;
        }

        const nameFromDisplay = address.split(",")[0]?.trim() ?? "Local mechanic";
        const name = item.name?.trim() || nameFromDisplay || "Local mechanic";
        return {
          id: `nominatim-${index}-${itemLat.toFixed(5)}-${itemLon.toFixed(5)}`,
          name,
          address,
          distanceMiles: haversineMiles(lat, lon, itemLat, itemLon),
          mapUrl: toGoogleMapsUrl(name, address, itemLat, itemLon),
        };
      })
      .filter((value): value is MechanicResult => Boolean(value))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 50);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimitContext = createAuthRateLimitContext(AuthRateLimitAction.MECHANIC_SEARCH, request.headers);
  const { limited } = await consumeAuthRateLimit(rateLimitContext, MECHANIC_SEARCH_RATE_LIMIT_MAX_ATTEMPTS);
  if (limited) {
    return NextResponse.json(
      { message: "Too many mechanic searches. Please wait a minute and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      },
    );
  }

  const zip = String(request.nextUrl.searchParams.get("zip") ?? "").trim();
  const lat = parseNumber(request.nextUrl.searchParams.get("lat"));
  const lon = parseNumber(request.nextUrl.searchParams.get("lon"));
  const radius = parseNumber(request.nextUrl.searchParams.get("radius"));
  let resolvedLat = lat;
  let resolvedLon = lon;

  if (zip) {
    if (!/^\d{5}(?:-\d{4})?$/.test(zip)) {
      return NextResponse.json({ message: "Enter a valid US ZIP code." }, { status: 400 });
    }
    const geocoded = await geocodeZip(zip);
    if (!geocoded) {
      return NextResponse.json({ message: "Could not locate that ZIP code." }, { status: 400 });
    }
    resolvedLat = geocoded.lat;
    resolvedLon = geocoded.lon;
  }

  if (
    resolvedLat === null ||
    resolvedLon === null ||
    resolvedLat < -90 ||
    resolvedLat > 90 ||
    resolvedLon < -180 ||
    resolvedLon > 180
  ) {
    return NextResponse.json({ message: "Valid coordinates are required." }, { status: 400 });
  }

  const radiusMeters = clampRadius(radius ?? 12000);
  let mechanics = await fetchOverpassMechanics(resolvedLat, resolvedLon, radiusMeters);
  if (mechanics.length === 0) {
    mechanics = await fetchNominatimMechanicsFallback(resolvedLat, resolvedLon);
  }
  return NextResponse.json({ mechanics });
}
