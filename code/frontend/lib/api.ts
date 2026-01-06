// code/frontend/lib/api.ts

import type { Deal, DealAnalysis, Campaign, DashboardStats, Property } from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export type ApiOptions = RequestInit & {
  auth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
  json?: any; // convenience: auto JSON.stringify + set content-type
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token") || localStorage.getItem("token");
}

function buildUrl(path: string, query?: ApiOptions["query"]) {
  const base = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  if (!query) return base;

  const url = new URL(base);
  for (const [k, v] of Object.entries(query)) {
    if (v === null || v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, init: ApiOptions = {}): Promise<T> {
  const token = getAccessToken();

  // headers
  const headers = new Headers(init.headers || {});

  // If user used `json`, convert to proper fetch body
  let body = init.body;
  if (init.json !== undefined && body === undefined) {
    body = JSON.stringify(init.json);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  } else {
    // keep existing behavior: only set JSON content-type if body exists and no content-type set
    if (!headers.has("Content-Type") && body) headers.set("Content-Type", "application/json");
  }

  if (init.auth && token) headers.set("Authorization", `Bearer ${token}`);
  // If they don't pass auth:true but token exists, you can choose to keep old behavior.
  // Right now: only attach if auth:true (safer + predictable).
  // If you want always-on token, change this line.

  const url = buildUrl(path, init.query);

  const { auth, query, json, ...rest } = init;
  const res = await fetch(url, { ...rest, headers, body });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}

// Optional: if you still need download helper
export async function apiDownload(path: string, init: ApiOptions = {}): Promise<Blob> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (init.auth && token) headers.set("Authorization", `Bearer ${token}`);

  const url = buildUrl(path, init.query);
  const { auth, query, json, ...rest } = init;

  const res = await fetch(url, { ...rest, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download ${res.status}: ${text || res.statusText}`);
  }
  return await res.blob();
}

// Dashboard API functions

/**
 * Fetch all deals
 */
export async function fetchDeals(): Promise<Deal[]> {
  try {
    return await apiFetch<Deal[]>('/api/deals', { auth: true });
  } catch (error) {
    console.error('Error fetching deals:', error);
    // Return mock data for development
    return [];
  }
}

/**
 * Fetch a single deal by ID
 */
export async function fetchDeal(id: string): Promise<Deal> {
  try {
    return await apiFetch<Deal>(`/api/deals/${id}`, { auth: true });
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw error;
  }
}

/**
 * Analyze a deal
 */
export async function analyzeDeal(payload: {
  dealId: string;
  [key: string]: unknown;
}): Promise<DealAnalysis> {
  try {
    return await apiFetch<DealAnalysis>('/api/deals/analyze', {
      method: 'POST',
      auth: true,
      json: payload,
    });
  } catch (error) {
    console.error('Error analyzing deal:', error);
    throw error;
  }
}

/**
 * Fetch all campaigns
 */
export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    return await apiFetch<Campaign[]>('/api/campaigns', { auth: true });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

/**
 * Fetch dashboard stats
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    return await apiFetch<DashboardStats>('/api/dashboard/stats', { auth: true });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default stats
    return {
      dealCountVerified: 0,
      assignmentReceived: 0,
      slipPerFixer: 0,
    };
  }
}

/**
 * Search properties
 */
export async function searchProperties(filters?: {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
}): Promise<Property[]> {
  try {
    return await apiFetch<Property[]>('/api/properties/search', {
      auth: true,
      query: filters as Record<string, string | number | boolean>,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
}
