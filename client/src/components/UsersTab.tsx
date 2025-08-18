import { DataUI } from './DataUI';
import {
  AlertDialog,
  Avatar,
  Button,
  DropdownMenu,
  Flex,
  Portal,
  Spinner,
  Table,
  Text,
} from '@radix-ui/themes';
import { useUsersContext } from '@src/hooks/useUsers';
import { formatDate } from '../util/formatDate';
import { useRef, useState, useCallback } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { UserWithRole } from '@src/contexts/types';

function UserRow({
  user,
  isDeleting,
  onDeleteUser,
}: {
  user: UserWithRole;
  isDeleting: boolean;
  onDeleteUser: (userId: string) => Promise<void>;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setDropdownOpen(false);
    }
  }, []);

  const handleDropdownOpenChange = useCallback(
    (open: boolean) => {
      if (!dialogOpen) {
        setDropdownOpen(open);
      }
    },
    [dialogOpen]
  );

  const handleDeleteClick = useCallback(() => {
    setDropdownOpen(false);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await onDeleteUser(user.id);
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }, [user.id, onDeleteUser]);

  return (
    <>
      <Table.Row
        key={user.id}
        align="center"
        style={{
          opacity: isDeleting ? 0.5 : 1,
          pointerEvents: isDeleting ? 'none' : 'auto',
        }}
      >
        <Table.RowHeaderCell>
          <Flex align="center" gap="2">
            <Avatar
              src={user.photo}
              fallback={`${user.first[0]}${user.last[0]}`}
              radius="full"
              size="2"
            />
            <Text size="2">
              {user.first} {user.last}
            </Text>
          </Flex>
        </Table.RowHeaderCell>
        <Table.Cell>{user.role?.name || 'Unknown'}</Table.Cell>
        <Table.Cell>
          Date created:{' '}
          {formatDate(user.createdAt, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          })}
        </Table.Cell>
        <Table.Cell style={{ width: '100px' }}>
          <Flex gap="2" justify="end">
            <DropdownMenu.Root open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenu.Trigger>
                <Button
                  variant="ghost"
                  size="3"
                  color="gray"
                  radius="full"
                  disabled={isDeleting}
                  style={{
                    padding: 8,
                    marginRight: 2,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                  }}
                  ref={dropdownTriggerRef}
                >
                  {isDeleting ? (
                    <Spinner size="1" />
                  ) : (
                    <DotsHorizontalIcon height="16" width="16" />
                  )}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                alignOffset={-80}
                onCloseAutoFocus={event => {
                  if (dropdownTriggerRef.current) {
                    dropdownTriggerRef.current.focus();
                    event.preventDefault();
                  }
                }}
              >
                <DropdownMenu.Item style={{ cursor: 'pointer' }}>Edit user</DropdownMenu.Item>
                <DropdownMenu.Item style={{ cursor: 'pointer' }} onSelect={handleDeleteClick}>
                  Delete user
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Table.Cell>
      </Table.Row>

      <AlertDialog.Root open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <Portal>
          <AlertDialog.Content
            className="DialogContent"
            onOpenAutoFocus={event => {
              event.preventDefault();
            }}
          >
            <AlertDialog.Title>Delete user</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure? This will delete{' '}
              <b>
                "{user.first} {user.last}"
              </b>{' '}
              and all of their data.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button
                  variant="surface"
                  color="gray"
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="surface"
                  color="red"
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Delete user
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </Portal>
      </AlertDialog.Root>
    </>
  );
}

export function UsersTab() {
  const {
    users,
    loading,
    error,
    pages,
    currentPage,
    searchQuery,
    searchLoading,
    deleteLoading,
    deletingUserId,
    refreshUsers,
    searchUsers,
    clearSearch,
    deleteUser,
    goToPage,
  } = useUsersContext();

  const handleCreateNew = () => {
    // TODO: add new user workflow (not in README…)?
  };

  const isUserDeleting = useCallback(
    (userId: string) => {
      return deleteLoading && deletingUserId === userId;
    },
    [deleteLoading, deletingUserId]
  );

  return (
    <DataUI
      loading={loading}
      error={error}
      onRetry={refreshUsers}
      createNewText="Add user"
      onCreateNew={handleCreateNew}
      data={users}
      statusHeading="No users found"
      statusMessage="Add a user to get started."
      searchLoading={searchLoading}
      deleteLoading={deleteLoading}
      searchConfig={{
        loading: loading,
        searchValue: searchQuery,
        placeholder: 'Search users by name',
        createButtonText: 'Add User',
        onSearch: searchUsers,
        onCreateNew: handleCreateNew,
        onClearSearch: clearSearch,
        debounceMs: 300,
        isSearching: searchLoading,
      }}
    >
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map(user => (
            <UserRow
              key={user.id}
              user={user}
              isDeleting={isUserDeleting(user.id)}
              onDeleteUser={deleteUser}
            />
          ))}
          <Table.Row>
            <Table.RowHeaderCell></Table.RowHeaderCell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell>
              <Flex gap="2" justify="end">
                <Button
                  variant="surface"
                  color="gray"
                  disabled={currentPage <= 1 || loading || searchLoading}
                  size="1"
                  onClick={() => goToPage(currentPage - 1)}
                  style={{
                    cursor:
                      currentPage > 1 && !loading && !searchLoading ? 'pointer' : 'not-allowed',
                  }}
                >
                  Prev
                </Button>

                <Button
                  variant="surface"
                  color="gray"
                  disabled={currentPage >= pages || loading || searchLoading}
                  size="1"
                  onClick={() => goToPage(currentPage + 1)}
                  style={{
                    cursor:
                      currentPage < pages && !loading && !searchLoading ? 'pointer' : 'not-allowed',
                  }}
                >
                  Next
                </Button>
              </Flex>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </DataUI>
  );
}
