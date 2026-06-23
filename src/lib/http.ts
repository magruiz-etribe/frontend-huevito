import { getIdToken, signOut } from "./firebase";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function authHeaders(forceRefresh = false): Promise<Record<string, string>> {
  const token = await getIdToken(forceRefresh);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** If true, do not throw on 404 — return null instead. */
  allow404?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: ApiRequestOptions = {},
): Promise<T | null> {
  const { method = "GET", body, query, allow404 = false } = opts;

  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const doFetch = async (forceRefresh: boolean) => {
    const headers = await authHeaders(forceRefresh);
    return fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(false);

  // 401 → force refresh token and retry once
  if (res.status === 401) {
    res = await doFetch(true);
    if (res.status === 401) {
      await signOut().catch(() => {});
      throw new ApiError(401, "Sesión expirada", "unauthorized");
    }
  }

  if (allow404 && res.status === 404) return null;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(res.status, err?.message ?? res.statusText, err?.code, err?.details);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

// ============ Typed endpoints ============

export interface ClienteDTO {
  id: string;
  firebase_uid: string;
  email: string;
  responsable: string;
  fonda: string;
  telefono?: string | null;
  direccion: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  responsable: string;
  fonda: string;
  telefono?: string;
  direccion: string;
}

export function registerCliente(payload: RegisterPayload) {
  return apiRequest<{ cliente: ClienteDTO }>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getMe() {
  return apiRequest<{ cliente: ClienteDTO }>("/auth/me", { allow404: true });
}

export interface RatingPayload {
  session_id: string;
  platillo_nombre: string;
  platillo_nombre_en?: string;
  rating: number;
  comentario?: string;
  flags?: Record<string, unknown>;
}

export function postRating(payload: RatingPayload) {
  return apiRequest<{ ok: true; id: string }>("/huevito/rating", {
    method: "POST",
    body: payload,
  });
}

/** GET /huevito/ya-califique — verifica si el usuario ya calificó en esta sesión. Requiere auth. */
export function getYaCalifique(sessionId: string) {
  return apiRequest<{ ya_califico: boolean }>("/huevito/ya-califique", {
    query: { session_id: sessionId },
  });
}

export interface PlatilloHistorial {
  id: string;
  session_id: string;
  nombre: string;
  nombre_en?: string;
  rating: number;
  comentario?: string;
  flags?: Record<string, unknown>;
  created_at: string;
}

export function getMisPlatillos(params: { limit?: number; cursor?: string } = {}) {
  return apiRequest<{ platillos: PlatilloHistorial[]; next_cursor: string | null }>(
    "/clientes/me/platillos",
    { query: { limit: params.limit, cursor: params.cursor } },
  );
}

// ============ Menú ============

export type SpicyLevel = "none" | "mild" | "medium" | "hot";

export interface MenuItemFlags {
  allergens?: boolean;
  gluten_free?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy_level?: SpicyLevel;
}

export interface MenuItemInput {
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  flags?: MenuItemFlags;
  canonical_dish?: string;
}

export interface MenuItem extends MenuItemInput {
  id: string;
  created_at: string;
}

export interface PostMenusResponse {
  added: number;
  skipped: number;
  items: MenuItem[];
}

/** POST /menus — guarda platillos nuevos (deduplicación por `name_en`). */
export function postMenus(items: MenuItemInput[]) {
  return apiRequest<PostMenusResponse>("/menus", {
    method: "POST",
    body: items,
  });
}

export interface GetMenusResponse {
  items: MenuItem[];
  total: number;
}

/** GET /menus — devuelve el menú completo del cliente. */
export function getMenus() {
  return apiRequest<GetMenusResponse>("/menus");
}

/** Health check — no auth required. */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.status === "ok";
  } catch {
    return false;
  }
}
