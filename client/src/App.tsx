import { useUsers } from './hooks/useUsers';
import { Avatar, Box, Container, Flex, Table, Tabs, Text } from '@radix-ui/themes';
import { formatDate } from './util/formatDate';

function App() {
  const { data: users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Container size="4" py={{ initial: '4', lg: '8' }} px="4">
        <Tabs.Root defaultValue="users">
          <Tabs.List>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="users">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {users.map(user => (
                    <Table.Row key={user.id}>
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
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>

            <Tabs.Content value="roles">
              <Text size="2">Access and update your documents.</Text>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Container>
    </>
  );
}

export default App;
