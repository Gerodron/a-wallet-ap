/**
 * @file API client — thin `fetch` wrapper with JWT injection and typed errors.
 *
 * Usage:
 * ```ts
 * import { api } from '@/lib/api/client';
 * const data = await api.get<Balance[]>('/wallets/balances');
 * ```
 *
 * The base URL is read from `NEXT_PUBLIC_API_URL`.
 * The JWT is read from the in-memory auth store on every request.
 */

import { useAuthStore } from '@/lib/store/auth-store';
import type { ApiResponse, ApiError } from '@/lib/types/api';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
    : 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, string>;

  constructor(err: ApiError) {
    super(err.message);
    this.name = 'ApiClientError';
    this.code = err.code;
    this.statusCode = err.statusCode;
    this.details = err.details;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build headers, injecting the Bearer token when available.
 */
function buildHeaders(custom?: HeadersInit): Headers {
  const headers = new Headers(custom);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Read JWT directly from in-memory store (never from localStorage)
  const token = useAuthStore.getState().jwtToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Execute a fetch request and return the parsed JSON body.
 * Throws {@link ApiClientError} for non-2xx responses that include a
 * structured error payload, or a plain `Error` otherwise.
 */
async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers),
  });

  // Attempt to parse JSON regardless of status code
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    /* response may have no body (e.g. 204) */
  }

  if (!res.ok) {
    if (body && !body.success) {
      throw new ApiClientError(body.error);
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  // For 204 No Content, return undefined cast to T
  if (res.status === 204 || !body) {
    return undefined as unknown as T;
  }

  if (body.success) {
    return body.data;
  }

  // Should not reach here, but handle gracefully
  throw new ApiClientError(body.error);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const api = {
  /**
   * HTTP GET.
   * @param path - URL path appended to the base URL (e.g. `/wallets/balances`).
   */
  get<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: 'GET' });
  },

  /**
   * HTTP POST.
   * @param path - URL path.
   * @param body - JSON-serialisable body.
   */
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * HTTP PUT.
   * @param path - URL path.
   * @param body - JSON-serialisable body.
   */
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * HTTP DELETE.
   * @param path - URL path.
   */
  delete<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: 'DELETE' });
  },
} as const;
