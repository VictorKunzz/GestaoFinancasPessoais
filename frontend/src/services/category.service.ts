import api from './api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export async function getAll(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

export async function getById(id: string): Promise<Category> {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function create(data: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<Category>('/categories', data);
  return response.data;
}

export async function update(id: string, data: UpdateCategoryRequest): Promise<Category> {
  const response = await api.put<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
