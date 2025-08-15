import { createContext } from 'react';
import type { RolesContextValue } from './types';

export const RolesContext = createContext<RolesContextValue | null>(null);
