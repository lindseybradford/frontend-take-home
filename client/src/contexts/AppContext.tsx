import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../api/client';
import type { User, Role, PagedData } from '@server/models';
import type { UsersContextValue, RolesContextValue, UserWithRole } from './types';
import { RolesContext } from './RolesContextDef';
import { UsersContext } from './UsersContextDef';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const rolesMap = useMemo(() => {
    return new Map(roles.map(role => [role.id, role]));
  }, [roles]);

  const joinUsersWithRoles = useCallback(
    (usersData: User[]): UserWithRole[] => {
      return usersData.map(user => ({
        ...user,
        role: rolesMap.get(user.roleId),
      }));
    },
    [rolesMap]
  );

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      setRolesError(null);
      const response = await apiClient.getRoles();
      setRoles(response.data);
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const refetchRoles = useCallback(() => {
    return fetchRoles();
  }, [fetchRoles]);

  const updateRole = useCallback(
    async (roleId: string, updates: Partial<Pick<Role, 'name' | 'description' | 'isDefault'>>) => {
      try {
        const updatedRole = await apiClient.updateRole(roleId, updates);
        setRoles(prevRoles => prevRoles.map(role => (role.id === roleId ? updatedRole : role)));
      } catch (err) {
        setRolesError(err instanceof Error ? err.message : 'Failed to update role');
        throw err;
      }
    },
    []
  );

  const fetchUsers = useCallback(
    async (search?: string, page?: number) => {
      setUsersLoading(true);
      setUsersError(null);

      if (rolesMap.size === 0) {
        setUsersLoading(false);
        setUsersError('Cannot load users: roles are required');
        return;
      }

      try {
        const response: PagedData<User> = await apiClient.getUsers({
          search: search ?? searchQuery,
          page: page ?? currentPage,
        });

        const enrichedUsers = joinUsersWithRoles(response.data);

        setUsers(enrichedUsers);
        setPages(response.pages);
        setCurrentPage(page ?? currentPage);
        setSearchQuery(search ?? searchQuery);
      } catch (err) {
        setUsersError(err instanceof Error ? err.message : 'Failed to fetch users');
        setUsers([]); // Clear users array on error
        setPages(0); // Reset pagination
      } finally {
        setUsersLoading(false);
      }
    },
    [rolesMap.size, searchQuery, currentPage, joinUsersWithRoles]
  );

  const refreshUsers = useCallback(async () => {
    if (rolesMap.size === 0) {
      try {
        await fetchRoles();
      } catch (err) {
        console.error('Failed to refresh roles:', err);
      }
    } else {
      return fetchUsers(searchQuery, currentPage);
    }
  }, [rolesMap.size, fetchRoles, fetchUsers, searchQuery, currentPage]);

  const searchUsers = useCallback(
    (query: string) => {
      return fetchUsers(query, 1);
    },
    [fetchUsers]
  );

  const clearSearch = useCallback(() => {
    return fetchUsers('', 1);
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setUsersError(null);
      await apiClient.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      return fetchUsers(searchQuery, page);
    },
    [fetchUsers, searchQuery]
  );

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Auto-fetch users after roles are loaded (success or failure)
  useEffect(() => {
    if (!rolesLoading) {
      if (rolesMap.size > 0 && users.length === 0 && !usersLoading) {
        // Roles loaded successfully, fetch users
        fetchUsers();
      } else if (rolesMap.size === 0 && rolesError) {
        setUsersError(`Cannot load users: ${rolesError}`);
      }
    }
  }, [rolesLoading, rolesMap.size, users.length, usersLoading, rolesError, fetchUsers]);

  // Re-enrich if roles change
  useEffect(() => {
    if (users.length > 0 && rolesMap.size > 0) {
      const reEnrichedUsers = users.map(user => ({
        ...user,
        role: rolesMap.get(user.roleId),
      }));

      const hasRoleChanges = reEnrichedUsers.some(
        (user, index) =>
          user.role?.name !== users[index]?.role?.name ||
          user.role?.description !== users[index]?.role?.description
      );

      if (hasRoleChanges) {
        setUsers(reEnrichedUsers);
      }
    }
  }, [rolesMap, users]);

  const usersContextValue: UsersContextValue = {
    users,
    loading: usersLoading || rolesLoading,
    error: usersError,
    pages,
    currentPage,
    searchQuery,
    fetchUsers,
    refreshUsers,
    searchUsers,
    clearSearch,
    deleteUser,
    goToPage,
  };

  const rolesContextValue: RolesContextValue = {
    roles,
    rolesMap,
    loading: rolesLoading,
    error: rolesError,
    refetchRoles,
    updateRole,
  };

  return (
    <RolesContext.Provider value={rolesContextValue}>
      <UsersContext.Provider value={usersContextValue}>{children}</UsersContext.Provider>
    </RolesContext.Provider>
  );
}
