const STORAGE_KEY = "supabase-auth-session";

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readStoredSession() {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse stored Supabase session", e);
    return null;
  }
}

function persistSession(session) {
  if (!isBrowser()) return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function enrichSession(session) {
  if (!session) return null;
  if (!session.expires_at && session.expires_in) {
    session.expires_at = nowInSeconds() + session.expires_in;
  }
  return session;
}

function toSession(data) {
  if (!data) return null;
  if (data.session) return enrichSession(data.session);
  if (data.access_token) return enrichSession({ ...data });
  return null;
}

class SupabaseAuthClient {
  constructor(url, key) {
    this.url = url.replace(/\/$/, "");
    this.key = key;
    this.listeners = new Set();
    this.session = readStoredSession();
  }

  emit(event, session) {
    for (const cb of this.listeners) {
      try {
        cb(event, session);
      } catch (e) {
        console.error("Supabase auth listener error", e);
      }
    }
  }

  baseHeaders() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
    };
  }

  async request(path, options = {}) {
    const res = await fetch(`${this.url}${path}`, {
      ...options,
      headers: { ...this.baseHeaders(), ...(options.headers || {}) },
    });
    let payload = null;
    try {
      payload = await res.json();
    } catch (e) {
      payload = null;
    }
    if (!res.ok) {
      const message = payload?.error_description || payload?.msg || payload?.message || res.statusText;
      return { error: { message }, data: null };
    }
    return { error: null, data: payload };
  }

  storeSession(session) {
    this.session = session;
    persistSession(session);
    this.emit(session ? "SIGNED_IN" : "SIGNED_OUT", session);
  }

  async signUp({ email, password }) {
    const { data, error } = await this.request("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (error) return { data: { user: null, session: null }, error };
    const session = toSession(data);
    if (session) this.storeSession(session);
    return { data: { user: data?.user ?? null, session }, error: null };
  }

  async signInWithPassword({ email, password }) {
    const { data, error } = await this.request("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (error) return { data: { session: null, user: null }, error };
    const session = toSession(data);
    if (session) this.storeSession(session);
    const user = data?.user ?? session?.user ?? null;
    return { data: { session, user }, error: null };
  }

  async signOut() {
    if (this.session?.access_token) {
      await this.request("/auth/v1/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.session.access_token}` },
      });
    }
    this.storeSession(null);
    return { error: null }; 
  }

  isExpired(session) {
    if (!session?.expires_at) return false;
    return session.expires_at <= nowInSeconds();
  }

  async refreshSession() {
    if (!this.session?.refresh_token) return null;
    const { data, error } = await this.request("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: this.session.refresh_token }),
    });
    if (error) return null;
    const session = toSession(data);
    if (session) this.storeSession(session);
    return session ?? null;
  }

  async getSession() {
    if (this.session && !this.isExpired(this.session)) {
      return { data: { session: this.session }, error: null };
    }
    const refreshed = await this.refreshSession();
    if (refreshed) return { data: { session: refreshed }, error: null };
    return { data: { session: null }, error: null };
  }

  onAuthStateChange(callback) {
    this.listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
      error: null,
    };
  }
}

class SupabaseClient {
  constructor(url, key) {
    this.auth = new SupabaseAuthClient(url, key);
  }
}

export function createClient(url, key) {
  if (!url) throw new Error("Supabase URL is required");
  if (!key) throw new Error("Supabase key is required");
  return new SupabaseClient(url, key);
}

export { SupabaseAuthClient, SupabaseClient };
