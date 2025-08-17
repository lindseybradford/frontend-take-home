import type { User, Role } from '@server/models';

export interface UserWithRole extends User {
  role?: Role;
}

export interface UsersContextValue {
  users: UserWithRole[];
  loading: boolean;
  error: string | null;
  pages: number;
  currentPage: number;
  searchQuery: string;
  searchLoading: boolean;
  deleteLoading: boolean;
  deletingUserId: string | null;

  fetchUsers: (search?: string, page?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export interface RolesContextValue {
  roles: Role[];
  rolesMap: Map<string, Role>;
  loading: boolean;
  error: string | null;
  refetchRoles: () => Promise<void>;
  updateRole: (
    roleId: string,
    updates: Partial<Pick<Role, 'name' | 'description' | 'isDefault'>>
  ) => Promise<void>;
}
