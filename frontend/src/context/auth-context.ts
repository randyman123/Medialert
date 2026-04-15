import { createContext } from 'react'
import type { LoginPayload, RegisterPayload } from '../services/auth.service'
import type { UserRole } from '../utils/auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole
  userName: string
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
