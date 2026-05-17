import api from './api';
import type { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types';

export async function getAll(): Promise<Goal[]> {
  const response = await api.get<Goal[]>('/goals');
  return response.data;
}

export async function getById(id: string): Promise<Goal> {
  const response = await api.get<Goal>(`/goals/${id}`);
  return response.data;
}

export async function create(data: CreateGoalRequest): Promise<Goal> {
  const response = await api.post<Goal>('/goals', data);
  return response.data;
}

export async function update(id: string, data: UpdateGoalRequest): Promise<Goal> {
  const response = await api.put<Goal>(`/goals/${id}`, data);
  return response.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}
