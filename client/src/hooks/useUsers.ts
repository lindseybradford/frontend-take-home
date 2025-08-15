import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client';
import type { User, Role } from '@server/models';

interface UserWithRole extends User {
  role?: Role;
}

interface UseUsersWithRolesState {
  data: UserWithRole[];
  loading: boolean;
  error: string | null;
  pages: number;
  currentPage: number;
  searchQuery: string;
}

export function useUsers() {
  const [state, setState] = useState<UseUsersWithRolesState>({
    data: [],
    loading: false,
    error: null,
    pages: 0,
    currentPage: 1,
    searchQuery: '',
  });

  const fetchUsersWithRoles = useCallback(async (search?: string, page?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiClient.getUsers({ search, page }),
        apiClient.getRoles(),
      ]);

      const rolesMap = new Map(rolesResponse.data.map(role => [role.id, role]));

      const usersWithRoles = usersResponse.data.map(user => ({
        ...user,
        role: rolesMap.get(user.roleId),
      }));

      setState({
        data: usersWithRoles,
        pages: usersResponse.pages,
        currentPage: page || 1,
        searchQuery: search || '',
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, []);

  const retry = useCallback(() => {
    fetchUsersWithRoles(state.searchQuery, state.currentPage);
  }, [fetchUsersWithRoles, state.searchQuery, state.currentPage]);

  const handleSearch = useCallback(
    (query: string) => {
      fetchUsersWithRoles(query, 1);
    },
    [fetchUsersWithRoles]
  );

  const handleClearSearch = useCallback(() => {
    fetchUsersWithRoles('', 1);
  }, [fetchUsersWithRoles]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        await apiClient.deleteUser(userId);
        fetchUsersWithRoles(state.searchQuery, state.currentPage);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to delete user',
        }));
        throw error;
      }
    },
    [apiClient, fetchUsersWithRoles, state.searchQuery, state.currentPage]
  );

  const hasInitiallyFetched = useRef(false);

  useEffect(() => {
    if (!hasInitiallyFetched.current) {
      hasInitiallyFetched.current = true;
      fetchUsersWithRoles();
    }
  }, [fetchUsersWithRoles]);

  return {
    ...state,
    retry,
    handleSearch,
    handleClearSearch,
    handleDeleteUser,
  };
}
