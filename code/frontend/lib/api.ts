export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const apiBase = API_BASE;

type ApiFetchOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
  auth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
  json?: unknown;
  body?: RequestInit["body"];
};

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function buildUrl(path: string, query?: ApiFetchOptions["query"]): string {
  const basePath = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const url = new URL(basePath);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth, headers: customHeaders, query, json, body: rawBody, ...rest } = options;
  const headers = new Headers(customHeaders || {});

  let body: BodyInit | null | undefined = rawBody as BodyInit | null | undefined;

  if (json !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(json);
  } else if (
    body &&
    typeof body === "object" &&
    !(body instanceof Blob) &&
    !(body instanceof FormData) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  ) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(body);
  }

  if (auth && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildUrl(path, query);
  const res = await fetch(url, {
    ...rest,
    body: body as BodyInit | null | undefined,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  return text as unknown as T;
}

export async function apiDownload(path: string, options: ApiFetchOptions = {}): Promise<Blob> {
  const { auth, headers: customHeaders, query, json, body: rawBody, ...rest } = options;
  const headers = new Headers(customHeaders || {});
  let body: BodyInit | null | undefined = rawBody as BodyInit | null | undefined;

  if (json !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(json);
  } else if (
    body &&
    typeof body === "object" &&
    !(body instanceof Blob) &&
    !(body instanceof FormData) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  ) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(body);
  }

  if (auth && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildUrl(path, query);
  const res = await fetch(url, {
    ...rest,
    body,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.blob();
}
