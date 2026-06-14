import api from './api';
import type { Category } from '../types';

export async function getAll(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

export async function create(data: { name: string; icon?: string }): Promise<Category> {
  const response = await api.post<Category>('/categories', data);
  return response.data;
}
