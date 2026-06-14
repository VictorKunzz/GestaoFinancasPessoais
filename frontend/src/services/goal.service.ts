import api from './api';
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalContribution,
  CreateContributionRequest,
  AddContributionResponse,
} from '../types';

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

// --- Aportes ---
export async function listContributions(goalId: string): Promise<GoalContribution[]> {
  const response = await api.get<GoalContribution[]>(`/goals/${goalId}/contributions`);
  return response.data;
}

export async function addContribution(
  goalId: string,
  data: CreateContributionRequest
): Promise<AddContributionResponse> {
  const response = await api.post<AddContributionResponse>(`/goals/${goalId}/contributions`, data);
  return response.data;
}

export async function removeContribution(
  goalId: string,
  contributionId: string
): Promise<{ goal: Goal }> {
  const response = await api.delete<{ goal: Goal }>(
    `/goals/${goalId}/contributions/${contributionId}`
  );
  return response.data;
}
