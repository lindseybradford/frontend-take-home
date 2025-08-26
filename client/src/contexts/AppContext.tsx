import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiClient } from '../api/client';
import type { User, Role, PagedData } from '@server/models';
import type {
  UsersContextValue,
  RolesContextValue,
  UserWithRole,
  ToastContextValue,
  ToastState,
} from './types';
import { RolesContext } from './RolesContextDef';
import { UsersContext } from './UsersContextDef';
import { ToastContext } from './ToastContextDef';
import { getAllCachedRoles } from '@src/api/cache'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [rolesPages, setRolesPages] = useState(0);
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesSearchQuery, setRolesSearchQuery] = useState('');
  const [rolesSearchLoading, setRolesSearchLoading] = useState(false);
  const [rolesHasInitialized, setRolesHasInitialized] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPages, setUsersPages] = useState(0);
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [usersSearchLoading, setUsersSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [usersHasInitialized, setUsersHasInitialized] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: '',
    description: '',
    type: 'info',
  });
  const toastTimerRef = useRef<number | null>(null);

  const rolesMap = useMemo(() => {
    const allCachedRoles = getAllCachedRoles();

    const rolesToMap = allCachedRoles.length > 0 ? allCachedRoles : roles;

    return new Map(rolesToMap.map(role => [role.id, role]));
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

  const showToast = useCallback(
    (title: string, description: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      setToast({
        open: true,
        title,
        description,
        type,
      });

      toastTimerRef.current = window.setTimeout(() => {
        setToast(prev => ({ ...prev, open: false }));
      }, 5000);
    },
    []
  );

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const fetchUsers = useCallback(
    async (search?: string, page?: number) => {
      const isSearchOperation = search !== undefined && search !== usersSearchQuery;

      if (isSearchOperation) {
        setUsersSearchLoading(true);
      } else {
        setUsersLoading(true);
      }

      setUsersError(null);

      if (rolesMap.size === 0) {
        setUsersLoading(false);
        setUsersSearchLoading(false);
        const errorMessage = 'Cannot load users: roles are required';
        setUsersError(errorMessage);
        showToast('Error Loading Users', errorMessage, 'error');
        return;
      }

      try {
        const response: PagedData<User> = await apiClient.getUsers({
          search: search ?? usersSearchQuery,
          page: page ?? usersCurrentPage,
        });

        const enrichedUsers = joinUsersWithRoles(response.data);

        setUsers(enrichedUsers);
        setUsersPages(response.pages);
        setUsersCurrentPage(page ?? usersCurrentPage);
        setUsersSearchQuery(search ?? usersSearchQuery);

        if (!usersHasInitialized) {
          setUsersHasInitialized(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        setUsersError(errorMessage);
        setUsers([]);
        setUsersPages(0);
        showToast('Error Loading Users', errorMessage, 'error');
      } finally {
        setUsersLoading(false);
        setUsersSearchLoading(false);
      }
    },
    [
      rolesMap.size,
      usersSearchQuery,
      usersCurrentPage,
      joinUsersWithRoles,
      usersHasInitialized,
      showToast,
    ]
  );

  const clearUsersSearch = useCallback(() => {
    return fetchUsers('', 1);
  }, [fetchUsers]);

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setUsersError(null);
        setDeleteLoading(true);
        setDeletingUserId(userId);

        await apiClient.deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        showToast('User Deleted', 'The user has been successfully deleted.', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
        setUsersError(errorMessage);
        showToast('Error Deleting User', errorMessage, 'error');
        throw err;
      } finally {
        setDeleteLoading(false);
        setDeletingUserId(null);
      }
    },
    [showToast]
  );

  const goToUsersPage = useCallback(
    (page: number) => {
      return fetchUsers(usersSearchQuery, page);
    },
    [fetchUsers, usersSearchQuery]
  );

  const fetchRoles = useCallback(
    async (search?: string, page?: number) => {
      const isSearchOperation = search !== undefined && search !== rolesSearchQuery;

      if (isSearchOperation) {
        setRolesSearchLoading(true);
      } else {
        setRolesLoading(true);
      }

      setRolesError(null);

      try {
        const response: PagedData<Role> = await apiClient.getRoles({
          search: search ?? rolesSearchQuery,
          page: page ?? rolesCurrentPage,
        });

        setRoles(response.data);
        setRolesPages(response.pages);
        setRolesCurrentPage(page ?? rolesCurrentPage);
        setRolesSearchQuery(search ?? rolesSearchQuery);

        if (!rolesHasInitialized) {
          setRolesHasInitialized(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
        setRolesError(errorMessage);
        setRoles([]);
        setRolesPages(0);
        showToast('Error Loading Roles', errorMessage, 'error');
      } finally {
        setRolesLoading(false);
        setRolesSearchLoading(false);
      }
    },
    [rolesSearchQuery, rolesCurrentPage, rolesHasInitialized, showToast]
  );

  const refreshRoles = useCallback(async () => {
    return fetchRoles(rolesSearchQuery, rolesCurrentPage);
  }, [fetchRoles, rolesSearchQuery, rolesCurrentPage]);

  const searchRoles = useCallback(
    (query: string) => {
      return fetchRoles(query, 1);
    },
    [fetchRoles]
  );

  const refreshUsers = useCallback(async () => {
    if (rolesMap.size === 0) {
      try {
        await fetchRoles();
      } catch (err) {
        console.error('Failed to refresh roles:', err);
      }
    } else {
      return fetchUsers(usersSearchQuery, usersCurrentPage);
    }
  }, [rolesMap.size, fetchRoles, fetchUsers, usersSearchQuery, usersCurrentPage]);

  const searchUsers = useCallback(
    (query: string) => {
      return fetchUsers(query, 1);
    },
    [fetchUsers]
  );

  const clearRolesSearch = useCallback(() => {
    return fetchRoles('', 1);
  }, [fetchRoles]);

  const goToRolesPage = useCallback(
    (page: number) => {
      return fetchRoles(rolesSearchQuery, page);
    },
    [fetchRoles, rolesSearchQuery]
  );

  const updateRole = useCallback(
    async (
      roleId: string,
      roleName: string,
      updates: Partial<Pick<Role, 'name' | 'description' | 'isDefault'>>
    ) => {
      try {
        setRolesError(null);
        setEditLoading(true);
        setEditingRoleId(roleId);

        // Prevent removing default status if this is the only default role
        if (updates.isDefault === false) {
          const currentRole = roles.find(role => role.id === roleId);
          const otherDefaultRoles = roles.filter(role => role.id !== roleId && role.isDefault);

          if (currentRole?.isDefault && otherDefaultRoles.length === 0) {
            showToast(
              'Cannot Remove Default',
              'At least one role must be marked as default.',
              'error'
            );
            return;
          }
        }

        // Optimistically update local state for setting new default
        if (updates.isDefault === true) {
          setRoles(prevRoles =>
            prevRoles.map(role => ({
              ...role,
              isDefault: role.id === roleId ? true : false,
            }))
          );
        }

        const updatedRole = await apiClient.updateRole(roleId, updates);

        // Update the specific role with server response
        setRoles(prevRoles => prevRoles.map(role => (role.id === roleId ? updatedRole : role)));

        // Show appropriate success message
        if (updates.isDefault === true) {
          showToast(
            'Default Role Updated',
            `The ${roleName} role is now the default role.`,
            'success'
          );

          // Refresh users to show updated role information
          if (users.length > 0) {
            await fetchUsers(usersSearchQuery, usersCurrentPage);
          }
        } else {
          showToast('Role Updated', 'The role has been successfully updated.', 'success');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
        setRolesError(errorMessage);

        // Revert optimistic updates on error
        if (updates.isDefault === true) {
          await fetchRoles(rolesSearchQuery, rolesCurrentPage);
        }

        showToast('Error Updating Role', errorMessage, 'error');
        throw err;
      } finally {
        setEditLoading(false);
        setEditingRoleId(null);
      }
    },
    [
      roles,
      showToast,
      users.length,
      fetchUsers,
      usersSearchQuery,
      usersCurrentPage,
      fetchRoles,
      rolesSearchQuery,
      rolesCurrentPage,
    ]
  );

  // Initialize roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Auto-fetch users after roles are loaded (success or failure)
  useEffect(() => {
    if (!rolesLoading) {
      if (rolesMap.size > 0 && !usersHasInitialized && !usersLoading) {
        fetchUsers();
      } else if (rolesMap.size === 0 && rolesError) {
        setUsersError(`Cannot load users: ${rolesError}`);
      }
    }
  }, [rolesLoading, rolesMap.size, usersHasInitialized, usersLoading, rolesError, fetchUsers]);

  // Re-enrich users if roles change
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
    pages: usersPages,
    currentPage: usersCurrentPage,
    searchQuery: usersSearchQuery,
    searchLoading: usersSearchLoading,
    deleteLoading,
    deletingUserId,
    fetchUsers,
    refreshUsers,
    searchUsers,
    clearSearch: clearUsersSearch,
    deleteUser,
    goToPage: goToUsersPage,
  };

  const rolesContextValue: RolesContextValue = {
    roles,
    loading: rolesLoading,
    error: rolesError,
    pages: rolesPages,
    currentPage: rolesCurrentPage,
    searchQuery: rolesSearchQuery,
    searchLoading: rolesSearchLoading,
    editLoading,
    editingRoleId,
    fetchRoles,
    refreshRoles,
    searchRoles,
    clearSearch: clearRolesSearch,
    goToPage: goToRolesPage,
    updateRole,
  };

  const toastContextValue: ToastContextValue = {
    toast,
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={toastContextValue}>
      <RolesContext.Provider value={rolesContextValue}>
        <UsersContext.Provider value={usersContextValue}>{children}</UsersContext.Provider>
      </RolesContext.Provider>
    </ToastContext.Provider>
  );
}
