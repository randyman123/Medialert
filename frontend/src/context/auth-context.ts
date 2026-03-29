import { createContext } from 'react'
import type { LoginPayload } from '../services/auth.service'
import type { UserRole } from '../utils/auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
