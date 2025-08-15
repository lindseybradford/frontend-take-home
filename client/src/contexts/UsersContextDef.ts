import { createContext } from 'react';
import type { UsersContextValue } from './types';

export const UsersContext = createContext<UsersContextValue | null>(null);
