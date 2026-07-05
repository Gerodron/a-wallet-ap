/**
 * @file Métodos de la API del mercado.
 */

import { api } from './client';
import type { PriceData, ChartDataPoint } from '@/lib/types/api';

export type ChartPeriod = '24h' | '7d' | '30d';

export function getPrices(): Promise<PriceData[]> {
  return api.get<PriceData[]>('/market/prices');
}

export function getPrice(symbol: string): Promise<PriceData> {
  return api.get<PriceData>(`/market/prices/${symbol.toUpperCase()}`);
}

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
