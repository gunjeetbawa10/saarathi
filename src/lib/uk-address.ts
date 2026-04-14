import { normalizeUkPostcode } from "@/lib/uk-postcode";

type GeoapifySearchResult = {
  housenumber?: string;
  street?: string;
  name?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  postcode?: string;
  formatted?: string;
  result_type?: string;
};

type GeoapifySearchResponse = {
  results?: GeoapifySearchResult[];
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const suggestionCache = new Map<string, { suggestions: string[]; expires: number }>();

// Uses provided key immediately, but can be overridden per environment.
const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY?.trim() || "7fb83e78f89c4bca876a9b621a74631f";

function isSamePostcode(candidate: string | undefined, normalized: string): boolean {
  if (!candidate) return false;
  return normalizeUkPostcode(candidate) === normalized;
}

function formatAddressLine(a: GeoapifySearchResult): string | null {
  const premise = a.housenumber || a.name;
  if (!premise) return null;

  const first =
    a.housenumber && a.street
      ? `${a.housenumber} ${a.street}`.trim()
      : a.name && a.street
        ? `${a.name}, ${a.street}`.trim()
        : premise;
  const locality = a.city || a.town || a.village || a.county;
  const parts = [first, a.suburb, locality, a.postcode].filter(
    (v): v is string => Boolean(v && v.trim())
  );
  if (parts.length === 0) return null;
  return parts.join(", ");
}

async function geoapifySearchByPostcode(normalizedPostcode: string): Promise<GeoapifySearchResult[]> {
  if (!GEOAPIFY_API_KEY) return [];

  const searchUrl = new URL("https://api.geoapify.com/v1/geocode/search");
  searchUrl.searchParams.set("postcode", normalizedPostcode);
  searchUrl.searchParams.set("countrycode", "gb");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("limit", "20");
  searchUrl.searchParams.set("apiKey", GEOAPIFY_API_KEY);

  const autocompleteUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  autocompleteUrl.searchParams.set("text", normalizedPostcode);
  autocompleteUrl.searchParams.set("filter", "countrycode:gb");
  autocompleteUrl.searchParams.set("format", "json");
  autocompleteUrl.searchParams.set("limit", "20");
  autocompleteUrl.searchParams.set("apiKey", GEOAPIFY_API_KEY);

  const [searchRes, autocompleteRes] = await Promise.all([
    fetch(searchUrl.toString(), { headers: { Accept: "application/json" }, cache: "no-store" }),
    fetch(autocompleteUrl.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }),
  ]);

  const all: GeoapifySearchResult[] = [];
  if (searchRes.ok) {
    const json = (await searchRes.json()) as GeoapifySearchResponse;
    if (Array.isArray(json.results)) all.push(...json.results);
  }
  if (autocompleteRes.ok) {
    const json = (await autocompleteRes.json()) as GeoapifySearchResponse;
    if (Array.isArray(json.results)) all.push(...json.results);
  }
  return all;
}

function normalizeSuggestion(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/,\s*United Kingdom\s*$/i, "")
    .trim();
}

function buildSuggestionList(
  rows: GeoapifySearchResult[],
  normalizedPostcode: string,
  max = 8
): string[] {
  const weakTypes = new Set([
    "postcode",
    "street",
    "city",
    "town",
    "village",
    "county",
    "state",
    "district",
    "suburb",
  ]);
  const uniq = new Set<string>();
  for (const row of rows) {
    if (!isSamePostcode(row.postcode, normalizedPostcode)) continue;
    if (row.result_type && weakTypes.has(row.result_type)) continue;
    const candidate = formatAddressLine(row);
    if (!candidate) continue;
    const clean = normalizeSuggestion(candidate);
    uniq.add(clean);
    if (uniq.size >= max) break;
  }
  return Array.from(uniq.values());
}

export async function lookupUkAddressSuggestions(rawPostcode: string): Promise<{
  normalizedPostcode: string;
  suggestions: string[];
}> {
  const normalized = normalizeUkPostcode(rawPostcode);
  if (!normalized) {
    throw new Error("INVALID_POSTCODE");
  }

  const now = Date.now();
  const hit = suggestionCache.get(normalized);
  if (hit && hit.expires > now) {
    return { normalizedPostcode: normalized, suggestions: hit.suggestions };
  }

  const suggestions = buildSuggestionList(
    await geoapifySearchByPostcode(normalized),
    normalized
  );

  suggestionCache.set(normalized, {
    suggestions,
    expires: now + CACHE_TTL_MS,
  });

  return { normalizedPostcode: normalized, suggestions };
}
