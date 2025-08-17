import { useContext } from 'react';
import { UsersContext } from '@src/contexts/UsersContextDef';

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsersContext must be used within an AppProvider');
  }
  return context;
}
