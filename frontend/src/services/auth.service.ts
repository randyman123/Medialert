import { AxiosError } from 'axios'
import { api } from './api'

export interface LoginPayload {
  correo: string
  contrasena: string
}

interface LoginResponse {
  accessToken: string
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
      const axiosError = error as AxiosError<{ message?: string | string[] }>
      const backendMessage = axiosError.response?.data?.message

      if (Array.isArray(backendMessage)) {
        throw new Error(backendMessage[0] ?? 'No se pudo iniciar sesión')
      }

      throw new Error(backendMessage ?? 'No se pudo iniciar sesión')
    }
  },
}
