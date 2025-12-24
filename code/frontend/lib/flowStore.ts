"use client";

export type ProviderKey = "dealmachine" | "attom" | "manual_csv";

export type Filters = {
  equityMinPct?: number; // 0-100
  absentee?: boolean;
  vacant?: boolean;
  minBeds?: number;
  minBaths?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  lastSaleBefore?: string; // YYYY-MM-DD
};

export type PreviewLead = {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  owner?: string;
  score?: number;
  status?: "keep" | "pass" | "new";
};

export type CampaignFlowState = {
  campaignId: string;

  // Step 2 (map)
  locationQuery?: string;
  locationDisplayName?: string;
  center?: { lat: number; lng: number };
  bbox?: [number, number, number, number]; // south, west, north, east

  // Step 3 (provider)
  provider?: ProviderKey;
  providerNotes?: string;

  // Step 4 (filters)
  filters?: Filters;

  // Step 5 (preview)
  previewCount?: number;
  previewLeads?: PreviewLead[];

  // Step 6 (score)
  scoringMode?: "simple" | "none";
  scoreNotes?: string;

  // Step 7 (export)
  exportFormat?: "csv";
  exportGroupBy?: "zip" | "none";
};

const KEY_PREFIX = "pp:flow:";

export function loadFlow(campaignId: string): CampaignFlowState {
  if (typeof window === "undefined") return { campaignId };
  const raw = window.localStorage.getItem(KEY_PREFIX + campaignId);
  if (!raw) return { campaignId };
  try {
    const parsed = JSON.parse(raw);
    return { campaignId, ...(parsed || {}) };
  } catch {
    return { campaignId };
  }
}

export function saveFlow(campaignId: string, patch: Partial<CampaignFlowState>) {
  if (typeof window === "undefined") return;
  const current = loadFlow(campaignId);
  const next: CampaignFlowState = { ...current, ...patch, campaignId };
  window.localStorage.setItem(KEY_PREFIX + campaignId, JSON.stringify(next));
  return next;
}

export function clearFlow(campaignId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_PREFIX + campaignId);
}
