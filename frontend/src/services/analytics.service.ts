import api from './api';
import type { HealthScore, Insights, BalanceForecast, Cashflow, MonthlyComparison } from '../types';

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

export async function getCashflow(months = 6): Promise<Cashflow> {
  const response = await api.get<Cashflow>('/analytics/cashflow', { params: { months } });
  return response.data;
}

export async function getMonthlyComparison(): Promise<MonthlyComparison> {
  const response = await api.get<MonthlyComparison>('/analytics/comparison');
  return response.data;
}
