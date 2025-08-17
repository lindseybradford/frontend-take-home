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

  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: '',
    description: '',
    type: 'info',
  });
  const toastTimerRef = useRef<number | null>(null);

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

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      setRolesError(null);
      const response = await apiClient.getRoles();
      setRoles(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
      setRolesError(errorMessage);
      showToast('Error Loading Roles', errorMessage, 'error');
    } finally {
      setRolesLoading(false);
    }
  }, [showToast]);

  const refetchRoles = useCallback(() => {
    return fetchRoles();
  }, [fetchRoles]);

  const updateRole = useCallback(
    async (roleId: string, updates: Partial<Pick<Role, 'name' | 'description' | 'isDefault'>>) => {
      try {
        const updatedRole = await apiClient.updateRole(roleId, updates);
        setRoles(prevRoles => prevRoles.map(role => (role.id === roleId ? updatedRole : role)));
        showToast('Role Updated', 'The role has been successfully updated.', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
        setRolesError(errorMessage);
        showToast('Error Updating Role', errorMessage, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const fetchUsers = useCallback(
    async (search?: string, page?: number) => {
      const isSearchOperation = search !== undefined && search !== searchQuery;

      if (isSearchOperation) {
        setSearchLoading(true);
      } else {
        setUsersLoading(true);
      }

      setUsersError(null);

      if (rolesMap.size === 0) {
        setUsersLoading(false);
        setSearchLoading(false);
        const errorMessage = 'Cannot load users: roles are required';
        setUsersError(errorMessage);
        showToast('Error Loading Users', errorMessage, 'error');
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

        if (!hasInitialized) {
          setHasInitialized(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        setUsersError(errorMessage);
        setUsers([]);
        setPages(0);
        showToast('Error Loading Users', errorMessage, 'error');
      } finally {
        setUsersLoading(false);
        setSearchLoading(false);
      }
    },
    [rolesMap.size, searchQuery, currentPage, joinUsersWithRoles, hasInitialized, showToast]
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

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setUsersError(null);
        setDeleteLoading(true);
        setDeletingUserId(userId);

        await apiClient.deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        // It'd be cool to add an "UNDO" action here instead of just the FYI…
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
      if (rolesMap.size > 0 && !hasInitialized && !usersLoading) {
        fetchUsers();
      } else if (rolesMap.size === 0 && rolesError) {
        setUsersError(`Cannot load users: ${rolesError}`);
      }
    }
  }, [rolesLoading, rolesMap.size, hasInitialized, usersLoading, rolesError, fetchUsers]);

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
    searchLoading,
    deleteLoading,
    deletingUserId,
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
