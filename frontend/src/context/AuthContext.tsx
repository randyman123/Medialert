import { useState, type PropsWithChildren } from 'react'
import { authService, type LoginPayload } from '../services/auth.service'
import { tokenService } from '../services/token.service'
import { formatUserName, getRoleFromToken, getUserNameFromToken } from '../utils/auth'
import { AuthContext } from './auth-context'

function getInitialToken() {
  return tokenService.getToken()
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(getInitialToken)
  const role = getRoleFromToken(token)
  const userName = getUserNameFromToken(token) ?? tokenService.getUserName() ?? 'Usuario'

  const login = async (payload: LoginPayload) => {
    const { accessToken } = await authService.login(payload)
    tokenService.setToken(accessToken)
    tokenService.setUserName(formatUserName(payload.correo))
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
        userName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
