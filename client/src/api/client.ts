import type { PagedData, User, Role } from '@server/models';
import { getFromCache, setCache, clearCache } from './cache';

const API_BASE = 'http://localhost:3002';
const USER_ENDPOINT = '/users';
const ROLES_ENDPOINT = '/roles';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  getUsers: async (params?: { search?: string; page?: number }) => {
    const cacheKey = `users_${JSON.stringify(params || {})}`;

    const cached = getFromCache<PagedData<User>>(cacheKey);
    if (cached) return cached;

    const url = new URL(USER_ENDPOINT, API_BASE);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.page) url.searchParams.set('page', params.page.toString());

    const result = await request<PagedData<User>>(url.toString().replace(API_BASE, ''));

    setCache(cacheKey, result);
    return result;
  },

  deleteUser: async (id: string) => {
    const result = await request<User>(`${USER_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });

    clearCache('users_');
    return result;
  },

  getRoles: async (params?: { search?: string; page?: number }) => {
    const cacheKey = `roles_${JSON.stringify(params || {})}`;

    const cached = getFromCache<PagedData<Role>>(cacheKey);
    if (cached) return cached;

    const url = new URL(ROLES_ENDPOINT, API_BASE);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.page) url.searchParams.set('page', params.page.toString());

    const result = await request<PagedData<Role>>(url.toString().replace(API_BASE, ''));

    setCache(cacheKey, result);
    return result;
  },

  updateRole: async (
    roleId: string,
    updates: Partial<Pick<Role, 'name' | 'description' | 'isDefault'>>
  ) => {
    const result = await request<Role>(`${ROLES_ENDPOINT}/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    clearCache('roles');
    return result;
  },
};
