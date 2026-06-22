/**
 * @file Market data API methods.
 *
 * Prices and chart data for the assets supported by the wallet.
 */

import { api } from './client';
import type { PriceData, ChartDataPoint } from '@/lib/types/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChartPeriod = '24h' | '7d' | '30d';

// ---------------------------------------------------------------------------
// Prices
// ---------------------------------------------------------------------------

/**
 * Fetch current spot prices for every supported native asset (SOL, BTC, BNB).
 */
export function getPrices(): Promise<PriceData[]> {
  return api.get<PriceData[]>('/market/prices');
}

/**
 * Fetch the spot price for a single symbol.
 *
 * @param symbol - Ticker symbol (e.g. "SOL").
 */
export function getPrice(symbol: string): Promise<PriceData> {
  return api.get<PriceData>(`/market/prices/${symbol.toUpperCase()}`);
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

/**
 * Fetch historical price data for charting.
 *
 * @param symbol - Ticker symbol (e.g. "BTC").
 * @param period - Time window.
 */
export function getChartData(
  symbol: string,
  period: ChartPeriod = '24h',
): Promise<ChartDataPoint[]> {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    period,
  });
  return api.get<ChartDataPoint[]>(`/market/chart?${params.toString()}`);
}
