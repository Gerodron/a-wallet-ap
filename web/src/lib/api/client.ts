/**
 * @file Cliente API.
 */

import { useAuthStore } from '@/lib/store/auth-store';
import type { ApiResponse, ApiError } from '@/lib/types/api';

const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL;
    if (!url.endsWith('/api')) {
      url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8080/api`;
  }

  return 'http://localhost:8080/api';
};

const BASE_URL = getBaseUrl();

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

function buildHeaders(custom?: HeadersInit): Headers {
  const headers = new Headers(custom);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = useAuthStore.getState().jwtToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers),
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // Ignorado
  }

  if (!res.ok) {
    if (body && !body.success) {
      throw new ApiClientError(body.error);
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204 || !body) {
    return undefined as unknown as T;
  }

  if (body.success) {
    return body.data;
  }

  throw new ApiClientError(body.error);
}

export const api = {
  get<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: 'DELETE' });
  },
} as const;
