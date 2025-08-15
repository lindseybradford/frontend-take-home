import { Box, Container, Tabs, Text } from '@radix-ui/themes';
import { UsersTab } from './components/UsersTab';

function App() {
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
              <UsersTab />
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
