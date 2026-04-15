import { AxiosError } from 'axios'
import { api } from './api'

export interface LoginPayload {
  correo: string
  contrasena: string
}

export interface RegisterPayload {
  nombreCompleto: string
  correo: string
  contrasena: string
}

interface LoginResponse {
  accessToken: string
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

export const authService = {
  async login(payload: LoginPayload) {
    try {
      const { data } = await api.post<LoginResponse>(
        '/autenticacion/login',
        payload,
      )

      return data
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'No se pudo iniciar sesión'))
    }
  },

  async register(payload: RegisterPayload) {
    try {
      const { data } = await api.post('/autenticacion/registrar', payload)
      return data
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'No se pudo completar el registro'))
    }
  },
}
