import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT?.trim();

function hygraphAuthHeaders(): Record<string, string> | undefined {
  const token = process.env.HYGRAPH_API_TOKEN?.trim();
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

/** True when a non-empty Permanent Auth Token is configured (server-only env). */
export function hasHygraphApiToken(): boolean {
  return Boolean(process.env.HYGRAPH_API_TOKEN?.trim());
}

export function getHygraphClient(): GraphQLClient {
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_HYGRAPH_ENDPOINT is not set");
  }
  const headers = hygraphAuthHeaders();
  return new GraphQLClient(endpoint, {
    ...(headers && { headers }),
  });
}

/** Safe client for build-time when env is missing (returns null). */
export function tryHygraphClient(): GraphQLClient | null {
  if (!endpoint) return null;
  return getHygraphClient();
}
