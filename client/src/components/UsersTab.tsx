import { TableUI } from './TableUI';
import { AlertDialog, Avatar, Button, DropdownMenu, Flex, Table, Text } from '@radix-ui/themes';
import { SearchField } from '@src/components/SearchField';
import { useUsers } from '../hooks/useUsers';
import { formatDate } from '../util/formatDate';
import { useState, useCallback } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

export function UsersTab() {
  const {
    data: users,
    loading,
    error,
    handleRetry,
    searchQuery,
    handleSearch,
    handleClearSearch,
    handleDeleteUser,
  } = useUsers();

  const [createLoading, setCreateLoading] = useState(false);

  // Note: needs improved - somewhat janky work-around to show the dialog programatically since using the
  // default trigger approach closes the dropdown button and removes the dialog from the DOM
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateNew = useCallback(async () => {
    setCreateLoading(true);
    try {
      // TODO: add user logic
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setCreateLoading(false);
    }
  }, []);

  const isLoading = loading || createLoading;

  return (
    <TableUI
      loading={loading}
      error={error}
      onRetry={handleRetry}
      createNewText="Add user"
      onCreateNew={handleCreateNew}
      data={users}
    >
      <SearchField
        loading={isLoading}
        searchValue={searchQuery}
        placeholder="Search users by name"
        createButtonText="Add User"
        onSearch={handleSearch}
        onCreateNew={handleCreateNew}
        onClearSearch={handleClearSearch}
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
                      style={{ paddingLeft: 6, paddingRight: 6, cursor: `pointer` }}
                    >
                      <DotsHorizontalIcon height="16" width="16" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content alignOffset={-80}>
                    {/* Notes: I see that API supports post to create but the README didn't require it (assuming it's a second step of the assessment and leaving as-is) */}
                    <DropdownMenu.Item style={{ cursor: `pointer` }}>Edit user</DropdownMenu.Item>
                    <AlertDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                      <AlertDialog.Trigger>
                        {/* Notes: This is related to the note above for improvement 
                        // Currently the dropdown stays open after the dialog is closed and needs manually shut. New Radix user here :/ */}
                        <DropdownMenu.Item
                          style={{ cursor: `pointer` }}
                          onClick={e => {
                            e.preventDefault();
                            setDialogOpen(true);
                          }}
                        >
                          Delete user
                        </DropdownMenu.Item>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete user</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          Are you sure? This will delete this user and all of their data.
                        </AlertDialog.Description>

                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" style={{ cursor: `pointer` }}>
                              Cancel
                            </Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button
                              onClick={() => handleDeleteUser(user.id)}
                              variant="solid"
                              color="red"
                              style={{ cursor: `pointer` }}
                            >
                              Delete user
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </TableUI>
  );
}
