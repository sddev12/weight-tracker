import type { Weight, Goal } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function getWeights(
  startDate?: string,
  endDate?: string
): Promise<Weight[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${API_URL}/weights${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weights');
  }
  
  const data = await response.json();
  return data.weights || [];
}

export async function getWeight(id: number): Promise<Weight> {
  const response = await fetch(`${API_URL}/weights/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weight');
  }
  
  return response.json();
}

export async function createWeight(date: string, pounds: number): Promise<Weight> {
  const response = await fetch(`${API_URL}/weights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, pounds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create weight entry');
  }

  return response.json();
}

export async function updateWeight(
  id: number,
  date: string,
  pounds: number
): Promise<Weight> {
  const response = await fetch(`${API_URL}/weights/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, pounds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update weight entry');
  }

  return response.json();
}

export async function deleteWeight(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/weights/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete weight entry');
  }
}

export async function getGoal(): Promise<Goal> {
  const response = await fetch(`${API_URL}/goal`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch goal');
  }
  
  return response.json();
}

export async function updateGoal(pounds: number | null): Promise<Goal> {
  const response = await fetch(`${API_URL}/goal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pounds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update goal');
  }

  return response.json();
}
