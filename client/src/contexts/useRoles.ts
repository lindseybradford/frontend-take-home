import { useContext } from 'react';
import { RolesContext } from './RolesContextDef';

export function useRolesContext() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useRolesContext must be used within an AppProvider');
  }
  return context;
}
