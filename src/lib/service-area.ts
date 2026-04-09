import { normalizeUkPostcode } from "@/lib/uk-postcode";
import {
  SERVICE_AREA_CENTRE_LAT,
  SERVICE_AREA_CENTRE_LNG,
  SERVICE_AREA_OUTSIDE_MESSAGE,
  SERVICE_AREA_RADIUS_MILES,
} from "@/lib/constants";

const EARTH_RADIUS_MILES = 3958.7613;

/** Great-circle distance in miles (WGS84 sphere). */
export function haversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

type PostcodesIoResult = {
  status: number;
  result?: { latitude: number; longitude: number };
};

const coordCache = new Map<string, { lat: number; lng: number; expires: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchPostcodeLatLng(normalizedPostcode: string): Promise<{ lat: number; lng: number } | null> {
  const now = Date.now();
  const hit = coordCache.get(normalizedPostcode);
  if (hit && hit.expires > now) {
    return { lat: hit.lat, lng: hit.lng };
  }

  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as PostcodesIoResult;
  const r = data.result;
  if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") {
    return null;
  }

  coordCache.set(normalizedPostcode, {
    lat: r.latitude,
    lng: r.longitude,
    expires: now + CACHE_TTL_MS,
  });

  return { lat: r.latitude, lng: r.longitude };
}

export type ServiceAreaCheck =
  | { ok: true; distanceMiles: number; postcode: string }
  | {
      ok: false;
      code: "INVALID_POSTCODE" | "POSTCODE_NOT_FOUND" | "OUTSIDE_SERVICE_AREA";
      message: string;
    };

/**
 * Resolves a postcode string against the configured service centre and radius.
 * Uses postcodes.io for UK geocoding (no API key).
 */
export async function checkPostcodeInServiceArea(rawPostcode: string): Promise<ServiceAreaCheck> {
  const normalized = normalizeUkPostcode(rawPostcode);
  if (!normalized) {
    return {
      ok: false,
      code: "INVALID_POSTCODE",
      message: "Enter a valid UK postcode.",
    };
  }

  const coords = await fetchPostcodeLatLng(normalized);
  if (!coords) {
    return {
      ok: false,
      code: "POSTCODE_NOT_FOUND",
      message: "We could not find that postcode. Check and try again.",
    };
  }

  const distanceMiles = haversineDistanceMiles(
    SERVICE_AREA_CENTRE_LAT,
    SERVICE_AREA_CENTRE_LNG,
    coords.lat,
    coords.lng
  );

  if (distanceMiles > SERVICE_AREA_RADIUS_MILES + 0.02) {
    return {
      ok: false,
      code: "OUTSIDE_SERVICE_AREA",
      message: SERVICE_AREA_OUTSIDE_MESSAGE,
    };
  }

  return { ok: true, distanceMiles, postcode: normalized };
}
