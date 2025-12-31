export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
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
  const { auth, headers: customHeaders, query, ...rest } = options;
  const headers = new Headers(customHeaders || {});

  let body = rest.body as BodyInit | null | undefined;

  if (!headers.has("Content-Type") && body) {
    headers.set("Content-Type", "application/json");
  }

  if (
    body &&
    typeof body === "object" &&
    !(body instanceof Blob) &&
    !(body instanceof FormData) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  ) {
    body = JSON.stringify(body);
  }

  if (auth && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildUrl(path, query);
  const res = await fetch(url, { ...rest, body, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
