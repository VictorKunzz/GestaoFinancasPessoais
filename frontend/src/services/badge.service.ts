import api from './api';
import type { Badge, UserBadge, BadgeCheckResponse } from '../types';

export async function getAll(): Promise<Badge[]> {
  const response = await api.get<Badge[]>('/badges');
  return response.data;
}

export async function getMyBadges(): Promise<UserBadge[]> {
  const response = await api.get<UserBadge[]>('/badges/my-badges');
  return response.data;
}

export async function check(condition: string): Promise<BadgeCheckResponse> {
  const response = await api.post<BadgeCheckResponse>('/badges/check', { condition });
  return response.data;
}
