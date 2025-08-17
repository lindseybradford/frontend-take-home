import { Box, Container, Tabs, Text } from '@radix-ui/themes';
import { UsersTab } from './components/UsersTab';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Container size="4" py={{ initial: '4', lg: '8' }} px="4">
          <Tabs.Root defaultValue="users">
            <Tabs.List>
              <Tabs.Trigger value="users" style={{ cursor: 'pointer' }}>
                Users
              </Tabs.Trigger>
              <Tabs.Trigger value="roles" style={{ cursor: 'pointer' }}>
                Roles
              </Tabs.Trigger>
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
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
