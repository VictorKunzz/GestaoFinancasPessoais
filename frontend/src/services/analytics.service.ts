import api from './api';
import type { HealthScore, Insights, BalanceForecast } from '../types';

export async function getHealthScore(): Promise<HealthScore> {
  const response = await api.get<HealthScore>('/analytics/health-score');
  return response.data;
}

export async function getInsights(): Promise<Insights> {
  const response = await api.get<Insights>('/analytics/insights');
  return response.data;
}

export async function getBalanceForecast(): Promise<BalanceForecast> {
  const response = await api.get<BalanceForecast>('/analytics/forecast');
  return response.data;
}
