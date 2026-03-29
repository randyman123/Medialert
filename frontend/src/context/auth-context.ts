import { createContext } from 'react'
import type { LoginPayload } from '../services/auth.service'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
