import { DataUI } from './DataUI';
import {
  Avatar,
  Badge,
  Card,
  Box,
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  Grid,
  Portal,
  Spinner,
  Switch,
  Tooltip,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';

import { formatDate } from '../util/formatDate';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useRolesContext } from '@src/hooks/useRoles';
import type { Role } from '@server/models';
import { useRef, useCallback, useState } from 'react';
import { getInitials } from '@src/util/getInitials';

interface GridCardProps {
  role: Role;
  isEditing: boolean;
  onEditRole: (role: Role) => void;
}

function GridCard({ role, isEditing, onEditRole }: GridCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setDropdownOpen(open);
  }, []);

  const handleEditClick = useCallback(() => {
    setDropdownOpen(false);
    onEditRole(role);
  }, [role, onEditRole]);

  return (
    <Card key={role.id} size="3">
      <Flex gap="4" direction="column">
        <Flex gap="2" width="100%" justify="between">
          <Flex gap="4" align="center">
            <Avatar size="3" radius="full" fallback={getInitials(role.name)} />
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">
                {role.name}
              </Text>
              <Tooltip content="If time allowed: Color cordinate these between users/roles">
                {role.isDefault && <Badge color="iris">Default</Badge>}
              </Tooltip>
            </Flex>
          </Flex>
          <Box style={{ alignSelf: 'center' }}>
            <DropdownMenu.Root open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenu.Trigger>
                <Button
                  variant="ghost"
                  size="3"
                  color="gray"
                  radius="full"
                  disabled={isEditing}
                  style={{
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    padding: 8,
                    marginRight: 1,
                  }}
                  ref={dropdownTriggerRef}
                  align-self="end"
                >
                  {isEditing ? <Spinner size="1" /> : <DotsHorizontalIcon height="16" width="16" />}
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
                <DropdownMenu.Item style={{ cursor: 'pointer' }} onSelect={handleEditClick}>
                  Edit Role
                </DropdownMenu.Item>
                <DropdownMenu.Item style={{ cursor: 'pointer' }}>Delete role</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
        </Flex>
        <Flex gap="3" align="start" direction="column">
          <Text as="div" size="2">
            {role.description}
          </Text>
          <Text as="div" size="1" color="gray">
            Date updated:{' '}
            {formatDate(role.updatedAt, {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            })}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

export function RolesTab() {
  const {
    roles,
    loading,
    error,
    pages,
    currentPage,
    searchQuery,
    searchLoading,
    editLoading,
    editingRoleId,
    searchRoles,
    clearSearch,
    refreshRoles,
    updateRole,
    goToPage,
  } = useRolesContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isDefault: false,
  });

  const handleCreateNew = () => {
    // TODO: add new role workflow (not in README)?
  };

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedRole(null);
    }
  }, []);

  const openEditDialog = useCallback((role: Role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description ?? '',
      isDefault: role.isDefault,
    });
    setDialogOpen(true);
  }, []);

  const handleSaveRole = useCallback(async () => {
    if (!selectedRole) return;

    try {
      await updateRole(selectedRole.id, selectedRole.name, editForm);
      setDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  }, [selectedRole, editForm, updateRole]);

  const isRoleEditing = useCallback(
    (roleId: string) => {
      return editLoading && editingRoleId === roleId;
    },
    [editLoading, editingRoleId]
  );

  const handleFormChange = useCallback((field: keyof typeof editForm, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return (
    <>
      <DataUI
        loading={loading}
        error={error}
        onRetry={refreshRoles}
        createNewText="Add role"
        data={roles}
        statusHeading="No roles found"
        statusMessage="Add a role to get started."
        searchLoading={searchLoading}
        searchConfig={{
          loading: loading,
          searchValue: searchQuery,
          placeholder: 'Search roles by name',
          createButtonText: 'Add role',
          onSearch: searchRoles,
          onCreateNew: handleCreateNew,
          onClearSearch: clearSearch,
          debounceMs: 300,
          isSearching: searchLoading,
        }}
      >
        <Grid columns="3" gap="4" rows="repeat(2)" width="auto">
          {roles.map(role => (
            <GridCard
              key={role.id}
              role={role}
              isEditing={isRoleEditing(role.id)}
              onEditRole={openEditDialog}
            />
          ))}
        </Grid>
        <Box style={{ borderTop: `1px solid #E8E8E8`, marginTop: 24, paddingTop: 16 }}>
          <Flex gap="2" justify="end">
            <Button
              variant="surface"
              color="gray"
              disabled={currentPage <= 1 || loading || searchLoading}
              size="1"
              onClick={() => goToPage(currentPage - 1)}
              style={{
                cursor: currentPage > 1 && !loading && !searchLoading ? 'pointer' : 'not-allowed',
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
        </Box>
      </DataUI>

      <Dialog.Root open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <Portal>
          <Dialog.Content
            maxWidth="450px"
            onOpenAutoFocus={event => {
              event.preventDefault();
            }}
          >
            <Dialog.Title>Edit role</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Make changes to the <b>{selectedRole?.name}</b> role.
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Name
                </Text>
                <TextField.Root
                  value={editForm.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="Enter role name"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
                <TextArea
                  value={editForm.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  placeholder="Enter a description"
                />
              </label>
              <label>
                <Flex align="center" gap="2">
                  <Text as="div" size="2" weight="bold">
                    Default role
                  </Text>
                  <Switch
                    checked={editForm.isDefault}
                    onCheckedChange={checked => handleFormChange('isDefault', checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </Flex>
              </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="surface" color="gray" style={{ cursor: 'pointer' }}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="surface"
                onClick={handleSaveRole}
                disabled={editLoading}
                style={{ cursor: 'pointer' }}
              >
                {editLoading ? <Spinner size="1" /> : 'Save'}
              </Button>
            </Flex>
          </Dialog.Content>
        </Portal>
      </Dialog.Root>
    </>
  );
}
