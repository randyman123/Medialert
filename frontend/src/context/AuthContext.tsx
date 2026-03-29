import { useState, type PropsWithChildren } from 'react'
import { authService, type LoginPayload } from '../services/auth.service'
import { tokenService } from '../services/token.service'
import { getRoleFromToken } from '../utils/auth'
import { AuthContext } from './auth-context'

function getInitialToken() {
  return tokenService.getToken()
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(getInitialToken)
  const role = getRoleFromToken(token)

  const login = async (payload: LoginPayload) => {
    const { accessToken } = await authService.login(payload)
    tokenService.setToken(accessToken)
    setToken(accessToken)
  }

  const logout = () => {
    tokenService.clearToken()
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        isLoading: false,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
