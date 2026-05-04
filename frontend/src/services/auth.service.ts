import api from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', data);
  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}
