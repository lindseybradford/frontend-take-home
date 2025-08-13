// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { User } from '@server/models';

interface UseUsersState {
  data: User[];
  loading: boolean;
  error: string | null;
}

export function useUsers() {
  const [state, setState] = useState<UseUsersState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchUsers = useCallback(async (search?: string, page?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.getUsers({ search, page });
      setState(prev => ({
        ...prev,
        data: response.data,
        pages: response.pages,
        currentPage: page || 1,
        searchQuery: search || '',
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    ...state,
    refetch: fetchUsers,
  };
}
