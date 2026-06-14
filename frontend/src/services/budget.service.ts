import api from './api';
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../types';

export async function getAll(): Promise<Budget[]> {
  const response = await api.get<Budget[]>('/budgets');
  return response.data;
}

export async function create(data: CreateBudgetRequest): Promise<Budget> {
  const response = await api.post<Budget>('/budgets', data);
  return response.data;
}

export async function update(id: string, data: UpdateBudgetRequest): Promise<Budget> {
  const response = await api.put<Budget>(`/budgets/${id}`, data);
  return response.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
