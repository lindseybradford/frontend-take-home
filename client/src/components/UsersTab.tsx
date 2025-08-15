import { TableUI } from './TableUI';
import { Avatar, Button, DropdownMenu, Flex, Table, Text } from '@radix-ui/themes';
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
    retry,
    searchQuery,
    handleSearch,
    handleClearSearch,
  } = useUsers();

  const [createLoading, setCreateLoading] = useState(false);

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
      onRetry={retry}
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
                    <DropdownMenu.Item style={{ cursor: `pointer` }}>Edit user</DropdownMenu.Item>
                    <DropdownMenu.Item style={{ cursor: `pointer` }}>Delete user</DropdownMenu.Item>
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
