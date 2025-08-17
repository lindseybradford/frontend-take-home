import { Box, Container, Tabs } from '@radix-ui/themes';
import { UsersTab } from './components/UsersTab';
import { RolesTab } from './components/RolesTab';
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
                <RolesTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Container>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
