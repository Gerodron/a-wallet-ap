export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ChartDataPoint {
  time: number;
  value: number;
}

export interface PriceData {
  symbol: string;
  priceUSD: number;
  change24h: number;
  change24hPercent: number;
}

export interface PortfolioSummary {
  totalValueUSD: number;
  change24h: number;
  change24hPercent: number;
  networks: Record<string, { valueUSD: number; percentage: number }>;
}
