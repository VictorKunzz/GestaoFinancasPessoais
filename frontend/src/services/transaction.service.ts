import api from './api';
import type {
  Transaction,
  TransactionFilters,
  PaginatedTransactions,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '../types';

export async function getAll(filters?: TransactionFilters): Promise<PaginatedTransactions> {
  const response = await api.get<PaginatedTransactions>('/transactions', { params: filters });
  return response.data;
}

export async function getById(id: string): Promise<Transaction> {
  const response = await api.get<Transaction>(`/transactions/${id}`);
  return response.data;
}

export async function create(data: CreateTransactionRequest): Promise<Transaction> {
  const response = await api.post<Transaction>('/transactions', data);
  return response.data;
}

export async function update(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
  const response = await api.put<Transaction>(`/transactions/${id}`, data);
  return response.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}
