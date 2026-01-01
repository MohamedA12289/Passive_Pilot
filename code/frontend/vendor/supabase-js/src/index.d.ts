export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED";

export type UserIdentity = {
  identity_data?: Record<string, any> | null;
};

export interface User {
  id?: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  identities?: UserIdentity[];
  [key: string]: any;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: User | null;
  [key: string]: any;
}

export interface AuthResponse {
  data: { session: Session | null; user: User | null };
  error: { message: string } | null;
}

export interface GetSessionResponse {
  data: { session: Session | null };
  error: { message: string } | null;
}

export interface Subscription {
  unsubscribe: () => void;
}

export interface AuthChangeResponse {
  data: { subscription: Subscription };
  error: { message: string } | null;
}

export interface SupabaseAuthClient {
  signUp(args: { email: string; password: string }): Promise<AuthResponse>;
  signInWithPassword(args: { email: string; password: string }): Promise<AuthResponse>;
  signOut(): Promise<{ error: { message: string } | null }>;
  getSession(): Promise<GetSessionResponse>;
  onAuthStateChange(cb: (event: AuthChangeEvent, session: Session | null) => void): AuthChangeResponse;
}

export interface SupabaseClient {
  auth: SupabaseAuthClient;
}

export function createClient(url: string, anonKey: string): SupabaseClient;
