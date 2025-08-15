import { TableUI } from './TableUI';
import { AlertDialog, Avatar, Button, DropdownMenu, Flex, Table, Text } from '@radix-ui/themes';
import { SearchField } from '@src/components/SearchField';
import { useUsersContext } from '../contexts/useUsers';
import { formatDate } from '../util/formatDate';
import { useState, useCallback } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { User } from '@server/models';

export function UsersTab() {
  const { users, loading, error, searchQuery, refreshUsers, searchUsers, clearSearch, deleteUser } =
    useUsersContext();

  console.log(loading, error);

  const [createLoading, setCreateLoading] = useState(false);

  // Note: needs improved - somewhat janky work-around to show the dialog programatically since using the
  // default trigger approach closes the dropdown button and removes the dialog from the DOM
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateNew = useCallback(async () => {
    setCreateLoading(true);
    try {
      // TODO: add user logic?
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setCreateLoading(false);
    }
  }, []);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        await deleteUser(userId);
        setDialogOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    },
    [deleteUser]
  );

  const openDeleteDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  }, []);

  const isLoading = loading || createLoading;

  return (
    <TableUI
      loading={loading}
      error={error}
      onRetry={refreshUsers}
      createNewText="Add user"
      onCreateNew={handleCreateNew}
      data={users}
      statusHeading="No users found"
      statusMessage="Add a user to get started."
    >
      <SearchField
        loading={isLoading}
        searchValue={searchQuery}
        placeholder="Search users by name"
        createButtonText="Add User"
        onSearch={searchUsers}
        onCreateNew={handleCreateNew}
        onClearSearch={clearSearch}
        debounceMs={300}
      />

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
            <Table.Row key={user.id} align="center">
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
                {formatDate(user.createdAt, {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                })}
              </Table.Cell>
              <Table.Cell>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button
                      variant="ghost"
                      size="3"
                      color="gray"
                      radius="full"
                      style={{ paddingLeft: 6, paddingRight: 6, cursor: 'pointer' }}
                    >
                      <DotsHorizontalIcon height="16" width="16" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content alignOffset={-80}>
                    <DropdownMenu.Item style={{ cursor: 'pointer' }}>Edit user</DropdownMenu.Item>
                    <DropdownMenu.Item
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.preventDefault();
                        openDeleteDialog(user);
                      }}
                    >
                      Delete user
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <AlertDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete user</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure? This will delete "{selectedUser?.first} {selectedUser?.last}" and all of
            their data.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
                variant="solid"
                color="red"
                style={{ cursor: 'pointer' }}
              >
                Delete user
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </TableUI>
  );
}
