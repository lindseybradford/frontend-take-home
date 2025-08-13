import { useUsers } from './hooks/useUsers';
import { Box, Container, Tabs, Text } from '@radix-ui/themes';

function App() {
  const { data: users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Container size="4">
        <Tabs.Root defaultValue="users">
          <Tabs.List>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="users">
              <ul>
                {users.map(user => (
                  <li key={user.id}>
                    <Text size="2">
                      {user.first} {user.last}
                    </Text>
                  </li>
                ))}
              </ul>
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
