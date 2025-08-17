import { useContext } from 'react';
import { ToastContext } from '@src/contexts/ToastContextDef';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within an AppProvider');
  }
  return context;
}
