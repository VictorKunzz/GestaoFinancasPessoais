import api from './api';
import type {
  AdminUser,
  AdminBadge,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  Role,
} from '../types';

// ===== Usuários =====
export async function getUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/admin/users');
  return response.data;
}

export async function updateUserRole(id: string, role: Role): Promise<AdminUser> {
  const response = await api.put<AdminUser>(`/admin/users/${id}/role`, { role });
  return response.data;
}

export async function removeUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

// ===== Badges =====
export async function getBadges(): Promise<AdminBadge[]> {
  const response = await api.get<AdminBadge[]>('/admin/badges');
  return response.data;
}

export async function createBadge(data: CreateBadgeRequest): Promise<AdminBadge> {
  const response = await api.post<AdminBadge>('/admin/badges', data);
  return response.data;
}

export async function updateBadge(id: string, data: UpdateBadgeRequest): Promise<AdminBadge> {
  const response = await api.put<AdminBadge>(`/admin/badges/${id}`, data);
  return response.data;
}

export async function removeBadge(id: string): Promise<void> {
  await api.delete(`/admin/badges/${id}`);
}
