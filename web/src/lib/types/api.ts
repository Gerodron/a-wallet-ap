/**
 * @file API response wrappers and error types.
 *
 * Every backend response is wrapped in {@link ApiResponse} so consumers
 * can pattern-match on `success` without runtime type-guards.
 */

// ---------------------------------------------------------------------------
// Success / Error wrappers
// ---------------------------------------------------------------------------

/** Successful API response. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Failed API response. */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/** Union discriminated on `success`. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Error detail
// ---------------------------------------------------------------------------

/** Structured error returned by the backend. */
export interface ApiError {
  /** Machine-readable error code (e.g. "INSUFFICIENT_FUNDS"). */
  code: string;
  /** Human-readable message. */
  message: string;
  /** HTTP status code. */
  statusCode: number;
  /** Optional per-field validation errors. */
  details?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Paginated list response. */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Market data
// ---------------------------------------------------------------------------

/** Single price point for a chart. */
export interface ChartDataPoint {
  /** Unix timestamp in milliseconds. */
  time: number;
  /** Price in USD. */
  value: number;
}

/** Current price snapshot for an asset. */
export interface PriceData {
  symbol: string;
  priceUSD: number;
  change24h: number;
  change24hPercent: number;
}

// ---------------------------------------------------------------------------
// Portfolio summary (used by dashboard)
// ---------------------------------------------------------------------------

/** Aggregated portfolio value across all networks. */
export interface PortfolioSummary {
  totalValueUSD: number;
  change24h: number;
  change24hPercent: number;
  /** Per-network breakdown. */
  networks: Record<string, { valueUSD: number; percentage: number }>;
}
